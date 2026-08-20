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

export async function deleteUser(userId: string) {
  const admin = await createAdminClient()
  await logAction('delete_user', userId)
  const { error } = await admin.auth.admin.deleteUser(userId)
  if (!error) {
    revalidatePath('/admin/students')
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

    if (mentorId) {
        // Notify student about mentor assignment
        const { data: mentor } = await admin.from('profiles').select('full_name').eq('id', mentorId).single()
        await admin.from('notifications').insert({
            user_id: studentId,
            title: 'Mentor Assigned',
            message: `${mentor?.full_name || 'A mentor'} has been assigned to accompany you.`,
            type: 'mentor_assigned',
            link: '/dashboard'
        })
    }

    revalidatePath('/admin/students')
    revalidatePath('/admin/mentors')
    return { success: true }
  }
  return { error: error.message }
}

export async function broadcastNotification(data: {
  audience: 'all' | 'students' | 'mentors' | 'cohort'
  cohortId?: string
  title: string
  message: string
  channel: 'in-app' | 'banner'
}) {
  const admin = await createAdminClient()
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  if (data.channel === 'banner') {
    // We'll use Sanity for banners (handled in a separate action or directly)
    return { error: 'Banner channel should be used with createAnnouncement action.' }
  }

  // In-app notifications loop
  let query = admin.from('profiles').select('id')

  if (data.audience === 'students') query = query.eq('role', 'student')
  if (data.audience === 'mentors') query = query.eq('role', 'mentor')
  if (data.audience === 'cohort' && data.cohortId) {
    const { data: enrolled } = await admin.from('enrollments').select('student_id').eq('cohort_id', data.cohortId)
    const ids = enrolled?.map(e => e.student_id) || []
    query = query.in('id', ids)
  }

  const { data: targets } = await query

  if (targets && targets.length > 0) {
    const notifications = targets.map(t => ({
      user_id: t.id,
      title: data.title,
      message: data.message,
      type: 'broadcast',
      link: '/dashboard'
    }))

    const { error } = await admin.from('notifications').insert(notifications)
    if (error) return { error: error.message }

    await logAction('broadcast_notification', user.id, { audience: data.audience, title: data.title })
    return { success: true }
  }

  return { error: 'No target users found.' }
}

export async function admitStudentWithSequence(data: {
    studentId: string
    cohortId: string
    personalMessage: string
    firstSessionDate: string
}) {
    const admin = await createAdminClient()

    // 1. Update Waitlist Status
    const { error: waitlistError } = await admin.from('waitlist').update({ status: 'admitted' }).eq('student_id', data.studentId).eq('cohort_id', data.cohortId)
    if (waitlistError) return { error: waitlistError.message }

    // 2. Create Enrollment
    const { error: enrollError } = await admin.from('enrollments').upsert({
        student_id: data.studentId,
        cohort_id: data.cohortId,
        status: 'enrolled'
    }, { onConflict: 'student_id,cohort_id' })
    if (enrollError) return { error: enrollError.message }

    // 3. Create Custom Acceptance Notification
    await admin.from('notifications').insert({
        user_id: data.studentId,
        title: 'Welcome to the Cohort!',
        message: data.personalMessage,
        type: 'acceptance',
        link: '/auth/activate'
    })

    // 4. Log Action
    await logAction('admit_student', data.studentId, { cohort_id: data.cohortId })

    revalidatePath('/admin/waitlist')
    revalidatePath('/admin/students')

    return { success: true }
}

export async function createPeerPartnership(studentId1: string, studentId2: string, cohortId: string) {
    const admin = await createAdminClient()

    // Sort IDs to satisfy (student_id_1 < student_id_2) constraint
    const [id1, id2] = [studentId1, studentId2].sort()

    const { data, error } = await admin.from('accountability_partnerships').upsert({
        student_id_1: id1,
        student_id_2: id2,
        cohort_id: cohortId
    }, { onConflict: 'student_id_1,cohort_id' }) // Adjust conflict as needed based on logic

    if (error) return { error: error.message }

    // Create a conversation for the pair
    await createPairConversation([id1, id2], cohortId)

    // Notify both students
    const notifications = [id1, id2].map(id => ({
        user_id: id,
        title: 'Peer Partner Assigned',
        message: 'You have been matched with an accountability partner. Start a conversation in the community space!',
        type: 'peer_assigned',
        link: '/dashboard'
    }))
    await admin.from('notifications').insert(notifications)

    revalidatePath('/admin/pairing')
    return { success: true }
}

export async function createPairConversation(participantIds: string[], cohortId?: string) {
    const admin = await createAdminClient()

    // Check if conversation already exists
    const { data: existing } = await admin.from('conversations')
        .select('id')
        .contains('participant_ids', participantIds)
        .maybeSingle()

    if (existing) return existing.id

    const { data: conversation, error } = await admin.from('conversations').insert({
        participant_ids: participantIds,
        cohort_id: cohortId,
        last_message: 'Conversation started.'
    }).select().single()

    if (error) throw new Error(error.message)
    return conversation.id
}

export async function removePeerPartnership(partnershipId: string) {
    const admin = await createAdminClient()
    const { error } = await admin.from('accountability_partnerships').delete().eq('id', partnershipId)
    if (error) return { error: error.message }
    revalidatePath('/admin/pairing')
    return { success: true }
}

