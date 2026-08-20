'use client'

import { useState } from 'react'
import Link from 'next/link'
import { CheckCircle, Clock, Circle, ChevronDown, ChevronUp, ChevronRight, FileText, MessageSquare } from '@/components/icons'
import { cn, formatDate } from '@/lib/utils'
import { PILLARS, getPillarColor } from '@/types'
import type { Task } from '@/types'
import { Confetti } from '@/components/gamification/Confetti'

interface Props {
  tasks: Task[]
  currentWeek: number
  pillars?: any[]
}

export function TaskList({ tasks, currentWeek, pillars = PILLARS }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [showConfetti, setShowConfetti] = useState(false)

  const grouped = tasks.reduce<Record<number, Task[]>>((acc, t) => {
    if (!acc[t.week_number]) acc[t.week_number] = []
    acc[t.week_number]!.push(t)
    return acc
  }, {})

  return (
    <div className="space-y-6">
      <Confetti trigger={showConfetti} />
      {Array.from({ length: 12 }, (_, i) => i + 1).map(week => {
        const weekTasks = grouped[week] || []
        const isCurrentWeek = week === currentWeek
        const isFuture = week > currentWeek
        const pillarNum = Math.min(Math.ceil(week / 2.4), 5)
        const pillar = pillars.find(p => p.number === pillarNum) || pillars[pillarNum - 1]

        return (
          <div key={week} className={cn('card overflow-hidden', isFuture && 'opacity-50')}>
            <div className={cn('px-5 py-3 flex items-center justify-between border-b border-gray-50', isCurrentWeek ? 'bg-teal-50' : 'bg-gray-50')}>
              <div className="flex items-center gap-2">
                <span className={cn('text-sm font-semibold', isCurrentWeek ? 'text-teal-700' : 'text-gray-500')}>Week {week}</span>
                {isCurrentWeek && <span className="badge badge-teal text-xs">Current</span>}
                {isFuture && <span className="badge badge-gray text-xs">Locked</span>}
              </div>
              {pillar && <span className={cn('badge text-[10px]', getPillarColor(pillarNum))}>P{pillarNum}: {pillar.name}</span>}
            </div>

            <div className="divide-y divide-gray-50">
              {weekTasks.length === 0 ? (
                <div className="px-5 py-4 text-sm text-gray-400">
                  {isFuture ? 'Unlocks when you reach this week.' : 'No tasks recorded for this week.'}
                </div>
              ) : weekTasks.map(task => {
                const isExpanded = expandedId === task.id
                const hasFeedback = !!task.mentor_feedback
                const hasSubmission = !!task.submission

                return (
                  <div key={task.id} className="group">
                    <div
                      onClick={() => !isFuture && setExpandedId(isExpanded ? null : task.id)}
                      className={cn(
                        "flex items-center gap-3 px-5 py-4 transition-colors cursor-pointer",
                        !isFuture && "hover:bg-gray-50/50",
                        isExpanded && "bg-gray-50/50"
                      )}
                    >
                      <div className="flex-shrink-0">
                        {task.status === 'approved' ? <CheckCircle className="w-5 h-5 text-teal-600" /> :
                         task.status === 'submitted' || task.status === 'reviewed' ? <Clock className="w-5 h-5 text-amber-500" /> :
                         <Circle className="w-5 h-5 text-gray-300" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={cn("text-sm font-medium text-gray-900", !isFuture && "group-hover:text-teal-700")}>{task.title}</p>
                        <div className="flex items-center gap-3 mt-1">
                           <span className={cn('badge text-[10px]', {
                             'badge-teal': task.status === 'approved',
                             'badge-amber': task.status === 'submitted',
                             'badge-blue': task.status === 'reviewed',
                             'badge-gray': task.status === 'pending',
                           })}>{task.status}</span>
                           {hasFeedback && <span className="text-[10px] text-teal-600 font-medium flex items-center gap-1"><MessageSquare className="w-3 h-3" /> Feedback received</span>}
                        </div>
                      </div>
                      {!isFuture && (
                        <div className="flex items-center gap-3">
                           <Link
                            href={`/dashboard/tasks/${task.id}`}
                            onClick={(e) => e.stopPropagation()}
                            className="p-1.5 text-gray-400 hover:text-teal-600 transition-colors"
                            title="Open full task page"
                           >
                             <ChevronRight className="w-4 h-4" />
                           </Link>
                           {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                        </div>
                      )}
                    </div>

                    {isExpanded && (
                      <div className="px-5 pb-5 pt-0 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                             <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                               <FileText className="w-3 h-3" /> Your Submission
                             </p>
                             <div className="bg-white border border-gray-100 rounded-lg p-3 text-xs text-gray-700 leading-relaxed whitespace-pre-wrap min-h-[80px]">
                               {task.submission || <span className="italic text-gray-400">No submission yet.</span>}
                             </div>
                             {task.submitted_at && <p className="text-[10px] text-gray-400">Submitted {formatDate(task.submitted_at)}</p>}
                          </div>

                          <div className="space-y-2">
                             <p className="text-[10px] font-bold text-teal-700 uppercase tracking-widest flex items-center gap-1.5">
                               <MessageSquare className="w-3 h-3" /> Mentor Response
                             </p>
                             <div className={cn("rounded-lg p-3 text-xs leading-relaxed whitespace-pre-wrap min-h-[80px] border",
                               hasFeedback ? "bg-teal-50/30 border-teal-100 text-teal-900" : "bg-gray-50 border-gray-100 text-gray-400 italic")}>
                               {task.mentor_feedback || "Mentor has not provided feedback yet."}
                             </div>
                             {task.reviewed_at && <p className="text-[10px] text-gray-400">Reviewed {formatDate(task.reviewed_at)}</p>}
                          </div>
                        </div>

                        <div className="flex justify-end">
                           <Link href={`/dashboard/tasks/${task.id}`} className="text-[11px] font-semibold text-teal-700 hover:underline flex items-center gap-1">
                             Open task details <ChevronRight className="w-3 h-3" />
                           </Link>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
