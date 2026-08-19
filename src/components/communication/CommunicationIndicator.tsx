interface CommunicationIndicatorProps {
  unreadCount?: number
  lastActivity?: string
  isOnline?: boolean
  className?: string
}

export function CommunicationIndicator({ 
  unreadCount = 0,
  lastActivity,
  isOnline = false,
  className = ''
}: CommunicationIndicatorProps) {
  const formatLastActivity = (date: string) => {
    const now = new Date()
    const activity = new Date(date)
    const diffMs = now.getTime() - activity.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return activity.toLocaleDateString()
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Online status */}
      <div className="relative">
        <div className={`w-3 h-3 rounded-full ${
          isOnline ? 'bg-green-500' : 'bg-gray-400'
        }`} />
        {isOnline && (
          <div className="absolute inset-0 w-3 h-3 rounded-full bg-green-500 animate-ping opacity-75" />
        )}
      </div>

      {/* Unread count */}
      {unreadCount > 0 && (
        <div className="relative">
          <span className="text-xs text-gray-500">{unreadCount} unread</span>
          {unreadCount > 0 && (
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </div>
          )}
        </div>
      )}

      {/* Last activity */}
      {lastActivity && (
        <span className="text-xs text-gray-400">
          {formatLastActivity(lastActivity)}
        </span>
      )}
    </div>
  )
}
