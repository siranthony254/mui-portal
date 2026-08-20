'use client'

import { useState } from 'react'
import { Plus, Zap, BookOpen, Settings, FileText } from '@/components/icons'
import { AddContentForm } from './AddContentForm'
import { AddResourceForm } from './AddResourceForm'
import { ResourceManager } from './ResourceManager'

export function AdminContentActions({ cohorts }: { cohorts: any[] }) {
  const [showForm, setShowShowForm] = useState<'orchestrate' | 'resource' | 'manage' | null>(null)

  if (showForm === 'orchestrate') {
    return (
      <div className="fixed inset-0 z-[100] bg-white/95 backdrop-blur-md flex items-center justify-center p-6 overflow-y-auto">
        <div className="max-w-4xl w-full">
          <AddContentForm cohorts={cohorts} onClose={() => setShowShowForm(null)} />
        </div>
      </div>
    )
  }

  if (showForm === 'resource') {
    return (
      <div className="fixed inset-0 z-[100] bg-white/95 backdrop-blur-md flex items-center justify-center p-6 overflow-y-auto">
        <div className="max-w-3xl w-full">
          <AddResourceForm cohorts={cohorts} onClose={() => setShowShowForm(null)} />
        </div>
      </div>
    )
  }

  if (showForm === 'manage') {
    return (
      <div className="fixed inset-0 z-[100] bg-white/95 backdrop-blur-md flex items-center justify-center p-6 overflow-y-auto">
        <div className="max-w-4xl w-full">
          <ResourceManager cohorts={cohorts} onClose={() => setShowShowForm(null)} />
        </div>
      </div>
    )
  }

  return (
    <div className="flex gap-3">
        <button
            onClick={() => setShowShowForm('manage')}
            className="bg-white text-gray-500 border-2 border-gray-100 px-4 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-gray-50 transition-all active:scale-95 shadow-sm"
            title="Manage Library"
        >
            <Settings className="w-4 h-4" />
        </button>
        <button
            onClick={() => setShowShowForm('resource')}
            className="bg-white text-blue-700 border-2 border-blue-100 px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-blue-50 transition-all active:scale-95 shadow-sm"
        >
            <BookOpen className="w-4 h-4" />
            Send Resource
        </button>
        <button
            onClick={() => setShowShowForm('orchestrate')}
            className="bg-emerald-700 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-emerald-800 transition-all shadow-lg shadow-emerald-700/20 active:scale-95"
        >
            <Plus className="w-4 h-4" />
            Orchestrate Content
        </button>
        <a
            href="https://sanity.io/manage"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white text-emerald-700 border-2 border-emerald-100 px-4 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-emerald-50 transition-all active:scale-95 shadow-sm"
            title="Edit Task Prompts in Sanity"
        >
            <FileText className="w-4 h-4" />
        </a>
    </div>
  )
}
