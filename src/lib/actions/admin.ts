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
  const { data: profile } = await admin.from('profiles').select('role').eq('id', userId).single()

  const { error } = await admin.from('profiles').update({
    approved,
    status: approved ? 'approved' : 'pending'
  }).eq('id', userId)

  if (!error) {
    await logAction(approved ? 'approve_user' : 'revoke_user', userId)

    // If approving a mentor, add them to any relevant cohort groups if they are already assigned
    if (approved && profile?.role === 'mentor') {
        const { data: assignments } = await admin.from('enrollments').select('cohort_id').eq('mentor_id', userId)
        if (assignments && assignments.length > 0) {
            for (const a of assignments) {
                const { data: group } = await admin.from('conversations').select('id, participant_ids').eq('cohort_id', a.cohort_id).eq('is_group', true).maybeSingle()
                if (group && !group.participant_ids.includes(userId)) {
                    await admin.from('conversations').update({ participant_ids: [...group.participant_ids, userId] }).eq('id', group.id)
                }
            }
        }
    }

    revalidatePath('/admin/students')
    revalidatePath('/admin/mentors')
    return { success: true }
  }
  return { error: error.message }
}

export async function updateUserStatus(userId: string, status: 'pending' | 'approved' | 'rejected' | 'left') {
  const admin = await createAdminClient()
  const { error } = await admin.from('profiles').update({
    status,
    approved: status === 'approved'
  }).eq('id', userId)

  if (!error) {
    await logAction('update_status', userId, { status })
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

    // Auto-create or add to cohort group chat
    try {
        const { data: cohort } = await admin.from('cohorts').select('name').eq('id', cohortId).single()
        const groupName = `${cohort?.name || 'Cohort'} Community`

        // 1. Find the group conversation for this cohort
        const { data: existingGroup } = await admin.from('conversations')
            .select('id, participant_ids')
            .eq('cohort_id', cohortId)
            .eq('is_group', true)
            .maybeSingle()

        if (existingGroup) {
            // Add user if not already in participants
            if (!existingGroup.participant_ids.includes(studentId)) {
                await admin.from('conversations')
                    .update({
                        participant_ids: [...existingGroup.participant_ids, studentId]
                    })
                    .eq('id', existingGroup.id)
            }
        } else {
            // Create new group chat (Admin should be included by default)
            const { data: admins } = await admin.from('profiles').select('id').eq('role', 'admin')
            const adminIds = admins?.map(a => a.id) || []

            await admin.from('conversations').insert({
                cohort_id: cohortId,
                participant_ids: [...new Set([...adminIds, studentId])],
                is_group: true,
                group_name: groupName,
                last_message: 'Community space activated.'
            })
        }
    } catch (e) {
        console.error('Group chat sync error:', e)
    }

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
        // 1. Notify student about mentor assignment
        const { data: mentor } = await admin.from('profiles').select('full_name').eq('id', mentorId).single()
        await admin.from('notifications').insert({
            user_id: studentId,
            title: 'Mentor Assigned',
            message: `${mentor?.full_name || 'A mentor'} has been assigned to accompany you.`,
            type: 'mentor_assigned',
            link: '/dashboard'
        })

        // 2. Create/Sync personal conversation between Mentor and Student
        await createPairConversation([studentId, mentorId])

        // 3. Ensure Mentor is in the student's cohort group chat
        const { data: enrollment } = await admin.from('enrollments').select('cohort_id').eq('student_id', studentId).single()
        if (enrollment?.cohort_id) {
            const { data: group } = await admin.from('conversations').select('id, participant_ids').eq('cohort_id', enrollment.cohort_id).eq('is_group', true).maybeSingle()
            if (group && !group.participant_ids.includes(mentorId)) {
                await admin.from('conversations').update({ participant_ids: [...group.participant_ids, mentorId] }).eq('id', group.id)
            }
        }
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

export async function createWeeklyTask(data: {
    cohortId: string
    pillarNumber: number
    weekNumber: number
    title: string
    prompt: string
}) {
    const admin = await createAdminClient()

    try {
        // Get all enrolled students in this cohort
        const { data: enrollments, error: enrollmentsError } = await admin
            .from('enrollments')
            .select('id, student_id')
            .eq('cohort_id', data.cohortId)
            .in('status', ['enrolled', 'active'])

        if (enrollmentsError) {
            console.error('Error fetching enrollments:', enrollmentsError)
            return { error: 'Failed to fetch enrolled students' }
        }

        if (!enrollments || enrollments.length === 0) {
            return { error: 'No enrolled students found in this cohort' }
        }

        // Create tasks for all enrolled students
        const tasks = enrollments.map(enrollment => ({
            enrollment_id: enrollment.id,
            student_id: enrollment.student_id,
            cohort_id: data.cohortId,
            pillar_number: data.pillarNumber,
            week_number: data.weekNumber,
            title: data.title,
            prompt: data.prompt,
            status: 'pending'
        }))

        const { error: tasksError } = await admin.from('tasks').insert(tasks)

        if (tasksError) {
            console.error('Error creating tasks:', tasksError)
            return { error: 'Failed to create weekly tasks' }
        }

        await logAction('create_weekly_task', data.cohortId, {
            pillarNumber: data.pillarNumber,
            weekNumber: data.weekNumber,
            studentCount: enrollments.length
        })

        revalidatePath('/admin/content')
        revalidatePath('/dashboard/tasks')
        return { success: true, studentCount: enrollments.length }
    } catch (error: any) {
        console.error('Weekly task creation error:', error)
        return { error: error.message }
    }
}
