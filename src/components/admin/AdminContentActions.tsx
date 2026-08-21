'use client'

import { useState } from 'react'
import { Plus, Zap, BookOpen, Settings, FileText, Edit3 } from '@/components/icons'
import { CurriculumOrchestrator } from './CurriculumOrchestrator'
import { AddResourceForm } from './AddResourceForm'
import { ResourceManager } from './ResourceManager'

export function AdminContentActions({ cohorts }: { cohorts: any[] }) {
  const [showForm, setShowShowForm] = useState<'orchestrate' | 'resource' | 'manage' | null>(null)

  if (showForm === 'orchestrate') {
    return (
      <div className="fixed inset-0 z-[100] bg-white overflow-y-auto">
        <div className="max-w-6xl mx-auto p-6 md:p-10">
          <div className="flex items-center justify-between mb-8 pb-4 border-b">
             <h2 className="text-xl font-black uppercase tracking-widest text-emerald-700">Quick Orchestration</h2>
          </div>
          <CurriculumOrchestrator cohorts={cohorts} onClose={() => setShowShowForm(null)} />
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
    <div className="flex flex-wrap gap-2 sm:gap-3">
        <button
            onClick={() => setShowShowForm('manage')}
            className="bg-white text-gray-500 border-2 border-gray-100 px-3 sm:px-4 py-2 sm:py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-gray-50 transition-all active:scale-95 shadow-sm text-xs sm:text-sm"
            title="Manage Library"
        >
            <Settings className="w-4 h-4" />
        </button>
        <button
            onClick={() => setShowShowForm('resource')}
            className="bg-white text-blue-700 border-2 border-blue-100 px-3 sm:px-4 py-2 sm:py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-blue-50 transition-all active:scale-95 shadow-sm text-xs sm:text-sm"
        >
            <BookOpen className="w-4 h-4" />
            <span className="hidden sm:inline">Send Resource</span>
        </button>
        <button
            onClick={() => setShowShowForm('orchestrate')}
            className="bg-emerald-700 text-white px-3 sm:px-4 py-2 sm:py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-emerald-800 transition-all shadow-lg shadow-emerald-700/20 active:scale-95 text-xs sm:text-sm"
        >
            <Edit3 className="w-4 h-4" />
            <span className="hidden sm:inline">Write & Orchestrate</span>
        </button>
        <a
            href="https://sanity.io/manage"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white text-emerald-700 border-2 border-emerald-100 px-3 sm:px-4 py-2 sm:py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-emerald-50 transition-all active:scale-95 shadow-sm text-xs sm:text-sm"
            title="Edit Task Prompts in Sanity"
        >
            <FileText className="w-4 h-4" />
        </a>
    </div>
  )
}
