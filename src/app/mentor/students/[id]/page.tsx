import { redirect, notFound } from 'next/navigation'
export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase/server'
import { getInitials, formatDate } from '@/lib/utils'
import Link from 'next/link'
import { ArrowLeft, MessageSquare, FileText, CheckCircle, Circle, Clock, Unlock } from '@/components/icons'
import { Metadata } from 'next'

export const metadata: Metadata = { title: 'Student Detail — Mentor' }

export default async function StudentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: enrollment } = await supabase.from('enrollments')
    .select('*, student:profiles!student_id(*), cohort:cohorts(*)')
    .eq('student_id', id)
    .eq('mentor_id', user.id)
    .single()

  if (!enrollment) notFound()

  const { data: tasks } = await supabase.from('tasks')
    .select('*')
    .eq('student_id', id)
    .order('week_number', { ascending: true })

  const { data: journals } = await supabase.from('journals')
    .select('*')
    .eq('student_id', id)
    .eq('is_shared', true)
    .order('week_number', { ascending: true })

  const s = enrollment.student as any
  const c = enrollment.cohort as any
  const progress = Math.round(((enrollment.current_week - 1) / 12) * 100)

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link href="/mentor/students" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-2">
        <ArrowLeft className="w-3.5 h-3.5" />Back to students
      </Link>

      <div className="card p-6">
        <div className="flex items-start gap-5">
          <div className="w-16 h-16 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-xl font-bold flex-shrink-0">
            {getInitials(s.full_name)}
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold text-gray-900">{s.full_name}</h1>
                <p className="text-sm text-gray-500">{s.email}</p>
              </div>
              <Link href="/mentor/messages" className="btn-primary py-2 px-4 text-xs flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />Message Student
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              <div><p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Institution</p><p className="text-sm text-gray-700">{s.institution} ({s.institution_type})</p></div>
              <div><p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Year</p><p className="text-sm text-gray-700">{s.year_of_study}</p></div>
              <div><p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Cohort</p><p className="text-sm text-gray-700">{c.name}</p></div>
              <div><p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Current Week</p><p className="text-sm text-gray-700">Week {enrollment.current_week} of 12</p></div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-gray-900 px-1 flex items-center gap-2">
            <Unlock className="w-4 h-4 text-teal-600" /> Shared Journal Entries ({journals?.length || 0})
          </h2>
          {journals && journals.length > 0 ? (
            <div className="space-y-3">
              {journals.map(entry => (
                <div key={entry.id} className="card p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-teal-700 uppercase tracking-widest">Week {entry.week_number} Reflection</span>
                    <span className="text-[10px] text-gray-400">{formatDate(entry.updated_at)}</span>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed line-clamp-4 whitespace-pre-wrap">{entry.content}</p>
                  {entry.content?.length > 200 && (
                     <div className="mt-2 text-center border-t border-gray-50 pt-2">
                        <p className="text-[10px] text-gray-400 italic">Open in messenger to discuss full reflection</p>
                     </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="card p-8 text-center text-gray-400 text-sm">
              Student has not shared any journal entries yet.
            </div>
          )}
        </div>

        <div className="space-y-4">
          <h2 className="text-sm font-bold text-gray-900 px-1 flex items-center gap-2">
             <CheckCircle className="w-4 h-4 text-teal-600" /> Task Status
          </h2>
          <div className="card divide-y divide-gray-50">
             {tasks?.map(task => (
               <Link key={task.id} href={`/mentor/tasks?student=${s.id}`} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                 <div className="flex items-center gap-3">
                   {task.status === 'approved' ? <CheckCircle className="w-4 h-4 text-teal-600" /> :
                    task.status === 'submitted' || task.status === 'reviewed' ? <Clock className="w-4 h-4 text-amber-500" /> :
                    <Circle className="w-4 h-4 text-gray-300" />}
                   <div>
                     <p className="text-sm font-medium text-gray-900">{task.title}</p>
                     <p className="text-[10px] text-gray-400">Week {task.week_number}</p>
                   </div>
                 </div>
                 <span className={`badge text-[10px] ${task.status === 'approved' ? 'badge-teal' : 'badge-amber'}`}>{task.status}</span>
               </Link>
             ))}
          </div>
        </div>
      </div>
    </div>
  )
}
