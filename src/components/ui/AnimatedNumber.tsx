'use client'

import CountUp from 'react-countup'
import { useState, useEffect } from 'react'

export function AnimatedNumber({ value, prefix = '', suffix = '', decimals = 0 }: { value: number; prefix?: string; suffix?: string; decimals?: number }) {
  const [prefersReducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(mediaQuery.matches)

    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches)
    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }, [])

  if (prefersReducedMotion) {
    return <span>{prefix}{value.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}{suffix}</span>
  }

  return (
    <CountUp
      end={value}
      duration={2}
      separator=","
      decimals={decimals}
      prefix={prefix}
      suffix={suffix}
      enableScrollSpy
      scrollSpyOnce
    />
  )
}
