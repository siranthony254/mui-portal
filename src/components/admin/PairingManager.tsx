'use client'

import { useState } from 'react'
import { createPeerPartnership, removePeerPartnership, assignMentorToStudent, createPairConversation } from '@/lib/actions/admin'
import { Users, UserPlus, Trash2, CheckCircle, Search, Award, MessageSquare, Zap, Mic2 } from '@/components/icons'
import { cn, getInitials } from '@/lib/utils'
import { useRouter } from 'next/navigation'

export function PairingManager({ cohorts, students, mentors, partnerships, enrollments }: any) {
    const [selectedCohortId, setSelectedCohortId] = useState(cohorts[0]?.id || '')
    const [activeTab, setActiveTab] = useState<'peer' | 'mentor'>('peer')
    const [selection, setSelection] = useState<string[]>([])
    const [loading, setLoading] = useState(false)
    const [search, setSearch] = useState('')
    const router = useRouter()

    const filteredStudents = students.filter((s: any) => {
        const enrollment = enrollments.find((e: any) => e.student_id === s.id && e.cohort_id === selectedCohortId)
        if (!enrollment) return false
        if (search) {
            return s.full_name.toLowerCase().includes(search.toLowerCase()) ||
                   s.institution?.toLowerCase().includes(search.toLowerCase())
        }
        return true
    })

    const handlePair = async () => {
        if (selection.length !== 2) return
        setLoading(true)
        const res = await createPeerPartnership(selection[0], selection[1], selectedCohortId)
        if (res.success) setSelection([])
        setLoading(false)
    }

    const handleAssignMentor = async (studentId: string, mentorId: string | null) => {
        setLoading(true)
        await assignMentorToStudent(studentId, mentorId)
        setLoading(false)
    }

    const toggleSelection = (id: string) => {
        if (selection.includes(id)) {
            setSelection(selection.filter(sid => sid !== id))
        } else if (selection.length < 2) {
            setSelection([...selection, id])
        }
    }

    return (
        <div className="space-y-8">
            {/* Filter Bar */}
            <div className="card p-4 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <select
                        value={selectedCohortId}
                        onChange={e => setSelectedCohortId(e.target.value)}
                        className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:border-teal-500 focus:ring-0"
                    >
                        {cohorts.map((c: any) => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                    <div className="flex bg-gray-100 p-1 rounded-xl">
                        <button
                            onClick={() => setActiveTab('peer')}
                            className={cn("px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all", activeTab === 'peer' ? "bg-white text-teal-700 shadow-sm" : "text-gray-400")}
                        >
                            Peer Pairing
                        </button>
                        <button
                            onClick={() => setActiveTab('mentor')}
                            className={cn("px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all", activeTab === 'mentor' ? "bg-white text-blue-700 shadow-sm" : "text-gray-400")}
                        >
                            Mentor Groups
                        </button>
                    </div>
                </div>

                <div className="relative max-w-xs w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        placeholder="Search students..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:border-teal-500 focus:ring-0"
                    />
                </div>
            </div>

            {activeTab === 'peer' && selection.length === 2 && (
                <div className="card p-6 bg-teal-900 text-white flex items-center justify-between animate-reveal">
                    <div className="flex items-center gap-6">
                        <div className="flex -space-x-3">
                            {selection.map(id => {
                                const s = students.find((st: any) => st.id === id)
                                return (
                                    <div key={id} className="w-12 h-12 rounded-full border-4 border-teal-900 bg-teal-100 text-teal-700 flex items-center justify-center font-black text-sm">
                                        {getInitials(s?.full_name)}
                                    </div>
                                )
                            })}
                        </div>
                        <div>
                            <p className="text-sm font-black uppercase tracking-widest">Ready to Match</p>
                            <p className="text-xs text-teal-100 opacity-80">Pair these two students for accountability?</p>
                        </div>
                    </div>
                    <button
                        onClick={handlePair}
                        disabled={loading}
                        className="bg-emerald-400 hover:bg-emerald-300 text-emerald-950 px-8 py-3 rounded-2xl font-black uppercase tracking-widest text-xs transition-all active:scale-95 disabled:opacity-50"
                    >
                        {loading ? 'Matching...' : 'Confirm Pair'}
                    </button>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredStudents.map((student: any) => {
                    const enrollment = enrollments.find((e: any) => e.student_id === student.id && e.cohort_id === selectedCohortId)
                    const partnership = partnerships.find((p: any) => (p.student_id_1 === student.id || p.student_id_2 === student.id) && p.cohort_id === selectedCohortId)
                    const partner = partnership ? (partnership.student_id_1 === student.id ? partnership.p2 : partnership.p1) : null
                    const mentor = mentors.find((m: any) => m.id === enrollment?.mentor_id)
                    const isSelected = selection.includes(student.id)

                    return (
                        <div
                            key={student.id}
                            onClick={() => activeTab === 'peer' && toggleSelection(student.id)}
                            className={cn(
                                "card p-6 cursor-pointer transition-all border-2",
                                isSelected ? "border-teal-500 bg-teal-50/50" : "border-transparent",
                                activeTab === 'mentor' && "cursor-default"
                            )}
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs", isSelected ? "bg-teal-700 text-white" : "bg-gray-100 text-gray-400")}>
                                        {getInitials(student.full_name)}
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-gray-900">{student.full_name}</h3>
                                        <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold truncate max-w-[120px]">{student.institution}</p>
                                    </div>
                                </div>
                                {activeTab === 'peer' && (
                                    <div className={cn("w-5 h-5 rounded-full border-2 flex items-center justify-center", isSelected ? "bg-teal-500 border-teal-500 text-white" : "border-gray-200")}>
                                        {isSelected && <CheckCircle className="w-3.5 h-3.5" />}
                                    </div>
                                )}
                            </div>

                            <div className="space-y-3">
                                {/* Peer Info */}
                                <div className="p-3 bg-gray-50 rounded-xl space-y-1">
                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.1em]">Peer Partner</p>
                                    {partner ? (
                                        <div className="flex items-center justify-between">
                                            <p className="text-xs font-bold text-gray-700">{partner.full_name}</p>
                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={async (e) => {
                                                        e.stopPropagation();
                                                        const convoId = await createPairConversation([student.id, partner.id], selectedCohortId);
                                                        router.push(`/admin/messages?convo=${convoId}`)
                                                    }}
                                                    className="p-1 text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                                                    title="Open Chat"
                                                >
                                                    <MessageSquare className="w-3 h-3" />
                                                </button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); removePeerPartnership(partnership.id) }}
                                                    className="text-gray-400 hover:text-red-600 transition-colors"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-xs text-gray-400 italic">No partner assigned</p>
                                    )}
                                </div>

                                {/* Mentor Selection (only in mentor tab) */}
                                {activeTab === 'mentor' && (
                                    <div className="space-y-1">
                                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.1em]">Mentor Group</p>
                                        <div className="flex gap-2">
                                            <select
                                                value={enrollment?.mentor_id || ''}
                                                onChange={e => handleAssignMentor(student.id, e.target.value || null)}
                                                className="flex-1 px-3 py-2 bg-white border border-gray-100 rounded-lg text-xs font-bold focus:border-blue-500 focus:ring-0"
                                            >
                                                <option value="">Assign Mentor...</option>
                                                {mentors.map((m: any) => (
                                                    <option key={m.id} value={m.id}>{m.full_name}</option>
                                                ))}
                                            </select>
                                            {mentor && (
                                                <button
                                                    onClick={async (e) => {
                                                        e.stopPropagation();
                                                        const convoId = await createPairConversation([student.id, mentor.id], selectedCohortId);
                                                        router.push(`/admin/messages?convo=${convoId}`)
                                                    }}
                                                    className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                                                >
                                                    <MessageSquare className="w-3.5 h-3.5" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'peer' && mentor && (
                                    <p className="text-[10px] text-gray-400 font-medium">Assigned to {mentor.full_name}</p>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
