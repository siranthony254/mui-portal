'use client'

import { useState } from 'react'
import { Plus, Zap } from '@/components/icons'
import { AddContentForm } from './AddContentForm'

export function AdminContentActions({ cohorts }: { cohorts: any[] }) {
  const [showForm, setShowShowForm] = useState(false)

  if (showForm) {
    return (
      <div className="fixed inset-0 z-[100] bg-white/95 backdrop-blur-md flex items-center justify-center p-6 overflow-y-auto">
        <div className="max-w-4xl w-full">
          <AddContentForm cohorts={cohorts} onClose={() => setShowShowForm(false)} />
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
      Orchestrate Content
    </button>
  )
}
