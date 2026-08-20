/**
 * Student Behavior Signals Analyzer
 * Analyzes individual student behavior patterns to detect health status
 * Returns signals: HEALTHY, WATCH, INTERVENTION, ESCALATION
 */

import { createClient } from '@/lib/supabase/server'

export type StudentSignal = 'HEALTHY' | 'WATCH' | 'INTERVENTION' | 'ESCALATION'

export interface StudentBehaviorAnalysis {
  studentId: string
  studentName: string
  cohortId: string
  signal: StudentSignal
  confidence: number // 0-100
  factors: {
    loginConsistency: number // 0-100
    reflectionCompletion: number // 0-100
    participation: number // 0-100
    mentorInteraction: number // 0-100
    practiceCompletion: number // 0-100
  }
  concerns: string[]
  recommendations: string[]
}

/**
 * Analyze a single student's behavior patterns
 */
export async function analyzeStudentBehavior(studentId: string, cohortId: string): Promise<StudentBehaviorAnalysis> {
  const supabase = await createClient()
  
  const now = new Date()
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  
  // Get student info
  const { data: student } = await supabase
    .from('profiles')
    .select('full_name, created_at')
    .eq('id', studentId)
    .single()
  
  // Get enrollment info
  const { data: enrollment } = await supabase
    .from('enrollments')
    .select('current_week, current_pillar, mentor_id')
    .eq('student_id', studentId)
    .eq('cohort_id', cohortId)
    .single()
  
  // Parallel queries for behavior factors
  const [
    { data: activityLog },
    { data: journals },
    { data: tasks },
    { data: messages },
    { data: discussionPosts },
    { data: commitments }
  ] = await Promise.all([
    // Login/activity consistency (last 30 days)
    supabase
      .from('student_activity_log')
      .select('created_at, activity_type')
      .eq('student_id', studentId)
      .gte('created_at', thirtyDaysAgo),
    
    // Reflection completion (journals)
    supabase
      .from('journals')
      .select('created_at, week_number')
      .eq('student_id', studentId)
      .gte('created_at', sevenDaysAgo),
    
    // Task completion
    supabase
      .from('tasks')
      .select('status, submitted_at, created_at')
      .eq('student_id', studentId)
      .gte('created_at', thirtyDaysAgo),
    
    // Mentor interaction (messages)
    supabase
      .from('messages')
      .select('created_at, sender_id')
      .in('conversation_id', (
        await supabase.from('conversations').select('id').contains('participant_ids', [studentId])
      ).data?.map(c => c.id) || [])
      .gte('created_at', sevenDaysAgo),
    
    // Community participation
    supabase
      .from('discussion_posts')
      .select('created_at')
      .eq('author_id', studentId)
      .eq('cohort_id', cohortId)
      .gte('created_at', sevenDaysAgo),
    
    // Practice completion
    supabase
      .from('formation_commitments')
      .select('status, created_at')
      .eq('student_id', studentId)
      .eq('cohort_id', cohortId)
      .gte('created_at', thirtyDaysAgo)
  ])
  
  // Calculate factors
  
  // 1. Login Consistency (activity frequency over 30 days)
  const activityDays = new Set(
    activityLog?.map(a => a.created_at.split('T')[0]) || []
  ).size
  const loginConsistency = Math.min(100, (activityDays / 20) * 100) // Target: 20 days/month
  
  // 2. Reflection Completion (journal entries in last 7 days)
  const journalCount = journals?.length || 0
  const reflectionCompletion = Math.min(100, (journalCount / 2) * 100) // Target: 2/week
  
  // 3. Task Completion Rate
  const completedTasks = tasks?.filter(t => t.status === 'completed' || t.status === 'submitted').length || 0
  const totalTasks = tasks?.length || 1
  const taskCompletionRate = (completedTasks / totalTasks) * 100
  
  // 4. Mentor Interaction (messages with mentor in last 7 days)
  const mentorMessages = messages?.filter(m => {
    // Check if sender is a mentor (would need to look up role)
    // For now, count all messages as proxy
    return true
  }).length || 0
  const mentorInteraction = Math.min(100, (mentorMessages / 3) * 100) // Target: 3/week
  
  // 5. Practice Completion
  const completedPractices = commitments?.filter(c => c.status === 'done').length || 0
  const totalPractices = commitments?.length || 1
  const practiceCompletion = (completedPractices / totalPractices) * 100
  
  // 6. Community Participation
  const postCount = discussionPosts?.length || 0
  const participation = Math.min(100, (postCount / 2) * 100) // Target: 2/week
  
  const factors = {
    loginConsistency: Math.round(loginConsistency),
    reflectionCompletion: Math.round(reflectionCompletion),
    participation: Math.round(participation),
    mentorInteraction: Math.round(mentorInteraction),
    practiceCompletion: Math.round(practiceCompletion)
  }
  
  // Calculate overall score
  const overallScore = (
    factors.loginConsistency * 0.25 +
    factors.reflectionCompletion * 0.2 +
    factors.participation * 0.15 +
    factors.mentorInteraction * 0.2 +
    factors.practiceCompletion * 0.2
  )
  
  // Determine signal and concerns
  const concerns: string[] = []
  const recommendations: string[] = []
  let signal: StudentSignal = 'HEALTHY'
  
  if (factors.loginConsistency < 40) {
    concerns.push('Low login consistency - student rarely accesses platform')
    recommendations.push('Send gentle reminder about formation journey')
  }
  
  if (factors.reflectionCompletion < 30) {
    concerns.push('Poor journal completion - not engaging in reflection')
    recommendations.push('Check if student understands journaling importance')
  }
  
  if (factors.mentorInteraction < 30) {
    concerns.push('Minimal mentor interaction - communication gap')
    recommendations.push('Mentor should reach out to rebuild connection')
  }
  
  if (factors.practiceCompletion < 40) {
    concerns.push('Low practice completion - not applying formation')
    recommendations.push('Review practice commitments and provide support')
  }
  
  if (factors.participation < 20) {
    concerns.push('No community participation - isolated from cohort')
    recommendations.push('Encourage engagement in cohort discussions')
  }
  
  // Determine signal based on overall score and specific concerns
  if (overallScore >= 70 && concerns.length === 0) {
    signal = 'HEALTHY'
  } else if (overallScore >= 50 && concerns.length <= 2) {
    signal = 'WATCH'
    recommendations.push('Monitor closely for next 2 weeks')
  } else if (overallScore >= 30 || concerns.length <= 4) {
    signal = 'INTERVENTION'
    recommendations.push('Mentor should schedule check-in call')
    recommendations.push('Consider additional support resources')
  } else {
    signal = 'ESCALATION'
    recommendations.push('Immediate leadership intervention required')
    recommendations.push('Assess if student should continue in program')
  }
  
  // Add inactivity check
  const lastActivity = activityLog?.[0]?.created_at
  if (lastActivity) {
    const daysSinceActivity = Math.floor((new Date().getTime() - new Date(lastActivity).getTime()) / (1000 * 60 * 60 * 24))
    if (daysSinceActivity >= 14) {
      signal = 'ESCALATION'
      concerns.push(`Severely inactive - ${daysSinceActivity} days since last activity`)
    } else if (daysSinceActivity >= 7) {
      if (signal !== 'ESCALATION') signal = 'INTERVENTION'
      concerns.push(`Inactive for ${daysSinceActivity} days`)
    }
  }
  
  return {
    studentId,
    studentName: student?.full_name || 'Unknown',
    cohortId,
    signal,
    confidence: Math.round(overallScore),
    factors,
    concerns,
    recommendations
  }
}

