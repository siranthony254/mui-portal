'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import {
    Layers, BookOpen, ChevronRight, Lock,
    CheckCircle, Zap, Play, FileText, Calendar
} from '@/components/icons'
import { SessionPlayer } from './SessionPlayer'

interface Props {
  curriculum: any
  completions: string[]
  enrollment: any
}

export function CohortCurriculumHub({ curriculum, completions, enrollment }: Props) {
  const [activeSession, setActiveSession] = useState<any>(null)

  if (!curriculum) {
    return (
        <div className="card p-12 text-center bg-gray-50 border-dashed border-gray-200">
            <BookOpen className="w-12 h-12 text-gray-200 mx-auto mb-4" />
            <h2 className="text-xl font-black text-gray-900">Formation records pending</h2>
            <p className="text-sm text-gray-500 max-w-sm mx-auto mt-2 leading-relaxed">
                The MUI team is currently preparing the curriculum for your cohort. Check back soon for your first pillar.
            </p>
        </div>
    )
  }

  const allSessions: any[] = []
  curriculum.pillars?.forEach((p: any) => {
    p.modules?.forEach((m: any) => {
        m.sessions?.forEach((s: any) => {
            allSessions.push({ ...s, pillar: p, module: m })
        })
    })
  })

  const progress = Math.round((completions.length / (allSessions.length || 1)) * 100)

  return (
    <div className="space-y-10 pb-20">
      {activeSession && (
          <SessionPlayer
            session={activeSession}
            onClose={() => setActiveSession(null)}
            onSwitch={(s: any) => setActiveSession(s)}
            isCompleted={completions.includes(activeSession._key)}
            cohortId={enrollment.cohort_id}
            allSessions={allSessions}
          />
      )}

      {/* 1. Dynamic Progress Header */}
      <section className="card p-8 bg-emerald-900 text-white overflow-hidden relative border-none shadow-2xl">
         <div className="absolute top-0 right-0 p-8 opacity-10">
            <Zap className="w-40 h-40 fill-white" />
         </div>
         <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
            <div className="flex-1 space-y-4">
                <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-none">Your Formation <br /> Journey.</h1>
                <p className="text-emerald-100/70 text-sm max-w-md leading-relaxed font-medium">
                    This curriculum is specific to your cohort. Finish one session to unlock the next.
                </p>
            </div>
            <div className="w-full md:w-64 space-y-3">
                <div className="flex justify-between items-end">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400">Programme Progress</span>
                    <span className="text-2xl font-black">{progress}%</span>
                </div>
                <div className="progress-bar h-2 bg-emerald-800">
                    <div className="progress-fill bg-emerald-400" style={{ width: `${progress}%` }} />
                </div>
                <p className="text-[9px] font-bold text-emerald-100/50 uppercase tracking-widest text-center">
                    {completions.length} of {allSessions.length} Sessions Complete
                </p>
            </div>
         </div>
      </section>

      {/* 2. Hierarchical View */}
      <div className="space-y-12">
        {curriculum.pillars?.map((pillar: any, pIdx: number) => (
            <section key={pillar._key} className="space-y-6">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center font-black">
                        {pillar.number}
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">{pillar.name}</h2>
                        <p className="text-xs text-gray-400 font-medium">{pillar.description}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pl-4 border-l-2 border-teal-50 ml-5">
                    {pillar.modules?.map((module: any) => (
                        <div key={module._key} className="space-y-4">
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-2 py-0.5 rounded-md">Week {module.weekNumber}</span>
                                <h3 className="text-sm font-bold text-gray-700">{module.title || 'Formation Module'}</h3>
                            </div>

                            <div className="space-y-2">
                                {module.sessions?.map((session: any, sIdx: number) => {
                                    // Logic for locking:
                                    // A session is locked if it's not the very first session
                                    // AND the session before it in allSessions is not completed.
                                    const sessionIndex = allSessions.findIndex(as => as._key === session._key)
                                    const isCompleted = completions.includes(session._key)
                                    const isLocked = sessionIndex > 0 && !completions.includes(allSessions[sessionIndex - 1]._key)

                                    return (
                                        <button
                                            key={session._key}
                                            disabled={isLocked}
                                            onClick={() => setActiveSession({ ...session, pillar, module })}
                                            className={cn(
                                                "w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all group",
                                                isLocked
                                                    ? "bg-gray-50 border-gray-100 opacity-60 cursor-not-allowed"
                                                    : isCompleted
                                                        ? "bg-white border-emerald-100 hover:border-emerald-200"
                                                        : "bg-white border-gray-100 hover:border-emerald-600 hover:shadow-lg"
                                            )}
                                        >
                                            <div className="flex items-center gap-4 text-left">
                                                <div className={cn(
                                                    "w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors",
                                                    isLocked ? "bg-gray-100 text-gray-300" : isCompleted ? "bg-emerald-100 text-emerald-700" : "bg-teal-50 text-teal-600 group-hover:bg-emerald-700 group-hover:text-white"
                                                )}>
                                                    {isLocked ? <Lock className="w-3.5 h-3.5" /> : isCompleted ? <CheckCircle className="w-4 h-4" /> : <Play className="w-3.5 h-3.5" />}
                                                </div>
                                                <div>
                                                    <p className={cn("text-xs font-black uppercase tracking-widest", isLocked ? "text-gray-300" : "text-gray-400")}>Day {session.dayNumber}</p>
                                                    <p className={cn("text-sm font-bold truncate max-w-[180px]", isLocked ? "text-gray-300" : "text-gray-900")}>{session.title}</p>
                                                </div>
                                            </div>
                                            {!isLocked && <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-emerald-700 transition-colors" />}
                                        </button>
                                    )
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        ))}
      </div>
    </div>
  )
}
