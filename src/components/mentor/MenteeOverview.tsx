'use client'

import Link from 'next/link'
import { getInitials, cn } from '@/lib/utils'
import { MessageSquare, AlertCircle, Clock, User } from '@/components/icons'
import { ProgressRing } from '@/components/charts/ProgressRing'

interface MenteeProps {
  enrollment: any
  lastMessageDate?: string | null
  overdueTasks: number
  sessionsCompleted?: number
  progress?: number
}

export function MenteeOverview({ enrollment, lastMessageDate, overdueTasks, sessionsCompleted = 0, progress = 0 }: MenteeProps) {
  const s = enrollment.student as any

  // Engagement logic
  const isInactive = false // Placeholder for 72h inactivity check
  const hasAlert = overdueTasks > 0 || isInactive

  return (
    <div className="card group hover:shadow-card-hover transition-all border-l-4 border-l-transparent data-[alert=true]:border-l-amber-500" data-alert={hasAlert}>
      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center font-black shadow-sm group-hover:scale-105 transition-transform">
              {getInitials(s.full_name)}
            </div>
            <div>
              <h3 className="font-bold text-gray-900 group-hover:text-teal-700 transition-colors">{s.full_name}</h3>
              <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">{s.institution}</p>
            </div>
          </div>
          {hasAlert && (
            <div className="flex items-center gap-1 text-amber-600 animate-pulse">
              <AlertCircle className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase">Attention</span>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <ProgressRing progress={progress} size={64} color="teal" />
            <div className="flex-1">
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider mb-1.5">
                <span className="text-gray-400">Pillar {enrollment.current_pillar} · Week {enrollment.current_week}</span>
                <span className="text-teal-700">{sessionsCompleted} Sessions Done</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
             <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-xl">
               <Clock className={cn("w-3.5 h-3.5", overdueTasks > 0 ? "text-amber-500" : "text-gray-400")} />
               <span className="text-[10px] font-bold text-gray-600">{overdueTasks} Overdue</span>
             </div>
             <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-xl">
               <MessageSquare className="w-3.5 h-3.5 text-gray-400" />
               <span className="text-[10px] font-bold text-gray-600">{lastMessageDate ? 'Active' : 'No Chat'}</span>
             </div>
          </div>
        </div>
      </div>

      <div className="px-5 py-3 bg-gray-50/50 border-t border-gray-50 flex items-center justify-between">
        <Link href={`/mentor/students/${s.id}`} className="text-[10px] font-black text-gray-400 hover:text-teal-700 uppercase tracking-widest flex items-center gap-1.5 transition-colors">
          <User className="w-3.5 h-3.5" /> View Profile
        </Link>
        <Link href={`/mentor/messages?user=${s.id}`} className="text-[10px] font-black text-teal-700 hover:text-teal-900 uppercase tracking-widest flex items-center gap-1.5 transition-colors">
          Message <MessageSquare className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  )
}
