'use client'

import { useState } from 'react'
import { broadcastNotification } from '@/lib/actions/admin'
import { createAnnouncement } from '@/lib/actions/sanity'
import { Bell, Zap, Users, Award, X, Send, Globe } from '@/components/icons'
import { cn } from '@/lib/utils'

export function ComposeNotificationForm({ cohorts, onClose }: { cohorts: any[], onClose?: () => void }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [channel, setChannel] = useState<'in-app' | 'banner'>('in-app')
  const [audience, setAudience] = useState<'all' | 'students' | 'mentors' | 'cohort'>('all')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)

    const formData = new FormData(e.currentTarget)
    const title = formData.get('title') as string
    const message = formData.get('message') as string
    const cohortId = formData.get('cohortId') as string

    let res;
    if (channel === 'banner') {
        // Map to Sanity Announcement
        const sanityData = new FormData()
        sanityData.append('title', title)
        // Note: Sanity announcements in current schema use roles array
        const roles = audience === 'all' ? ['admin', 'mentor', 'student']
                    : audience === 'students' ? ['student']
                    : audience === 'mentors' ? ['mentor']
                    : ['student'] // default for cohort

        roles.forEach(r => sanityData.append('targetRoles', r))
        if (cohortId) sanityData.append('cohortId', cohortId)

        res = await createAnnouncement(sanityData)
    } else {
        res = await broadcastNotification({
            audience,
            cohortId,
            title,
            message,
            channel
        })
    }

    if (res.error) {
      setError(res.error)
    } else {
      setSuccess(true)
      if (onClose) setTimeout(onClose, 2000)
    }
    setLoading(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black text-gray-900 tracking-tight">The Megaphone</h2>
        {onClose && (
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        )}
      </div>

      {success ? (
          <div className="bg-emerald-50 rounded-2xl p-12 text-center border border-emerald-100 animate-reveal">
             <div className="w-16 h-16 bg-emerald-700 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-emerald-700/20">
                <Send className="w-8 h-8 text-white" />
             </div>
             <h3 className="text-xl font-black text-emerald-900 mb-2">Broadcast Dispatched</h3>
             <p className="text-emerald-700 font-medium">Your message is now live for the selected audience.</p>
          </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-8">
            {/* Channel Selection */}
            <div className="space-y-3">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Select Channel</p>
                <div className="grid grid-cols-2 gap-3">
                    <button
                        type="button"
                        onClick={() => setChannel('in-app')}
                        className={cn(
                            "flex flex-col items-center gap-2 p-6 rounded-[2rem] border-2 transition-all",
                            channel === 'in-app' ? "border-emerald-700 bg-emerald-50 text-emerald-900" : "border-gray-100 bg-white text-gray-400 hover:border-gray-200"
                        )}
                    >
                        <Bell className="w-6 h-6" />
                        <span className="text-xs font-black uppercase tracking-widest">In-App Alert</span>
                        <p className="text-[9px] text-center opacity-70">Appears in notification bell</p>
                    </button>
                    <button
                        type="button"
                        onClick={() => setChannel('banner')}
                        className={cn(
                            "flex flex-col items-center gap-2 p-6 rounded-[2rem] border-2 transition-all",
                            channel === 'banner' ? "border-emerald-700 bg-emerald-50 text-emerald-900" : "border-gray-100 bg-white text-gray-400 hover:border-gray-200"
                        )}
                    >
                        <Globe className="w-6 h-6" />
                        <span className="text-xs font-black uppercase tracking-widest">Dashboard Banner</span>
                        <p className="text-[9px] text-center opacity-70">Appears at the top of home</p>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                    {/* Audience Selection */}
                    <div className="space-y-3">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Target Audience</p>
                        <div className="grid grid-cols-2 gap-2">
                            {['all', 'students', 'mentors', 'cohort'].map((a) => (
                                <button
                                    key={a}
                                    type="button"
                                    onClick={() => setAudience(a as any)}
                                    className={cn(
                                        "px-4 py-2.5 rounded-xl border-2 text-[10px] font-black uppercase tracking-widest transition-all",
                                        audience === a ? "border-emerald-700 bg-emerald-50 text-emerald-900" : "border-gray-100 bg-white text-gray-400"
                                    )}
                                >
                                    {a}
                                </button>
                            ))}
                        </div>
                    </div>

                    {audience === 'cohort' && (
                        <div className="animate-reveal">
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Select Cohort</label>
                            <select name="cohortId" required className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-emerald-500 focus:ring-0 font-bold text-sm">
                                {cohorts.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                    )}
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Subject / Title</label>
                        <input name="title" required className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-emerald-500 focus:ring-0 font-bold" placeholder="Message heading..." />
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Detailed Message</label>
                        <textarea name="message" rows={4} required className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-emerald-500 focus:ring-0 text-sm font-medium" placeholder="Write your announcement here..." />
                    </div>
                </div>
            </div>

            {error && <p className="text-xs font-bold text-red-600 bg-red-50 p-3 rounded-xl">{error}</p>}

            <div className="flex justify-end pt-4">
                <button
                    type="submit"
                    disabled={loading}
                    className="bg-emerald-700 text-white px-12 py-4 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-emerald-800 transition-all shadow-xl shadow-emerald-700/20 disabled:opacity-50"
                >
                    {loading ? 'Dispatching...' : 'Broadcast Message'}
                    <Send className="w-4 h-4" />
                </button>
            </div>
        </form>
      )}
    </div>
  )
}
