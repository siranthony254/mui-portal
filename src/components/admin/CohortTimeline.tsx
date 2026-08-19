'use client'

import { cn } from '@/lib/utils'

export function CohortTimeline({ currentWeek }: { currentWeek: number }) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center px-1">
        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">12-Week Formation Cycle</h3>
        <span className="text-[10px] font-black text-teal-600 bg-teal-50 px-2 py-1 rounded-md uppercase">Current: Week {currentWeek}</span>
      </div>

      <div className="flex gap-1 h-12">
        {Array.from({ length: 12 }, (_, i) => i + 1).map((week) => {
          const isCompleted = week < currentWeek
          const isActive = week === currentWeek
          const isPillarStart = (week - 1) % 2 === 0

          return (
            <div
              key={week}
              className={cn(
                "flex-1 rounded-lg border-2 transition-all relative group",
                isCompleted ? "bg-teal-600 border-teal-600 opacity-40" :
                isActive ? "bg-white border-teal-600 shadow-lg shadow-teal-700/10 scale-y-110" :
                "bg-gray-50 border-gray-100"
              )}
            >
              {isPillarStart && (
                <div className="absolute -top-6 left-0 whitespace-nowrap">
                   <span className="text-[8px] font-black text-gray-300 uppercase tracking-widest">Pillar {Math.ceil(week/2)}</span>
                </div>
              )}
              <div className="absolute inset-0 flex items-center justify-center">
                 <span className={cn(
                   "text-[10px] font-black",
                   isCompleted ? "text-white" : isActive ? "text-teal-700" : "text-gray-300"
                 )}>
                   {week}
                 </span>
              </div>

              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-[8px] px-2 py-1 rounded font-black whitespace-nowrap pointer-events-none z-30">
                 WEEK {week} {isActive ? '(ACTIVE)' : isCompleted ? '(COMPLETED)' : ''}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
