/**
 * Notification Factory
 * Centralized system for creating notifications with priority levels and categories
 */

export enum NotificationPriority {
  ROUTINE = 'routine',
  SOCIAL = 'social',
  ACTION_REQUIRED = 'action_required',
  INTERVENTION = 'intervention'
}

export enum NotificationCategory {
  FORMATION = 'formation',
  MENTORSHIP = 'mentorship',
  ACCOUNTABILITY = 'accountability',
  SOCIAL = 'social',
  ADMIN = 'admin',
  SYSTEM = 'system'
}

export enum NotificationType {
  // Formation
  DAILY_REMINDER = 'daily_reminder',
  SESSION_READY = 'session_ready',
  PRACTICE_DUE = 'practice_due',
  REFLECTION_PROMPT = 'reflection_prompt',
  WEEKLY_SUMMARY = 'weekly_summary',
  
  // Mentorship
  MENTOR_ASSIGNED = 'mentor_assigned',
  MENTOR_MESSAGE = 'mentor_message',
  MENTOR_REQUEST_REVISION = 'mentor_request_revision',
  MENTOR_ASSIGN_PRACTICE = 'mentor_assign_practice',
  MENTOR_REQUEST_CHECKIN = 'mentor_request_checkin',
  MENTOR_MILESTONE_APPROVED = 'mentor_milestone_approved',
  MENTOR_AVAILABLE = 'mentor_available',
  
  // Accountability
  PEER_ASSIGNED = 'peer_assigned',
  PEER_CHECKIN = 'peer_checkin',
  COMMITMENT_DUE = 'commitment_due',
  COMMITMENT_REMINDER = 'commitment_reminder',
  
  // Social
  PEER_RESPONSE = 'peer_response',
  MENTION = 'mention',
  REACTION = 'reaction',
  COHORT_DISCUSSION = 'cohort_discussion',
  
  // Admin
  BROADCAST = 'broadcast',
  ADMISSION = 'admission',
  ACCEPTANCE = 'acceptance',
  
  // System
  INACTIVITY_REMINDER = 'inactivity_reminder',
  INACTIVITY_ESCALATION = 'inactivity_escalation',
  SYSTEM_UPDATE = 'system_update'
}

export interface NotificationData {
  userId: string
  title: string
  message: string
  priority: NotificationPriority
  category: NotificationCategory
  type: NotificationType
  link?: string
  metadata?: Record<string, any>
}

export interface NotificationResult {
  success: boolean
  notificationId?: string
  error?: string
  skipped?: boolean
  skipReason?: string
}

/**
 * Create a single notification
 */
export async function createNotification(data: NotificationData): Promise<NotificationResult> {
  const { createClient } = await import('@/lib/supabase/server')
  const supabase = await createClient()

  try {
    // Check user preferences before creating notification
    const { data: preferences } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', data.userId)
      .single()

    // Skip if in quiet hours (unless intervention priority)
    if (preferences && data.priority !== NotificationPriority.INTERVENTION) {
      const now = new Date()
      const currentTime = now.toTimeString().slice(0, 5) // HH:MM format
      
      if (currentTime >= preferences.quiet_hours_start && currentTime < preferences.quiet_hours_end) {
        return {
          success: false,
          skipped: true,
          skipReason: 'quiet_hours'
        }
      }
    }

    // Skip if category disabled (unless intervention priority)
    if (preferences && data.priority !== NotificationPriority.INTERVENTION) {
      const categoryEnabled = preferences.categories?.[data.category] ?? true
      if (!categoryEnabled) {
        return {
          success: false,
          skipped: true,
          skipReason: 'category_disabled'
        }
      }
    }

    // Create notification
    const { data: notification, error } = await supabase
      .from('notifications')
      .insert({
        user_id: data.userId,
        title: data.title,
        message: data.message,
        priority: data.priority,
        category: data.category,
        type: data.type,
        link: data.link,
        metadata: data.metadata || {}
      })
      .select('id')
      .single()

    if (error) {
      return {
        success: false,
        error: error.message
      }
    }

    return {
      success: true,
      notificationId: notification.id
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Unknown error'
    }
  }
}

/**
 * Create notifications for multiple users (batch)
 */
