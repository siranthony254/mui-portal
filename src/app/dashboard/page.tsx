import { redirect } from 'next/navigation'
export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase/server'
import { WaitlistScreen } from '@/components/cohort/WaitlistScreen'
import { StudentDashboard } from '@/components/cohort/StudentDashboard'
import { Metadata } from 'next'
export const metadata: Metadata = { title: 'Dashboard' }

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  const { data: enrollment } = await supabase.from('enrollments').select('*,cohort:cohorts(*),mentor:profiles!mentor_id(id,full_name,bio)').eq('student_id', user.id).in('status',['enrolled','active']).order('enrolled_at',{ascending:false}).limit(1).single()
  const { data: waitlistEntry } = await supabase.from('waitlist').select('*,cohort:cohorts(name,semester,year)').eq('student_id', user.id).eq('status','waiting').order('applied_at',{ascending:false}).limit(1).single()

  const { data: tasks } = enrollment
    ? await supabase.from('tasks').select('*').eq('enrollment_id', enrollment.id).eq('week_number', enrollment.cohort?.current_week || 1).order('pillar_number',{ascending:true})
    : { data: [] }

  if (enrollment) return <StudentDashboard enrollment={enrollment} tasks={tasks||[]} profile={profile!} />
  if (waitlistEntry) return <WaitlistScreen waitlistEntry={waitlistEntry} />

  return (
    <div className="max-w-lg mx-auto text-center py-16">
      <div className="w-16 h-16 bg-teal-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <div className="w-7 h-7 rounded-full bg-teal-700" />
      </div>
      <h1 className="text-xl font-semibold text-gray-900 mb-2">Welcome to MUI Portal</h1>
      <p className="text-sm text-gray-500 mb-6">You are not yet enrolled in a cohort. Apply for the next one to begin your formation journey.</p>
      <a href="/dashboard/apply" className="btn-primary">Apply for next cohort</a>
    </div>
  )
}
