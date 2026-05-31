import { createClient } from '@/lib/supabase/server'
export const dynamic = 'force-dynamic'
import { redirect } from 'next/navigation'
import { ApplyForm } from '@/components/cohort/ApplyForm'
import { Metadata } from 'next'
export const metadata: Metadata = { title: 'Apply for Cohort' }

export default async function ApplyPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: existing } = await supabase.from('enrollments').select('id').eq('student_id',user.id).in('status',['enrolled','active']).single()
  if (existing) redirect('/dashboard')

  const { data: cohorts } = await supabase.from('cohorts').select('id,name,semester,year,max_participants').eq('applications_open',true).order('created_at',{ascending:false})

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="page-title mb-2">Apply for a cohort</h1>
      <p className="text-sm text-gray-500 mb-6">Applications are reviewed by the MUI team. You may be placed on a waitlist.</p>
      {cohorts?.length ? <ApplyForm cohorts={cohorts} userId={user.id} /> : (
        <div className="card p-8 text-center">
          <p className="text-sm font-medium text-gray-700 mb-2">No cohorts open right now</p>
          <p className="text-sm text-gray-400">Check back soon or follow MUI on social media for announcements about the next cohort.</p>
          <a href="https://micdupinitiative.site" target="_blank" rel="noopener noreferrer" className="btn-secondary mt-4 inline-flex">Visit MUI website</a>
        </div>
      )}
    </div>
  )
}
