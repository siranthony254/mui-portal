import { redirect } from 'next/navigation'
export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase/server'
import { getCohortCurriculum } from '@/lib/sanity/queries'
import { ContentCard } from '@/components/content/ContentCard'
import { PILLARS } from '@/types'
import { ArrowRight, BookOpen } from '@/components/icons'
import Link from 'next/link'
import { Metadata } from 'next'

export const metadata: Metadata = { title: 'Pillar Content' }

export default async function PillarContentPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: enrollment } = await supabase.from('enrollments')
    .select('*, cohort:cohorts(*)')
    .eq('student_id', user.id)
    .in('status', ['enrolled', 'active'])
    .single()

  if (!enrollment) redirect('/dashboard')

  const weekNum = enrollment.current_week
  const pillarNum = enrollment.current_pillar
  const activePillars = (enrollment.cohort as any)?.pillars_config || PILLARS
  const pillar = activePillars[pillarNum - 1] || activePillars[0]

  const curriculum = await getCohortCurriculum(enrollment.cohort_id)

  // Extract content from curriculum hierarchy for the current week: Pillar -> Module (Week) -> Day -> Sessions
  const sanityPillar = curriculum?.pillars?.find((p: any) => p.number === pillarNum)
  const sanityModule = sanityPillar?.modules?.find((m: any) => m.weekNumber === weekNum)
  const days = sanityModule?.days || []

  // Flatten all sessions from all days, sorted by day then session number
  const allSessions = days.flatMap((day: any) =>
    (day.sessions || []).map((session: any) => ({
      ...session,
      dayNumber: day.dayNumber,
      dayTitle: day.title
    }))
  ).sort((a: any, b: any) => {
    if (a.dayNumber !== b.dayNumber) return a.dayNumber - b.dayNumber
    return a.sessionNumber - b.sessionNumber
  })

  // Get completed sessions for this student
  const { data: completedSessions } = await supabase.from('session_homework_completions')
    .select('session_id')
    .eq('student_id', user.id)

  const completedSessionIds = new Set(completedSessions?.map(c => c.session_id) || [])

  // Determine which sessions are unlocked based on sequential completion
  let unlockedCount = 0
  const sessionsWithStatus = allSessions.map((session: any) => {
    const isCompleted = completedSessionIds.has(session._id)
    const isUnlocked = unlockedCount === 0 || completedSessionIds.size >= unlockedCount
    if (isCompleted) unlockedCount++
    return {
      ...session,
      isCompleted,
      isUnlocked
    }
  })

  // Transform curriculum sessions into ContentBlock format for ContentCard
  const content = sessionsWithStatus.flatMap((s: any) =>
    (s.contentBlocks || []).map((cb: any) => ({
        ...cb,
        weekNumber: weekNum,
        pillarNumber: pillarNum,
        contentType: cb._type === 'videoBlock' ? 'video' : cb._type === 'textBlock' ? 'article' : 'pdf',
        dayNumber: s.dayNumber,
        sessionNumber: s.sessionNumber,
        isUnlocked: s.isUnlocked,
        isCompleted: s.isCompleted,
        sessionId: s._id
    }))
  )

  const { data: tasks } = await supabase.from('tasks')
    .select('id, status')
    .eq('enrollment_id', enrollment.id)
    .eq('week_number', weekNum)
    .limit(1)

  const activeTask = tasks?.[0]

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12 px-4">
      <div className="page-header">
        <div>
          <h1 className="page-title uppercase tracking-tighter text-lg sm:text-xl">Pillar {pillarNum}: {pillar?.name}</h1>
          <p className="text-sm text-gray-500 mt-1">Week {weekNum} of 12 — Formation Content</p>
        </div>
      </div>

      {content.length > 0 ? (
        <div className="space-y-8">
          {content.map((block: any, idx: number) => (
            <div key={idx} className="space-y-4">
               <ContentCard
                 content={block}
                 isUnlocked={block.isUnlocked}
                 isCompleted={block.isCompleted}
                 dayNumber={block.dayNumber}
                 sessionNumber={block.sessionNumber}
               />
            </div>
          ))}
        </div>
      ) : (
        <div className="card p-12 text-center">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8 text-gray-300" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">Content not yet available</h3>
          <p className="text-sm text-gray-500 max-w-xs mx-auto">Formation material for this week will be uploaded by the MUI team shortly.</p>
        </div>
      )}

      {activeTask && (
        <div className="mt-12 pt-8 border-t border-gray-100">
          <div className="bg-teal-50 rounded-2xl p-4 sm:p-6 flex flex-col items-center justify-center gap-4 text-center">
            <div>
              <h3 className="font-semibold text-teal-900">Finished the reading?</h3>
              <p className="text-sm text-teal-700 mt-1">Move to this week's formation task to capture your reflections.</p>
            </div>
            <Link
              href={`/dashboard/tasks/${activeTask.id}`}
              className="btn-primary w-full sm:w-auto justify-center whitespace-nowrap flex items-center gap-2"
            >
              Go to Task <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
