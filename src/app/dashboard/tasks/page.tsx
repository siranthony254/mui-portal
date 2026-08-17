import { redirect } from 'next/navigation'
export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase/server'
import { TaskList } from '@/components/cohort/TaskList'
import { Metadata } from 'next'
export const metadata: Metadata = { title: 'Weekly Tasks' }

export default async function TasksPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: enrollment } = await supabase.from('enrollments').select('*,cohort:cohorts(current_week)').eq('student_id',user.id).in('status',['enrolled','active']).single()
  if (!enrollment) redirect('/dashboard')

  const { data: tasks } = await supabase.from('tasks').select('*').eq('enrollment_id',enrollment.id).order('week_number',{ascending:true})
  const currentWeek = enrollment.cohort?.current_week || 1

  return (
    <div className="max-w-2xl mx-auto">
      <div className="page-header">
        <h1 className="page-title">Weekly Tasks</h1>
        <span className="badge badge-teal">Week {currentWeek} active</span>
      </div>

      <TaskList tasks={tasks || []} currentWeek={currentWeek} />
    </div>
  )
}
