'use client'

import { useState } from 'react'
import { CohortEditor } from './CohortEditor'
import { Edit3 } from '@/components/icons'
import type { Cohort } from '@/types'

export function CohortEditorWrapper({ cohort }: { cohort: Cohort }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="btn-secondary text-[10px] font-black uppercase tracking-widest py-1 px-3 flex items-center gap-1.5 active:scale-95 transition-all"
      >
        <Edit3 className="w-3 h-3" />
        Edit Configuration
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="max-w-4xl w-full">
            <CohortEditor
              cohort={cohort}
              onCancel={() => {
                setIsOpen(false)
              }}
            />
          </div>
        </div>
      )}
    </>
  )
}
