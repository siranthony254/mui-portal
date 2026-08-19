'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

interface HoverCardProps {
  children: React.ReactNode
  hoverContent: React.ReactNode
  className?: string
  hoverClassName?: string
}

export function HoverCard({ children, hoverContent, className = '', hoverClassName = '' }: HoverCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div
      className={cn('relative', className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}
      {isHovered && (
        <div className={cn(
          'absolute top-full left-0 mt-2 p-4 bg-white rounded-xl shadow-xl border border-gray-100 z-50 animate-fade-in-up',
          hoverClassName
        )}>
          {hoverContent}
        </div>
      )}
    </div>
  )
}
