'use client'

import { useState } from 'react'
import { Plus } from '@/components/icons'
import { ComposeNotificationForm } from './ComposeNotificationForm'

export function AdminNotificationActions({ cohorts }: { cohorts: any[] }) {
  const [showForm, setShowShowForm] = useState(false)

  if (showForm) {
    return (
      <div className="fixed inset-0 z-[100] bg-white/95 backdrop-blur-md flex items-center justify-center p-6 overflow-y-auto">
        <div className="max-w-4xl w-full py-10">
          <ComposeNotificationForm cohorts={cohorts} onClose={() => setShowShowForm(false)} />
        </div>
      </div>
    )
  }

  return (
    <button
      onClick={() => setShowShowForm(true)}
      className="bg-emerald-700 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-emerald-800 transition-all shadow-lg shadow-emerald-700/20 active:scale-95"
    >
      <Plus className="w-4 h-4" />
      Broadcast Message
    </button>
  )
}
