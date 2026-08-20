'use client'

import { useState } from 'react'
import { CurriculumOrchestrator } from './CurriculumOrchestrator'
import { ContentManagerClient } from '@/components/content/ContentManagerClient'
import { PILLARS } from '@/types'

export function ContentHubManager({ cohorts, content }: { cohorts: any[], content: any[] }) {
    const [selectedCohortId, setSelectedCohortId] = useState('')

    const selectedCohort = cohorts.find(c => c.id === selectedCohortId)
    const activePillars = selectedCohort?.pillars_config || PILLARS

    return (
        <div className="space-y-12">
            {/* 1. Hierarchical Drill-Down UI */}
            <section className="space-y-6">
                <h2 className="text-xs font-black text-emerald-600 uppercase tracking-[0.2em]">Curriculum Orchestrator</h2>
                <CurriculumOrchestrator
                    cohorts={cohorts}
                    onCohortSelect={setSelectedCohortId}
                />
            </section>

            {/* 2. Global Asset Library synchronized with selected cohort */}
            <section className="pt-12 border-t border-gray-100 space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">
                        {selectedCohort ? `Asset Library: ${selectedCohort.name}` : 'Global Asset Library'}
                    </h2>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50 px-2 py-0.5 rounded-md">
                        {selectedCohort ? 'Filtered' : 'All Content'}
                    </span>
                </div>
                <ContentManagerClient
                    content={content}
                    isAdmin
                    customPillars={activePillars}
                />
            </section>
        </div>
    )
}
