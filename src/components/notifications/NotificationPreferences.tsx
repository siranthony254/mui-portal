'use client'

import { useState } from 'react'
import { Bell, Mail, MessageSquare, Moon, Sun, Check, X } from '@/components/icons'
import { cn } from '@/lib/utils'

interface NotificationPreferences {
  push_enabled: boolean
  email_enabled: boolean
  sms_enabled: boolean
  quiet_hours_start: string
  quiet_hours_end: string
  categories: {
    formation: boolean
    mentorship: boolean
    accountability: boolean
    social: boolean
    admin: boolean
    system: boolean
  }
}

interface NotificationPreferencesProps {
  preferences: NotificationPreferences
  onSave: (preferences: NotificationPreferences) => void
}

export function NotificationPreferences({ preferences, onSave }: NotificationPreferencesProps) {
  const [localPrefs, setLocalPrefs] = useState<NotificationPreferences>(preferences)
  const [hasChanges, setHasChanges] = useState(false)

  const handleToggle = (key: keyof NotificationPreferences) => {
    setLocalPrefs(prev => ({ ...prev, [key]: !prev[key as any] }))
    setHasChanges(true)
  }

  const handleCategoryToggle = (category: keyof NotificationPreferences['categories']) => {
    setLocalPrefs(prev => ({
      ...prev,
      categories: {
        ...prev.categories,
        [category]: !prev.categories[category]
      }
    }))
    setHasChanges(true)
  }

  const handleTimeChange = (key: 'quiet_hours_start' | 'quiet_hours_end', value: string) => {
    setLocalPrefs(prev => ({ ...prev, [key]: value }))
    setHasChanges(true)
  }

  const handleSave = () => {
    onSave(localPrefs)
    setHasChanges(false)
  }

  const handleReset = () => {
    setLocalPrefs(preferences)
    setHasChanges(false)
  }

  const categoryLabels = {
    formation: { label: 'Formation', icon: '🧭', description: 'Daily reminders, session prompts, weekly reflections' },
    mentorship: { label: 'Mentorship', icon: '👤', description: 'Mentor messages, check-ins, milestone approvals' },
    accountability: { label: 'Accountability', icon: '🤝', description: 'Peer partner notifications, commitment reminders' },
    social: { label: 'Social', icon: '💬', description: 'Peer responses, mentions, cohort discussions' },
    admin: { label: 'Admin', icon: '🔔', description: 'Broadcasts, admissions, announcements' },
    system: { label: 'System', icon: '📌', description: 'Inactivity reminders, system updates' }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-gray-900 tracking-tight">Notification Preferences</h2>
          <p className="text-sm text-gray-500 font-medium">Control how and when you receive notifications</p>
        </div>
        {hasChanges && (
          <div className="flex gap-2">
            <button
              onClick={handleReset}
              className="px-4 py-2 text-sm font-bold text-gray-600 hover:text-gray-900 transition-colors"
            >
              Reset
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-emerald-700 text-white rounded-xl font-bold text-sm hover:bg-emerald-800 transition-all"
            >
              Save Changes
            </button>
          </div>
        )}
      </div>

      {/* Delivery Channels */}
      <div className="card p-6 space-y-6">
        <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest">Delivery Channels</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">Push Notifications</p>
                <p className="text-xs text-gray-500">Receive notifications in your browser</p>
              </div>
            </div>
            <button
              onClick={() => handleToggle('push_enabled')}
              className={cn(
                "w-12 h-6 rounded-full transition-colors relative",
                localPrefs.push_enabled ? "bg-emerald-700" : "bg-gray-200"
              )}
            >
              <div className={cn(
                "w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform",
                localPrefs.push_enabled ? "left-6" : "left-0.5"
              )} />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">Email Notifications</p>
                <p className="text-xs text-gray-500">Receive notifications via email</p>
              </div>
            </div>
            <button
              onClick={() => handleToggle('email_enabled')}
              className={cn(
                "w-12 h-6 rounded-full transition-colors relative",
                localPrefs.email_enabled ? "bg-emerald-700" : "bg-gray-200"
              )}
            >
              <div className={cn(
                "w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform",
                localPrefs.email_enabled ? "left-6" : "left-0.5"
              )} />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">SMS Notifications</p>
                <p className="text-xs text-gray-500">Receive critical notifications via SMS</p>
              </div>
            </div>
            <button
              onClick={() => handleToggle('sms_enabled')}
              className={cn(
                "w-12 h-6 rounded-full transition-colors relative",
                localPrefs.sms_enabled ? "bg-emerald-700" : "bg-gray-200"
              )}
            >
              <div className={cn(
                "w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform",
                localPrefs.sms_enabled ? "left-6" : "left-0.5"
              )} />
            </button>
          </div>
        </div>
      </div>

      {/* Quiet Hours */}
      <div className="card p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest">Quiet Hours</h3>
            <p className="text-xs text-gray-500">Pause notifications during specific hours</p>
          </div>
          <div className="flex items-center gap-2 text-gray-400">
            <Moon className="w-4 h-4" />
            <Sun className="w-4 h-4" />
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-2">Start Time</label>
            <input
              type="time"
              value={localPrefs.quiet_hours_start}
              onChange={(e) => handleTimeChange('quiet_hours_start', e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-emerald-500 focus:ring-0 font-bold"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-2">End Time</label>
            <input
              type="time"
              value={localPrefs.quiet_hours_end}
              onChange={(e) => handleTimeChange('quiet_hours_end', e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-emerald-500 focus:ring-0 font-bold"
            />
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
          <p className="text-xs text-blue-700 font-medium">
            ⚠️ Intervention priority notifications will still be delivered during quiet hours for urgent matters.
          </p>
        </div>
      </div>

      {/* Categories */}
      <div className="card p-6 space-y-6">
        <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest">Notification Categories</h3>
        <p className="text-xs text-gray-500">Choose which types of notifications you want to receive</p>
        
        <div className="space-y-3">
          {Object.entries(categoryLabels).map(([key, { label, icon, description }]) => (
            <div
              key={key}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{icon}</span>
                <div>
                  <p className="text-sm font-bold text-gray-900">{label}</p>
                  <p className="text-xs text-gray-500">{description}</p>
                </div>
              </div>
              <button
                onClick={() => handleCategoryToggle(key as keyof NotificationPreferences['categories'])}
                className={cn(
                  "w-10 h-6 rounded-full transition-colors relative",
                  localPrefs.categories[key as keyof NotificationPreferences['categories']]
                    ? "bg-emerald-700"
                    : "bg-gray-300"
                )}
              >
                <div className={cn(
                  "w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform",
                  localPrefs.categories[key as keyof NotificationPreferences['categories']]
                    ? "left-4"
                    : "left-0.5"
                )} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="card p-6 bg-emerald-50 border-emerald-100">
        <div className="flex items-start gap-3">
          <Check className="w-5 h-5 text-emerald-700 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-emerald-900">Your Current Settings</p>
            <p className="text-xs text-emerald-700 mt-1">
              {Object.values(localPrefs.categories).filter(v => v).length} of 6 categories enabled • 
              Quiet hours: {localPrefs.quiet_hours_start} - {localPrefs.quiet_hours_end}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
