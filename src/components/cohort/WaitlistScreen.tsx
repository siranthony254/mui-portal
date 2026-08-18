'use client'
import { Clock, Users, Globe, Trash2 } from '@/components/icons'
import { leaveWaitlist } from '@/lib/actions/cohort'
import { useState } from 'react'

export function WaitlistScreen({ waitlistEntry }: { waitlistEntry: any }) {
  const [loading, setLoading] = useState(false)
  const cohort = waitlistEntry.cohort

  const handleLeave = async () => {
    if (!confirm('Withdraw your application from this cohort?')) return
    setLoading(true)
    await leaveWaitlist(waitlistEntry.id)
    setLoading(false)
  }

  return (
    <div className="max-w-lg mx-auto py-16">
      <div className="card p-8 text-center relative group">
        <button
            onClick={handleLeave}
            disabled={loading}
            className="absolute top-4 right-4 p-2 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
            title="Withdraw Application"
        >
            <Trash2 className="w-4 h-4" />
        </button>
        <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Clock className="w-8 h-8 text-amber-600" />
        </div>
        <h1 className="text-xl font-semibold text-gray-900 mb-2">You're on the waitlist</h1>
        <p className="text-sm text-gray-500 mb-6">
          {cohort ? `For ${cohort.name} — ${cohort.semester} ${cohort.year}` : 'For the upcoming cohort'}. We will notify you by email when it opens.
        </p>
        <div className="bg-gray-50 rounded-xl p-4 mb-6 inline-block">
          <p className="text-xs text-gray-400 mb-1">Your waitlist position</p>
          <p className="text-3xl font-bold text-teal-700">#{waitlistEntry.position}</p>
        </div>
        <div className="text-left space-y-3 border-t border-gray-100 pt-6">
          <p className="text-sm font-medium text-gray-700 mb-3">What happens next</p>
          {[
            { icon: Clock, title: 'Admin opens the cohort', desc: 'Your dashboard unlocks automatically when the cohort opens.' },
            { icon: Users, title: 'You join the cohort community', desc: 'Matched with a mentor and connected to peers from other campuses.' },
            { icon: Globe, title: '12 weeks of formation begin', desc: 'Weekly tasks, monthly sessions, and a public capstone at the end.' },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex items-start gap-3">
              <div className="w-7 h-7 bg-teal-50 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                <Icon className="w-3.5 h-3.5 text-teal-700" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{title}</p>
                <p className="text-xs text-gray-500">{desc}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 pt-6 border-t border-gray-100">
          <p className="text-xs text-gray-400 mb-3">While you wait</p>
          <a href="/dashboard/courses" className="btn-secondary text-sm justify-center block mb-2">Browse free courses</a>
          <a href="https://micdupinitiative.site" target="_blank" rel="noopener noreferrer" className="text-sm text-teal-700 hover:underline">Visit micdupinitiative.site →</a>
        </div>
      </div>
    </div>
  )
}
