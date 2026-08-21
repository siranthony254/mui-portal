'use client'

import { useState, useEffect } from 'react'
import { CurriculumOrchestrator } from './CurriculumOrchestrator'
import { ContentManagerClient } from '@/components/content/ContentManagerClient'
import { PILLARS } from '@/types'
import { getCohortCurriculum } from '@/lib/sanity/queries'

export function ContentHubManager({ cohorts }: { cohorts: any[] }) {
    const [selectedCohortId, setSelectedCohortId] = useState('')
    const [curriculum, setCurriculum] = useState<any>(null)

    const selectedCohort = cohorts.find(c => c.id === selectedCohortId)
    const activePillars = selectedCohort?.pillars_config || PILLARS

    useEffect(() => {
        async function fetchCurriculum() {
            if (selectedCohortId) {
                const data = await getCohortCurriculum(selectedCohortId)
                setCurriculum(data)
            } else {
                setCurriculum(null)
            }
        }
        fetchCurriculum()
    }, [selectedCohortId])

    // Flatten curriculum data into content blocks for ContentManagerClient
    const contentBlocks = curriculum?.pillars?.flatMap((pillar: any) =>
        pillar.modules?.flatMap((module: any) =>
            module.days?.flatMap((day: any) =>
                day.sessions?.flatMap((session: any) =>
                    session.contentBlocks?.map((block: any) => ({
                        ...block,
                        _id: `${pillar.number}-${module.weekNumber}-${day.dayNumber}-${session.sessionNumber}`,
                        pillarNumber: pillar.number,
                        weekNumber: module.weekNumber,
                        dayNumber: day.dayNumber,
                        sessionNumber: session.sessionNumber,
                        title: session.title || block.title,
                        journalPrompt: session.journalPrompt
                    }))
                )
            )
        )
    ) || []

    return (
        <div className="space-y-12">
            {/* 1. Hierarchical Drill-Down UI */}
            <section className="space-y-6">
                <h2 className="text-xs font-black text-emerald-600 uppercase tracking-[0.2em]">Orchestration Studio</h2>
                <CurriculumOrchestrator
                    cohorts={cohorts}
                    onCohortSelect={setSelectedCohortId}
                />
            </section>

            {/* 2. Global Asset Library synchronized with selected cohort */}
            {selectedCohortId && (
                <section className="pt-12 border-t border-gray-100 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">
                            Asset Library: {selectedCohort?.name}
                        </h2>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50 px-2 py-0.5 rounded-md">
                            Filtered
                        </span>
                    </div>
                    <ContentManagerClient
                        content={contentBlocks}
                        isAdmin
                        customPillars={activePillars}
                    />
                </section>
            )}
        </div>
    )
}
