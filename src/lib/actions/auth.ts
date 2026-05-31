'use server'

import { redirect } from 'next/navigation'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { isAdminEmail } from '@/lib/auth/admin-emails'

export async function signInWithEmail(formData: FormData) {
  const email = String(formData.get('email') || '').trim().toLowerCase()
  if (!email) return { error: 'Enter your email address.' }

  const supabase = await createClient()
  const admin = await createAdminClient()

  const { data: profile, error: profileError } = await admin
    .from('profiles')
    .select('id,role,approved')
    .ilike('email', email)
    .in('role', ['admin', 'mentor', 'student'])
    .maybeSingle()

  if (profileError) return { error: 'Could not verify access. Please try again.' }
  if (!profile) return { error: 'Access denied. Use the email from your cohort application, mentor application, or admin account.' }

  if (isAdminEmail(email) && (profile.role !== 'admin' || !profile.approved)) {
    const { error: promoteError } = await admin
      .from('profiles')
      .update({ role: 'admin', approved: true })
      .eq('id', profile.id)

    if (promoteError) return { error: 'Could not activate admin access. Please try again.' }
  }

  const { data: authUser, error: authError } = await admin.auth.admin.getUserById(profile.id)
  if (authError) return { error: 'Could not verify your login account. Please try again.' }

  if (authUser.user.email?.toLowerCase() !== email) {
    return { error: 'Access denied. This email is in the portal database but does not have a Supabase Auth account yet.' }
  }

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      shouldCreateUser: false,
    },
  })

  if (error) return { error: error.message }
  return { success: 'Check your email for the sign-in link.' }
}

export async function signUpStudent(formData: FormData) {
  const email = formData.get('email') as string
  const fullName = formData.get('full_name') as string
  const institution = formData.get('institution') as string
  const institutionType = formData.get('institution_type') as string
  const yearOfStudy = formData.get('year_of_study') as string
  const county = formData.get('county') as string
  const phone = formData.get('phone') as string

  const supabase = await createClient()
  const { data: signUpData, error } = await supabase.auth.signUp({
    email,
    password: crypto.randomUUID(),
    options: {
      data: { full_name: fullName, role: 'student' },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    },
  })
  if (error) return { error: error.message }

  // Update profile with extra fields if user was created
  if (signUpData.user?.id) {
    const admin = await createAdminClient()
    await admin.from('profiles').update({
      institution,
      institution_type: institutionType,
      year_of_study: yearOfStudy,
      county,
      phone,
      ...(isAdminEmail(email) ? { role: 'admin', approved: true } : {}),
    }).eq('id', signUpData.user.id)
  }

  return { success: 'Account created. Check your email to confirm.' }
}

export async function signUpMentor(formData: FormData) {
  const email = formData.get('email') as string
  const fullName = formData.get('full_name') as string
  const bio = formData.get('bio') as string

  const supabase = await createClient()
  const { data: signUpData, error } = await supabase.auth.signUp({
    email,
    password: crypto.randomUUID(),
    options: {
      data: { full_name: fullName, role: 'mentor' },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    },
  })
  if (error) return { error: error.message }

  if (signUpData.user?.id) {
    const admin = await createAdminClient()
    await admin.from('profiles').update({
      bio,
      ...(isAdminEmail(email) ? { role: 'admin', approved: true } : {}),
    }).eq('id', signUpData.user.id)
  }

  return { success: 'Mentor application submitted. You will be notified when approved.' }
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
