'use client'

import { PILLARS } from '@/types'
import { cn } from '@/lib/utils'
import { CheckCircle2, Circle, Star, Zap } from 'lucide-react'

export function JourneyMap({ currentWeek, currentPillar }: { currentWeek: number; currentPillar: number }) {
  return (
    <div className="relative py-12 px-4 overflow-x-auto">
      <div className="flex justify-between items-start min-w-[800px] relative">
        {/* Connection Line */}
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-100 -translate-y-1/2 z-0" />
        <div
          className="absolute top-1/2 left-0 h-0.5 bg-teal-500 -translate-y-1/2 z-0 transition-all duration-1000"
          style={{ width: `${Math.min(((currentWeek - 1) / 12) * 100, 100)}%` }}
        />

        {PILLARS.map((pillar) => {
          const isCompleted = pillar.number < currentPillar
          const isActive = pillar.number === currentPillar

          return (
            <div key={pillar.number} className="relative z-10 flex flex-col items-center group w-1/5">
              {/* Milestone Node */}
              <div className={cn(
                "w-12 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 mb-4 shadow-xl",
                isCompleted ? "bg-teal-600 text-white scale-90" :
                isActive ? "bg-white border-4 border-teal-600 text-teal-700 scale-110 animate-pulse" :
                "bg-white border-2 border-gray-100 text-gray-300"
              )}>
                {isCompleted ? <CheckCircle2 className="w-6 h-6" /> :
                 isActive ? <Zap className="w-6 h-6 fill-current" /> :
                 <Circle className="w-5 h-5 fill-current opacity-20" />}
              </div>

              {/* Label */}
              <div className="text-center">
                <p className={cn(
                  "text-[10px] font-black uppercase tracking-widest transition-colors",
                  isActive ? "text-teal-600" : "text-gray-400"
                )}>
                  Pillar {pillar.number}
                </p>
                <h4 className={cn(
                  "text-xs font-bold mt-1 max-w-[120px] transition-colors",
                  isActive ? "text-gray-900" : "text-gray-400"
                )}>
                  {pillar.name}
                </h4>
              </div>

              {/* Tooltip on Hover */}
              <div className="absolute -top-16 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white p-3 rounded-xl text-[10px] w-48 pointer-events-none z-20">
                <p className="font-black uppercase tracking-widest text-teal-400 mb-1">{pillar.subtitle}</p>
                <p className="font-medium leading-relaxed opacity-80">{pillar.goal}</p>
              </div>
            </div>
          )
        })}

        {/* Final Goal */}
        <div className="relative z-10 flex flex-col items-center w-12">
            <div className={cn(
                "w-12 h-14 rounded-2xl flex items-center justify-center transition-all shadow-xl",
                currentWeek >= 12 ? "bg-amber-400 text-white" : "bg-white border-2 border-gray-100 text-gray-200"
            )}>
                <Star className={cn("w-6 h-6", currentWeek >= 12 && "fill-current")} />
            </div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-4">Capstone</p>
        </div>
      </div>
    </div>
  )
}
