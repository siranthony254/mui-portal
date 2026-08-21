import { createClient } from '@/lib/supabase/server'
export const dynamic = 'force-dynamic'
import { redirect } from 'next/navigation'
import { getCohortCurriculum } from '@/lib/sanity/queries'
import { BookOpen, ChevronLeft, ChevronRight, Calendar, Clock } from '@/components/icons'
import { ContentCard } from '@/components/content/ContentCard'
import { Metadata } from 'next'

export const metadata: Metadata = { title: 'Cohort Materials Review' }

export default async function MentorSessionsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  // Get mentor's enrollments to find their cohort
  const { data: enrollments } = await supabase.from('enrollments')
    .select('*, cohort:cohorts(*)')
    .eq('mentor_id', user.id)
    .in('status', ['enrolled', 'active'])
    .limit(1)
    .single()

  if (!enrollments || !enrollments.cohort) {
    return (
      <div className="max-w-4xl mx-auto space-y-8 pb-20 px-4">
        <div className="page-header">
          <div>
            <h1 className="page-title uppercase tracking-tighter text-lg sm:text-xl">Cohort Materials</h1>
          </div>
        </div>
        <div className="card p-12 text-center">
          <BookOpen className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <p className="text-gray-500">No cohort assigned. Please contact an administrator.</p>
        </div>
      </div>
    )
  }

  const cohort = enrollments.cohort as any
  const curriculum = await getCohortCurriculum(cohort.id)

  // Flatten all content from all pillars, weeks, days, and sessions
  const allContent = curriculum?.pillars?.flatMap((pillar: any) =>
    pillar.modules?.flatMap((module: any) =>
      module.days?.flatMap((day: any) =>
        day.sessions?.flatMap((session: any) =>
          (session.contentBlocks || []).map((block: any) => ({
            ...block,
            pillarNumber: pillar.number,
            pillarName: pillar.name,
            weekNumber: module.weekNumber,
            dayNumber: day.dayNumber,
            sessionNumber: session.sessionNumber,
            sessionId: session._id,
            journalPrompt: session.journalPrompt
          }))
        )
      )
    )
  ) || []

  // Sort by pillar, week, day, then session
  const sortedContent = allContent.sort((a: any, b: any) => {
    if (a.pillarNumber !== b.pillarNumber) return a.pillarNumber - b.pillarNumber
    if (a.weekNumber !== b.weekNumber) return a.weekNumber - b.weekNumber
    if (a.dayNumber !== b.dayNumber) return a.dayNumber - b.dayNumber
    return a.sessionNumber - b.sessionNumber
  })

  // Group by session for navigation
  const sessions = allContent.reduce((acc: any[], item: any) => {
    const key = `${item.pillarNumber}-${item.weekNumber}-${item.dayNumber}-${item.sessionNumber}`
    if (!acc.find(s => s.key === key)) {
      acc.push({
        key,
        pillarNumber: item.pillarNumber,
        pillarName: item.pillarName,
        weekNumber: item.weekNumber,
        dayNumber: item.dayNumber,
        sessionNumber: item.sessionNumber,
        sessionId: item.sessionId,
        journalPrompt: item.journalPrompt
      })
    }
    return acc
  }, [])

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20 px-4">
      <div className="page-header">
        <div>
          <h1 className="page-title uppercase tracking-tighter text-lg sm:text-xl">Cohort Materials Review</h1>
          <p className="text-sm text-gray-500 mt-1">{cohort.name} — {sessions.length} sessions</p>
        </div>
      </div>

      {sessions.length === 0 ? (
        <div className="card p-12 text-center">
          <BookOpen className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <p className="text-gray-500">No curriculum content available yet.</p>
        </div>
      ) : (
        <div className="space-y-12" id="sessions-container">
          {sessions.map((session: any, idx: number) => (
            <div key={session.key} id={`session-${idx}`} className="scroll-mt-24">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 sticky top-0 bg-gray-50 py-3 sm:py-4 px-4 z-10 border-b border-gray-200">
                <div className="flex-1 min-w-0">
                  <h2 className="text-base sm:text-lg font-bold text-gray-900 truncate">
                    Pillar {session.pillarNumber}: {session.pillarName}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Week {session.weekNumber} · Day {session.dayNumber} · Session {session.sessionNumber}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {idx > 0 && (
                    <a
                      href={`#session-${idx - 1}`}
                      className="p-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
                      title="Previous session"
                    >
                      <ChevronLeft className="w-5 h-5 text-gray-600" />
                    </a>
                  )}
                  {idx < sessions.length - 1 && (
                    <a
                      href={`#session-${idx + 1}`}
                      className="p-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
                      title="Next session"
                    >
                      <ChevronRight className="w-5 h-5 text-gray-600" />
                    </a>
                  )}
                </div>
              </div>

              {session.journalPrompt && (
                <div className="card bg-blue-50 border-blue-100 p-4 sm:p-6 mb-6">
                  <div className="flex items-start gap-3">
                    <BookOpen className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-bold text-blue-900 mb-2">Journal Prompt</h3>
                      <p className="text-sm text-blue-800 leading-relaxed">{session.journalPrompt}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-6">
                {sortedContent
                  .filter((item: any) => 
                    item.pillarNumber === session.pillarNumber &&
                    item.weekNumber === session.weekNumber &&
                    item.dayNumber === session.dayNumber &&
                    item.sessionNumber === session.sessionNumber
                  )
                  .map((block: any, blockIdx: number) => (
                    <ContentCard
                      key={blockIdx}
                      content={block}
                      isUnlocked={true}
                      isCompleted={false}
                      dayNumber={block.dayNumber}
                      sessionNumber={block.sessionNumber}
                    />
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quick Navigation */}
      {sessions.length > 1 && (
        <div className="fixed bottom-6 right-6 z-50 hidden sm:block">
          <div className="card p-4 shadow-2xl">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Quick Jump</p>
            <div className="flex flex-col gap-2 max-h-64 overflow-y-auto">
              {sessions.map((session: any, idx: number) => (
                <a
                  key={session.key}
                  href={`#session-${idx}`}
                  className="text-xs font-medium text-gray-600 hover:text-emerald-700 transition-colors"
                >
                  P{session.pillarNumber} W{session.weekNumber} D{session.dayNumber} S{session.sessionNumber}
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
