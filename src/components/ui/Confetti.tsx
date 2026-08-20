 'use client'

/**
 * Optimized Confetti utility using dynamic imports
 * This prevents the heavy canvas-confetti library from being part of the initial bundle
 */

export async function triggerConfetti() {
  const { default: confetti } = await import('canvas-confetti')

  const duration = 3 * 1000
  const animationEnd = Date.now() + duration
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 }

  const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min

  const interval: any = setInterval(function() {
    const timeLeft = animationEnd - Date.now()

    if (timeLeft <= 0) {
      return clearInterval(interval)
    }

    const particleCount = 50 * (timeLeft / duration)

    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
    })
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
    })
  }, 250)
}

export async function triggerSuccessConfetti() {
    const { default: confetti } = await import('canvas-confetti')

    confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#0d9488', '#2dd4bf', '#fbbf24'],
        zIndex: 100
    })
}
