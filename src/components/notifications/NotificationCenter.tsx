'use client'

import { useState } from 'react'
import { Bell, X, CheckCircle, Clock, Filter, Archive, MoreVertical } from '@/components/icons'
import { cn } from '@/lib/utils'
import { formatDate } from '@/lib/utils'
import { NotificationPriority, NotificationCategory } from '@/lib/notifications/factory'

interface Notification {
  id: string
  title: string
  message: string
  priority: string
  category: string
  type: string
  link?: string
  read: boolean
  created_at: string
  metadata?: Record<string, any>
}

interface NotificationCenterProps {
  notifications: Notification[]
  onMarkRead: (id: string) => void
  onMarkAllRead: () => void
  onClearAll: () => void
}

export function NotificationCenter({ 
  notifications, 
  onMarkRead, 
  onMarkAllRead, 
  onClearAll 
}: NotificationCenterProps) {
  const [filter, setFilter] = useState<'all' | 'unread' | 'priority'>('all')
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null)
  const [savedNotifications, setSavedNotifications] = useState<Set<string>>(new Set())

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread' && n.read) return false
    if (filter === 'priority' && n.priority !== 'intervention' && n.priority !== 'action_required') return false
    if (categoryFilter && n.category !== categoryFilter) return false
    return true
  })

  // Group by time
  const grouped = filteredNotifications.reduce((groups, n) => {
    const date = new Date(n.created_at)
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
    
    let group = 'Earlier'
    if (diffDays === 0) group = 'Today'
    else if (diffDays === 1) group = 'Yesterday'
    else if (diffDays < 7) group = 'This Week'
    
    if (!groups[group]) groups[group] = []
    groups[group].push(n)
    return groups
  }, {} as Record<string, Notification[]>)

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'intervention': return 'bg-red-500'
      case 'action_required': return 'bg-orange-500'
      case 'social': return 'bg-purple-500'
      default: return 'bg-emerald-500'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'formation': return '🧭'
      case 'mentorship': return '👤'
      case 'accountability': return '🤝'
      case 'social': return '💬'
      case 'admin': return '🔔'
      default: return '📌'
    }
  }

  const toggleSave = (id: string) => {
    setSavedNotifications(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) newSet.delete(id)
      else newSet.add(id)
      return newSet
    })
  }

  return (
    <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-gray-50 border-b border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-gray-600" />
            <h3 className="text-sm font-black uppercase tracking-widest text-gray-900">Notifications</h3>
            {notifications.filter(n => !n.read).length > 0 && (
              <span className="bg-emerald-100 text-emerald-700 text-[10px] font-black px-2 py-0.5 rounded-full">
                {notifications.filter(n => !n.read).length} New
              </span>
            )}
          </div>
          <button onClick={onClearAll} className="text-[10px] font-black text-emerald-700 uppercase tracking-widest hover:text-emerald-900">
            Clear All
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={cn(
              "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-colors",
              filter === 'all' ? "bg-emerald-700 text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
            )}
          >
            All
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={cn(
              "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-colors",
              filter === 'unread' ? "bg-emerald-700 text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
            )}
          >
            Unread
          </button>
          <button
            onClick={() => setFilter('priority')}
            className={cn(
              "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-colors",
              filter === 'priority' ? "bg-emerald-700 text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
            )}
          >
            Priority
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-h-96 overflow-y-auto">
        {Object.keys(grouped).length === 0 ? (
          <div className="p-12 text-center">
            <Bell className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="text-sm text-gray-400 font-medium">No notifications</p>
          </div>
        ) : (
          Object.entries(grouped).map(([group, groupNotifications]) => (
            <div key={group}>
              <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{group}</p>
              </div>
              {groupNotifications.map(notification => (
                <div
                  key={notification.id}
                  className={cn(
                    "p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors group relative",
                    !notification.read && "bg-emerald-50/50"
                  )}
                >
                  <div className="flex items-start gap-3">
                    {/* Priority Indicator */}
                    <div className={cn(
                      "w-2 h-2 rounded-full mt-2 flex-shrink-0",
                      getPriorityColor(notification.priority)
                    )} />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm">{getCategoryIcon(notification.category)}</span>
                            <p className={cn(
                              "text-sm font-bold leading-tight",
                              notification.read ? "text-gray-500" : "text-gray-900"
                            )}>
                              {notification.title}
                            </p>
                          </div>
                          <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">
                            {notification.message}
                          </p>
                        </div>
                        {!notification.read && (
                          <button
                            onClick={() => onMarkRead(notification.id)}
                            className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-[9px] text-gray-400 font-bold uppercase tracking-tighter flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" />
                          {formatDate(notification.created_at)}
                        </p>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => toggleSave(notification.id)}
                            className={cn(
                              "p-1.5 rounded-lg transition-colors",
                              savedNotifications.has(notification.id)
                                ? "bg-emerald-100 text-emerald-600"
                                : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                            )}
                          >
                            <Archive className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="p-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
        <button
          onClick={onMarkAllRead}
          className="text-[10px] font-black text-emerald-700 uppercase tracking-widest hover:text-emerald-900"
        >
          Mark All Read
        </button>
        <div className="flex items-center gap-2">
          <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">
            {savedNotifications.size} Saved
          </span>
        </div>
      </div>
    </div>
  )
}
