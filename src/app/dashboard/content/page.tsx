import { redirect } from 'next/navigation'
export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase/server'
import { getCohortCurriculum } from '@/lib/sanity/queries'
import { CohortCurriculumHub } from '@/components/cohort/hub/CohortCurriculumHub'
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

  // Fetch sequential progress from Supabase
  const { data: completionsData } = await supabase.from('session_completions')
    .select('session_id')
    .eq('student_id', user.id)
    .eq('cohort_id', enrollment.cohort_id)

  const completions = completionsData?.map(c => c.session_id) || []

  // Fetch the hierarchical curriculum from Sanity
  const curriculum = await getCohortCurriculum(enrollment.cohort_id)

  return (
    <div className="max-w-6xl mx-auto">
      <CohortCurriculumHub
        curriculum={curriculum}
        completions={completions}
        enrollment={enrollment}
      />
    </div>
  )
}
