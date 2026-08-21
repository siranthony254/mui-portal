import { createClient } from '@/lib/supabase/server'
export const dynamic = 'force-dynamic'
import { redirect } from 'next/navigation'
import { CohortCard } from '@/components/cohort/CohortCard'
import { CreateCohortForm } from '@/components/cohort/CreateCohortForm'
import { Metadata } from 'next'
export const metadata: Metadata = { title: 'Cohorts' }

export default async function CohortsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: cohorts } = await supabase.from('cohorts').select('*').order('created_at', { ascending: false })
  const { data: enrollmentCounts } = await supabase.from('enrollments').select('cohort_id').in('status', ['enrolled','active'])
  const countMap = (enrollmentCounts||[]).reduce<Record<string,number>>((acc,e) => { acc[e.cohort_id]=(acc[e.cohort_id]||0)+1; return acc }, {})

  return (
    <div className="max-w-4xl mx-auto space-y-6 px-4">
      <div className="page-header"><h1 className="page-title text-lg sm:text-xl">Cohorts</h1></div>
      <div className="card p-4 sm:p-5">
        <p className="section-title text-sm">Create new cohort</p>
        <CreateCohortForm />
      </div>
      <div className="space-y-4">
        <p className="section-title text-sm">All cohorts ({cohorts?.length||0})</p>
        {cohorts?.length === 0 ? (
          <div className="card p-8 text-center"><p className="text-sm text-gray-400">No cohorts yet. Create one above.</p></div>
        ) : cohorts?.map(cohort => (
          <CohortCard key={cohort.id} cohort={cohort} enrolledCount={countMap[cohort.id]||0} />
        ))}
      </div>
    </div>
  )
}
