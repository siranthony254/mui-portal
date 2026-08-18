'use client'

import { useState, useEffect } from 'react'
import { getInitials } from '@/lib/utils'
import { MessageSquare, X, ShieldCheck } from '@/components/icons'
import Link from 'next/link'

interface Props {
  mentor: {
    id: string
    full_name: string
    bio?: string
  }
}

export function MentorAssignmentBanner({ mentor }: Props) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const acknowledged = localStorage.getItem(`mentor_ack_${mentor.id}`)
    if (!acknowledged) {
      setVisible(true)
    }
  }, [mentor.id])

  const dismiss = () => {
    localStorage.setItem(`mentor_ack_${mentor.id}`, 'true')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="card p-6 bg-emerald-900 text-white overflow-hidden relative mb-6 animate-reveal">
      <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12">
        <ShieldCheck className="w-32 h-32" />
      </div>

      <button
        onClick={dismiss}
        className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-lg transition-colors"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="relative z-10">
        <div className="flex items-center gap-2 text-emerald-300 font-black text-[10px] uppercase tracking-[0.2em] mb-4">
          <ShieldCheck className="w-4 h-4" /> Mentor Assigned
        </div>

        <div className="flex flex-col md:flex-row md:items-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center text-xl font-black flex-shrink-0 border border-white/20">
            {getInitials(mentor.full_name)}
          </div>

          <div className="flex-1 space-y-2">
            <h3 className="text-xl font-black">
              {mentor.full_name} will be accompanying you.
            </h3>
            <p className="text-sm text-emerald-100/70 leading-relaxed max-w-2xl">
              {mentor.bio || "Your mentor has been assigned to support you through your 12-week formation journey. You can now reach out to them directly."}
            </p>
          </div>

          <div className="flex-shrink-0 pt-4 md:pt-0">
             <Link
              href="/dashboard/messages"
              className="inline-flex items-center gap-3 bg-white text-emerald-900 px-6 py-3 rounded-2xl font-bold hover:bg-emerald-50 transition-all shadow-xl"
             >
               <MessageSquare className="w-4 h-4" />
               Send First Message
             </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
