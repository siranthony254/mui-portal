'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { saveJournalEntry, toggleJournalSharing, deleteJournalEntry } from '@/lib/actions/cohort'
import { uploadVoiceJournal } from '@/lib/actions/sanity'
import { JOURNAL_PROMPTS, getPillarColor } from '@/types'
import { Lock, Unlock, Check, Save, ChevronLeft, ChevronRight, Share2, Globe, CloudOff, Trash2, Mic2, Play, Pause } from '@/components/icons'
import { cn } from '@/lib/utils'
import type { JournalEntry } from '@/types'
import { useSearchParams } from 'next/navigation'
import { VoiceRecorder } from '@/components/ui/VoiceRecorder'

interface Props {
  initialEntries: JournalEntry[]
  initialVoiceEntries?: any[]
  currentWeek: number
  currentPillar: number
  studentId?: string
}

function JournalContent({ initialEntries, initialVoiceEntries = [], currentWeek, currentPillar, studentId }: Props) {
  const [selectedWeek, setSelectedWeek] = useState(currentWeek)
  const [entries, setEntries] = useState(initialEntries)
  const [voiceEntries, setVoiceEntries] = useState(initialVoiceEntries)
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false)
  const [content, setContent] = useState('')
  const [saving, setSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [isShared, setIsShared] = useState(false)
  const [activeJournalId, setActiveJournalId] = useState<string | null>(null)
  const [isOnline, setIsOnline] = useState(true)
  const [hasUnsyncedChanges, setHasUnsyncedChanges] = useState(false)
  const searchParams = useSearchParams()
  const externalPrompt = searchParams.get('prompt')

  useEffect(() => {
    setIsOnline(navigator.onLine)
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Load from LocalStorage if available (Offline-first)
  useEffect(() => {
    const entry = entries.find(e => e.week_number === selectedWeek)
    const localKey = `journal_w${selectedWeek}`
    const localContent = localStorage.getItem(localKey)

    if (localContent !== null) {
      setContent(localContent)
      setHasUnsyncedChanges(localContent !== entry?.content)
    } else {
      setContent(entry?.content || '')
      setHasUnsyncedChanges(false)
    }

    setIsShared(entry?.is_shared || false)
    setActiveJournalId(entry?.id || null)
  }, [selectedWeek, entries])

  const pillarNum = Math.ceil(selectedWeek / 3)
  const defaultPrompt = JOURNAL_PROMPTS[selectedWeek as keyof typeof JOURNAL_PROMPTS]
  const prompt = (selectedWeek === currentWeek && externalPrompt) ? externalPrompt : defaultPrompt

  const handleSave = useCallback(async () => {
    if (saving) return
    setSaving(true)

    // Always save to LocalStorage first
    const localKey = `journal_w${selectedWeek}`
    localStorage.setItem(localKey, content)

    if (navigator.onLine) {
      const res = await saveJournalEntry(selectedWeek, pillarNum, content)
      if (res.success) {
        setLastSaved(new Date())
        setHasUnsyncedChanges(false)
      } else {
        setHasUnsyncedChanges(true)
      }
    } else {
      setHasUnsyncedChanges(true)
    }
    setSaving(false)
  }, [selectedWeek, content, saving, pillarNum])

  // Sync logic when coming back online
  useEffect(() => {
    if (isOnline && hasUnsyncedChanges) {
      handleSave()
    }
  }, [isOnline, hasUnsyncedChanges, handleSave])

  // Auto-save every 10 seconds if content changed (more aggressive for offline safety)
  useEffect(() => {
    const timer = setTimeout(() => {
      const localKey = `journal_w${selectedWeek}`
      const lastLocal = localStorage.getItem(localKey)
      if (lastLocal !== content) {
        handleSave()
      }
    }, 10000)
    return () => clearTimeout(timer)
  }, [content, handleSave, selectedWeek])

  async function handleToggleShare() {
    if (!activeJournalId) return
    const newShared = !isShared
    const res = await toggleJournalSharing(activeJournalId, newShared)
    if (res.success) setIsShared(newShared)
  }

  async function handleDelete() {
    if (!confirm('Permanently delete this week\'s journal entry?')) return
    setSaving(true)
    const res = await deleteJournalEntry(selectedWeek)
    if (res.success) {
        localStorage.removeItem(`journal_w${selectedWeek}`)
        setContent('')
        setHasUnsyncedChanges(false)
        setLastSaved(null)
    }
    setSaving(false)
  }

  const handleVoiceUpload = async (file: File) => {
    if (!studentId) return
    setSaving(true)
    const res = await uploadVoiceJournal({
        studentId,
        weekNumber: selectedWeek,
        pillarNumber: pillarNum,
        file
    })
    if (res.success) {
        setShowVoiceRecorder(false)
        // Refresh local voice entries (in a real app we'd fetch again or optimistic update)
        setVoiceEntries(prev => [{
            _id: Math.random().toString(),
            weekNumber: selectedWeek,
            audioFile: { asset: { url: URL.createObjectURL(file) } }, // Temporary local URL
            publishedAt: new Date().toISOString()
        }, ...prev])
    }
    setSaving(false)
  }

  const weeklyVoiceEntries = voiceEntries.filter(v => v.weekNumber === selectedWeek)

  return (
    <div className="max-w-4xl mx-auto flex flex-col lg:flex-row gap-6">
      <div className="w-full lg:w-64 space-y-4 flex-shrink-0">
        <div className="card p-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Timeline</p>
          <div className="grid grid-cols-6 lg:grid-cols-4 gap-2">
            {Array.from({ length: 12 }, (_, i) => i + 1).map(w => {
              const hasEntry = entries.some(e => e.week_number === w && e.content?.length > 0)
              const isCurrent = w === currentWeek
              const isSelected = w === selectedWeek
              return (
                <button
                  key={w}
                  onClick={() => setSelectedWeek(w)}
                  className={cn(
                    'aspect-square rounded-lg text-xs font-medium flex items-center justify-center border transition-all',
                    isSelected ? 'border-teal-600 bg-teal-50 text-teal-700 ring-1 ring-teal-600' :
                    isCurrent ? 'border-teal-200 bg-white text-teal-600' :
                    hasEntry ? 'border-gray-200 bg-gray-50 text-gray-600' :
                    'border-gray-100 bg-white text-gray-300'
                  )}
                >
                  {w}
                </button>
              )
            })}
          </div>
        </div>

        <div className="card p-4 bg-gray-50 border-none shadow-none">
          <div className="flex items-center gap-2 mb-2 text-gray-500">
            <Lock className="w-3.5 h-3.5" />
            <span className="text-[10px] font-semibold uppercase tracking-widest">Privacy Policy</span>
          </div>
          <p className="text-[11px] text-gray-500 leading-relaxed">
            Your journal is private. Mentors and admins cannot see these entries unless you explicitly choose to share a specific week's entry for feedback.
          </p>
        </div>
      </div>

      <div className="lg:col-span-3 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-gray-900">Week {selectedWeek} Journal</h1>
            <span className={cn('badge text-[10px]', getPillarColor(pillarNum))}>Pillar {pillarNum}</span>
          </div>
          <div className="flex items-center gap-4">
            {!isOnline && (
              <span className="flex items-center gap-1 text-[10px] text-amber-600 font-bold bg-amber-50 px-2 py-1 rounded-md">
                <CloudOff className="w-3 h-3" /> Offline Mode
              </span>
            )}
            {hasUnsyncedChanges && (
              <span className="text-[10px] text-blue-600 font-medium italic animate-pulse">
                Unsynced changes
              </span>
            )}
            {lastSaved && !hasUnsyncedChanges && (
              <span className="text-[10px] text-gray-400 flex items-center gap-1">
                <Check className="w-3 h-3" /> {isOnline ? 'Synced' : 'Saved Locally'} {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
            <button
              onClick={handleSave}
              disabled={saving}
              className="btn-primary py-1.5 px-3 text-xs flex items-center gap-2"
            >
              <Save className="w-3.5 h-3.5" /> {saving ? 'Saving...' : 'Save'}
            </button>
            <button
                onClick={() => setShowVoiceRecorder(!showVoiceRecorder)}
                className={cn(
                    "p-2 rounded-lg transition-all",
                    showVoiceRecorder ? "bg-teal-600 text-white" : "bg-teal-50 text-teal-700 hover:bg-teal-100"
                )}
                title="Voice Journal"
            >
                <Mic2 className="w-4 h-4" />
            </button>
            {content.trim() && (
                <button
                    onClick={handleDelete}
                    disabled={saving}
                    className="p-1.5 text-gray-300 hover:text-red-500 transition-colors"
                    title="Clear Entry"
                >
                    <Trash2 className="w-3.5 h-3.5" />
                </button>
            )}
          </div>
        </div>

        {showVoiceRecorder && (
            <div className="animate-reveal">
                <VoiceRecorder onUpload={handleVoiceUpload} label="Weekly Voice Reflection" />
            </div>
        )}

        {weeklyVoiceEntries.length > 0 && (
            <div className="space-y-3 animate-reveal">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-1">Voice Reflections</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {weeklyVoiceEntries.map((v: any) => (
                        <div key={v._id} className="card p-4 flex items-center gap-4 bg-teal-50/30 border-teal-100/50">
                            <div className="w-10 h-10 rounded-full bg-teal-600 text-white flex items-center justify-center flex-shrink-0">
                                <Play className="w-5 h-5 fill-current ml-0.5" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-gray-900">Voice Note</p>
                                <p className="text-[10px] text-gray-400">{new Date(v.publishedAt).toLocaleDateString()}</p>
                            </div>
                            <audio src={v.audioFile?.asset?.url} controls className="hidden" />
                            <button
                                onClick={(e) => {
                                    const audio = e.currentTarget.parentElement?.querySelector('audio')
                                    if (audio) {
                                        if (audio.paused) audio.play()
                                        else audio.pause()
                                    }
                                }}
                                className="text-[10px] font-black text-teal-700 uppercase tracking-widest hover:underline"
                            >
                                Play
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        )}

        <div className="card overflow-hidden">
          <div className="px-5 py-4 bg-teal-50/50 border-b border-gray-100">
            <p className="text-[10px] font-bold text-teal-700 uppercase tracking-widest mb-1">Weekly Prompt</p>
            <p className="text-sm text-teal-900 font-medium leading-relaxed italic">
              "{prompt || 'Free writing week. What is on your mind regarding your formation?'}"
            </p>
          </div>

          <div className="relative">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Start writing here... Your thoughts, observations, and reflections."
              className="w-full min-h-[400px] p-6 text-sm text-gray-800 border-none focus:ring-0 resize-none leading-relaxed placeholder:text-gray-300"
            />
          </div>

          <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
             <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
                   {isShared ? <Unlock className="w-3.5 h-3.5 text-amber-500" /> : <Lock className="w-3.5 h-3.5 text-teal-600" />}
                   {isShared ? 'Shared with your mentor' : 'Private to you'}
                </div>
             </div>
             {activeJournalId && (
               <button
                onClick={handleToggleShare}
                className={cn(
                  "flex items-center gap-2 text-[11px] font-semibold px-3 py-1.5 rounded-lg transition-colors",
                  isShared ? "bg-amber-50 text-amber-700 hover:bg-amber-100" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                )}
               >
                 <Share2 className="w-3.5 h-3.5" />
                 {isShared ? 'Make Private' : 'Share with Mentor'}
               </button>
             )}
          </div>
        </div>

        <div className="flex justify-between items-center px-1">
          <button
            onClick={() => setSelectedWeek(s => Math.max(1, s - 1))}
            disabled={selectedWeek === 1}
            className="text-xs text-gray-500 flex items-center gap-1 hover:text-teal-700 disabled:opacity-30"
          >
            <ChevronLeft className="w-4 h-4" /> Week {selectedWeek - 1}
          </button>
          <button
            onClick={() => setSelectedWeek(s => Math.min(12, s + 1))}
            disabled={selectedWeek === 12}
            className="text-xs text-gray-500 flex items-center gap-1 hover:text-teal-700 disabled:opacity-30"
          >
            Week {selectedWeek + 1} <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

export function JournalClient(props: Props) {
  return (
    <Suspense fallback={<div className="py-20 text-center text-gray-400">Loading journal infrastructure...</div>}>
      <JournalContent {...props} />
    </Suspense>
  )
}

