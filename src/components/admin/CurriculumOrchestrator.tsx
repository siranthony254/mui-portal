'use client'

import { useState, useEffect } from 'react'
import { getCohortCurriculum } from '@/lib/sanity/queries'
import { PILLARS } from '@/types'
import {
    updateCohortCurriculum,
    deleteCurriculumSession,
    deleteCurriculumPillar,
    updateCurriculumPillar
} from '@/lib/actions/sanity'
import {
    Layers, Zap, Calendar, Play, ChevronRight,
    ArrowLeft, Plus, MessageSquare, BookOpen,
    FileText, Video, Headphones, FileDown, X, CheckCircle, Search, Trash2, Edit3, Save, Globe, Image as ImageIcon
} from '@/components/icons'
import { cn, parseYouTubeEmbed } from '@/lib/utils'
import { CohortCurriculumHub } from '@/components/cohort/hub/CohortCurriculumHub'
import { MediaPicker } from '@/components/ui/MediaPicker'
import { RichTextEditor } from '@/components/ui/RichTextEditor'

interface Pillar {
    number: number
    name: string
    description?: string
}

interface Cohort {
    id: string
    name: string
    pillars_config: Pillar[]
}

export function CurriculumOrchestrator({ cohorts, onCohortSelect, onClose }: { cohorts: any[], onCohortSelect?: (id: string) => void, onClose?: () => void }) {
    const [selectedCohortId, setSelectedCohortId] = useState('')
    const [curriculum, setCurriculum] = useState<any>(null)
    const [loading, setLoading] = useState(false)
    const [activePillar, setActivePillar] = useState<number | null>(null)
    const [editingPillar, setEditingPillar] = useState<Pillar | null>(null)
    const [activeSession, setActiveSession] = useState<any>(null)
    const [showPreview, setShowPreview] = useState(false)

    const selectedCohort = cohorts.find(c => c.id === selectedCohortId)
    const activePillars = selectedCohort?.pillars_config || PILLARS.map(p => ({ ...p, objectives: [] }))

    useEffect(() => {
        if (selectedCohortId) {
            fetchCurriculum()
        } else {
            setCurriculum(null)
            setActivePillar(null)
        }
        if (onCohortSelect) onCohortSelect(selectedCohortId)
    }, [selectedCohortId])

    async function fetchCurriculum() {
        setLoading(true)
        const data = await getCohortCurriculum(selectedCohortId)
        console.log('Fetched curriculum:', data)
        setCurriculum(data)
        setLoading(false)
    }

    const handleDeletePillar = async (pillarNum: number) => {
        if (!confirm(`Are you sure you want to delete Pillar ${pillarNum} and all its content?`)) return
        setLoading(true)
        await deleteCurriculumPillar(selectedCohortId, pillarNum)
        await fetchCurriculum()
    }

    const handleDeleteSession = async (pillarNum: number, weekNum: number, dayNum: number, sessionNum: number) => {
        if (!confirm(`Delete Session ${sessionNum} for Day ${dayNum}?`)) return
        setLoading(true)
        await deleteCurriculumSession(selectedCohortId, pillarNum, weekNum, dayNum, sessionNum)
        await fetchCurriculum()
    }

    if (!selectedCohortId) {
        return (
            <div className="card p-12 text-center bg-gray-50 border-dashed border-gray-200">
                <Layers className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                <h2 className="text-xl font-black text-gray-900">Select a Cohort to Orchestrate</h2>
                <p className="text-sm text-gray-500 max-w-sm mx-auto mt-2 mb-8 leading-relaxed">
                    Choose a cohort from the list below to begin designing its unique formation journey.
                </p>
                <div className="max-w-xs mx-auto">
                    <select
                        value={selectedCohortId}
                        onChange={(e) => setSelectedCohortId(e.target.value)}
                        className="w-full px-5 py-4 bg-white border-2 border-gray-200 rounded-2xl focus:border-emerald-500 focus:ring-0 font-bold text-sm shadow-sm"
                    >
                        <option value="">Select Cohort...</option>
                        {cohorts.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-8 animate-reveal">
            {/* Level Header */}
            <div className="flex items-center justify-between">
                <button
                    onClick={() => {
                        if (activeSession) setActiveSession(null)
                        else if (activePillar) setActivePillar(null)
                        else if (onClose) onClose()
                        else setSelectedCohortId('')
                    }}
                    className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-widest hover:text-emerald-700 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" /> Back {activeSession ? 'to Pillar' : activePillar ? 'to Cohort' : onClose ? 'to Dashboard' : 'to Selection'}
                </button>
                <div className="flex items-center gap-3">
                    {selectedCohortId && (
                        <button
                            onClick={() => setShowPreview(true)}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest bg-blue-50 text-blue-700 border border-blue-100 hover:bg-blue-100 transition-all"
                        >
                            <Globe className="w-3.5 h-3.5" /> Learner Preview
                        </button>
                    )}
                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-2 py-0.5 rounded-md">Orchestrating</span>
                    <h2 className="text-sm font-bold text-gray-900">{selectedCohort?.name}</h2>
                </div>
            </div>

            {showPreview && (
                <div className="fixed inset-0 z-[150] bg-white overflow-y-auto">
                    <div className="max-w-6xl mx-auto p-6 md:p-10">
                        <div className="flex items-center justify-between mb-10 pb-6 border-b border-gray-100">
                             <div>
                                <h2 className="text-2xl font-black text-gray-900 tracking-tight">Learner Experience Preview</h2>
                                <p className="text-sm text-gray-500 font-medium">Viewing as a student in {selectedCohort?.name}</p>
                             </div>
                             <button
                                onClick={() => setShowPreview(false)}
                                className="p-3 bg-gray-50 hover:bg-gray-100 rounded-2xl transition-all"
                             >
                                <X className="w-6 h-6 text-gray-400" />
                             </button>
                        </div>
                        <CohortCurriculumHub
                            curriculum={curriculum}
                            completions={[]}
                            enrollment={{ cohort_id: selectedCohortId }}
                        />
                    </div>
                </div>
            )}

            {loading ? (
                <div className="py-20 text-center space-y-4">
                    <div className="w-8 h-8 border-4 border-emerald-700 border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Loading Infrastructure...</p>
                </div>
            ) : editingPillar ? (
                <PillarEditor
                    pillar={editingPillar}
                    cohortId={selectedCohortId}
                    onUpdate={() => {
                        fetchCurriculum()
                        setEditingPillar(null)
                    }}
                    onClose={() => setEditingPillar(null)}
                />
            ) : activeSession ? (
                <SessionEditor
                    session={activeSession}
                    cohortId={selectedCohortId}
                    onUpdate={() => {
                        fetchCurriculum()
                        setActiveSession(null)
                    }}
                    onClose={() => setActiveSession(null)}
                    onDelete={() => {
                        handleDeleteSession(activeSession.pillarNumber, activeSession.weekNumber, activeSession.dayNumber, activeSession.sessionNumber || 1)
                        setActiveSession(null)
                    }}
                />
            ) : activePillar ? (
                <PillarModuleView
                    pillar={activePillars.find((p: any) => p.number === activePillar)!}
                    curriculum={curriculum}
                    onOpenSession={(s: any) => setActiveSession(s)}
                    onDeleteSession={handleDeleteSession}
                />
            ) : (
                <PillarSelectionGrid
                    pillars={activePillars}
                    curriculum={curriculum}
                    onSelect={(num) => setActivePillar(num)}
                    onEditPillar={(p) => setEditingPillar(p)}
                    onDeletePillar={handleDeletePillar}
                />
            )}
        </div>
    )
}

function PillarSelectionGrid({ pillars, curriculum, onSelect, onEditPillar, onDeletePillar }: { pillars: Pillar[], curriculum: any, onSelect: (num: number) => void, onEditPillar: (p: Pillar) => void, onDeletePillar: (num: number) => void }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pillars.map(p => {
                const sanityPillar = curriculum?.pillars?.find((sp: any) => sp.number === p.number)
                const sessionCount = sanityPillar?.modules?.reduce((acc: number, m: any) => {
                    const daySessions = m.days?.reduce((dayAcc: number, d: any) => dayAcc + (d.sessions?.length || 0), 0) || 0
                    return acc + daySessions
                }, 0) || 0

                return (
                    <div key={p.number} className="relative group">
                        <button
                            onClick={() => onSelect(p.number)}
                            className="w-full card p-8 text-left group hover:border-emerald-600 transition-all hover:shadow-2xl relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                                <Layers className="w-20 h-20" />
                            </div>
                            <div className="relative z-10 space-y-4">
                                <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center font-black group-hover:bg-emerald-700 group-hover:text-white transition-colors shadow-lg shadow-teal-700/10">
                                    {p.number}
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-gray-900 group-hover:text-emerald-900 transition-colors uppercase tracking-tight">{p.name}</h3>
                                    <p className="text-xs text-gray-400 mt-1 font-medium leading-relaxed line-clamp-2">{p.description || "Formation foundation for this pillar."}</p>
                                </div>
                                <div className="pt-4 flex items-center justify-between">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">{sessionCount} Sessions Designed</span>
                                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-emerald-700 group-hover:translate-x-1 transition-all" />
                                </div>
                            </div>
                        </button>
                        <div className="absolute top-4 right-4 z-20 flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                            <button
                                onClick={(e) => { e.stopPropagation(); onEditPillar(p) }}
                                className="p-2 bg-white/80 backdrop-blur rounded-lg text-gray-400 hover:text-emerald-600 shadow-sm"
                            >
                                <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); onDeletePillar(p.number) }}
                                className="p-2 bg-white/80 backdrop-blur rounded-lg text-red-400 hover:text-red-600 shadow-sm"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )
            })}
            <div className="card p-8 border-dashed border-2 border-gray-200 flex flex-col items-center justify-center text-center opacity-40 hover:opacity-100 transition-opacity">
                <Plus className="w-10 h-10 text-gray-300 mb-2" />
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest">New Pillar</p>
                <p className="text-[10px] text-gray-400 font-medium px-4">Update cohort settings to add more pillars.</p>
            </div>
        </div>
    )
}

