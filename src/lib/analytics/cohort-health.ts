/**
 * Cohort Health Analytics
 * Provides comprehensive cohort health metrics for admin intelligence
 * Includes engagement, reflection, mentor engagement, practice, community, and retention
 */

import { createClient } from '@/lib/supabase/server'

export interface CohortHealthMetrics {
  cohortId: string
  cohortName: string
  engagement: {
    activeThisWeek: number
    totalStudents: number
    percentage: number
  }
  reflection: {
    completed: number
    total: number
    percentage: number
  }
  mentorEngagement: {
    reviewed: number
    submitted: number
    percentage: number
  }
  practice: {
    completed: number
    total: number
    percentage: number
  }
  community: {
    participated: number
    total: number
    percentage: number
  }
  retention: {
    active: number
    started: number
    percentage: number
  }
  overallHealth: number // 0-100 score
}

/**
 * Get health metrics for a specific cohort
 */
export async function getCohortHealthMetrics(cohortId: string): Promise<CohortHealthMetrics> {
  const supabase = await createClient()
  
  const now = new Date()
  const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay())).toISOString()
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  
  // Get cohort info
  const { data: cohort } = await supabase
    .from('cohorts')
    .select('name')
    .eq('id', cohortId)
    .single()
  
  // Get total enrolled students
  const { count: totalStudents } = await supabase
    .from('enrollments')
    .select('*', { count: 'exact', head: true })
    .eq('cohort_id', cohortId)
    .in('status', ['enrolled', 'active'])
  
  if (!totalStudents || totalStudents === 0) {
    return {
      cohortId,
      cohortName: cohort?.name || 'Unknown',
      engagement: { activeThisWeek: 0, totalStudents: 0, percentage: 0 },
      reflection: { completed: 0, total: 0, percentage: 0 },
      mentorEngagement: { reviewed: 0, submitted: 0, percentage: 0 },
      practice: { completed: 0, total: 0, percentage: 0 },
      community: { participated: 0, total: 0, percentage: 0 },
      retention: { active: 0, started: 0, percentage: 0 },
      overallHealth: 0
    }
  }
  
  // Parallel queries for all metrics
  const [
    { data: activeStudents },
    { data: journalEntries },
    { data: tasksWithFeedback },
    { data: submittedTasks },
    { data: completedPractices },
    { data: totalPractices },
    { data: discussionParticipants },
    { data: activeEnrollments },
    { count: startedCount }
  ] = await Promise.all([
    // Students active this week (logged in or submitted something)
    supabase
      .from('student_activity_log')
      .select('student_id')
      .eq('cohort_id', cohortId)
      .gte('created_at', startOfWeek),
    
    // Journal entries this week
    supabase
      .from('journals')
      .select('student_id')
      .gte('created_at', sevenDaysAgo),
    
    // Tasks with mentor feedback
    supabase
      .from('tasks')
      .select('id')
      .in('enrollment_id', (
        await supabase.from('enrollments').select('id').eq('cohort_id', cohortId)
      ).data?.map(e => e.id) || [])
      .not('mentor_feedback', 'is', null),
    
    // Tasks submitted (for mentor engagement calculation)
    supabase
      .from('tasks')
      .select('id')
      .in('enrollment_id', (
        await supabase.from('enrollments').select('id').eq('cohort_id', cohortId)
      ).data?.map(e => e.id) || [])
      .eq('status', 'submitted'),
    
    // Completed formation practices
    supabase
      .from('formation_commitments')
      .select('student_id')
      .eq('cohort_id', cohortId)
      .eq('status', 'done'),
    
    // Total formation commitments
    supabase
      .from('formation_commitments')
      .select('student_id')
      .eq('cohort_id', cohortId),
    
    // Discussion participants this week
    supabase
      .from('discussion_posts')
      .select('author_id')
      .eq('cohort_id', cohortId)
      .gte('created_at', startOfWeek),
    
    // Currently active enrollments
    supabase
      .from('enrollments')
      .select('student_id')
      .eq('cohort_id', cohortId)
      .in('status', ['enrolled', 'active']),
    
    // Total students who ever started (including left)
    supabase
      .from('enrollments')
      .select('*', { count: 'exact', head: true })
      .eq('cohort_id', cohortId)
  ])
  
  // Calculate metrics
  const activeStudentIds = new Set(activeStudents?.map(s => s.student_id) || [])
  const engagement = {
    activeThisWeek: activeStudentIds.size,
    totalStudents,
    percentage: Math.round((activeStudentIds.size / totalStudents) * 100)
  }
  
  const journalStudentIds = new Set(journalEntries?.map(j => j.student_id) || [])
  const reflection = {
    completed: journalStudentIds.size,
    total: totalStudents,
    percentage: Math.round((journalStudentIds.size / totalStudents) * 100)
  }
  
  const mentorEngagement = {
    reviewed: tasksWithFeedback?.length || 0,
    submitted: submittedTasks?.length || 0,
    percentage: submittedTasks && submittedTasks.length > 0 
      ? Math.round(((tasksWithFeedback?.length || 0) / submittedTasks.length) * 100)
      : 0
  }
  
  const practiceStudentIds = new Set(completedPractices?.map(p => p.student_id) || [])
  const practice = {
    completed: practiceStudentIds.size,
    total: totalPractices?.length || 0,
    percentage: totalPractices && totalPractices.length > 0
      ? Math.round((practiceStudentIds.size / totalStudents) * 100)
      : 0
  }
  
  const discussionStudentIds = new Set(discussionParticipants?.map(d => d.author_id) || [])
  const community = {
    participated: discussionStudentIds.size,
    total: totalStudents,
    percentage: Math.round((discussionStudentIds.size / totalStudents) * 100)
  }
  
  const retention = {
    active: activeEnrollments?.length || 0,
    started: startedCount || totalStudents,
    percentage: startedCount && startedCount > 0
      ? Math.round(((activeEnrollments?.length || 0) / startedCount) * 100)
      : 100
  }
  
  // Calculate overall health score (weighted average)
  const overallHealth = Math.round(
    (engagement.percentage * 0.25) +
    (reflection.percentage * 0.2) +
    (mentorEngagement.percentage * 0.2) +
    (practice.percentage * 0.15) +
    (community.percentage * 0.1) +
    (retention.percentage * 0.1)
  )
  
  return {
    cohortId,
    cohortName: cohort?.name || 'Unknown',
    engagement,
    reflection,
    mentorEngagement,
    practice,
    community,
    retention,
    overallHealth
  }
}

