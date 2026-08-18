'use server'

import { createAdminClient, createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

async function logAction(action: string, targetId: string, details?: any) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const admin = await createAdminClient()
  await admin.from('audit_logs').insert({
    admin_id: user.id,
    action,
    target_id: targetId,
    details
  })
}

export async function toggleUserApproval(userId: string, approved: boolean) {
  const admin = await createAdminClient()
  const { error } = await admin.from('profiles').update({ approved }).eq('id', userId)

  if (!error) {
    await logAction(approved ? 'approve_user' : 'revoke_user', userId)
    revalidatePath('/admin/students')
    revalidatePath('/admin/mentors')
    return { success: true }
  }
  return { error: error.message }
}

export async function promoteToAdmin(userId: string) {
  const admin = await createAdminClient()
  const { error } = await admin.from('profiles').update({ role: 'admin', approved: true }).eq('id', userId)

  if (!error) {
    await logAction('promote_admin', userId)
    revalidatePath('/admin/mentors')
    return { success: true }
  }
  return { error: error.message }
}

export async function demoteToMentor(userId: string) {
    const admin = await createAdminClient()
    const { error } = await admin.from('profiles').update({ role: 'mentor' }).eq('id', userId)

    if (!error) {
      await logAction('demote_to_mentor', userId)
      revalidatePath('/admin/mentors')
      return { success: true }
    }
    return { error: error.message }
  }

export async function updateStudentCohort(studentId: string, cohortId: string | null) {
  const admin = await createAdminClient()

  if (!cohortId) {
    const { error } = await admin.from('enrollments').delete().eq('student_id', studentId)
    if (!error) {
        await logAction('remove_from_cohort', studentId)
        revalidatePath('/admin/students')
        return { success: true }
    }
    return { error: error.message }
  }

  // Check if already enrolled in this cohort
  const { data: existing } = await admin.from('enrollments').select('id').eq('student_id', studentId).eq('cohort_id', cohortId).maybeSingle()

  if (existing) return { success: true }

  const { error } = await admin.from('enrollments').upsert({
    student_id: studentId,
    cohort_id: cohortId,
    status: 'active'
  }, { onConflict: 'student_id,cohort_id' })

  if (!error) {
    await logAction('enroll_in_cohort', studentId, { cohort_id: cohortId })
    revalidatePath('/admin/students')
    return { success: true }
  }
  return { error: error.message }
}

export async function assignMentorToStudent(studentId: string, mentorId: string | null) {
    const admin = await createAdminClient()
    const { error } = await admin.from('enrollments').update({ mentor_id: mentorId }).eq('student_id', studentId)

    if (!error) {
      await logAction('assign_mentor', studentId, { mentor_id: mentorId })
      revalidatePath('/admin/students')
      revalidatePath('/admin/mentors')
      return { success: true }
    }
    return { error: error.message }
  }
