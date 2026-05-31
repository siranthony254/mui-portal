import { createClient } from '@/lib/supabase/server'
export const dynamic = 'force-dynamic'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getInitials, formatDate } from '@/lib/utils'
import { Clock, Users, MessageSquare, CheckCircle } from '@/components/icons'
import { Metadata } from 'next'
export const metadata: Metadata = { title: 'Mentor Dashboard' }

export default async function MentorDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: enrollments } = await supabase.from('enrollments').select('*,student:profiles!student_id(id,full_name,institution,institution_type,year_of_study),cohort:cohorts(id,name,current_week)').eq('mentor_id',user.id).in('status',['enrolled','active']).order('enrolled_at',{ascending:false})
  const studentIds = enrollments?.map(e=>(e.student as any)?.id).filter(Boolean)||[]
  const { data: pendingTasks } = studentIds.length ? await supabase.from('tasks').select('*,student:profiles!student_id(id,full_name)').in('student_id',studentIds).eq('status','submitted').order('submitted_at',{ascending:true}).limit(10) : { data:[] }
  const { data: convos } = await supabase.from('conversations').select('id').contains('participant_ids',[user.id])
  const { count: unreadCount } = convos?.length ? await supabase.from('messages').select('id',{count:'exact',head:true}).in('conversation_id',convos.map(c=>c.id)).not('read_by','cs',`{${user.id}}`).neq('sender_id',user.id) : { count:0 }

  const stats = [
    {label:'My students',value:enrollments?.length||0,icon:Users,href:'/mentor/students'},
    {label:'Tasks to review',value:pendingTasks?.length||0,icon:Clock,href:'/mentor/tasks'},
    {label:'Unread messages',value:unreadCount||0,icon:MessageSquare,href:'/mentor/messages'},
    {label:'Completed',value:0,icon:CheckCircle,href:'/mentor/tasks'},
  ]

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="page-header"><h1 className="page-title">Mentor Dashboard</h1></div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map(s=>{ const Icon=s.icon; return (
          <Link key={s.label} href={s.href} className="card p-4 hover:shadow-card-hover transition-shadow">
            <div className="w-8 h-8 bg-teal-50 rounded-lg flex items-center justify-center mb-2"><Icon className="w-4 h-4 text-teal-700" /></div>
            <p className="text-2xl font-bold text-gray-900">{s.value}</p>
            <p className="text-sm text-gray-500 mt-0.5">{s.label}</p>
          </Link>
        )})}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4"><p className="section-title mb-0">Tasks awaiting review</p><Link href="/mentor/tasks" className="text-xs text-teal-700 hover:underline">View all</Link></div>
          {!pendingTasks?.length ? <p className="text-sm text-gray-400 py-4 text-center">No tasks waiting. 🎉</p> : (
            <div className="space-y-2">
              {pendingTasks.slice(0,5).map(task=>(
                <Link key={task.id} href={`/mentor/tasks`} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 group">
                  <Clock className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 group-hover:text-teal-700 truncate">{task.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{(task.student as any)?.full_name} · Week {task.week_number}{task.submitted_at&&` · ${formatDate(task.submitted_at)}`}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4"><p className="section-title mb-0">My students</p><Link href="/mentor/students" className="text-xs text-teal-700 hover:underline">View all</Link></div>
          {!enrollments?.length ? <p className="text-sm text-gray-400 py-4 text-center">No students assigned yet.</p> : (
            <div className="space-y-2">
              {enrollments.map(enrollment=>{
                const s = enrollment.student as any; if (!s) return null
                const progress = Math.round(((enrollment.current_week-1)/12)*100)
                return (
                  <div key={enrollment.id} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50">
                    <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-xs font-semibold flex-shrink-0">{getInitials(s.full_name)}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{s.full_name}</p>
                      <div className="flex items-center gap-2 mt-0.5"><div className="progress-bar flex-1"><div className="progress-fill" style={{width:`${progress}%`}} /></div><span className="text-xs text-gray-400 flex-shrink-0">W{enrollment.current_week}</span></div>
                    </div>
                    <Link href="/mentor/messages" className="w-7 h-7 bg-gray-100 hover:bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0"><MessageSquare className="w-3.5 h-3.5 text-gray-500" /></Link>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
