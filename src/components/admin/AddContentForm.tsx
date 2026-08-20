'use client'

import { useState, useEffect } from 'react'
import { updateCohortCurriculum } from '@/lib/actions/sanity'
import {
    Zap, Video, FileText, Headphones, FileDown,
    Globe, Plus, X, Award, Layers, Calendar, Play
} from '@/components/icons'
import { cn, parseYouTubeEmbed } from '@/lib/utils'
import { SimpleRichEditor } from '@/components/ui/SimpleRichEditor'

export function AddContentForm({ cohorts, onClose }: { cohorts: any[], onClose?: () => void }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Hierarchy State
  const [selectedCohortId, setSelectedCohortId] = useState('')
  const [selectedPillarNum, setSelectedPillarNum] = useState<number | null>(null)
  const [selectedWeekNum, setSelectedWeekNum] = useState<number | null>(null)
  const [selectedDayNum, setSelectedDayNum] = useState<number>(1)

  // Content Block State
  const [contentType, setContentType] = useState('video')
  const [videoSource, setVideoSource] = useState<'youtube' | 'upload'>('youtube')
  const [youtubeInput, setYoutubeInput] = useState('')
  const [articleBody, setArticleBody] = useState('')
  const [journalPrompt, setJournalPrompt] = useState('')

  const selectedCohort = cohorts.find(c => c.id === selectedCohortId)
  const pillars = selectedCohort?.pillars_config || []

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!selectedCohortId || !selectedPillarNum || !selectedWeekNum) {
        setError('Please complete the curriculum hierarchy selection.')
        return
    }

    setLoading(true)
    setError('')

    const formData = new FormData(e.currentTarget)

    // Construct Content Block
    let contentBlock: any = {
        _type: contentType === 'video' ? 'videoBlock' : contentType === 'article' ? 'textBlock' : 'fileBlock',
        title: formData.get('title'),
    }

    if (contentType === 'article') {
        contentBlock.body = articleBody;
    }

    if (contentType === 'video') {
        contentBlock.videoType = videoSource
        if (videoSource === 'youtube') {
            const videoId = parseYouTubeEmbed(youtubeInput)
            if (!videoId) {
                setError('Invalid YouTube link or embed code.')
                setLoading(false)
                return
            }
            contentBlock.youtubeEmbed = youtubeInput
            contentBlock.url = `https://www.youtube.com/watch?v=${videoId}`
        } else {
            // File upload logic would go here
            setError('Direct video upload via this form is coming soon. Please use YouTube embed for now.')
            setLoading(false)
            return
        }
    }

    const res = await updateCohortCurriculum({
        cohortId: selectedCohortId,
        pillarNumber: selectedPillarNum,
        weekNumber: selectedWeekNum,
        dayNumber: selectedDayNum,
        contentBlock,
        journalPrompt: journalPrompt || undefined
    })

    if (res.error) {
      setError(res.error)
    } else {
      if (onClose) onClose()
    }
    setLoading(false)
  }

  return (
    <div className="space-y-8 bg-white p-8 rounded-[2.5rem] shadow-2xl border border-emerald-50 max-h-[90vh] overflow-y-auto custom-scrollbar">
      <div className="flex items-center justify-between">
        <div>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">Curriculum Orchestrator</h2>
            <p className="text-sm text-gray-500 font-medium mt-1">Design the formation journey for your cohort.</p>
        </div>
        {onClose && (
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <X className="w-6 h-6 text-gray-400" />
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-10">
        {/* 1. Hierarchy Selection */}
        <section className="space-y-6">
            <h3 className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] flex items-center gap-2">
                <Layers className="w-4 h-4" /> Step 1: Placement
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Cohort</label>
                    <select
                        value={selectedCohortId}
                        onChange={(e) => setSelectedCohortId(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-emerald-500 focus:ring-0 font-bold text-sm"
                        required
                    >
                        <option value="">Select Cohort...</option>
                        {cohorts.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Pillar</label>
                    <select
                        disabled={!selectedCohortId}
                        value={selectedPillarNum || ''}
                        onChange={(e) => setSelectedPillarNum(Number(e.target.value))}
                        className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-emerald-500 focus:ring-0 font-bold text-sm disabled:opacity-50"
                        required
                    >
                        <option value="">Select Pillar...</option>
                        {pillars.map((p: any) => <option key={p.number} value={p.number}>P{p.number}: {p.name}</option>)}
                    </select>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Module (Week)</label>
                    <select
                        disabled={!selectedPillarNum}
                        value={selectedWeekNum || ''}
                        onChange={(e) => setSelectedWeekNum(Number(e.target.value))}
                        className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-emerald-500 focus:ring-0 font-bold text-sm disabled:opacity-50"
                        required
                    >
                        <option value="">Select Week...</option>
                        {selectedPillarNum && [
                            (selectedPillarNum * 2) - 1,
                            (selectedPillarNum * 2)
                        ].map(w => <option key={w} value={w}>Week {w}</option>)}
                    </select>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Session (Day)</label>
                    <select
                        disabled={!selectedWeekNum}
                        value={selectedDayNum}
                        onChange={(e) => setSelectedDayNum(Number(e.target.value))}
                        className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-emerald-500 focus:ring-0 font-bold text-sm disabled:opacity-50"
                        required
                    >
                        {[1, 2, 3, 4, 5, 6].map(d => <option key={d} value={d}>Day {d}</option>)}
                    </select>
                </div>
            </div>
        </section>

        {/* 2. Content Block Configuration */}
        <section className="space-y-6 pt-6 border-t border-gray-50">
            <h3 className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] flex items-center gap-2">
                <Zap className="w-4 h-4" /> Step 2: Content Details
            </h3>

            <div className="space-y-4">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Format</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {[
                        { id: 'video', label: 'Video', icon: Video },
                        { id: 'article', label: 'Article', icon: FileText },
                        { id: 'audio', label: 'Audio', icon: Headphones },
                        { id: 'pdf', label: 'PDF', icon: FileDown },
                    ].map((t) => (
                        <button
                            key={t.id}
                            type="button"
                            onClick={() => setContentType(t.id)}
                            className={cn(
                                "flex items-center gap-2 px-4 py-3 rounded-2xl border-2 transition-all",
                                contentType === t.id
                                    ? "border-emerald-700 bg-emerald-50 text-emerald-900"
                                    : "border-gray-100 bg-white text-gray-500 hover:border-gray-200"
                            )}
                        >
                            <t.icon className="w-4 h-4" />
                            <span className="text-[10px] font-black uppercase tracking-widest">{t.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Content Title</label>
                        <input name="title" required className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-emerald-500 focus:ring-0 font-bold" placeholder="e.g. Introduction to Identity" />
                    </div>

                    {contentType === 'article' && (
                        <div className="space-y-4 animate-reveal">
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Article Body (Type or Paste)</label>
                                <SimpleRichEditor
                                    value={articleBody}
                                    onChange={setArticleBody}
                                    placeholder="Type or paste your article content here..."
                                    rows={12}
                                />
                                <p className="mt-2 text-[9px] text-gray-400 font-bold uppercase italic tracking-tighter">Use the toolbar for basic formatting. Content is stored as plain text/markdown.</p>
                            </div>
                        </div>
                    )}

                    {contentType === 'video' && (
                        <div className="space-y-4 animate-reveal">
                            <div className="flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => setVideoSource('youtube')}
                                    className={cn("flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 transition-all", videoSource === 'youtube' ? "bg-red-50 border-red-200 text-red-700" : "bg-white border-gray-100 text-gray-400")}
                                >
                                    YouTube Embed
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setVideoSource('upload')}
                                    className={cn("flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 transition-all", videoSource === 'upload' ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-white border-gray-100 text-gray-400")}
                                >
                                    Direct Upload
                                </button>
                            </div>

                            {videoSource === 'youtube' ? (
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">YouTube Embed Code or Link</label>
                                    <textarea
                                        value={youtubeInput}
                                        onChange={(e) => setYoutubeInput(e.target.value)}
                                        rows={3}
                                        required
                                        className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-red-500 focus:ring-0 font-mono text-xs"
                                        placeholder='Paste <iframe...> code or full URL here'
                                    />
                                    <p className="mt-2 text-[9px] text-gray-400 font-bold uppercase italic tracking-tighter">System will auto-parse the video parameters.</p>
                                </div>
                            ) : (
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Upload Video File</label>
                                    <div className="w-full px-5 py-8 bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl text-center cursor-pointer hover:border-emerald-500 transition-colors">
                                        <Play className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Click to select MP4/MOV</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="space-y-6">
                    <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center justify-between">
                            Daily Journal Prompt
                            <span className="text-[8px] opacity-60 font-black">Triggered on completion</span>
                        </label>
                        <textarea
                            value={journalPrompt}
                            onChange={(e) => setJournalPrompt(e.target.value)}
                            rows={4}
                            className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-blue-500 focus:ring-0 text-sm font-medium italic text-gray-600"
                            placeholder="Ask a reflective question for this session..."
                        />
                    </div>

                    <div className="p-4 bg-blue-50 rounded-2xl border-2 border-blue-100">
                        <div className="flex items-center gap-2 text-blue-900 font-black text-[10px] uppercase tracking-widest mb-1">
                            <Calendar className="w-3 h-3" /> Sequential Unlocking
                        </div>
                        <p className="text-[10px] text-blue-800/70 leading-relaxed font-medium">
                            Once this content is pushed, it will be locked for students until they complete the previous session in this module.
                        </p>
                    </div>
                </div>
            </div>
        </section>

        {error && <p className="text-xs font-bold text-red-600 bg-red-50 p-4 rounded-2xl border border-red-100">{error}</p>}

        <div className="flex justify-end gap-3 pt-6 border-t border-gray-50">
          <button
            type="submit"
            disabled={loading || !selectedCohortId}
            className="bg-emerald-700 text-white px-12 py-5 rounded-[1.5rem] font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-emerald-800 transition-all shadow-2xl shadow-emerald-700/40 disabled:opacity-50 active:scale-95"
          >
            {loading ? 'Orchestrating...' : 'Deploy to Cohort'}
            <Zap className="w-5 h-5 fill-white" />
          </button>
        </div>
      </form>
    </div>
  )
}
