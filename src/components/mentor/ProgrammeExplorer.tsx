'use client'

import { useState, useEffect } from 'react'
import { getCohortCurriculum, getAllCurricula } from '@/lib/sanity/queries'
import { CohortCurriculumHub } from '@/components/cohort/hub/CohortCurriculumHub'
import { BookOpen, X, ChevronRight, Layers } from '@/components/icons'
import { cn } from '@/lib/utils'

export function ProgrammeExplorer({ cohorts }: { cohorts: any[] }) {
    const [selectedCohortId, setSelectedCohortId] = useState('')
    const [curriculum, setCurriculum] = useState<any>(null)
    const [allCurricula, setAllCurricula] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [showFull, setShowFull] = useState(false)

    useEffect(() => {
        // Fetch all curricula on mount
        async function fetchAllCurricula() {
            const data = await getAllCurricula()
            setAllCurricula(data || [])
        }
        fetchAllCurricula()
    }, [])

    useEffect(() => {
        if (selectedCohortId) {
            fetchCurriculum()
        } else {
            setCurriculum(null)
        }
    }, [selectedCohortId])

    async function fetchCurriculum() {
        setLoading(true)
        // First try to find in already fetched curricula
        const existingCurriculum = allCurricula.find((c: any) => c.cohortId === selectedCohortId)
        if (existingCurriculum) {
            setCurriculum(existingCurriculum)
            setLoading(false)
            return
        }
        // If not found, fetch individually
        const data = await getCohortCurriculum(selectedCohortId)
        setCurriculum(data)
        setLoading(false)
    }

    const selectedCohort = cohorts.find(c => c.id === selectedCohortId)

    return (
        <section className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xs font-black text-emerald-600 uppercase tracking-[0.2em]">Programme Explorer</h2>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Real-time Curriculum View</p>
            </div>

            <div className="card p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                            <BookOpen className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900 leading-tight">View Formation Materials</h3>
                            <p className="text-xs text-gray-500 mt-1">Check exactly what your mentees are learning this week.</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <select
                            value={selectedCohortId}
                            onChange={(e) => setSelectedCohortId(e.target.value)}
                            className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold focus:border-emerald-500 focus:ring-0"
                        >
                            <option value="">Select Cohort...</option>
                            {cohorts.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                        <button
                            disabled={!selectedCohortId || loading}
                            onClick={() => setShowFull(true)}
                            className="bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-emerald-800 transition-all disabled:opacity-50"
                        >
                            {loading ? 'Fetching...' : 'Open Preview'}
                        </button>
                    </div>
                </div>
            </div>

            {showFull && selectedCohortId && (
                <div className="fixed inset-0 z-[150] bg-white overflow-y-auto">
                    <div className="max-w-6xl mx-auto p-6 md:p-10">
                        <div className="flex items-center justify-between mb-10 pb-6 border-b border-gray-100">
                             <div>
                                <h2 className="text-2xl font-black text-gray-900 tracking-tight">Curriculum Preview: {selectedCohort?.name}</h2>
                                <p className="text-sm text-gray-500 font-medium italic">Viewing the live formation journey as shared with learners.</p>
                             </div>
                             <button
                                onClick={() => setShowFull(false)}
                                className="p-3 bg-gray-50 hover:bg-gray-100 rounded-2xl transition-all"
                             >
                                <X className="w-6 h-6 text-gray-400" />
                             </button>
                        </div>
                        {curriculum ? (
                            <CohortCurriculumHub
                                curriculum={curriculum}
                                completions={[]}
                                enrollment={{ cohort_id: selectedCohortId }}
                            />
                        ) : (
                            <div className="py-20 text-center">
                                <Layers className="w-12 h-12 text-gray-100 mx-auto mb-4" />
                                <p className="text-sm text-gray-400">Curriculum data not yet pushed for this cohort.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </section>
    )
}
