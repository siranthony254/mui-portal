/**
 * Daily Formation Reminder System
 * Intelligently sends personalized daily formation prompts based on day of week
 * and student progress
 */

import { createClient } from '@/lib/supabase/server'
import { createNotification, NotificationTemplates, NotificationPriority } from './factory'

interface DailyReminderConfig {
  enabled: boolean
  defaultTime: string // HH:MM format
}

const DAILY_QUESTIONS = {
  monday: "What are you allowing to shape you without intentionally choosing it?",
  tuesday: "Which of your current habits is actually forming you?",
  wednesday: "What truth do you need to embrace about yourself today?",
  thursday: "What would change if you led with your values instead of your fears?",
  friday: "What formation practice will you commit to this weekend?",
  saturday: "Who in your life is shaping you, and how?",
  sunday: "What did you learn about yourself this week?"
}

/**
 * Get the appropriate daily reminder based on day of week and student progress
 */
async function getDailyReminderForStudent(studentId: string, cohortId: string) {
  const supabase = await createClient()
  const dayOfWeek = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase()

  // Get student's current progress
  const { data: enrollment } = await supabase
    .from('enrollments')
    .select('current_week, current_pillar')
    .eq('student_id', studentId)
    .eq('cohort_id', cohortId)
    .single()

  if (!enrollment) return null

  const weekNumber = enrollment.current_week || 1
  const pillar = enrollment.current_pillar || 'identity'

  // Check if student has already completed today's activity
  const today = new Date().toISOString().split('T')[0]
  const { data: todayActivity } = await supabase
    .from('student_activity_log')
    .select('*')
    .eq('student_id', studentId)
    .gte('created_at', today)
    .limit(1)

  // If already active today, skip
  if (todayActivity && todayActivity.length > 0) {
    return null
  }

  // Customize based on day of week
  switch (dayOfWeek) {
    case 'monday':
      return NotificationTemplates.sessionReady(weekNumber, `Pillar ${pillar}`)
    
    case 'tuesday':
      return {
        ...NotificationTemplates.dailyReminder('Student', DAILY_QUESTIONS.tuesday),
        title: '✍️ Your journal is waiting',
        message: `Yesterday you explored ${pillar}. Today, let's go deeper.`
      }
    
    case 'wednesday':
      // Check cohort discussion activity
      const { count: discussionCount } = await supabase
        .from('discussion_posts')
        .select('*', { count: 'exact', head: true })
        .eq('cohort_id', cohortId)
        .gte('created_at', today)
      
      return NotificationTemplates.cohortDiscussion(
        `Week ${weekNumber} reflection`,
        discussionCount || 0
      )
    
    case 'thursday':
      // Check if mentor has sent any messages
      const { data: mentorMessages } = await supabase
        .from('messages')
        .select('*, sender:profiles!sender_id(full_name)')
        .in('conversation_id', (
          await supabase.from('conversations')
            .select('id')
            .contains('participant_ids', [studentId])
        ).data?.map(c => c.id) || [])
        .eq('sender.role', 'mentor')
        .gte('created_at', today)
      
      if (mentorMessages && mentorMessages.length > 0) {
        return NotificationTemplates.mentorMessage(
          mentorMessages[0].sender.full_name,
          'reflection'
        )
      }
      
      return {
        ...NotificationTemplates.dailyReminder('Student', DAILY_QUESTIONS.thursday),
        title: '👤 Mentor moment',
        message: 'Your mentor has a question for you.'
      }
    
    case 'friday':
      // Check for active practice commitment
      const { data: commitment } = await supabase
        .from('formation_commitments')
        .select('*')
        .eq('student_id', studentId)
        .eq('cohort_id', cohortId)
        .eq('week_number', weekNumber)
        .single()
      
      if (commitment && commitment.status !== 'done') {
        return NotificationTemplates.commitmentReminder(
          commitment.commitment,
          Math.floor((new Date().getTime() - new Date(commitment.created_at).getTime()) / (1000 * 60 * 60 * 24))
        )
      }
      
      return NotificationTemplates.practiceDue('intentionality')
    
    case 'saturday':
      return {
        ...NotificationTemplates.dailyReminder('Student', DAILY_QUESTIONS.saturday),
        title: '🎙 MUI Formation Lab',
        message: 'We\'re gathering today. See you at 4:00 PM.',
        link: '/dashboard/sessions'
      }
    
    case 'sunday':
      return NotificationTemplates.weeklySummary(weekNumber)
    
    default:
      return NotificationTemplates.dailyReminder('Student', DAILY_QUESTIONS.monday)
  }
}

/**
 * Send daily formation reminders to all active students
 */
export async function sendDailyFormationReminders(config: DailyReminderConfig) {
  if (!config.enabled) {
    return { success: false, message: 'Daily reminders disabled' }
  }

  const supabase = await createClient()

  // Get all active students
  const { data: enrollments } = await supabase
    .from('enrollments')
    .select('student_id, cohort_id')
    .in('status', ['enrolled', 'active'])

  if (!enrollments || enrollments.length === 0) {
    return { success: true, message: 'No active students to remind', sent: 0 }
  }

  const results = []
  let sentCount = 0
  let alreadyActiveCount = 0

  for (const enrollment of enrollments) {
    const reminder = await getDailyReminderForStudent(
      enrollment.student_id,
      enrollment.cohort_id
    )

    if (!reminder) {
      alreadyActiveCount++
      continue
    }

    const result = await createNotification({
      ...reminder,
      userId: enrollment.student_id
    })

    results.push({
      studentId: enrollment.student_id,
      result
    })

    if (result.success) {
      sentCount++
    }
  }

  return {
    success: true,
    message: `Daily formation reminders sent`,
    sent: sentCount,
    alreadyActive: alreadyActiveCount,
    total: enrollments.length,
    results
  }
}

/**
 * Send daily reminder to a specific student (manual trigger)
 */
export async function sendDailyReminderToStudent(studentId: string, cohortId: string) {
  const reminder = await getDailyReminderForStudent(studentId, cohortId)
  
  if (!reminder) {
    return { success: false, message: 'Student already active today or no suitable reminder' }
  }

  const result = await createNotification({
    ...reminder,
    userId: studentId
  })

  return result
}

/**
 * Get daily reminder preview for a student (without sending)
 */
export async function getDailyReminderPreview(studentId: string, cohortId: string) {
  const reminder = await getDailyReminderForStudent(studentId, cohortId)
  return reminder
}
