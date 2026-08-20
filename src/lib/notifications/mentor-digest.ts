/**
 * Mentor Digest Generator
 * Creates aggregated daily summaries for mentors about their mentees
 * Includes active students, pending responses, milestones, and check-ins needed
 */

import { createClient } from '@/lib/supabase/server'
import { createNotification, NotificationPriority } from './factory'

interface MentorDigestConfig {
  enabled: boolean
  digestTime: string // HH:MM format
}

interface MentorDigestData {
  mentorId: string
  mentorName: string
  totalMentees: number
  activeToday: number
  awaitingResponse: number
  completedMilestones: number
  needCheckIn: number
  inactiveSevenDays: number
  priorities: Array<{
    type: 'response' | 'checkin' | 'milestone' | 'inactive'
    studentName: string
    context: string
    urgency: 'high' | 'medium' | 'low'
  }>
}

/**
 * Get digest data for a specific mentor
 */
async function getMentorDigestData(mentorId: string): Promise<MentorDigestData> {
  const supabase = await createClient()
  
  // Get all mentees for this mentor
  const { data: enrollments } = await supabase
    .from('enrollments')
    .select('student_id, student:profiles!student_id(full_name), cohort_id, current_week')
    .eq('mentor_id', mentorId)
    .in('status', ['enrolled', 'active'])
  
  if (!enrollments || enrollments.length === 0) {
    return {
      mentorId,
      mentorName: '',
      totalMentees: 0,
      activeToday: 0,
      awaitingResponse: 0,
      completedMilestones: 0,
      needCheckIn: 0,
      inactiveSevenDays: 0,
      priorities: []
    }
  }
  
  // Get mentor name
  const { data: mentor } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', mentorId)
    .single()
  
  const studentIds = enrollments.map(e => e.student_id)
  const today = new Date().toISOString().split('T')[0]
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  
  // Parallel queries for efficiency
  const [
    { data: todayActivity },
    { data: pendingTasks },
    { data: completedMilestones },
    { data: inactiveStudents },
    { data: pendingJournals }
  ] = await Promise.all([
    // Students active today
    supabase
      .from('student_activity_log')
      .select('student_id')
      .in('student_id', studentIds)
      .gte('created_at', today),
    
    // Tasks awaiting mentor response
    supabase
      .from('tasks')
      .select('student_id, student:profiles!student_id(full_name), enrollment:enrollments!enrollment_id(current_pillar)')
      .in('student_id', studentIds)
      .eq('status', 'submitted')
      .is('mentor_feedback', null),
    
    // Completed milestones (tasks with mentor_feedback approved)
    supabase
      .from('tasks')
      .select('student_id, student:profiles!student_id(full_name)')
      .in('student_id', studentIds)
      .eq('status', 'completed')
      .gte('updated_at', sevenDaysAgo),
    
    // Students inactive 7+ days
    supabase
      .from('student_activity_log')
      .select('student_id')
      .in('student_id', studentIds)
      .lt('created_at', sevenDaysAgo),
    
    // Journals awaiting mentor review
    supabase
      .from('journals')
      .select('student_id, student:profiles!student_id(full_name), week_number')
      .in('student_id', studentIds)
      .eq('is_shared', true)
      .is('mentor_reviewed', false)
  ])
  
  const activeTodayIds = new Set(todayActivity?.map(a => a.student_id) || [])
  const inactiveIds = new Set(inactiveStudents?.map(a => a.student_id) || [])
  
  // Build priorities list
  const priorities: MentorDigestData['priorities'] = []
  
  // High priority: Pending responses
  for (const task of pendingTasks || []) {
    priorities.push({
      type: 'response',
      studentName: task.student?.full_name || 'Unknown',
      context: `${task.enrollment?.current_pillar || 'formation'} task`,
      urgency: 'high'
    })
  }
  
  // High priority: Pending journal reviews
  for (const journal of pendingJournals || []) {
    priorities.push({
      type: 'response',
      studentName: journal.student?.full_name || 'Unknown',
      context: `Week ${journal.week_number} journal`,
      urgency: 'high'
    })
  }
  
  // Medium priority: Inactive students
  for (const studentId of inactiveIds) {
    const enrollment = enrollments.find(e => e.student_id === studentId)
    if (enrollment) {
      priorities.push({
        type: 'inactive',
        studentName: enrollment.student?.full_name || 'Unknown',
        context: 'inactive for 7+ days',
        urgency: 'medium'
      })
    }
  }
  
  // Low priority: Completed milestones
  for (const milestone of completedMilestones || []) {
    priorities.push({
      type: 'milestone',
      studentName: milestone.student?.full_name || 'Unknown',
      context: 'milestone completed',
      urgency: 'low'
    })
  }
  
  return {
    mentorId,
    mentorName: mentor?.full_name || '',
    totalMentees: enrollments.length,
    activeToday: activeTodayIds.size,
    awaitingResponse: (pendingTasks?.length || 0) + (pendingJournals?.length || 0),
    completedMilestones: completedMilestones?.length || 0,
    needCheckIn: inactiveIds.size,
    inactiveSevenDays: inactiveIds.size,
    priorities: priorities.slice(0, 10) // Limit to top 10 priorities
  }
}

