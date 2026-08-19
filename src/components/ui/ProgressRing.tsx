'use client'

import { cn } from '@/lib/utils'

export function ProgressRing({ progress, size = 60, strokeWidth = 5 }: { progress: number; size?: number; strokeWidth?: number }) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (progress / 100) * circumference

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background Circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="text-gray-100"
        />
        {/* Progress Circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          style={{ strokeDashoffset: offset, transition: 'stroke-dashoffset 1s ease-in-out' }}
          className={cn(
            "transition-all duration-1000 ease-out",
            progress < 30 ? "text-amber-400" : progress < 70 ? "text-teal-500" : "text-emerald-600"
          )}
        />
      </svg>
      <span className="absolute text-[10px] font-black text-gray-700">{Math.round(progress)}%</span>
    </div>
  )
}
