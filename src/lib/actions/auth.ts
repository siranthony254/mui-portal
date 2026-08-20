'use server'

import { redirect } from 'next/navigation'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { isAdminEmail } from '@/lib/auth/admin-emails'
import {
  sendStudentWaitlistEmail,
  sendMentorRequestReceivedEmail,
} from '@/lib/email/services'

export async function signInWithPassword(formData: FormData) {
  const email = String(formData.get('email') || '').trim().toLowerCase()
  const password = String(formData.get('password') || '')

  if (!email || !password) return { error: 'Enter your email and password.' }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) return { error: error.message }

  // Update last login timestamp
  if (data.user) {
    const admin = await createAdminClient()
    await admin.from('profiles').update({ last_login_at: new Date().toISOString() }).eq('id', data.user.id)
  }

  return { success: true }
}

export async function signUpStudent(formData: FormData) {
  const email = String(formData.get('email') || '').trim().toLowerCase()
  const fullName = String(formData.get('full_name') || '').trim()
  const password = String(formData.get('password') || '')
  const institution = String(formData.get('institution') || '').trim()
  const institutionType = String(formData.get('institution_type') || '').trim()
  const yearOfStudy = String(formData.get('year_of_study') || '').trim()
  const county = String(formData.get('county') || '').trim()
  const phone = String(formData.get('phone') || '').trim()

  if (!email || !fullName || !password) return { error: 'All starred fields are required.' }

  const supabase = await createClient()

  // Sign up with Supabase
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName, role: 'student' },
    },
  })

  if (signUpError) return { error: signUpError.message }

  if (signUpData.user?.id) {
    const admin = await createAdminClient()
    const isEmailAdmin = isAdminEmail(email)

    // The trigger already creates the profile, so we update it with additional fields
    const { error: profileError } = await admin.from('profiles').update({
      institution,
      institution_type: institutionType,
      year_of_study: yearOfStudy,
      county,
      phone,
      approved: isEmailAdmin,
      status: isEmailAdmin ? 'approved' : 'pending',
    }).eq('id', signUpData.user.id)

    if (profileError) {
      console.error('Error updating profile:', profileError)
      return { error: 'Failed to update user profile. Please try again.' }
    }

    // Automatically add to waitlist if a cohort is open
    if (!isEmailAdmin) {
      const { data: openCohort } = await admin.from('cohorts').select('id').eq('applications_open', true).limit(1).maybeSingle()
      if (openCohort) {
        const { error: waitlistError } = await admin.from('waitlist').upsert({
          cohort_id: openCohort.id,
          student_id: signUpData.user.id,
          status: 'waiting'
        }, { onConflict: 'cohort_id,student_id' })

        if (waitlistError) {
          console.error('Error adding to waitlist:', waitlistError)
        }
      }
    }

    // Send application confirmation email via SendGrid (Student specific)
    try {
      await sendStudentWaitlistEmail(email, fullName)
    } catch (e) {
      console.error('Failed to send email:', e)
    }
  }

  return { success: 'Your application has been received! Check your email for next steps.' }
}

export async function signUpMentor(formData: FormData) {
  const email = String(formData.get('email') || '').trim().toLowerCase()
  const fullName = String(formData.get('full_name') || '').trim()
  const password = String(formData.get('password') || '')
  const bio = String(formData.get('bio') || '').trim()

  if (!email || !fullName || !password) return { error: 'All starred fields are required.' }

  const supabase = await createClient()

  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName, role: 'mentor' },
    },
  })

  if (signUpError) return { error: signUpError.message }

  if (signUpData.user?.id) {
    const admin = await createAdminClient()
    const isEmailAdmin = isAdminEmail(email)

    // The trigger already creates the profile, so we update it with additional fields
    const { error: profileError } = await admin.from('profiles').update({
      bio,
      status: isEmailAdmin ? 'approved' : 'pending',
      approved: isEmailAdmin,
    }).eq('id', signUpData.user.id)

    if (profileError) {
      console.error('Error updating mentor profile:', profileError)
      return { error: 'Failed to update mentor profile. Please try again.' }
    }

    // Send mentor application received email via SendGrid
    try {
      await sendMentorRequestReceivedEmail(email, fullName)
    } catch (e) {
      console.error('Failed to send mentor email:', e)
    }
  }

  return { success: 'Mentor application submitted! Check your email for next steps.' }
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/auth/login')
}

export async function getProfile() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  return data
}

export async function generateAndSendAdminPIN() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || !isAdminEmail(user.email)) return { error: 'Unauthorized' }

  // Generate 4-digit PIN
  const pin = Math.floor(1000 + Math.random() * 9000).toString()

  const admin = await createAdminClient()
  await admin.from('profiles').update({ security_pin: pin }).eq('id', user.id)

  // FOR TESTING: Log to console
  console.log('---------------------------------')
  console.log(`ADMIN SECURITY PIN FOR ${user.email}: ${pin}`)
  console.log('---------------------------------')

  // TODO: Connect SendGrid here to send email
  /*
  const { sendgrid, getFromEmail } = await import('@/lib/email/sendgrid')
  if (sendgrid) {
    await sendgrid.send({
      from: getFromEmail(),
      to: user.email!,
      subject: 'Your Admin Security PIN',
      text: `Your 4-digit security PIN is: ${pin}. Use this to verify your session.`
    })
  }
  */

  return { success: true }
}

export async function verifyAdminPIN(pin: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const { data: profile } = await supabase.from('profiles').select('security_pin').eq('id', user.id).single()

  if (profile?.security_pin === pin) {
    return { success: true }
  }

  return { error: 'Invalid security PIN' }
}
