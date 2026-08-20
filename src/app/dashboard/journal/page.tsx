import { redirect } from 'next/navigation'
export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase/server'
import { JournalClient } from '@/components/cohort/JournalClient'
import { Metadata } from 'next'
import { getVoiceJournals } from '@/lib/actions/sanity'

export const metadata: Metadata = { title: 'My Journal' }

export default async function JournalPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: enrollment } = await supabase.from('enrollments')
    .select('current_week, current_pillar')
    .eq('student_id', user.id)
    .in('status', ['enrolled', 'active', 'completed'])
    .single()

  if (!enrollment) redirect('/dashboard')

  const { data: entries } = await supabase.from('journals')
    .select('*')
    .eq('student_id', user.id)
    .order('week_number', { ascending: true })

  const voiceJournals = await getVoiceJournals(user.id)

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title">Personal Journal</h1>
        <p className="text-sm text-gray-500">A private space for your ongoing formation and reflections.</p>
      </div>

      <JournalClient
        initialEntries={entries || []}
        initialVoiceEntries={voiceJournals || []}
        currentWeek={enrollment.current_week}
        currentPillar={enrollment.current_pillar}
        studentId={user.id}
      />
    </div>
  )
  )
}
