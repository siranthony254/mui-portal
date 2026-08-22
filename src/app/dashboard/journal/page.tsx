import { redirect } from 'next/navigation'
export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase/server'
import { JournalClient } from '@/components/cohort/JournalClient'
import { Metadata } from 'next'
import { getCohortCurriculum } from '@/lib/sanity/queries'

export const metadata: Metadata = { title: 'My Journal' }

export default async function JournalPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: enrollment } = await supabase.from('enrollments')
    .select('*, cohort:cohorts(*)')
    .eq('student_id', user.id)
    .in('status', ['enrolled', 'active', 'completed'])
    .single()

  if (!enrollment) redirect('/dashboard')

  // Fetch journal submissions from the new table
  const { data: journalSubmissions } = await supabase.from('journal_submissions')
    .select('*')
    .eq('student_id', user.id)
    .eq('cohort_id', enrollment.cohort_id)
    .order('submitted_at', { ascending: true })

  // Fetch curriculum to get all sessions
  const curriculum = await getCohortCurriculum(enrollment.cohort_id)

  // Extract all sessions from curriculum
  const allSessions: any[] = []
  curriculum?.pillars?.forEach((p: any) => {
    p.modules?.forEach((m: any) => {
      m.days?.forEach((d: any) => {
        d.sessions?.forEach((s: any) => {
          allSessions.push({
            ...s,
            pillar: p,
            module: m,
            day: d
          })
        })
      })
    })
  })

  // Map journal submissions to sessions
  const sessionJournals = allSessions.map(session => {
    const submission = journalSubmissions?.find(j => j.session_id === session._key)
    return {
      sessionKey: session._key,
      sessionTitle: session.title,
      sessionNumber: session.sessionNumber,
      dayNumber: session.dayNumber,
      weekNumber: session.module.weekNumber,
      pillarNumber: session.pillar.number,
      journalType: session.journalType || 'private',
      hasJournal: !!submission,
      journalContent: submission?.content || '',
      submittedAt: submission?.submitted_at,
      journalId: submission?.id
    }
  })

  return (
    <div className="space-y-6 px-4">
      <div className="page-header">
        <h1 className="page-title text-lg sm:text-xl">Session Journals</h1>
        <p className="text-sm text-gray-500">Your journal reflections from cohort sessions.</p>
      </div>

      <JournalClient
        sessionJournals={sessionJournals}
        currentWeek={enrollment.current_week}
        currentPillar={enrollment.current_pillar}
        studentId={user.id}
        cohortId={enrollment.cohort_id}
      />
    </div>
  )
}