export async function createBulkNotifications(
  userIds: string[],
  baseNotification: Omit<NotificationData, 'userId'>
): Promise<{ success: number; failed: number; skipped: number; results: NotificationResult[] }> {
  const results = await Promise.all(
    userIds.map(userId => createNotification({ ...baseNotification, userId }))
  )

  return {
    success: results.filter(r => r.success).length,
    failed: results.filter(r => !r.success && !r.skipped).length,
    skipped: results.filter(r => r.skipped).length,
    results
  }
}

/**
 * Pre-built notification templates for common scenarios
 */
export const NotificationTemplates = {
  // Formation Templates
  dailyReminder: (studentName: string, question: string): NotificationData => ({
    title: '🧭 Today\'s formation',
    message: `You have one question waiting for you today:\n"${question}"\n\nTake 5 minutes to reflect.`,
    priority: NotificationPriority.ROUTINE,
    category: NotificationCategory.FORMATION,
    type: NotificationType.DAILY_REMINDER,
    link: '/dashboard',
    metadata: { question }
  }),

  sessionReady: (sessionNumber: number, sessionTitle: string): NotificationData => ({
    title: '🧠 Something to think about',
    message: `Today's session is ready. Give yourself 15 minutes to explore ${sessionTitle}.`,
    priority: NotificationPriority.ROUTINE,
    category: NotificationCategory.FORMATION,
    type: NotificationType.SESSION_READY,
    link: '/dashboard/courses',
    metadata: { session_number: sessionNumber, session_title: sessionTitle }
  }),

  practiceDue: (practiceName: string): NotificationData => ({
    title: '🎯 Your formation practice',
    message: `You chose to practice ${practiceName} this week.\nHow is it going today?`,
    priority: NotificationPriority.ACTION_REQUIRED,
    category: NotificationCategory.FORMATION,
    type: NotificationType.PRACTICE_DUE,
    link: '/dashboard/tasks',
    metadata: { practice_name: practiceName }
  }),

  weeklySummary: (weekNumber: number): NotificationData => ({
    title: '🔄 Weekly reflection',
    message: `What changed in you this week? Take a moment to reflect on your formation journey.`,
    priority: NotificationPriority.ROUTINE,
    category: NotificationCategory.FORMATION,
    type: NotificationType.WEEKLY_SUMMARY,
    link: '/dashboard/journal',
    metadata: { week_number: weekNumber }
  }),

  // Mentorship Templates
  mentorAssigned: (mentorName: string): NotificationData => ({
    title: '👤 Mentor Assigned',
    message: `${mentorName} has been assigned to accompany you on your formation journey.`,
    priority: NotificationPriority.SOCIAL,
    category: NotificationCategory.MENTORSHIP,
    type: NotificationType.MENTOR_ASSIGNED,
    link: '/dashboard',
    metadata: { mentor_name: mentorName }
  }),

  mentorMessage: (mentorName: string, context: string): NotificationData => ({
    title: '👤 Your mentor responded',
    message: `${mentorName} has responded to your ${context}.`,
    priority: NotificationPriority.ACTION_REQUIRED,
    category: NotificationCategory.MENTORSHIP,
    type: NotificationType.MENTOR_MESSAGE,
    link: '/dashboard/messages',
    metadata: { mentor_name: mentorName, context }
  }),

  mentorAvailable: (mentorName: string, duration: number): NotificationData => ({
    title: '🟢 Your mentor is available',
    message: `${mentorName} is currently online. You can continue your conversation.`,
    priority: NotificationPriority.SOCIAL,
    category: NotificationCategory.MENTORSHIP,
    type: NotificationType.MENTOR_AVAILABLE,
    link: '/dashboard/messages',
    metadata: { mentor_name: mentorName, duration_minutes: duration }
  }),

  mentorMilestoneApproved: (milestoneName: string): NotificationData => ({
    title: '🌱 Formation milestone unlocked',
    message: `Your mentor has approved your ${milestoneName} milestone.`,
    priority: NotificationPriority.SOCIAL,
    category: NotificationCategory.MENTORSHIP,
    type: NotificationType.MENTOR_MILESTONE_APPROVED,
    link: '/dashboard/profile',
    metadata: { milestone_name: milestoneName }
  }),

  // Accountability Templates
  peerAssigned: (): NotificationData => ({
    title: '🤝 Peer Partner Assigned',
    message: 'You have been matched with an accountability partner. Start a conversation in the community space!',
    priority: NotificationPriority.SOCIAL,
    category: NotificationCategory.ACCOUNTABILITY,
    type: NotificationType.PEER_ASSIGNED,
    link: '/dashboard/messages',
    metadata: {}
  }),

  peerCheckin: (partnerName: string): NotificationData => ({
    title: '🤝 Your accountability partner is here',
    message: `${partnerName} just checked in. Have you completed your commitment today?`,
    priority: NotificationPriority.SOCIAL,
    category: NotificationCategory.ACCOUNTABILITY,
    type: NotificationType.PEER_CHECKIN,
    link: '/dashboard/messages',
    metadata: { partner_name: partnerName }
  }),

  commitmentReminder: (commitment: string, daysSince: number): NotificationData => ({
    title: '🎯 Remember what you chose?',
    message: `You committed to: "${commitment}"\n\nHow did it go?`,
    priority: NotificationPriority.ACTION_REQUIRED,
    category: NotificationCategory.ACCOUNTABILITY,
    type: NotificationType.COMMITMENT_REMINDER,
    link: '/dashboard/tasks',
    metadata: { commitment, days_since: daysSince }
  }),

  // Social Templates
  peerResponse: (peerName: string, context: string): NotificationData => ({
    title: '💬 Response to your reflection',
    message: `${peerName} responded to your ${context}.`,
    priority: NotificationPriority.SOCIAL,
    category: NotificationCategory.SOCIAL,
    type: NotificationType.PEER_RESPONSE,
    link: '/dashboard/messages',
    metadata: { peer_name: peerName, context }
  }),

  mention: (userName: string, location: string): NotificationData => ({
    title: `@${userName} mentioned you`,
    message: `${userName} mentioned you in the ${location}.`,
    priority: NotificationPriority.SOCIAL,
    category: NotificationCategory.SOCIAL,
    type: NotificationType.MENTION,
    link: '/dashboard/messages',
    metadata: { user_name: userName, location }
  }),

  cohortDiscussion: (topic: string, participantCount: number): NotificationData => ({
    title: '💬 Your cohort is thinking about this',
    message: `${participantCount} students have shared their thoughts on today's question.\nWhat's yours?`,
    priority: NotificationPriority.SOCIAL,
    category: NotificationCategory.SOCIAL,
    type: NotificationType.COHORT_DISCUSSION,
    link: '/dashboard/messages',
    metadata: { topic, participant_count: participantCount }
  }),

  // Inactivity Templates
  inactivityReminder: (daysInactive: number): NotificationData => ({
    title: '👋 We haven\'t seen you this week',
    message: `Your formation journey is still here.\nTake a few minutes to reconnect.`,
    priority: NotificationPriority.ROUTINE,
    category: NotificationCategory.SYSTEM,
    type: NotificationType.INACTIVITY_REMINDER,
    link: '/dashboard',
    metadata: { days_inactive: daysInactive }
  }),

  inactivityEscalation: (daysInactive: number, context: string): NotificationData => ({
    title: '🧭 Pick up where you left off',
    message: `You were exploring ${context}.\nYour unfinished reflection is waiting.`,
    priority: NotificationPriority.ACTION_REQUIRED,
    category: NotificationCategory.SYSTEM,
    type: NotificationType.INACTIVITY_ESCALATION,
    link: '/dashboard',
    metadata: { days_inactive: daysInactive, context }
  }),

  // Admin Templates
  broadcast: (title: string, message: string): NotificationData => ({
    title,
    message,
    priority: NotificationPriority.ROUTINE,
    category: NotificationCategory.ADMIN,
    type: NotificationType.BROADCAST,
    link: '/dashboard',
    metadata: {}
  }),

  admission: (cohortName: string): NotificationData => ({
    title: 'Welcome to the Cohort!',
    message: `You have been admitted to ${cohortName}. Your 12-week formation journey starts now.`,
    priority: NotificationPriority.ACTION_REQUIRED,
    category: NotificationCategory.ADMIN,
    type: NotificationType.ADMISSION,
    link: '/auth/activate',
    metadata: { cohort_name: cohortName }
  })
}
