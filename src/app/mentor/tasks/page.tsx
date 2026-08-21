import { createClient } from '@/lib/supabase/server'
export const dynamic = 'force-dynamic'
import { getPillarColor } from '@/types'
import { redirect } from 'next/navigation'
import { TaskReviewClient } from '@/components/cohort/TaskReviewClient'
import { formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { Metadata } from 'next'
import { QueryParamSelect } from '@/components/admin/QueryParamSelect'
export const metadata: Metadata = { title: 'Task Reviews' }

export default async function MentorTasksPage({ searchParams }: { searchParams: Promise<{ student?: string }> }) {
  const { student: studentFilter } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: enrollments } = await supabase.from('enrollments').select('student_id,student:profiles!student_id(id,full_name)').eq('mentor_id',user.id).in('status',['enrolled','active'])
  const studentIds = enrollments?.map(e=>(e.student as any)?.id).filter(Boolean)||[]

  let q = supabase.from('tasks').select('*,student:profiles!student_id(id,full_name,institution,institution_type)').in('student_id',studentIds).in('status',['submitted','reviewed','approved']).order('submitted_at',{ascending:true})
  if (studentFilter) q = q.eq('student_id', studentFilter)
  const { data: tasks } = await q.limit(50)

  const pending = tasks?.filter(t=>t.status==='submitted')||[]
  const reviewed = tasks?.filter(t=>t.status==='reviewed'||t.status==='approved')||[]

  return (
    <div className="max-w-3xl mx-auto space-y-6 px-4">
      <div className="page-header">
        <h1 className="page-title text-lg sm:text-xl">Task Reviews</h1>
        {pending.length>0 && <span className="badge badge-amber">{pending.length} awaiting review</span>}
      </div>

      <div className="card p-4 flex flex-col sm:flex-row sm:items-center gap-3">
        <label className="text-sm text-gray-600">Student:</label>
        <QueryParamSelect name="student" defaultValue={studentFilter||''} className="select w-full sm:w-auto text-sm">
          <option value="">All students</option>
          {enrollments?.map(e=>{const s=e.student as any;return s?<option key={s.id} value={s.id}>{s.full_name}</option>:null})}
        </QueryParamSelect>
      </div>

      {pending.length > 0 && (
        <div className="space-y-3">
          <p className="section-title">Awaiting review — {pending.length}</p>
          {pending.map(task=>{
            const s = task.student as any
            return (
              <div key={task.id} className="card overflow-hidden border-l-4 border-l-amber-400">
                <div className="p-4 sm:p-5">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className={cn('badge text-xs',getPillarColor(task.pillar_number))}>Pillar {task.pillar_number} · Week {task.week_number}</span>
                        <span className="badge badge-amber text-xs">Needs review</span>
                      </div>
                      <h3 className="font-semibold text-gray-900 truncate">{task.title}</h3>
                      <p className="text-xs text-gray-400 mt-0.5">{s?.full_name} · {s?.institution}{task.submitted_at&&` · ${formatDate(task.submitted_at)}`}</p>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 mb-3">
                    <p className="text-xs font-medium text-gray-500 mb-1">Task prompt</p>
                    <p className="text-sm text-gray-600 line-clamp-2">{task.prompt}</p>
                  </div>
                  <div className="bg-teal-50 rounded-lg p-3 mb-4">
                    <p className="text-xs font-medium text-teal-700 mb-1">Student submission</p>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap line-clamp-4">{task.submission}</p>
                    {task.submission_url && <a href={task.submission_url} target="_blank" rel="noopener noreferrer" className="text-xs text-teal-700 hover:underline mt-1 inline-block">View attachment →</a>}
                  </div>
                  <TaskReviewClient taskId={task.id} />
                </div>
              </div>
            )
          })}
        </div>
      )}

      {reviewed.length > 0 && (
        <div className="space-y-2">
          <p className="section-title">Reviewed — {reviewed.length}</p>
          {reviewed.map(task=>{
            const s = task.student as any
            return (
              <div key={task.id} className="card p-4 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-sm font-medium text-gray-900 truncate">{task.title}</p>
                    <span className={cn('badge text-xs',{'badge-teal':task.status==='approved','badge-blue':task.status==='reviewed'})}>{task.status}</span>
                  </div>
                  <p className="text-xs text-gray-400">{s?.full_name} · P{task.pillar_number} W{task.week_number}{task.reviewed_at&&` · ${formatDate(task.reviewed_at)}`}</p>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {!tasks?.length && <div className="card p-10 text-center"><p className="text-sm text-gray-400">No tasks to review yet.</p></div>}
    </div>
  )
}
