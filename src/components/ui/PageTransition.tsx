'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

interface PageTransitionProps {
  children: React.ReactNode
}

export function PageTransition({ children }: PageTransitionProps) {
  const [isAnimating, setIsAnimating] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    setIsAnimating(true)
    const timer = setTimeout(() => setIsAnimating(false), 400)
    return () => clearTimeout(timer)
  }, [pathname])

  return (
    <div className={isAnimating ? 'page-transition-enter' : ''}>
      {children}
    </div>
  )
}