/**
 * Analyze all students in a cohort
 */
export async function analyzeCohortStudents(cohortId: string): Promise<StudentBehaviorAnalysis[]> {
  const supabase = await createClient()
  
  const { data: enrollments } = await supabase
    .from('enrollments')
    .select('student_id')
    .eq('cohort_id', cohortId)
    .in('status', ['enrolled', 'active'])
  
  if (!enrollments || enrollments.length === 0) {
    return []
  }
  
  const analyses = await Promise.all(
    enrollments.map(e => analyzeStudentBehavior(e.student_id, cohortId))
  )
  
  return analyses
}

/**
 * Get signal summary for admin dashboard
 */
export async function getSignalSummary(cohortId?: string) {
  const analyses = cohortId 
    ? await analyzeCohortStudents(cohortId)
    : await analyzeAllStudents()
  
  const summary = {
    total: analyses.length,
    healthy: analyses.filter(a => a.signal === 'HEALTHY').length,
    watch: analyses.filter(a => a.signal === 'WATCH').length,
    intervention: analyses.filter(a => a.signal === 'INTERVENTION').length,
    escalation: analyses.filter(a => a.signal === 'ESCALATION').length,
    students: analyses.filter(a => a.signal !== 'HEALTHY')
  }
  
  return summary
}

