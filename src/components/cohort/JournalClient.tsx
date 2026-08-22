'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Lock, Unlock, Check, Save, ChevronLeft, ChevronRight, Share2, Globe, CloudOff, Trash2, Edit3, MessageSquare } from '@/components/icons'
import { cn } from '@/lib/utils'
import { useSearchParams } from 'next/navigation'

interface SessionJournal {
  sessionKey: string
  sessionTitle: string
  sessionNumber: number
  dayNumber: number
  weekNumber: number
  pillarNumber: number
  journalType: 'private' | 'mentor' | 'group'
  hasJournal: boolean
  journalContent: string
  submittedAt: string | null
  journalId: string | null
}

interface Props {
  sessionJournals: SessionJournal[]
  currentWeek: number
  currentPillar: number
  studentId?: string
  cohortId?: string
}

function JournalContent({ sessionJournals, currentWeek, currentPillar, studentId, cohortId }: Props) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [content, setContent] = useState('')
  const [saving, setSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [isOnline, setIsOnline] = useState(true)
  const supabase = createClient()

  const selectedJournal = sessionJournals[selectedIndex] || null

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

  // Load content when selection changes
  useEffect(() => {
    if (selectedJournal) {
      setContent(selectedJournal.journalContent)
      setLastSaved(selectedJournal.submittedAt ? new Date(selectedJournal.submittedAt) : null)
    }
  }, [selectedJournal, selectedIndex])

  const handleSave = useCallback(async () => {
    if (!selectedJournal || !studentId || !cohortId || saving) return
    setSaving(true)

    try {
      if (selectedJournal.hasJournal && selectedJournal.journalId) {
        // Update existing journal
        await supabase.from('journal_submissions').update({
          content: content,
          updated_at: new Date().toISOString()
        }).eq('id', selectedJournal.journalId)
      } else {
        // Insert new journal
        await supabase.from('journal_submissions').insert({
          student_id: studentId,
          session_id: selectedJournal.sessionKey,
          cohort_id: cohortId,
          journal_type: selectedJournal.journalType,
          content: content,
          is_private: selectedJournal.journalType === 'private'
        })
      }
      setLastSaved(new Date())
    } catch (error) {
      console.error('Error saving journal:', error)
    } finally {
      setSaving(false)
    }
  }, [selectedJournal, studentId, cohortId, content, saving, supabase])

  const handlePrevious = () => {
    setSelectedIndex(prev => Math.max(0, prev - 1))
  }

  const handleNext = () => {
    setSelectedIndex(prev => Math.min(sessionJournals.length - 1, prev + 1))
  }

  const getJournalTypeIcon = (type: string) => {
    switch (type) {
      case 'private': return <Lock className="w-3 h-3" />
      case 'mentor': return <Share2 className="w-3 h-3" />
      case 'group': return <MessageSquare className="w-3 h-3" />
      default: return <Lock className="w-3 h-3" />
    }
  }

  const getJournalTypeColor = (type: string) => {
    switch (type) {
      case 'private': return 'text-blue-600 bg-blue-50'
      case 'mentor': return 'text-emerald-600 bg-emerald-50'
      case 'group': return 'text-purple-600 bg-purple-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  if (sessionJournals.length === 0) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <MessageSquare className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No sessions available</h3>
        <p className="text-sm text-gray-500">Your cohort curriculum will appear here once sessions are available.</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto flex flex-col lg:flex-row gap-6">
      {/* Session List */}
      <div className="w-full lg:w-72 space-y-4 flex-shrink-0">
        <div className="card p-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Sessions</p>
          <div className="space-y-2">
            {sessionJournals.map((journal, index) => (
              <button
                key={journal.sessionKey}
                onClick={() => setSelectedIndex(index)}
                className={cn(
                  'w-full text-left p-3 rounded-xl border transition-all',
                  selectedIndex === index
                    ? 'border-teal-600 bg-teal-50 text-teal-700'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                )}
              >
                <div className="flex items-start gap-2">
                  <div className={cn('mt-0.5', getJournalTypeColor(journal.journalType))}>
                    {getJournalTypeIcon(journal.journalType)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold truncate">{journal.sessionTitle}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      W{journal.weekNumber} · D{journal.dayNumber} · S{journal.sessionNumber}
                    </p>
                  </div>
                  {journal.hasJournal && (
                    <Check className="w-3 h-3 text-emerald-600 flex-shrink-0 mt-0.5" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Journal Editor */}
      <div className="lg:col-span-3 space-y-4">
        {selectedJournal && (
          <>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-bold text-gray-900">{selectedJournal.sessionTitle}</h1>
                <span className={cn('badge text-[10px]', getJournalTypeColor(selectedJournal.journalType))}>
                  {selectedJournal.journalType}
                </span>
              </div>
              <div className="flex items-center gap-4">
                {!isOnline && (
                  <span className="flex items-center gap-1 text-[10px] text-amber-600 font-bold bg-amber-50 px-2 py-1 rounded-md">
                    <CloudOff className="w-3 h-3" /> Offline Mode
                  </span>
                )}
                {lastSaved && (
                  <span className="text-[10px] text-gray-400 flex items-center gap-1">
                    <Check className="w-3 h-3" /> {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                )}
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="btn-primary py-1.5 px-3 text-xs flex items-center gap-2"
                >
                  <Save className="w-3.5 h-3.5" /> {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>

            <div className="card overflow-hidden">
              <div className="px-5 py-4 bg-gray-50 border-b border-gray-100">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">
                  Week {selectedJournal.weekNumber} · Day {selectedJournal.dayNumber} · Session {selectedJournal.sessionNumber}
                </p>
                <p className="text-[10px] text-gray-400">
                  Pillar {selectedJournal.pillarNumber}
                </p>
              </div>

              <div className="relative">
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder={selectedJournal.hasJournal ? 'Edit your journal entry...' : 'Write your journal entry for this session...'}
                  className="w-full min-h-[400px] p-6 text-sm text-gray-800 border-none focus:ring-0 resize-none leading-relaxed placeholder:text-gray-300"
                />
              </div>

              <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
                  {selectedJournal.journalType === 'private' ? (
                    <>
                      <Lock className="w-3.5 h-3.5 text-blue-600" /> Private to you
                    </>
                  ) : selectedJournal.journalType === 'mentor' ? (
                    <>
                      <Share2 className="w-3.5 h-3.5 text-emerald-600" /> Shared with mentor
                    </>
                  ) : (
                    <>
                      <MessageSquare className="w-3.5 h-3.5 text-purple-600" /> Posted to group
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center px-1">
              <button
                onClick={handlePrevious}
                disabled={selectedIndex === 0}
                className="text-xs text-gray-500 flex items-center gap-1 hover:text-teal-700 disabled:opacity-30"
              >
                <ChevronLeft className="w-4 h-4" /> Previous Session
              </button>
              <button
                onClick={handleNext}
                disabled={selectedIndex === sessionJournals.length - 1}
                className="text-xs text-gray-500 flex items-center gap-1 hover:text-teal-700 disabled:opacity-30"
              >
                Next Session <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </>
        )}
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