/**
 * Get health metrics for all cohorts
 */
export async function getAllCohortHealthMetrics(): Promise<CohortHealthMetrics[]> {
  const supabase = await createClient()
  
  const { data: cohorts } = await supabase
    .from('cohorts')
    .select('id')
    .eq('status', 'active')
  
  if (!cohorts || cohorts.length === 0) {
    return []
  }
  
  const metrics = await Promise.all(
    cohorts.map(cohort => getCohortHealthMetrics(cohort.id))
  )
  
  return metrics
}

/**
 * Get formation bottleneck detection
 * Identifies sessions with unusually high drop-off rates
 */
export async function detectFormationBottlenecks(cohortId: string) {
  const supabase = await createClient()
  
  // Get session completion data
  const { data: sessionCompletions } = await supabase
    .from('session_completions')
    .select('session_number, student_id')
    .eq('cohort_id', cohortId)
  
  if (!sessionCompletions || sessionCompletions.length === 0) {
    return { bottlenecks: [], message: 'No session data available' }
  }
  
  // Calculate completion rate per session
  const sessionStats = new Map<number, { completed: number; total: number }>()
  
  // Get total students in cohort
  const { count: totalStudents } = await supabase
    .from('enrollments')
    .select('*', { count: 'exact', head: true })
    .eq('cohort_id', cohortId)
    .in('status', ['enrolled', 'active'])
  
  if (!totalStudents || totalStudents === 0) {
    return { bottlenecks: [], message: 'No students in cohort' }
  }
  
  // Group by session number
  for (const completion of sessionCompletions) {
    const sessionNum = completion.session_number
    if (!sessionStats.has(sessionNum)) {
      sessionStats.set(sessionNum, { completed: 0, total: totalStudents })
    }
    sessionStats.get(sessionNum)!.completed++
  }
  
  // Calculate average completion rate
  const rates = Array.from(sessionStats.values()).map(s => s.completed / s.total)
  const averageRate = rates.length > 0 ? rates.reduce((a, b) => a + b, 0) / rates.length : 0
  
  // Identify bottlenecks (sessions with >20% drop-off from average)
  const bottlenecks = []
  
  for (const [sessionNum, stats] of sessionStats.entries()) {
    const rate = stats.completed / stats.total
    const dropOff = averageRate - rate
    
    if (dropOff > 0.2) {
      bottlenecks.push({
        sessionNumber: sessionNum,
        completionRate: Math.round(rate * 100),
        averageRate: Math.round(averageRate * 100),
        dropOffPercentage: Math.round(dropOff * 100),
        severity: dropOff > 0.4 ? 'critical' : dropOff > 0.3 ? 'high' : 'moderate'
      })
    }
  }
  
  return {
    bottlenecks: bottlenecks.sort((a, b) => b.dropOffPercentage - a.dropOffPercentage),
    averageCompletionRate: Math.round(averageRate * 100),
    message: bottlenecks.length > 0 
      ? `Found ${bottlenecks.length} formation bottleneck(s)` 
      : 'No formation bottlenecks detected'
  }
}

/**
 * Get platform-wide health summary for admin dashboard
 */
export async function getPlatformHealthSummary() {
  const cohortMetrics = await getAllCohortHealthMetrics()
  
  if (cohortMetrics.length === 0) {
    return {
      totalCohorts: 0,
      overallHealth: 0,
      totalStudents: 0,
      activeStudents: 0,
      averageEngagement: 0,
      averageReflection: 0,
      averageMentorEngagement: 0
    }
  }
  
  const totalStudents = cohortMetrics.reduce((sum, m) => sum + m.engagement.totalStudents, 0)
  const activeStudents = cohortMetrics.reduce((sum, m) => sum + m.engagement.activeThisWeek, 0)
  const averageEngagement = cohortMetrics.reduce((sum, m) => sum + m.engagement.percentage, 0) / cohortMetrics.length
  const averageReflection = cohortMetrics.reduce((sum, m) => sum + m.reflection.percentage, 0) / cohortMetrics.length
  const averageMentorEngagement = cohortMetrics.reduce((sum, m) => sum + m.mentorEngagement.percentage, 0) / cohortMetrics.length
  const overallHealth = cohortMetrics.reduce((sum, m) => sum + m.overallHealth, 0) / cohortMetrics.length
  
  return {
    totalCohorts: cohortMetrics.length,
    overallHealth: Math.round(overallHealth),
    totalStudents,
    activeStudents,
    averageEngagement: Math.round(averageEngagement),
    averageReflection: Math.round(averageReflection),
    averageMentorEngagement: Math.round(averageMentorEngagement)
  }
}