/**
 * Analyze all students across all cohorts
 */
async function analyzeAllStudents(): Promise<StudentBehaviorAnalysis[]> {
  const supabase = await createClient()
  
  const { data: enrollments } = await supabase
    .from('enrollments')
    .select('student_id, cohort_id')
    .in('status', ['enrolled', 'active'])
  
  if (!enrollments || enrollments.length === 0) {
    return []
  }
  
  const analyses = await Promise.all(
    enrollments.map(e => analyzeStudentBehavior(e.student_id, e.cohort_id))
  )
  
  return analyses
}

/**
 * Get student journey timeline for detailed view
 */
export async function getStudentJourneyTimeline(studentId: string) {
  const supabase = await createClient()
  
  const { data: student } = await supabase
    .from('profiles')
    .select('full_name, created_at')
    .eq('id', studentId)
    .single()
  
  const { data: enrollments } = await supabase
    .from('enrollments')
    .select('*, cohort:cohorts(name)')
    .eq('student_id', studentId)
    .order('created_at', { ascending: false })
  
  const { data: tasks } = await supabase
    .from('tasks')
    .select('*, enrollment:enrollments!enrollment_id(current_pillar)')
    .eq('student_id', studentId)
    .order('created_at', { ascending: true })
  
  const { data: journals } = await supabase
    .from('journals')
    .select('*')
    .eq('student_id', studentId)
    .order('created_at', { ascending: true })
  
  const { data: activityLog } = await supabase
    .from('student_activity_log')
    .select('*')
    .eq('student_id', studentId)
    .order('created_at', { ascending: true })
    .limit(50)
  
  // Build timeline
  const timeline: Array<{
    date: string
    event: string
    type: 'milestone' | 'activity' | 'reflection' | 'engagement'
    details?: string
  }> = []
  
  // Profile creation
  if (student?.created_at) {
    timeline.push({
      date: student.created_at,
      event: 'Joined MUI',
      type: 'milestone'
    })
  }
  
  // Enrollments
  enrollments?.forEach(e => {
    timeline.push({
      date: e.created_at,
      event: `Enrolled in ${e.cohort?.name || 'Cohort'}`,
      type: 'milestone',
      details: `Mentor assigned: ${e.mentor_id ? 'Yes' : 'No'}`
    })
  })
  
  // Tasks
  tasks?.forEach(t => {
    timeline.push({
      date: t.created_at,
      event: `Task ${t.status}`,
      type: 'activity',
      details: t.enrollment?.current_pillar
    })
  })
  
  // Journals
  journals?.forEach(j => {
    timeline.push({
      date: j.created_at,
      event: 'Journal Entry',
      type: 'reflection',
      details: `Week ${j.week_number}`
    })
  })
  
  // Activity log
  activityLog?.forEach(a => {
    timeline.push({
      date: a.created_at,
      event: a.activity_type.replace('_', ' ').toUpperCase(),
      type: 'engagement'
    })
  })
  
  // Sort by date
  timeline.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  
  return {
    studentName: student?.full_name,
    timeline
  }
}
