import { redirect } from 'next/navigation'
export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { CheckCircle, Circle, Clock, ChevronRight } from '@/components/icons'
import { PILLARS } from '@/types'
import { getPillarColor } from '@/types'
import { cn } from '@/lib/utils'
import { Metadata } from 'next'
export const metadata: Metadata = { title: 'Weekly Tasks' }

export default async function TasksPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: enrollment } = await supabase.from('enrollments').select('*,cohort:cohorts(current_week)').eq('student_id',user.id).in('status',['enrolled','active']).single()
  if (!enrollment) redirect('/dashboard')

  const { data: tasks } = await supabase.from('tasks').select('*').eq('enrollment_id',enrollment.id).order('week_number',{ascending:true})
  const grouped = (tasks||[]).reduce<Record<number,any[]>>((acc,t) => { if(!acc[t.week_number]) acc[t.week_number]=[]; acc[t.week_number]!.push(t); return acc }, {})
  const currentWeek = enrollment.cohort?.current_week || 1

  return (
    <div className="max-w-2xl mx-auto">
      <div className="page-header">
        <h1 className="page-title">Weekly Tasks</h1>
        <span className="badge badge-teal">Week {currentWeek} active</span>
      </div>
      <div className="space-y-6">
        {Array.from({length:12},(_,i)=>i+1).map(week => {
          const weekTasks = grouped[week] || []
          const isCurrentWeek = week === currentWeek
          const isFuture = week > currentWeek
          const pillarNum = Math.min(Math.ceil(week/2.4),5)
          const pillar = PILLARS[pillarNum-1]
          return (
            <div key={week} className={cn('card overflow-hidden', isFuture && 'opacity-50')}>
              <div className={cn('px-5 py-3 flex items-center justify-between border-b border-gray-50', isCurrentWeek?'bg-teal-50':'bg-gray-50')}>
                <div className="flex items-center gap-2">
                  <span className={cn('text-sm font-semibold', isCurrentWeek?'text-teal-700':'text-gray-500')}>Week {week}</span>
                  {isCurrentWeek && <span className="badge badge-teal text-xs">Current</span>}
                  {isFuture && <span className="badge badge-gray text-xs">Locked</span>}
                </div>
                {pillar && <span className={cn('badge text-xs', getPillarColor(pillarNum))}>P{pillarNum}: {pillar.name}</span>}
              </div>
              <div className="divide-y divide-gray-50">
                {weekTasks.length === 0 ? (
                  <div className="px-5 py-4 text-sm text-gray-400">{isFuture ? 'Unlocks when you reach this week.' : 'No tasks yet.'}</div>
                ) : weekTasks.map(task => (
                  <Link key={task.id} href={`/dashboard/tasks/${task.id}`}
                    className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 transition-colors group">
                    <div className="flex-shrink-0">
                      {task.status==='approved' ? <CheckCircle className="w-4 h-4 text-teal-600" />
                        : task.status==='submitted'||task.status==='reviewed' ? <Clock className="w-4 h-4 text-amber-500" />
                        : <Circle className="w-4 h-4 text-gray-300" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 group-hover:text-teal-700">{task.title}</p>
                      {task.mentor_feedback && <p className="text-xs text-teal-600 mt-0.5">Feedback received</p>}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={cn('badge text-xs',{'badge-teal':task.status==='approved','badge-amber':task.status==='submitted','badge-blue':task.status==='reviewed','badge-gray':task.status==='pending'})}>{task.status}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
