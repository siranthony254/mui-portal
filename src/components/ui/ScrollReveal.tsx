'use client'

import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

interface ScrollRevealProps {
  children: React.ReactNode
  direction?: 'up' | 'left' | 'right' | 'scale'
  delay?: number
  className?: string
}

export function ScrollReveal({ 
  children, 
  direction = 'up', 
  delay = 0,
  className = ''
}: ScrollRevealProps) {
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay)
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [delay])

  const directionClasses = {
    up: 'scroll-reveal',
    left: 'scroll-reveal-left',
    right: 'scroll-reveal-right',
    scale: 'scroll-reveal-scale'
  }

  return (
    <div
      ref={ref}
      className={cn(
        directionClasses[direction],
        isVisible && 'visible',
        className
      )}
    >
      {children}
    </div>
  )
}
