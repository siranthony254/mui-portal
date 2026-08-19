'use client'

import CountUp from 'react-countup'

interface AnimatedNumberProps {
  end: number
  duration?: number
  separator?: string
  decimals?: number
  prefix?: string
  suffix?: string
  className?: string
}

export function AnimatedNumber({ 
  end, 
  duration = 2, 
  separator = ',', 
  decimals = 0,
  prefix = '',
  suffix = '',
  className = ''
}: AnimatedNumberProps) {
  return (
    <span className={className}>
      <CountUp
        end={end}
        duration={duration}
        separator={separator}
        decimals={decimals}
        prefix={prefix}
        suffix={suffix}
      />
    </span>
  )
}