/**
 * Generate digest message from digest data
 */
function generateDigestMessage(data: MentorDigestData): string {
  const lines = [
    `Good morning, ${data.mentorName.split(' ')[0]}.`,
    '',
    `You have ${data.totalMentees} mentees.`,
    '',
    `${data.activeToday} active today`,
    `${data.awaitingResponse} awaiting your response`,
    `${data.completedMilestones} completed milestones`,
    `${data.needCheckIn} need a check-in`,
    `${data.inactiveSevenDays} haven't engaged for 7 days`,
    ''
  ]
  
  if (data.priorities.length > 0) {
    lines.push("Today's priorities")
    lines.push('')
    
    for (const priority of data.priorities) {
      const icon = priority.urgency === 'high' ? '🔴' : priority.urgency === 'medium' ? '🟡' : '🟢'
      const action = priority.type === 'response' ? 'Respond to' :
                    priority.type === 'checkin' ? 'Check in with' :
                    priority.type === 'inactive' ? 'Reach out to' : 'Acknowledge'
      lines.push(`${icon} ${action} ${priority.studentName}'s ${priority.context}`)
    }
  }
  
  return lines.join('\n')
}

/**
 * Send mentor digest to a specific mentor
 */
async function sendMentorDigest(mentorId: string) {
  const digestData = await getMentorDigestData(mentorId)
  
  if (digestData.totalMentees === 0) {
    return { success: false, skipped: true, reason: 'No mentees' }
  }
  
  const message = generateDigestMessage(digestData)
  
  const result = await createNotification({
    userId: mentorId,
    title: 'MENTOR DIGEST',
    message,
    priority: NotificationPriority.ROUTINE,
    category: 'mentorship',
    type: 'mentor_digest',
    link: '/mentor/students',
    metadata: digestData
  })
  
  return result
}

/**
 * Send mentor digests to all active mentors
 */
export async function sendMentorDigests(config: MentorDigestConfig) {
  if (!config.enabled) {
    return { success: false, message: 'Mentor digest disabled' }
  }
  
  const supabase = await createClient()
  
  // Get all approved mentors
  const { data: mentors } = await supabase
    .from('profiles')
    .select('id')
    .eq('role', 'mentor')
    .eq('approved', true)
  
  if (!mentors || mentors.length === 0) {
    return { success: true, message: 'No mentors to send digest to', sent: 0 }
  }
  
  const results = []
  let sentCount = 0
  let skippedCount = 0
  
  for (const mentor of mentors) {
    const result = await sendMentorDigest(mentor.id)
    results.push({
      mentorId: mentor.id,
      result
    })
    
    if (result.success) {
      sentCount++
    } else if (result.skipped) {
      skippedCount++
    }
  }
  
  return {
    success: true,
    message: 'Mentor digests sent',
    sent: sentCount,
    skipped: skippedCount,
    total: mentors.length,
    results
  }
}

/**
 * Get mentor digest preview (without sending)
 */
export async function getMentorDigestPreview(mentorId: string) {
  const digestData = await getMentorDigestData(mentorId)
  const message = generateDigestMessage(digestData)
  
  return {
    data: digestData,
    message
  }
}

/**
 * Get all mentor health metrics for admin dashboard
 */
export async function getAllMentorHealthMetrics() {
  const supabase = await createClient()
  
  // Get all approved mentors
  const { data: mentors } = await supabase
    .from('profiles')
    .select('id, full_name')
    .eq('role', 'mentor')
    .eq('approved', true)
  
  if (!mentors || mentors.length === 0) {
    return []
  }
  
  const metrics = []
  
  for (const mentor of mentors) {
    const digestData = await getMentorDigestData(mentor.id)
    
    // Calculate average response time (mock for now - would need actual tracking)
    const avgResponseHours = 18 // Placeholder
    
    metrics.push({
      mentorId: mentor.id,
      mentorName: mentor.full_name,
      studentsAssigned: digestData.totalMentees,
      studentsActive: digestData.activeToday,
      reflectionsPending: digestData.awaitingResponse,
      avgResponseHours,
      checkInsCompleted: digestData.totalMentees - digestData.needCheckIn,
      studentsNeedingAttention: digestData.needCheckIn + digestData.awaitingResponse,
      lastActivity: new Date().toISOString() // Placeholder
    })
  }
  
  return metrics
}

/**
 * Update mentor health metrics in database
 */
export async function updateMentorHealthMetrics(mentorId: string) {
  const supabase = await createClient()
  
  const digestData = await getMentorDigestData(mentorId)
  
  const { error } = await supabase
    .from('mentor_health_metrics')
    .upsert({
      mentor_id: mentorId,
      students_assigned: digestData.totalMentees,
      students_active: digestData.activeToday,
      reflections_pending: digestData.awaitingResponse,
      avg_response_hours: 18, // Would calculate from actual data
      check_ins_completed: digestData.totalMentees - digestData.needCheckIn,
      check_ins_total: digestData.totalMentees,
      last_activity: new Date().toISOString(),
      last_updated_at: new Date().toISOString()
    }, { onConflict: 'mentor_id' })
  
  if (error) {
    return { success: false, error: error.message }
  }
  
  return { success: true }
}
