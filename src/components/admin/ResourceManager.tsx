'use client'

import { useState, useEffect } from 'react'
import { getSupplementaryResources } from '@/lib/sanity/queries'
import { deleteSanityDocument } from '@/lib/actions/sanity'
import {
    BookOpen, Video, FileText, Headphones, FileDown,
    Globe, Trash2, Edit3, Plus, X, Search
} from '@/components/icons'
import { cn, formatDate } from '@/lib/utils'

export function ResourceManager({ cohorts, onClose }: { cohorts: any[], onClose?: () => void }) {
    const [resources, setResources] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearch) = useState('')

    useEffect(() => {
        fetchResources()
    }, [])

    async function fetchResources() {
        setLoading(true)
        const data = await getSupplementaryResources()
        setResources(data)
        setLoading(false)
    }

    async function handleDelete(id: string) {
        if (!confirm('Delete this resource permanently?')) return
        await deleteSanityDocument(id)
        fetchResources()
    }

    const filtered = resources.filter(r =>
        r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.description?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const typeIcons: Record<string, any> = {
        video: Video,
        article: FileText,
        audio: Headphones,
        pdf: FileDown,
        image: Globe
    }

    return (
        <div className="bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 flex flex-col max-h-[90vh] overflow-hidden">
            <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <div>
                    <h2 className="text-2xl font-black text-gray-900 tracking-tight">Resource Management</h2>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Manage supplementary materials</p>
                </div>
                {onClose && (
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-xl transition-colors">
                        <X className="w-6 h-6 text-gray-400" />
                    </button>
                )}
            </div>

            <div className="p-6 border-b border-gray-50 flex items-center gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        value={searchTerm}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search resources..."
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-xl focus:border-blue-500 focus:ring-0 text-sm font-medium"
                    />
                </div>
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50 px-3 py-2 rounded-lg">
                    {filtered.length} items
                </span>
            </div>

            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                {loading ? (
                    <div className="py-20 text-center space-y-4">
                        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Fetching Library...</p>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="py-20 text-center">
                        <BookOpen className="w-12 h-12 text-gray-100 mx-auto mb-4" />
                        <p className="text-sm text-gray-400 font-medium">No resources found matching your search.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {filtered.map(resource => {
                            const Icon = typeIcons[resource.contentType] || BookOpen
                            const cohort = cohorts.find(c => c.id === resource.cohortId)

                            return (
                                <div key={resource._id} className="group border border-gray-100 rounded-2xl p-4 hover:border-blue-500 transition-all flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-4 flex-1 min-w-0">
                                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                            <Icon className="w-5 h-5" />
                                        </div>
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2 mb-0.5">
                                                <h3 className="text-sm font-bold text-gray-900 truncate">{resource.title}</h3>
                                                <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100">{resource.contentType}</span>
                                            </div>
                                            <p className="text-[10px] text-gray-400 font-medium truncate">
                                                {cohort ? `Assigned to: ${cohort.name}` : 'Global Resource'} • {formatDate(resource.publishedAt)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => handleDelete(resource._id)}
                                            className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Delete Resource"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}
