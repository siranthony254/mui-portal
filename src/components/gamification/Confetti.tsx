'use client'

import { useEffect, useState } from 'react'

interface ConfettiProps {
  trigger?: boolean
  duration?: number
}

export function Confetti({ trigger = false, duration = 3000 }: ConfettiProps) {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; color: string; rotation: number }>>([])

  useEffect(() => {
    if (trigger) {
      const colors = ['#0F6E56', '#4BC387', '#F59E0B', '#8B5CF6', '#0EA5E9']
      const newParticles = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: -10 - Math.random() * 20,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360
      }))
      setParticles(newParticles)

      const timer = setTimeout(() => setParticles([]), duration)
      return () => clearTimeout(timer)
    }
  }, [trigger, duration])

  if (particles.length === 0) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute w-2 h-2 rounded-full animate-fall"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            backgroundColor: particle.color,
            transform: `rotate(${particle.rotation}deg)`,
            animation: `fall ${2 + Math.random() * 2}s linear forwards`
          }}
        />
      ))}
      <style jsx>{`
        @keyframes fall {
          to {
            transform: translateY(110vh) rotate(720deg);
          }
        }
      `}</style>
    </div>
  )
}
