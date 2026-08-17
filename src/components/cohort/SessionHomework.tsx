'use client'

import { useState, useEffect } from 'react'
import { toggleHomeworkCompletion } from '@/lib/actions/cohort'
import { CheckCircle, Circle, ClipboardList } from '@/components/icons'
import { cn } from '@/lib/utils'

interface Props {
  sessionId: string
  homework: string
  isCompleted: boolean
}

export function SessionHomework({ sessionId, homework, isCompleted }: Props) {
  const [completed, setCompleted] = useState(isCompleted)
  const [loading, setLoading] = useState(false)
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    setIsOnline(navigator.onLine)
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Sync if status changed while offline
    const localStatus = localStorage.getItem(`homework_${sessionId}`)
    if (localStatus !== null) {
      const isLocalCompleted = localStatus === 'true'
      if (isLocalCompleted !== isCompleted && navigator.onLine) {
        syncStatus(isLocalCompleted)
      } else {
        setCompleted(isLocalCompleted)
      }
    }

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [sessionId, isCompleted])

  async function syncStatus(status: boolean) {
    setLoading(true)
    const res = await toggleHomeworkCompletion(sessionId, status)
    if (res.success) {
      setCompleted(status)
      localStorage.removeItem(`homework_${sessionId}`)
    }
    setLoading(false)
  }

  async function handleToggle() {
    const newStatus = !completed
    setCompleted(newStatus)

    if (navigator.onLine) {
      setLoading(true)
      const res = await toggleHomeworkCompletion(sessionId, newStatus)
      setLoading(false)
      if (!res.success) {
        localStorage.setItem(`homework_${sessionId}`, String(newStatus))
      }
    } else {
      localStorage.setItem(`homework_${sessionId}`, String(newStatus))
    }
  }

  return (
    <div className="bg-amber-50 border border-amber-100 rounded-xl p-5 mt-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[10px] font-bold text-amber-700 uppercase tracking-widest flex items-center gap-2">
          <ClipboardList className="w-3.5 h-3.5" /> Before Next Session
        </p>
        <div className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-full',
          completed ? 'bg-teal-100 text-teal-700' : 'bg-amber-100 text-amber-700')}>
          {completed ? 'Ready for session' : 'Preparation needed'}
        </div>
      </div>

      <div className="flex items-start gap-4">
        <button
          onClick={handleToggle}
          disabled={loading}
          className={cn("mt-0.5 flex-shrink-0 transition-colors",
            completed ? "text-teal-600" : "text-amber-400 hover:text-amber-600")}
        >
          {completed ? <CheckCircle className="w-6 h-6" /> : <Circle className="w-6 h-6" />}
        </button>
        <div className="flex-1">
          <p className={cn("text-sm font-medium leading-relaxed",
            completed ? "text-gray-500 line-through" : "text-amber-900")}>
            {homework}
          </p>
          {!completed && (
            <p className="text-[11px] text-amber-700/70 mt-2 italic">
              Tick this once you've prepared what is asked above.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
