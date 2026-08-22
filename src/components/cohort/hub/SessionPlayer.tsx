'use client'

import { useState, useEffect, useRef } from 'react'
import { X, CheckCircle, Zap, Play, FileText, FileDown, Globe, MessageSquare, ChevronLeft, ChevronRight, Headphones } from '@/components/icons'
import { cn, getYouTubeEmbed } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export function SessionPlayer({ session, onClose, onSwitch, isCompleted, cohortId, allSessions = [], onSessionComplete }: { session: any, onClose: () => void, onSwitch: (s: any) => void, isCompleted: boolean, cohortId: string, allSessions?: any[], onSessionComplete?: (sessionKey: string) => void }) {
  const [loading, setLoading] = useState(false)
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null)
  const [journalContent, setJournalContent] = useState('')
  const [journalSubmitted, setJournalSubmitted] = useState(false)
  const [showNextSessionInvite, setShowNextSessionInvite] = useState(false)
  const router = useRouter()
  const supabase = createClient()
  const contentRef = useRef<HTMLDivElement>(null)
  const MINIMUM_READ_TIME = 5 * 60 // 5 minutes in seconds

  const sessionIndex = allSessions.findIndex(s => s._key === session._key)
  const nextSession = sessionIndex < allSessions.length - 1 ? allSessions[sessionIndex + 1] : null
  const prevSession = sessionIndex > 0 ? allSessions[sessionIndex - 1] : null

  // Time tracking - resume timer on mount
  useEffect(() => {
    const storageKey = `session_start_${session._key}`
    const storedStartTime = localStorage.getItem(storageKey)

    if (storedStartTime) {
      const startTime = parseInt(storedStartTime, 10)
      const elapsed = Math.floor((Date.now() - startTime) / 1000)
      setSessionStartTime(startTime)
      setElapsedTime(elapsed)
    } else {
      const now = Date.now()
      localStorage.setItem(storageKey, now.toString())
      setSessionStartTime(now)
      setElapsedTime(0)
    }

    // Timer interval
    const timer = setInterval(() => {
      setElapsedTime(prev => prev + 1)
    }, 1000)

    return () => {
      clearInterval(timer)
    }
  }, [session._key])

  // Clear stored time when session closes
  useEffect(() => {
    return () => {
      const storageKey = `session_start_${session._key}`
      localStorage.removeItem(storageKey)
    }
  }, [session._key, onClose])

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Calculate remaining time
  const remainingTime = Math.max(0, MINIMUM_READ_TIME - elapsedTime)
  const timeMet = elapsedTime >= MINIMUM_READ_TIME
  const journalType = session.journalType || 'private'
  const journalUnlocked = timeMet && hasScrolledToBottom

  // Auto-save journal content to localStorage
  useEffect(() => {
    const storageKey = `journal_draft_${session._key}`
    if (journalContent) {
      localStorage.setItem(storageKey, journalContent)
    } else {
      const saved = localStorage.getItem(storageKey)
      if (saved) setJournalContent(saved)
    }
  }, [session._key, journalContent])

  // Clear draft on successful submission
  useEffect(() => {
    if (journalSubmitted) {
      const storageKey = `journal_draft_${session._key}`
      localStorage.removeItem(storageKey)
    }
  }, [journalSubmitted, session._key])

  const submitJournal = async (action: 'save' | 'send') => {
    if (!journalContent.trim()) return

    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: existing } = await supabase
        .from('journal_submissions')
        .select('*')
        .eq('student_id', user.id)
        .eq('session_id', session._key)
        .single()

      if (existing) {
        // Update existing journal
        await supabase.from('journal_submissions').update({
          content: journalContent,
          sent_to_mentor: action === 'send' && journalType === 'mentor',
          posted_to_group: action === 'send' && journalType === 'group',
          updated_at: new Date().toISOString()
        }).eq('id', existing.id)
      } else {
        // Insert new journal
        await supabase.from('journal_submissions').insert({
          student_id: user.id,
          session_id: session._key,
          cohort_id: cohortId,
          journal_type: journalType,
          content: journalContent,
          sent_to_mentor: action === 'send' && journalType === 'mentor',
          posted_to_group: action === 'send' && journalType === 'group',
          is_private: journalType === 'private'
        })
      }

      // Mark session as complete
      await supabase.from('session_completions').insert({
        student_id: user.id,
        session_id: session._key,
        cohort_id: cohortId
      })

      setJournalSubmitted(true)

      // Notify parent component
      if (onSessionComplete) {
        onSessionComplete(session._key)
      }

      // Show next session invitation
      setShowNextSessionInvite(true)

      router.refresh()
    } catch (error) {
      console.error('Error submitting journal:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleNextSession = () => {
    if (nextSession) {
      onSwitch({ ...nextSession, pillar: session.pillar, module: nextSession.module || session.module, day: nextSession.day || session.day })
      setShowNextSessionInvite(false)
    } else {
      onClose()
    }
  }

  // Scroll detection for journal prompt
  useEffect(() => {
    const handleScroll = () => {
      if (!contentRef.current) return
      const { scrollTop, scrollHeight, clientHeight } = contentRef.current
      const scrollPercentage = (scrollTop + clientHeight) / scrollHeight
      // Show journal prompt when user has scrolled to 90% of content
      if (scrollPercentage >= 0.9) {
        setHasScrolledToBottom(true)
      }
    }

    const scrollContainer = contentRef.current
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll)
      return () => scrollContainer.removeEventListener('scroll', handleScroll)
    }
  }, [])

  const renderArticleBody = (body: any) => {
    if (!body) return null
    if (typeof body === 'string') {
      // Check if it's HTML (contains tags)
      if (body.includes('<')) {
        return <div className="prose prose-sm prose-emerald max-w-none" dangerouslySetInnerHTML={{ __html: body }} />
      }
      return <p className="whitespace-pre-wrap mb-4">{body}</p>
    }
    if (Array.isArray(body)) {
      return body.map((block: any, idx: number) => {
        if (block._type === 'block') {
          const text = block.children?.map((c: any) => c.text).join('')
          return <p key={idx} className="whitespace-pre-wrap mb-4 last:mb-0">{text}</p>
        }
        return null
      })
    }
    return null
  }

  const markComplete = async () => {
    console.log('markComplete called')
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        console.log('No user found')
        setLoading(false)
        return
      }

      console.log('User found:', user.id)
      console.log('Session key:', session._key)
      console.log('Cohort ID:', cohortId)

      // Check if already completed
      const { data: existing, error: checkError } = await supabase
        .from('session_completions')
        .select('*')
        .eq('student_id', user.id)
        .eq('session_id', session._key)
        .single()

      if (checkError) {
        console.log('Check error (expected if not completed):', checkError)
      }

      if (existing) {
        console.log('Session already completed:', existing)
        // Even if already completed, still allow navigation to next session
        if (onSessionComplete) {
          console.log('Calling onSessionComplete callback for existing completion')
          onSessionComplete(session._key)
        }
      } else {
        console.log('Marking session as complete...')

        // Mark as complete
        const { data: insertData, error: insertError } = await supabase.from('session_completions').insert({
          student_id: user.id,
          session_id: session._key,
          cohort_id: cohortId
        }).select()

        if (insertError) {
          console.error('Error inserting completion:', insertError)
          console.error('Error details:', JSON.stringify(insertError, null, 2))
          setLoading(false)
          return
        }

        console.log('Insert successful:', insertData)

        // Notify parent component
        if (onSessionComplete) {
          console.log('Calling onSessionComplete callback')
          onSessionComplete(session._key)
        }
      }

      // Auto-switch to next session if available
      if (nextSession) {
        console.log('Switching to next session:', nextSession._key)
        setTimeout(() => {
          onSwitch({ ...nextSession, pillar: session.pillar, module: nextSession.module || session.module, day: nextSession.day || session.day })
        }, 500)
      } else {
        console.log('No next session, closing player')
        setTimeout(() => {
          onClose()
        }, 500)
      }

      // Refresh the page to show updated state
      console.log('Refreshing page')
      router.refresh()
    } catch (error) {
      console.error('Error marking session as complete:', error)
    } finally {
      setLoading(false)
    }
  }

  const hasMultimedia = session.contentBlocks?.some((b: any) => ['videoBlock', 'imageBlock', 'audioBlock'].includes(b._type))

  return (
    <div className="fixed inset-0 z-[110] bg-gray-900/90 backdrop-blur-xl flex flex-col overflow-hidden">
        {/* Video / Primary Content - Full Screen on Mobile */}
        {hasMultimedia && (
            <div className="w-full flex-1 bg-black flex flex-col items-center justify-center relative overflow-hidden aspect-video sm:aspect-auto">
                <button onClick={onClose} className="absolute top-4 left-4 z-50 p-2.5 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors border border-white/10 shadow-lg">
                    <X className="w-5 h-5" />
                </button>

                <div className="w-full h-full max-w-6xl mx-auto flex items-center justify-center bg-black rounded-lg overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)]">
                    {(() => {
                        const videoBlock = session.contentBlocks?.find((b: any) => b._type === 'videoBlock');
                        const imageBlock = session.contentBlocks?.find((b: any) => b._type === 'imageBlock');
                        const audioBlock = session.contentBlocks?.find((b: any) => b._type === 'audioBlock');

                        if (videoBlock) {
                            if (videoBlock.videoType === 'youtube') {
                                const srcMatch = videoBlock.youtubeEmbed?.match(/src=["']([^"']+)["']/)
                                let src = srcMatch ? srcMatch[1] : videoBlock.url ? getYouTubeEmbed(videoBlock.url) : ''

                                // rel=0 ensures that when the video finishes, suggestions are limited to the same channel
                                // modestbranding=1 removes the YouTube logo from the control bar
                                // iv_load_policy=3 hides video annotations
                                const params = "rel=0&modestbranding=1&iv_load_policy=3&showinfo=0"
                                src = src.includes('?') ? `${src}&${params}` : `${src}?${params}`

                                if (videoBlock.youtubeEmbed?.includes('youtube-nocookie.com') && !src.includes('youtube-nocookie.com')) {
                                    src = src.replace('youtube.com', 'youtube-nocookie.com')
                                }
                                return (
                                    <div key={videoBlock._key} className="w-full h-full relative">
                                        <iframe
                                            src={src}
                                            className="absolute inset-0 w-full h-full border-none"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                            allowFullScreen
                                        />
                                    </div>
                                )
                            } else {
                                return (
                                    <div key={videoBlock._key} className="w-full h-full flex items-center justify-center bg-black">
                                        <video src={videoBlock.videoUrl} controls className="w-full h-full object-contain" />
                                    </div>
                                )
                            }
                        }

                        if (imageBlock) {
                            return (
                                <div key={imageBlock._key} className="w-full h-full flex items-center justify-center bg-zinc-900 p-4">
                                    <img
                                        src={imageBlock.imageUrl || '/placeholder.png'}
                                        className="max-w-full max-h-full object-contain shadow-2xl rounded-lg"
                                        alt={session.title}
                                    />
                                </div>
                            )
                        }

                        if (audioBlock) {
                            return (
                                <div key={audioBlock._key} className="flex flex-col items-center justify-center h-full w-full bg-zinc-900 text-center p-12">
                                    <div className="w-32 h-32 md:w-48 md:h-48 rounded-full bg-teal-500/10 flex items-center justify-center mb-8 border border-teal-500/20 animate-pulse">
                                        <Headphones className="w-16 h-16 md:w-24 md:h-24 text-teal-500" />
                                    </div>
                                    <h3 className="text-xl md:text-2xl font-black text-white uppercase tracking-[0.3em] mb-6">Audio Insight</h3>
                                    <audio src={audioBlock.audioUrl} controls className="w-full max-w-md h-12" />
                                </div>
                            )
                        }

                        return null;
                    })()}
                </div>
            </div>
        )}

        {/* Details & Actions - Below video on mobile, side on desktop */}
        <div className={cn(
            "bg-white flex flex-col shadow-2xl relative overflow-hidden transition-all",
            hasMultimedia ? "w-full max-h-[50vh] sm:max-h-none sm:w-[450px] sm:flex-1" : "w-full max-w-4xl mx-auto h-full sm:h-[90vh] my-auto sm:rounded-[3rem]"
        )}>
            <div className="absolute top-4 right-4 z-50 flex items-center gap-2">
                <div className="flex bg-gray-100/80 backdrop-blur rounded-lg p-1 border border-gray-200/50 shadow-sm">
                    <button
                        disabled={!prevSession}
                        onClick={() => prevSession && onSwitch(prevSession)}
                        className="p-1.5 hover:bg-white rounded-md disabled:opacity-20 transition-all"
                    >
                        <ChevronLeft className="w-4 h-4 text-gray-600" />
                    </button>
                    <button
                        disabled={!nextSession || (!isCompleted && !allSessions.find(s => s._key === nextSession._key)?.isCompleted)}
                        onClick={() => nextSession && onSwitch(nextSession)}
                        className="p-1.5 hover:bg-white rounded-md disabled:opacity-20 transition-all"
                    >
                        <ChevronRight className="w-4 h-4 text-gray-600" />
                    </button>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                    <X className="w-6 h-6 text-gray-400" />
                </button>
            </div>

            <div ref={contentRef} className="flex-1 overflow-y-auto p-4 sm:p-6 pt-16 custom-scrollbar">
                <div className="space-y-6">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-2 py-0.5 rounded-md">Week {session.module.weekNumber} · Day {session.dayNumber}</span>
                        </div>
                        <h1 className="text-lg sm:text-xl md:text-2xl font-black text-gray-900 leading-tight tracking-tight uppercase">{session.title}</h1>
                        <p className="text-[10px] sm:text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Pillar {session.pillar.number}: {session.pillar.name}</p>
                    </div>

                    {/* Content Blocks (Non-Video) */}
                    <div className="space-y-4">
                        {(() => {
                            const videoBlock = session.contentBlocks?.find((b: any) => b._type === 'videoBlock');
                            const imageBlock = session.contentBlocks?.find((b: any) => b._type === 'imageBlock');
                            const audioBlock = session.contentBlocks?.find((b: any) => b._type === 'audioBlock');

                            // We hide the "Primary" block from the right if it's already shown on the left
                            const primaryKey = videoBlock?._key || imageBlock?._key || audioBlock?._key;

                            return session.contentBlocks?.filter((b: any) => b._key !== primaryKey).map((block: any) => (
                                <div key={block._key} className="space-y-4">
                                    {block._type === 'textBlock' && (
                                        <div className="prose prose-sm prose-emerald text-gray-600 font-medium leading-relaxed italic border-l-4 border-teal-500 pl-4 sm:pl-6 py-2">
                                            {renderArticleBody(block.body)}
                                        </div>
                                    )}
                                    {block._type === 'imageBlock' && (
                                        <div className="rounded-[1.5rem] overflow-hidden border border-gray-100 shadow-sm">
                                            <img src={block.imageUrl || '/placeholder.png'} className="w-full object-cover" alt={block.title || 'Session image'} />
                                            {block.caption && <p className="p-3 text-[10px] text-gray-400 font-bold text-center italic">{block.caption}</p>}
                                        </div>
                                    )}
                                    {block._type === 'audioBlock' && (
                                        <div className="p-3 sm:p-4 bg-teal-50 rounded-xl sm:rounded-2xl border border-teal-100 space-y-2">
                                            <div className="flex items-center gap-2 text-teal-800 font-black text-[10px] uppercase tracking-widest">
                                                <Headphones className="w-3.5 h-3.5" /> Audio Insight
                                            </div>
                                            <audio src={block.audioUrl} controls className="w-full h-8" />
                                        </div>
                                    )}
                                    {block._type === 'fileBlock' && (
                                        <a href={block.fileUrl || block.externalUrl || '#'} target="_blank" className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-xl sm:rounded-2xl border border-gray-100 group hover:border-emerald-500 transition-all shadow-sm">
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
                            ));
                        })()}
                    </div>

                    {/* Subsessions (Daily Takes) */}
                    {session.subsessions?.length > 0 && (
                        <div className="space-y-4">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Daily Takes</p>
                            <div className="space-y-3">
                                {session.subsessions.map((sub: any) => (
                                    <div key={sub._key} className="p-5 bg-white border border-gray-100 rounded-2xl space-y-2">
                                        <h4 className="text-sm font-bold text-gray-900">{sub.title}</h4>
                                        <div className="text-xs text-gray-500 leading-relaxed">
                                            {/* Subsession content placeholder */}
                                            <p>Additional guided formation content for this take.</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Timer and Scroll Indicator */}
                    {session.journalPrompt && (
                        <div className="text-center py-4 space-y-2">
                            {!timeMet && (
                                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 space-y-1">
                                    <p className="text-[10px] font-bold text-amber-800 uppercase tracking-widest">
                                        Minimum reading time required
                                    </p>
                                    <div className="flex items-center justify-center gap-2">
                                        <div className="w-32 h-2 bg-amber-200 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-amber-500 transition-all duration-1000"
                                                style={{ width: `${(elapsedTime / MINIMUM_READ_TIME) * 100}%` }}
                                            />
                                        </div>
                                        <span className="text-xs font-mono font-bold text-amber-700">
                                            {formatTime(remainingTime)} remaining
                                        </span>
                                    </div>
                                </div>
                            )}
                            {timeMet && !hasScrolledToBottom && (
                                <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">
                                    ✓ Time met · Scroll to bottom to reveal journal
                                </p>
                            )}
                            {!timeMet && !hasScrolledToBottom && (
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                                    Scroll to bottom after timer completes
                                </p>
                            )}
                        </div>
                    )}

                    {/* Journal Prompt - Only show when BOTH time met AND scrolled to bottom */}
                    {session.journalPrompt && journalUnlocked && !journalSubmitted && (
                        <div className="p-4 sm:p-6 bg-blue-50 rounded-xl sm:rounded-[2rem] border-2 border-blue-100 space-y-4 relative overflow-hidden animate-reveal">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <MessageSquare className="w-10 h-10 sm:w-12 sm:h-12 text-blue-900" />
                            </div>
                            <h4 className="text-[10px] font-black text-blue-900 uppercase tracking-widest flex items-center gap-2">
                                <Zap className="w-3 h-3 fill-blue-900" /> Daily Reflection
                            </h4>
                            <div className="text-sm text-blue-800 leading-relaxed font-medium italic mb-3">
                                {typeof session.journalPrompt === 'string' && session.journalPrompt.includes('<') ? (
                                    <div className="prose prose-sm prose-blue max-w-none" dangerouslySetInnerHTML={{ __html: session.journalPrompt }} />
                                ) : (
                                    <>"{session.journalPrompt}"</>
                                )}
                            </div>
                            <textarea
                                value={journalContent}
                                onChange={(e) => setJournalContent(e.target.value)}
                                placeholder="Write your reflection here..."
                                className="w-full p-4 rounded-xl border-2 border-blue-200 bg-white text-sm text-gray-700 focus:outline-none focus:border-blue-400 resize-none"
                                rows={4}
                            />
                            <div className="flex items-center gap-2">
                                {journalType === 'private' && (
                                    <button
                                        onClick={() => submitJournal('save')}
                                        disabled={loading || !journalContent.trim()}
                                        className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {loading ? 'Saving...' : 'Save Journal'}
                                    </button>
                                )}
                                {journalType === 'mentor' && (
                                    <button
                                        onClick={() => submitJournal('send')}
                                        disabled={loading || !journalContent.trim()}
                                        className="flex-1 bg-emerald-600 text-white py-3 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {loading ? 'Sending...' : 'Send to Mentor'}
                                    </button>
                                )}
                                {journalType === 'group' && (
                                    <button
                                        onClick={() => submitJournal('send')}
                                        disabled={loading || !journalContent.trim()}
                                        className="flex-1 bg-purple-600 text-white py-3 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {loading ? 'Posting...' : 'Post to Group'}
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Journal submitted confirmation */}
                    {journalSubmitted && (
                        <div className="p-4 sm:p-6 bg-emerald-50 rounded-xl sm:rounded-[2rem] border-2 border-emerald-100 space-y-3 text-center animate-reveal">
                            <CheckCircle className="w-8 h-8 text-emerald-600 mx-auto" />
                            <h4 className="text-sm font-bold text-emerald-900 uppercase tracking-widest">
                                Journal {journalType === 'private' ? 'Saved' : journalType === 'mentor' ? 'Sent to Mentor' : 'Posted to Group'}
                            </h4>
                            <p className="text-xs text-emerald-700">
                                Session marked as complete
                            </p>
                        </div>
                    )}

            <div className="p-4 sm:p-6 sm:p-8 border-t border-gray-100 bg-gray-50/50">
                {!journalSubmitted ? (
                    <div className="text-center">
                        {session.journalPrompt ? (
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">
                                Complete the journal above to finish this session
                            </p>
                        ) : (
                            <button
                                onClick={markComplete}
                                disabled={loading || !timeMet}
                                className="w-full bg-emerald-700 text-white py-4 sm:py-5 rounded-xl sm:rounded-[1.5rem] font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-emerald-800 transition-all shadow-2xl shadow-emerald-700/40 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                            >
                                {loading ? 'Processing...' : timeMet ? 'Mark Session as Complete' : `${formatTime(remainingTime)} remaining`}
                            </button>
                        )}
                    </div>
                ) : (
                    <button
                        onClick={handleNextSession}
                        className="w-full bg-emerald-700 text-white py-4 sm:py-5 rounded-xl sm:rounded-[1.5rem] font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-emerald-800 transition-all shadow-2xl shadow-emerald-700/40 active:scale-95 text-sm sm:text-base"
                    >
                        {nextSession ? (
                            <>
                                Continue to Next Session <ChevronRight className="w-5 h-5" />
                            </>
                        ) : (
                            <>
                                Return to Curriculum <X className="w-5 h-5" />
                            </>
                        )}
                    </button>
                )}
                <p className="text-[9px] sm:text-[10px] text-gray-400 font-bold uppercase tracking-widest text-center mt-3 sm:mt-4">
                    {nextSession ? `Next: ${nextSession.title}` : 'End of current path'}
                </p>
            </div>

            {/* Next Session Invitation Modal */}
            {showNextSessionInvite && (
                <div className="fixed inset-0 z-[200] bg-gray-900/80 backdrop-blur-sm flex items-center justify-center p-4 animate-reveal">
                    <div className="bg-white rounded-2xl sm:rounded-[2rem] p-6 sm:p-8 max-w-md w-full space-y-6 shadow-2xl">
                        <div className="text-center space-y-4">
                            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
                                <CheckCircle className="w-8 h-8 text-emerald-600" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">
                                    Session Complete!
                                </h3>
                                <p className="text-sm text-gray-500 mt-2">
                                    {journalType === 'private' ? 'Your journal has been saved.' : journalType === 'mentor' ? 'Your journal has been sent to your mentor.' : 'Your journal has been posted to the group.'}
                                </p>
                            </div>
                        </div>
                        <div className="space-y-3">
                            {nextSession && (
                                <button
                                    onClick={handleNextSession}
                                    className="w-full bg-emerald-700 text-white py-4 rounded-xl font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-emerald-800 transition-all shadow-lg shadow-emerald-700/30 active:scale-95"
                                >
                                    Continue to Next Session <ChevronRight className="w-5 h-5" />
                                </button>
                            )}
                            <button
                                onClick={() => {
                                    setShowNextSessionInvite(false)
                                    onClose()
                                }}
                                className="w-full bg-gray-100 text-gray-700 py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-gray-200 transition-all active:scale-95"
                            >
                                Return to Curriculum
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    </div>
  )
}