function PillarEditor({ pillar, cohortId, onUpdate, onClose }: { pillar: Pillar, cohortId: string, onUpdate: () => void, onClose: () => void }) {
    const [loading, setLoading] = useState(false)
    const [name, setName] = useState(pillar.name)
    const [description, setDescription] = useState(pillar.description || '')

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        const res = await updateCurriculumPillar({
            cohortId,
            pillarNumber: pillar.number,
            name,
            description
        })
        if (res.success) onUpdate()
        setLoading(false)
    }

    return (
        <div className="card p-10 bg-white shadow-2xl animate-reveal">
            <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">Edit Pillar {pillar.number}</h3>
                <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors"><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <form onSubmit={handleSave} className="space-y-6">
                <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Pillar Name</label>
                    <input value={name} onChange={e => setName(e.target.value)} required className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-emerald-500 focus:ring-0 font-bold" />
                </div>
                <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Description</label>
                    <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-emerald-500 focus:ring-0 text-sm font-medium" />
                </div>
                <div className="flex justify-end gap-3 pt-4">
                    <button type="button" onClick={onClose} className="px-6 py-3 text-xs font-black uppercase text-gray-400">Cancel</button>
                    <button type="submit" disabled={loading} className="bg-emerald-700 text-white px-8 py-3 rounded-xl font-black uppercase tracking-widest flex items-center gap-2 shadow-lg">
                        {loading ? 'Saving...' : 'Save Changes'} <Save className="w-4 h-4" />
                    </button>
                </div>
            </form>
        </div>
    )
}

