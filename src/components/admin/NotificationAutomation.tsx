'use client'

import { useState } from 'react'
import { Zap, Clock, Bell, ShieldCheck, Play, Pause, Settings, CheckCircle, AlertCircle, X } from '@/components/icons'
import { cn } from '@/lib/utils'

interface AutomationConfig {
  dailyRemindersEnabled: boolean
  dailyReminderTime: string
  inactivityCheckEnabled: boolean
  inactivityThresholdDays: number
  mentorDigestEnabled: boolean
  mentorDigestTime: string
  weeklyReportEnabled: boolean
  weeklyReportDay: string
}

export function NotificationAutomation() {
  const [config, setConfig] = useState<AutomationConfig>({
    dailyRemindersEnabled: true,
    dailyReminderTime: '08:00',
    inactivityCheckEnabled: true,
    inactivityThresholdDays: 3,
    mentorDigestEnabled: true,
    mentorDigestTime: '09:00',
    weeklyReportEnabled: true,
    weeklyReportDay: 'monday'
  })

  const [isRunning, setIsRunning] = useState(false)
  const [lastRun, setLastRun] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'daily' | 'inactivity' | 'mentor' | 'reports'>('daily')

  const handleToggle = (key: keyof AutomationConfig) => {
    setConfig(prev => ({ ...prev, [key]: !prev[key] as boolean }))
  }

  const handleTimeChange = (key: keyof AutomationConfig, value: string) => {
    setConfig(prev => ({ ...prev, [key]: value }))
  }

  const handleRunNow = async () => {
    setIsRunning(true)
    // Simulate running automation
    await new Promise(resolve => setTimeout(resolve, 2000))
    setLastRun(new Date().toISOString())
    setIsRunning(false)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-gray-900 tracking-tight">Notification Automation</h2>
          <p className="text-sm text-gray-500 font-medium">Configure automated notification schedules and rules</p>
        </div>
        <div className="flex items-center gap-3">
          {lastRun && (
            <span className="text-xs text-gray-400 font-medium">
              Last run: {new Date(lastRun).toLocaleString()}
            </span>
          )}
          <button
            onClick={handleRunNow}
            disabled={isRunning}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-700 text-white rounded-xl font-bold text-sm hover:bg-emerald-800 transition-all disabled:opacity-50"
          >
            {isRunning ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Running...
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Run Now
              </>
            )}
          </button>
        </div>
      </div>

      {/* Status Banner */}
      <div className={cn(
        "card p-4 border-l-4",
        config.dailyRemindersEnabled || config.inactivityCheckEnabled || config.mentorDigestEnabled
          ? "border-l-emerald-500 bg-emerald-50"
          : "border-l-gray-300 bg-gray-50"
      )}>
        <div className="flex items-center gap-3">
          {config.dailyRemindersEnabled || config.inactivityCheckEnabled || config.mentorDigestEnabled ? (
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <CheckCircle className="w-4 h-4" />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center">
              <Pause className="w-4 h-4" />
            </div>
          )}
          <div>
            <p className="text-sm font-bold text-gray-900">
              {config.dailyRemindersEnabled || config.inactivityCheckEnabled || config.mentorDigestEnabled
                ? 'Automation Active'
                : 'Automation Paused'}
            </p>
            <p className="text-xs text-gray-500">
              {config.dailyRemindersEnabled || config.inactivityCheckEnabled || config.mentorDigestEnabled
                ? 'Automated notifications are being sent according to schedule'
                : 'No automated notifications are currently being sent'}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-100">
        {[
          { id: 'daily', label: 'Daily Reminders', icon: Clock },
          { id: 'inactivity', label: 'Inactivity', icon: AlertCircle },
          { id: 'mentor', label: 'Mentor Digest', icon: Bell },
          { id: 'reports', label: 'Reports', icon: Settings }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              "flex items-center gap-2 px-4 py-3 text-sm font-bold uppercase tracking-wider border-b-2 transition-colors",
              activeTab === tab.id
                ? "border-emerald-700 text-emerald-700"
                : "border-transparent text-gray-400 hover:text-gray-600"
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="card p-6">
        {activeTab === 'daily' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Daily Formation Reminders</h3>
                <p className="text-sm text-gray-500">Send personalized daily formation prompts to students</p>
              </div>
              <button
                onClick={() => handleToggle('dailyRemindersEnabled')}
                className={cn(
                  "w-12 h-6 rounded-full transition-colors relative",
                  config.dailyRemindersEnabled ? "bg-emerald-700" : "bg-gray-200"
                )}
              >
                <div className={cn(
                  "w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform",
                  config.dailyRemindersEnabled ? "left-6" : "left-0.5"
                )} />
              </button>
            </div>

            {config.dailyRemindersEnabled && (
              <div className="space-y-4 pt-4 border-t border-gray-100">
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
                    Daily Reminder Time
                  </label>
                  <input
                    type="time"
                    value={config.dailyReminderTime}
                    onChange={(e) => handleTimeChange('dailyReminderTime', e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-emerald-500 focus:ring-0 font-bold"
                  />
                </div>

                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <Zap className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-blue-900">Smart Reminder Logic</p>
                      <p className="text-xs text-blue-700 mt-1">
                        The system intelligently determines which reminder to send each day:
                      </p>
                      <ul className="text-xs text-blue-700 mt-2 space-y-1">
                        <li>• Monday: Session ready notification</li>
                        <li>• Tuesday: Journal entry reminder</li>
                        <li>• Wednesday: Cohort discussion prompt</li>
                        <li>• Thursday: Mentor moment notification</li>
                        <li>• Friday: Practice challenge reminder</li>
                        <li>• Saturday: Formation lab reminder</li>
                        <li>• Sunday: Weekly reflection prompt</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'inactivity' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Inactivity Detection</h3>
                <p className="text-sm text-gray-500">Automatically detect and notify inactive students</p>
              </div>
              <button
                onClick={() => handleToggle('inactivityCheckEnabled')}
                className={cn(
                  "w-12 h-6 rounded-full transition-colors relative",
                  config.inactivityCheckEnabled ? "bg-emerald-700" : "bg-gray-200"
                )}
              >
                <div className={cn(
                  "w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform",
                  config.inactivityCheckEnabled ? "left-6" : "left-0.5"
                )} />
              </button>
            </div>

            {config.inactivityCheckEnabled && (
              <div className="space-y-4 pt-4 border-t border-gray-100">
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
                    Inactivity Threshold (Days)
                  </label>
                  <select
                    value={config.inactivityThresholdDays}
                    onChange={(e) => handleTimeChange('inactivityThresholdDays', e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-emerald-500 focus:ring-0 font-bold"
                  >
                    <option value="3">3 days</option>
                    <option value="5">5 days</option>
                    <option value="7">7 days</option>
                  </select>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-yellow-100 text-yellow-700 flex items-center justify-center text-xs font-bold">
                      3
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-gray-900">Gentle Reminder</p>
                      <p className="text-xs text-gray-500">"We haven't seen you this week"</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center text-xs font-bold">
                      7
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-gray-900">Mentor Alert</p>
                      <p className="text-xs text-gray-500">Mentor receives notification</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-red-100 text-red-700 flex items-center justify-center text-xs font-bold">
                      14
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-gray-900">Admin Escalation</p>
                      <p className="text-xs text-gray-500">Leadership intervention required</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'mentor' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Mentor Daily Digest</h3>
                <p className="text-sm text-gray-500">Send aggregated mentor activity summaries</p>
              </div>
              <button
                onClick={() => handleToggle('mentorDigestEnabled')}
                className={cn(
                  "w-12 h-6 rounded-full transition-colors relative",
                  config.mentorDigestEnabled ? "bg-emerald-700" : "bg-gray-200"
                )}
              >
                <div className={cn(
                  "w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform",
                  config.mentorDigestEnabled ? "left-6" : "left-0.5"
                )} />
              </button>
            </div>

            {config.mentorDigestEnabled && (
              <div className="space-y-4 pt-4 border-t border-gray-100">
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
                    Digest Time
                  </label>
                  <input
                    type="time"
                    value={config.mentorDigestTime}
                    onChange={(e) => handleTimeChange('mentorDigestTime', e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-emerald-500 focus:ring-0 font-bold"
                  />
                </div>

                <div className="bg-purple-50 border border-purple-100 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <Bell className="w-5 h-5 text-purple-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-purple-900">Digest Contents</p>
                      <p className="text-xs text-purple-700 mt-1">
                        Each mentor receives a morning digest with:
                      </p>
                      <ul className="text-xs text-purple-700 mt-2 space-y-1">
                        <li>• Total mentees and active count</li>
                        <li>• Students awaiting mentor response</li>
                        <li>• Completed milestones</li>
                        <li>• Students needing check-in</li>
                        <li>• Students inactive for 7+ days</li>
                        <li>• Today's priority actions</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Weekly Reports</h3>
                <p className="text-sm text-gray-500">Generate cohort health and engagement reports</p>
              </div>
              <button
                onClick={() => handleToggle('weeklyReportEnabled')}
                className={cn(
                  "w-12 h-6 rounded-full transition-colors relative",
                  config.weeklyReportEnabled ? "bg-emerald-700" : "bg-gray-200"
                )}
              >
                <div className={cn(
                  "w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform",
                  config.weeklyReportEnabled ? "left-6" : "left-0.5"
                )} />
              </button>
            </div>

            {config.weeklyReportEnabled && (
              <div className="space-y-4 pt-4 border-t border-gray-100">
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
                    Report Day
                  </label>
                  <select
                    value={config.weeklyReportDay}
                    onChange={(e) => handleTimeChange('weeklyReportDay', e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-emerald-500 focus:ring-0 font-bold"
                  >
                    <option value="monday">Monday</option>
                    <option value="tuesday">Tuesday</option>
                    <option value="wednesday">Wednesday</option>
                    <option value="thursday">Thursday</option>
                    <option value="friday">Friday</option>
                    <option value="saturday">Saturday</option>
                    <option value="sunday">Sunday</option>
                  </select>
                </div>

                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <ShieldCheck className="w-5 h-5 text-emerald-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-emerald-900">Report Metrics</p>
                      <p className="text-xs text-emerald-700 mt-1">
                        Weekly reports include cohort health analytics:
                      </p>
                      <ul className="text-xs text-emerald-700 mt-2 space-y-1">
                        <li>• Engagement rate (active this week)</li>
                        <li>• Reflection completion rate</li>
                        <li>• Mentor engagement rate</li>
                        <li>• Practice completion rate</li>
                        <li>• Community participation</li>
                        <li>• Retention rate</li>
                        <li>• Formation bottleneck detection</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button className="bg-emerald-700 text-white px-8 py-3 rounded-2xl font-black uppercase tracking-widest hover:bg-emerald-800 transition-all shadow-lg shadow-emerald-700/20">
          Save Configuration
        </button>
      </div>
    </div>
  )
}
