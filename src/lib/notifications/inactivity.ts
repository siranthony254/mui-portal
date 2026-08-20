/**
 * Inactivity Detection System
 * Monitors student activity and sends escalating reminders
 * Alerts mentors and admins based on inactivity thresholds
 */

import { createClient } from '@/lib/supabase/server'
import { createNotification, NotificationTemplates, NotificationPriority, NotificationCategory, NotificationType } from './factory'

interface InactivityConfig {
  enabled: boolean
  firstReminderDays: number
  mentorAlertDays: number
  adminEscalationDays: number
}

interface StudentInactivityStatus {
  studentId: string
  studentName: string
  cohortId: string
  daysInactive: number
  lastActivity: string | null
  mentorId: string | null
  status: 'active' | 'warning' | 'alert' | 'escalation'
}

/**
 * Get student's last activity timestamp
 */
async function getLastActivity(studentId: string): Promise<Date | null> {
  const supabase = await createClient()
  
  const { data: activity } = await supabase
    .from('student_activity_log')
    .select('created_at')
    .eq('student_id', studentId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()
  
  return activity?.created_at ? new Date(activity.created_at) : null
}

/**
 * Calculate days inactive for a student
 */
async function getDaysInactive(studentId: string): Promise<number> {
  const lastActivity = await getLastActivity(studentId)
  
  if (!lastActivity) {
    // Never logged activity - use profile created_at as fallback
    const supabase = await createClient()
    const { data: profile } = await supabase
      .from('profiles')
      .select('created_at')
      .eq('id', studentId)
      .single()
    
    if (profile?.created_at) {
      return Math.floor((new Date().getTime() - new Date(profile.created_at).getTime()) / (1000 * 60 * 60 * 24))
    }
    
    return 999 // Very long inactive
  }
  
  const now = new Date()
  const diffTime = now.getTime() - lastActivity.getTime()
  return Math.floor(diffTime / (1000 * 60 * 60 * 24))
}

/**
 * Get inactivity status for all students
 */
export async function getAllStudentInactivityStatus(): Promise<StudentInactivityStatus[]> {
  const supabase = await createClient()
  
  // Get all enrolled students
  const { data: enrollments } = await supabase
    .from('enrollments')
    .select('student_id, cohort_id, mentor_id, student:profiles!student_id(full_name)')
    .in('status', ['enrolled', 'active'])
  
  if (!enrollments || enrollments.length === 0) {
    return []
  }
  
  const statuses: StudentInactivityStatus[] = []
  
  for (const enrollment of enrollments) {
    const daysInactive = await getDaysInactive(enrollment.student_id)
    const lastActivity = await getLastActivity(enrollment.student_id)
    
    let status: StudentInactivityStatus['status'] = 'active'
    
    if (daysInactive >= 14) {
      status = 'escalation'
    } else if (daysInactive >= 7) {
      status = 'alert'
    } else if (daysInactive >= 3) {
      status = 'warning'
    }
    
    statuses.push({
      studentId: enrollment.student_id,
      studentName: enrollment.student?.[0]?.full_name || 'Unknown',
      cohortId: enrollment.cohort_id,
      daysInactive,
      lastActivity: lastActivity?.toISOString() || null,
      mentorId: enrollment.mentor_id,
      status
    })
  }
  
  return statuses
}

/**
 * Send inactivity reminder to student
 */
async function sendStudentReminder(
  studentId: string,
  daysInactive: number,
  config: InactivityConfig
) {
  const supabase = await createClient()
  
  // Get student's current context (what were they working on)
  const { data: lastTask } = await supabase
    .from('tasks')
    .select('*, enrollment:enrollments!enrollment_id(current_pillar)')
    .eq('student_id', studentId)
    .order('submitted_at', { ascending: false })
    .limit(1)
    .single()
  
  const context = lastTask?.enrollment?.current_pillar || 'your formation journey'
  
  // Choose appropriate template based on days inactive
  let template
  if (daysInactive >= config.mentorAlertDays) {
    template = NotificationTemplates.inactivityEscalation(daysInactive, context)
  } else {
    template = NotificationTemplates.inactivityReminder(daysInactive)
  }
  
  const result = await createNotification({
    ...template,
    userId: studentId
  })
  
  // Log the reminder sent
  await supabase.from('student_activity_log').insert({
    student_id: studentId,
    activity_type: 'inactivity_reminder',
    metadata: {
      days_inactive: daysInactive,
      reminder_type: daysInactive >= config.mentorAlertDays ? 'escalation' : 'gentle'
    }
  })
  
  return result
}

/**
 * Alert mentor about inactive student
 */
async function alertMentor(
  mentorId: string,
  studentId: string,
  studentName: string,
  daysInactive: number
) {
  const supabase = await createClient()
  
  const { data: mentor } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', mentorId)
    .single()
  
  const result = await createNotification({
    userId: mentorId,
    title: '🟡 Student may need a check-in',
    message: `${studentName} has been inactive for ${daysInactive} days. Consider reaching out to them.`,
    priority: NotificationPriority.ACTION_REQUIRED,
    category: NotificationCategory.MENTORSHIP,
    type: NotificationType.MENTOR_MESSAGE,
    link: '/mentor/students',
    metadata: { student_id: studentId, student_name: studentName, days_inactive: daysInactive }
  })
  
  // Log the mentor alert
  await supabase.from('student_activity_log').insert({
    student_id: studentId,
    activity_type: 'mentor_alert',
    metadata: { mentor_id: mentorId, days_inactive: daysInactive }
  })
  
  return result
}

/**
 * Escalate to admin about severely inactive student
 */
async function escalateToAdmin(
  studentId: string,
  studentName: string,
  daysInactive: number,
  cohortId: string
) {
  const supabase = await createClient()
  
  // Get all admins
  const { data: admins } = await supabase
    .from('profiles')
    .select('id')
    .eq('role', 'admin')
  
  if (!admins || admins.length === 0) {
    return { success: false, error: 'No admins found' }
  }
  
  // Get cohort info
  const { data: cohort } = await supabase
    .from('cohorts')
    .select('name')
    .eq('id', cohortId)
    .single()
  
  const results = await Promise.all(
    admins.map(admin =>
      createNotification({
        userId: admin.id,
        title: '🔴 Student Inactivity Escalation',
        message: `${studentName} (${cohort?.name || 'Unknown Cohort'}) has been inactive for ${daysInactive} days. Leadership intervention may be required.`,
        priority: NotificationPriority.INTERVENTION,
        category: NotificationCategory.ADMIN,
        type: NotificationType.BROADCAST,
        link: '/admin/students',
        metadata: { student_id: studentId, student_name: studentName, cohortId, days_inactive: daysInactive }
      })
    )
  )
  
  // Log the escalation
  await supabase.from('student_activity_log').insert({
    student_id: studentId,
    activity_type: 'admin_escalation',
    metadata: { days_inactive: daysInactive, cohortId }
  })
  
  return { success: true, results }
}

/**
 * Run inactivity check for all students
 */
export async function runInactivityCheck(config: InactivityConfig) {
  if (!config.enabled) {
    return { success: false, message: 'Inactivity check disabled' }
  }
  
  const statuses = await getAllStudentInactivityStatus()
  
  const results = {
    gentleReminders: 0,
    mentorAlerts: 0,
    adminEscalations: 0,
    alreadyAlerted: 0,
    details: [] as any[]
  }
  
  for (const status of statuses) {
    // Skip active students
    if (status.status === 'active') continue
    
    // Check if we already sent a reminder recently (within last 48 hours)
    const supabase = await createClient()
    const twoDaysAgo = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString()
    
    const { count: recentReminder } = await supabase
      .from('student_activity_log')
      .select('*', { count: 'exact', head: true })
      .eq('student_id', status.studentId)
      .eq('activity_type', 'inactivity_reminder')
      .gte('created_at', twoDaysAgo)
    
    if (recentReminder && recentReminder > 0) {
      results.alreadyAlerted++
      continue
    }
    
    // Send appropriate notification based on inactivity level
    if (status.status === 'escalation' && status.daysInactive >= config.adminEscalationDays) {
      // Escalate to admin
      const escalationResult = await escalateToAdmin(
        status.studentId,
        status.studentName,
        status.daysInactive,
        status.cohortId
      )
      
      if (escalationResult.success) {
        results.adminEscalations++
        results.details.push({
          studentId: status.studentId,
          studentName: status.studentName,
          action: 'admin_escalation',
          daysInactive: status.daysInactive
        })
      }
    } else if (status.status === 'alert' && status.daysInactive >= config.mentorAlertDays) {
      // Alert mentor
      if (status.mentorId) {
        const alertResult = await alertMentor(
          status.mentorId,
          status.studentId,
          status.studentName,
          status.daysInactive
        )
        
        if (alertResult.success) {
          results.mentorAlerts++
          results.details.push({
            studentId: status.studentId,
            studentName: status.studentName,
            action: 'mentor_alert',
            daysInactive: status.daysInactive
          })
        }
      }
      
      // Also send student reminder
      const reminderResult = await sendStudentReminder(
        status.studentId,
        status.daysInactive,
        config
      )
      
      if (reminderResult.success) {
        results.gentleReminders++
      }
    } else if (status.status === 'warning' && status.daysInactive >= config.firstReminderDays) {
      // Send gentle reminder to student
      const reminderResult = await sendStudentReminder(
        status.studentId,
        status.daysInactive,
        config
      )
      
      if (reminderResult.success) {
        results.gentleReminders++
        results.details.push({
          studentId: status.studentId,
          studentName: status.studentName,
          action: 'gentle_reminder',
          daysInactive: status.daysInactive
        })
      }
    }
  }
  
  return {
    success: true,
    message: 'Inactivity check completed',
    ...results
  }
}

/**
 * Get inactivity report for admin dashboard
 */
export async function getInactivityReport() {
  const statuses = await getAllStudentInactivityStatus()
  
  const summary = {
    total: statuses.length,
    active: statuses.filter(s => s.status === 'active').length,
    warning: statuses.filter(s => s.status === 'warning').length,
    alert: statuses.filter(s => s.status === 'alert').length,
    escalation: statuses.filter(s => s.status === 'escalation').length,
    students: statuses.filter(s => s.status !== 'active')
  }
  
  return summary
}