function PillarModuleView({ pillar, curriculum, onOpenSession, onDeleteSession }: { pillar: any, curriculum: any, onOpenSession: (s: any) => void, onDeleteSession: (p: number, w: number, d: number, s: number) => void }) {
    const weeks = [(pillar.number * 2) - 1, (pillar.number * 2)]
    const sanityPillar = curriculum?.pillars?.find((p: any) => p.number === pillar.number)

    console.log('PillarModuleView:', { pillarNumber: pillar.number, sanityPillar, weeks })

    return (
        <div className="space-y-10 animate-reveal">
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tighter">Pillar {pillar.number}: {pillar.name}</h3>
                        <p className="text-sm text-emerald-600 font-black uppercase tracking-widest">{pillar.subtitle}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Pillar Goal</p>
                        <p className="text-sm font-bold text-gray-900">{pillar.goal}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Pillar Description</h4>
                        <p className="text-sm text-gray-600 leading-relaxed font-medium">{pillar.description}</p>
                    </div>

                    <div className="bg-teal-50/50 rounded-2xl p-6 border border-teal-100">
                        <h4 className="text-[10px] font-black text-teal-600 uppercase tracking-widest mb-3">Pillar Objectives</h4>
                        <ul className="space-y-2">
                            {pillar.objectives?.map((obj: string, i: number) => (
                                <li key={i} className="flex gap-2 text-sm text-teal-900 font-medium italic">
                                    <span className="text-teal-400">•</span> {obj}
                                </li>
                            ))}
                            {(!pillar.objectives || pillar.objectives.length === 0) && (
                                <li className="text-sm text-gray-400 italic">No specific objectives set for this pillar.</li>
                            )}
                        </ul>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {weeks.map(week => {
                    const module = sanityPillar?.modules?.find((m: any) => m.weekNumber === week)
                    const days = module?.days || []
                    return (
                        <div key={week} className="space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-xl bg-emerald-700 text-white flex items-center justify-center text-xs font-black shadow-lg">
                                    W{week}
                                </div>
                                <h4 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Module: Week {week}</h4>
                            </div>

                            <div className="space-y-4">
                                {[1, 2, 3, 4, 5, 6, 7].map(day => {
                                    const dayData = days.find((d: any) => d.dayNumber === day)
                                    const sessions = dayData?.sessions || []
                                    return (
                                        <div key={day} className="space-y-2">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Day {day}</span>
                                                {sessions.length > 0 && (
                                                    <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                                                        {sessions.length} session{sessions.length !== 1 ? 's' : ''}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="space-y-2">
                                                {sessions.length === 0 ? (
                                                    <button
                                                        onClick={() => onOpenSession({ dayNumber: day, weekNumber: week, pillarNumber: pillar.number, sessionNumber: 1 })}
                                                        className="w-full flex items-center justify-between p-4 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 hover:border-gray-300 transition-all"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-lg bg-white text-gray-300 flex items-center justify-center text-xs font-black shadow-sm">
                                                                +
                                                            </div>
                                                            <span className="text-xs text-gray-400">Add first session</span>
                                                        </div>
                                                    </button>
                                                ) : (
                                                    sessions.map((session: any) => (
                                                        <div key={session.sessionNumber} className="relative group">
                                                            <button
                                                                onClick={() => onOpenSession({ ...session, dayNumber: day, weekNumber: week, pillarNumber: pillar.number })}
                                                                className={cn(
                                                                    "w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all group",
                                                                    "bg-white border-emerald-100 hover:border-emerald-600 hover:shadow-xl"
                                                                )}
                                                            >
                                                                <div className="flex items-center gap-3 text-left">
                                                                    <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-black group-hover:bg-emerald-700 group-hover:text-white transition-colors">
                                                                        S{session.sessionNumber}
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Session {session.sessionNumber}</p>
                                                                        <p className="text-sm font-bold text-gray-900">{session.title || 'Untitled'}</p>
                                                                    </div>
                                                                </div>
                                                                <div className="flex items-center gap-3">
                                                                    {session.journalPrompt && <MessageSquare className="w-4 h-4 text-blue-400" />}
                                                                    {session.contentBlocks?.length > 0 && <CheckCircle className="w-4 h-4 text-emerald-500" />}
                                                                    <div className="p-2 rounded-lg bg-gray-50 text-gray-400 group-hover:text-emerald-700 transition-colors">
                                                                        <Edit3 className="w-3.5 h-3.5" />
                                                                    </div>
                                                                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-emerald-700 group-hover:translate-x-1 transition-all" />
                                                                </div>
                                                            </button>
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); onDeleteSession(pillar.number, week, day, session.sessionNumber) }}
                                                                className="absolute -top-2 -right-2 z-20 p-2 bg-white rounded-full text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-all shadow-md border border-gray-100"
                                                            >
                                                                <Trash2 className="w-3.5 h-3.5" />
                                                            </button>
                                                        </div>
                                                    ))
                                                )}
                                                <button
                                                    onClick={() => onOpenSession({ dayNumber: day, weekNumber: week, pillarNumber: pillar.number, sessionNumber: sessions.length + 1 })}
                                                    className="w-full flex items-center justify-center gap-2 p-3 rounded-xl border border-dashed border-gray-200 bg-gray-50 hover:border-emerald-300 hover:bg-emerald-50 transition-all text-xs text-gray-400 hover:text-emerald-600 font-black uppercase tracking-widest"
                                                >
                                                    <Plus className="w-4 h-4" /> Add Session
                                                </button>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

function SessionEditor({ session, cohortId, onUpdate, onClose, onDelete }: { session: any, cohortId: string, onUpdate: () => void, onClose: () => void, onDelete?: () => void }) {
    const [loading, setLoading] = useState(false)
    const [title, setTitle] = useState(session?.title || '')
    const [journalPrompt, setJournalPrompt] = useState(session?.journalPrompt || '')

    const initialBlock = session?.contentBlocks?.[0]
    const [contentType, setContentType] = useState(
        initialBlock?._type === 'videoBlock' ? 'video' :
        initialBlock?._type === 'textBlock' ? 'article' :
        initialBlock?._type === 'audioBlock' ? 'audio' :
        initialBlock?._type === 'fileBlock' ? 'pdf' :
        initialBlock?._type === 'imageBlock' ? 'image' : 'video'
    )
    const [videoSource, setVideoSource] = useState<'youtube' | 'upload'>(session?.contentBlocks?.[0]?.videoType === 'youtube' ? 'youtube' : 'upload')
    const [youtubeInput, setYoutubeInput] = useState(() => {
        const block = session?.contentBlocks?.[0]
        if (block?.youtubeEmbed) return block.youtubeEmbed
        if (block?.url && typeof block.url === 'string' && block.url.includes('youtube')) return block.url
        return ''
    })
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    
    // Extract HTML from Sanity block array for article body
    const extractBodyText = (body: any) => {
        if (!body) return ''
        if (typeof body === 'string') return body
        if (Array.isArray(body)) {
            return body.map((block: any) => {
                if (block.children && Array.isArray(block.children)) {
                    return block.children.map((child: any) => child.text || '').join('')
                }
                return ''
            }).join('\n')
        }
        return ''
    }
    
    const [articleBody, setArticleBody] = useState(() => {
        const body = session?.contentBlocks?.[0]?.body
        // If body is already HTML string, use it directly
        if (typeof body === 'string' && body.includes('<')) {
            return body
        }
        // Otherwise extract from Sanity blocks
        return extractBodyText(body)
    })

    async function handleSave() {
        if (!title) {
            alert('Please enter a session title')
            return
        }
        setLoading(true)

        let contentBlock: any = {
            _type: contentType === 'video' ? 'videoBlock' : contentType === 'article' ? 'textBlock' : contentType === 'audio' ? 'audioBlock' : contentType === 'pdf' ? 'fileBlock' : 'imageBlock',
            title: title
        }

        if (contentType === 'video') {
            if (videoSource === 'youtube') {
                const videoId = parseYouTubeEmbed(youtubeInput)
                if (videoId) {
                    contentBlock.videoType = 'youtube'
                    contentBlock.youtubeEmbed = youtubeInput
                    contentBlock.url = `https://www.youtube.com/watch?v=${videoId}`
                }
            } else if (selectedFile) {
                contentBlock.videoType = 'upload'
                contentBlock.url = URL.createObjectURL(selectedFile)
            }
        } else if (contentType === 'article') {
            // Save HTML from rich text editor
            contentBlock.body = articleBody || '';
        } else if (contentType === 'audio' || contentType === 'pdf' || contentType === 'image') {
            if (selectedFile) {
                contentBlock.url = selectedFile.name
            } else if (session?.contentBlocks?.[0]?.url) {
                contentBlock.url = session.contentBlocks[0].url
            }
        }

        console.log('Saving session:', {
            cohortId,
            pillarNumber: session.pillarNumber,
            weekNumber: session.weekNumber,
            dayNumber: session.dayNumber,
            sessionNumber: session.sessionNumber || 1,
            contentBlock,
            journalPrompt: journalPrompt || undefined,
            hasFile: !!selectedFile
        })

        const res = await updateCohortCurriculum({
            cohortId,
            pillarNumber: session.pillarNumber,
            weekNumber: session.weekNumber,
            dayNumber: session.dayNumber,
            sessionNumber: session.sessionNumber || 1,
            contentBlock,
            journalPrompt: journalPrompt || undefined,
            file: selectedFile
        })

        console.log('Save response:', res)

        if (res.error) {
            alert(`Error saving session: ${res.error}`)
        } else {
            onUpdate()
        }
        setLoading(false)
    }

    async function handleDelete() {
        if (!confirm(`Permanently delete this session and all its content? This action cannot be undone.`)) return
        if (onDelete) {
            onDelete()
        }
    }

    return (
        <div className="card p-10 bg-white border-none shadow-[0_32px_64px_-12px_rgba(0,0,0,0.14)] animate-reveal max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-8 sticky top-0 bg-white pb-4 border-b border-gray-100 z-10">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-700 text-white flex items-center justify-center font-black text-lg shadow-xl shadow-emerald-700/20">
                        D{session.dayNumber}S{session.sessionNumber || 1}
                    </div>
                    <div>
                        <h3 className="text-lg font-black text-gray-900 leading-tight">Session Editor</h3>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Week {session.weekNumber} · Day {session.dayNumber} · Session {session.sessionNumber || 1}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {session?.contentBlocks?.length > 0 && (
                        <button
                            onClick={handleDelete}
                            className="p-2 hover:bg-red-50 rounded-xl transition-colors text-red-400 hover:text-red-600"
                            title="Delete Session"
                        >
                            <Trash2 className="w-6 h-6" />
                        </button>
                    )}
                    <button onClick={onClose} className="p-2 hover:bg-gray-50 rounded-xl transition-colors">
                        <X className="w-6 h-6 text-gray-400" />
                    </button>
                </div>
            </div>

            <div className="space-y-6">
                <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Session Title</label>
                    <input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-emerald-500 focus:ring-0 font-bold"
                        placeholder="e.g. Identity and the Inner Voice"
                    />
                </div>

                <div className="space-y-4">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Content Type</p>
                    <div className="grid grid-cols-5 gap-2">
                        {[
                            { id: 'video', icon: Video, label: 'Video' },
                            { id: 'article', icon: FileText, label: 'Article' },
                            { id: 'audio', icon: Headphones, label: 'Audio' },
                            { id: 'pdf', icon: FileDown, label: 'PDF' },
                            { id: 'image', icon: ImageIcon, label: 'Image' }
                        ].map(type => {
                            const Icon = type.icon
                            return (
                                <button
                                    key={type.id}
                                    type="button"
                                    onClick={() => setContentType(type.id)}
                                    className={cn(
                                        "flex flex-col items-center justify-center gap-2 py-3 rounded-2xl border-2 transition-all font-black text-[10px] uppercase tracking-widest",
                                        contentType === type.id ? "border-emerald-700 bg-emerald-50 text-emerald-900" : "border-gray-100 text-gray-400"
                                    )}
                                >
                                    <Icon className="w-4 h-4" />
                                    {type.label}
                                </button>
                            )
                        })}
                    </div>
                </div>

                {contentType === 'video' && (
                    <div className="space-y-4">
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => setVideoSource('youtube')}
                                className={cn("flex-1 py-3 rounded-xl border-2 font-black text-xs uppercase tracking-widest transition-all", videoSource === 'youtube' ? "border-emerald-700 bg-emerald-50 text-emerald-900" : "border-gray-100 text-gray-400")}
                            >
                                YouTube
                            </button>
                            <button
                                type="button"
                                onClick={() => setVideoSource('upload')}
                                className={cn("flex-1 py-3 rounded-xl border-2 font-black text-xs uppercase tracking-widest transition-all", videoSource === 'upload' ? "border-emerald-700 bg-emerald-50 text-emerald-900" : "border-gray-100 text-gray-400")}
                            >
                                Upload
                            </button>
                        </div>
                        {videoSource === 'youtube' ? (
                            <div className="space-y-2">
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">YouTube Embed Code</label>
                                <textarea
                                    value={youtubeInput}
                                    onChange={(e) => setYoutubeInput(e.target.value)}
                                    rows={4}
                                    className="w-full px-5 py-4 bg-gray-900 text-emerald-400 border-none rounded-2xl focus:ring-1 focus:ring-emerald-500 font-mono text-xs"
                                    placeholder='Paste <iframe...> from YouTube here'
                                />
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Upload Video</label>
                                <MediaPicker
                                    onFileSelect={setSelectedFile}
                                    type="video"
                                    accept="video/*"
                                    label="Click to select MP4/MOV"
                                />
                                {session?.contentBlocks?.[0]?.url && !selectedFile && (
                                    <p className="text-[10px] text-gray-400 mt-2 italic px-2">Current video: {typeof session.contentBlocks[0].url === 'string' ? session.contentBlocks[0].url.split('/').pop() : 'Video uploaded'}</p>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {contentType === 'article' && (
                    <div className="space-y-2">
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Article Body</label>
                        <RichTextEditor
                            value={articleBody}
                            onChange={setArticleBody}
                            placeholder="Write your article content here..."
                        />
                    </div>
                )}

                {(contentType === 'audio' || contentType === 'pdf' || contentType === 'image') && (
                    <div className="space-y-2">
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Upload {contentType.toUpperCase()}</label>
                        <MediaPicker
                            onFileSelect={setSelectedFile}
                            type={contentType as any}
                            accept={contentType === 'audio' ? 'audio/*' : contentType === 'pdf' ? 'application/pdf' : 'image/*'}
                        />
                        {session?.contentBlocks?.[0]?.url && !selectedFile && (
                            <p className="text-[10px] text-gray-400 mt-2 italic px-2">Current file: {typeof session.contentBlocks[0].url === 'string' ? session.contentBlocks[0].url.split('/').pop() : 'File uploaded'}</p>
                        )}
                    </div>
                )}

                <div className="space-y-2">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Journal Prompt</label>
                    <RichTextEditor
                        value={journalPrompt}
                        onChange={setJournalPrompt}
                        placeholder="What is one thing that stood out to you today?"
                    />
                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">This prompt is revealed after session content.</p>
                </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-50 flex justify-between gap-3 sticky bottom-0 bg-white pb-4">
                {session?.contentBlocks?.length > 0 && (
                    <button
                        onClick={handleDelete}
                        className="px-8 py-4 rounded-xl text-xs font-black uppercase tracking-widest text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors"
                    >
                        Delete Session
                    </button>
                )}
                <div className="flex gap-3 ml-auto">
                    <button
                        onClick={onClose}
                        className="px-8 py-4 rounded-xl text-xs font-black uppercase tracking-widest text-gray-400 hover:text-gray-900 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="bg-emerald-700 text-white px-12 py-4 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-emerald-800 transition-all shadow-xl shadow-emerald-700/20 active:scale-95 disabled:opacity-50"
                    >
                        {loading ? 'Saving...' : 'Save Session'} <Zap className="w-4 h-4 fill-white" />
                    </button>
                </div>
            </div>
        </div>
    )
}
