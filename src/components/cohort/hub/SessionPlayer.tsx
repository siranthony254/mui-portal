'use client'

import { useState } from 'react'
import { X, CheckCircle, Zap, Play, FileText, FileDown, Globe, MessageSquare } from '@/components/icons'
import { cn, getYouTubeEmbed } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export function SessionPlayer({ session, onClose, isCompleted, cohortId }: { session: any, onClose: () => void, isCompleted: boolean, cohortId: string }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const markComplete = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
        const { error } = await supabase.from('session_completions').upsert({
            student_id: user.id,
            cohort_id: cohortId,
            session_id: session._key
        })
        if (!error) {
            router.refresh()
            onClose()
        }
    }
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 z-[110] bg-gray-900/90 backdrop-blur-xl flex flex-col md:flex-row">
        {/* Left Side: Video / Primary Content */}
        <div className="flex-1 bg-black flex items-center justify-center relative">
            <button onClick={onClose} className="absolute top-6 left-6 z-50 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors md:hidden">
                <X className="w-6 h-6" />
            </button>

            <div className="w-full h-full">
                {session.contentBlocks?.map((block: any) => {
                    if (block._type === 'videoBlock') {
                        if (block.videoType === 'youtube') {
                            // Extract src from iframe if admin pasted full code
                            const srcMatch = block.youtubeEmbed?.match(/src=["']([^"']+)["']/)
                            const src = srcMatch ? srcMatch[1] : block.url ? getYouTubeEmbed(block.url) : ''

                            return (
                                <div key={block._key} className="w-full h-full aspect-video">
                                    <iframe
                                        src={src}
                                        className="w-full h-full border-none"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                        allowFullScreen
                                    />
                                </div>
                            )
                        } else {
                            // Direct upload rendering placeholder
                            return <div key={block._key} className="text-white p-12">Video file upload rendering...</div>
                        }
                    }
                    return null
                })}
                {/* Fallback if no video */}
                {!session.contentBlocks?.some((b:any) => b._type === 'videoBlock') && (
                    <div className="flex flex-col items-center justify-center h-full text-white/20 p-12 text-center">
                        <FileText className="w-24 h-24 mb-4" />
                        <p className="text-sm font-black uppercase tracking-widest">Reading Materials Only</p>
                    </div>
                )}
            </div>
        </div>

        {/* Right Side: Details & Actions */}
        <div className="w-full md:w-[450px] bg-white h-full flex flex-col shadow-2xl relative">
            <button onClick={onClose} className="absolute top-6 right-6 z-50 p-2 hover:bg-gray-100 rounded-xl transition-colors hidden md:block">
                <X className="w-6 h-6 text-gray-400" />
            </button>

            <div className="flex-1 overflow-y-auto p-8 pt-20 custom-scrollbar">
                <div className="space-y-8">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-[10px] font-black text-teal-600 uppercase tracking-widest bg-teal-50 px-2 py-0.5 rounded-md">Week {session.module.weekNumber} · Day {session.dayNumber}</span>
                        </div>
                        <h1 className="text-2xl font-black text-gray-900 leading-tight tracking-tight uppercase">{session.title}</h1>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Pillar {session.pillar.number}: {session.pillar.name}</p>
                    </div>

                    {/* Content Blocks (Non-Video) */}
                    <div className="space-y-6">
                        {session.contentBlocks?.filter((b:any) => b._type !== 'videoBlock').map((block: any) => (
                            <div key={block._key} className="space-y-4">
                                {block._type === 'textBlock' && (
                                    <div className="prose prose-sm prose-emerald text-gray-600 font-medium leading-relaxed italic border-l-4 border-teal-500 pl-6 py-2">
                                        {/* Simplified block rendering for now */}
                                        <p>Comprehensive article body text from Sanity will be rendered here via PortableText.</p>
                                    </div>
                                )}
                                {block._type === 'imageBlock' && (
                                    <div className="rounded-[1.5rem] overflow-hidden border border-gray-100">
                                        <img src={block.image?.asset?.url || '/placeholder.png'} className="w-full object-cover" />
                                        {block.caption && <p className="p-3 text-[10px] text-gray-400 font-bold text-center italic">{block.caption}</p>}
                                    </div>
                                )}
                                {block._type === 'fileBlock' && (
                                    <a href={block.externalUrl || '#'} target="_blank" className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 group hover:border-emerald-500 transition-all">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center shadow-sm">
                                                <FileDown className="w-4 h-4 text-emerald-600" />
                                            </div>
                                            <span className="text-xs font-bold text-gray-700">{block.title || 'Download Resource'}</span>
                                        </div>
                                        <Globe className="w-4 h-4 text-gray-300 group-hover:text-emerald-500" />
                                    </a>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Journal Prompt */}
                    {session.journalPrompt && (
                        <div className="p-6 bg-blue-50 rounded-[2rem] border-2 border-blue-100 space-y-3 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <MessageSquare className="w-12 h-12 text-blue-900" />
                            </div>
                            <h4 className="text-[10px] font-black text-blue-900 uppercase tracking-widest flex items-center gap-2">
                                <Zap className="w-3 h-3 fill-blue-900" /> Daily Reflection
                            </h4>
                            <p className="text-sm text-blue-800 leading-relaxed font-medium italic">
                                "{session.journalPrompt}"
                            </p>
                        </div>
                    )}
                </div>
            </div>

            <div className="p-8 border-t border-gray-100 bg-gray-50/50">
                {!isCompleted ? (
                    <button
                        onClick={markComplete}
                        disabled={loading}
                        className="w-full bg-emerald-700 text-white py-5 rounded-[1.5rem] font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-emerald-800 transition-all shadow-2xl shadow-emerald-700/40 active:scale-95 disabled:opacity-50"
                    >
                        {loading ? 'Processing...' : 'Mark Session as Complete'}
                        <CheckCircle className="w-5 h-5" />
                    </button>
                ) : (
                    <div className="w-full bg-emerald-50 text-emerald-700 py-5 rounded-[1.5rem] font-black uppercase tracking-widest flex items-center justify-center gap-3 border-2 border-emerald-100">
                        <CheckCircle className="w-5 h-5" />
                        Session Completed
                    </div>
                )}
                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest text-center mt-4">
                    Finishing unlocks Day {session.dayNumber + 1}
                </p>
            </div>
        </div>
    </div>
  )
}
