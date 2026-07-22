'use server'

import { redirect } from 'next/navigation'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { isAdminEmail } from '@/lib/auth/admin-emails'
import { getAuthCallbackUrl } from '@/lib/app-url'

import {
  sendStudentApplicationEmail,
  sendMentorApplicationEmail,
  sendSignInLinkEmail,
} from '@/lib/email/services'

export async function signInWithEmail(formData: FormData) {
  const email = String(formData.get('email') || '').trim().toLowerCase()
  if (!email) return { error: 'Enter your email address.' }

  const supabase = await createClient()
  const admin = await createAdminClient()

  // 1. Check if email matches admin email
  const isEmailAdmin = isAdminEmail(email)

  // 2. Look up profile
  const { data: profile, error: profileError } = await admin
    .from('profiles')
    .select('id,role,approved,full_name')
    .ilike('email', email)
    .in('role', ['admin', 'mentor', 'student'])
    .maybeSingle()

  if (profileError) return { error: 'Could not verify access. Please try again.' }
  if (!profile && !isEmailAdmin) {
    return { error: 'Access denied. Use the email from your cohort application, mentor application, or admin account.' }
  }

  if (isEmailAdmin && profile && (profile.role !== 'admin' || !profile.approved)) {
    const { error: promoteError } = await admin
      .from('profiles')
      .update({ role: 'admin', approved: true })
      .eq('id', profile.id)

    if (promoteError) return { error: 'Could not activate admin access. Please try again.' }
  }

  const callbackUrl = `${getAuthCallbackUrl()}?next=/auth/login`

  // Attempt custom Resend sign-in email if link generation is available
  try {
    const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
      type: 'magiclink',
      email,
      options: { redirectTo: callbackUrl },
    })

    if (!linkError && linkData?.properties?.action_link) {
      await sendSignInLinkEmail(email, linkData.properties.action_link, profile?.full_name || undefined)
      return { success: 'Sign-in link sent via Resend! Check your email for your link to sign in.' }
    }
  } catch (err) {
    console.warn('Fallback to standard OTP due to link generation error:', err)
  }

  // Fallback to standard Supabase Auth OTP
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: callbackUrl,
      shouldCreateUser: true,
    },
  })

  if (error) return { error: error.message }
  return { success: 'Sign-in link sent! Check your email for your link to sign in.' }
}

export async function signUpStudent(formData: FormData) {
  const email = String(formData.get('email') || '').trim().toLowerCase()
  const fullName = String(formData.get('full_name') || '').trim()
  const institution = String(formData.get('institution') || '').trim()
  const institutionType = String(formData.get('institution_type') || '').trim()
  const yearOfStudy = String(formData.get('year_of_study') || '').trim()
  const county = String(formData.get('county') || '').trim()
  const phone = String(formData.get('phone') || '').trim()

  if (!email || !fullName) return { error: 'Email and full name are required.' }

  const supabase = await createClient()
  const callbackUrl = `${getAuthCallbackUrl()}?next=/auth/login&signup=true`

  const { data: signUpData, error } = await supabase.auth.signUp({
    email,
    password: crypto.randomUUID(),
    options: {
      data: { full_name: fullName, role: 'student' },
      emailRedirectTo: callbackUrl,
    },
  })
  if (error) return { error: error.message }

  if (signUpData.user?.id) {
    const admin = await createAdminClient()
    await admin.from('profiles').upsert({
      id: signUpData.user.id,
      email,
      full_name: fullName,
      role: isAdminEmail(email) ? 'admin' : 'student',
      approved: isAdminEmail(email),
      institution,
      institution_type: institutionType,
      year_of_study: yearOfStudy,
      county,
      phone,
    }, { onConflict: 'id' })
  }

  // Send application confirmation email via Resend
  await sendStudentApplicationEmail(email, fullName, callbackUrl)

  return { success: 'Application submitted! A sign up confirmation email has been sent to your inbox.' }
}

export async function signUpMentor(formData: FormData) {
  const email = String(formData.get('email') || '').trim().toLowerCase()
  const fullName = String(formData.get('full_name') || '').trim()
  const bio = String(formData.get('bio') || '').trim()

  if (!email || !fullName) return { error: 'Email and full name are required.' }

  const supabase = await createClient()
  const callbackUrl = `${getAuthCallbackUrl()}?next=/auth/login&signup=true`

  const { data: signUpData, error } = await supabase.auth.signUp({
    email,
    password: crypto.randomUUID(),
    options: {
      data: { full_name: fullName, role: 'mentor' },
      emailRedirectTo: callbackUrl,
    },
  })
  if (error) return { error: error.message }

  if (signUpData.user?.id) {
    const admin = await createAdminClient()
    await admin.from('profiles').upsert({
      id: signUpData.user.id,
      email,
      full_name: fullName,
      role: isAdminEmail(email) ? 'admin' : 'mentor',
      approved: isAdminEmail(email),
      bio,
    }, { onConflict: 'id' })
  }

  // Send mentor application received email via Resend
  await sendMentorApplicationEmail(email, fullName)

  return { success: 'Mentor application submitted! A confirmation email has been sent to your inbox.' }
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
