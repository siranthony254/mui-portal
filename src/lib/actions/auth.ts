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
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) return { error: error.message }

  // Revalidate and redirect will be handled by the client or middleware
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

    await admin.from('profiles').upsert({
      id: signUpData.user.id,
      email,
      full_name: fullName,
      role: isEmailAdmin ? 'admin' : 'student',
      approved: isEmailAdmin,
      institution,
      institution_type: institutionType,
      year_of_study: yearOfStudy,
      county,
      phone,
    }, { onConflict: 'id' })

    // Automatically add to waitlist if a cohort is open
    if (!isEmailAdmin) {
      const { data: openCohort } = await admin.from('cohorts').select('id').eq('applications_open', true).limit(1).maybeSingle()
      if (openCohort) {
        await admin.from('waitlist').upsert({
          cohort_id: openCohort.id,
          student_id: signUpData.user.id,
          status: 'waiting'
        }, { onConflict: 'cohort_id,student_id' })
      }
    }

    // Send application confirmation email via Resend (Student specific)
    await sendStudentWaitlistEmail(email, fullName)
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

    await admin.from('profiles').upsert({
      id: signUpData.user.id,
      email,
      full_name: fullName,
      role: isEmailAdmin ? 'admin' : 'mentor',
      approved: isEmailAdmin,
      bio,
    }, { onConflict: 'id' })

    // Send mentor application received email via Resend
    await sendMentorRequestReceivedEmail(email, fullName)
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
