import { createClient } from '@/lib/supabase/server'
export const dynamic = 'force-dynamic'
import { notFound, redirect } from 'next/navigation'
import { getInitials, formatDate, cn } from '@/lib/utils'
import {
  ArrowLeft, Clock, CheckCircle, BookOpen, MessageSquare,
  AlertCircle, ShieldCheck, User, Zap, Globe, ArrowRight
} from '@/components/icons'
import Link from 'next/link'
import { TaskFeedbackForm } from '@/components/mentor/TaskFeedbackForm'
import { MentorNotes } from '@/components/mentor/MentorNotes'

import { getVoiceJournals } from '@/lib/actions/sanity'

export default async function MenteeDetailPage({ params }: { params: { id: string } }) {
  const { id } = params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  // Verify mentor relationship
  const { data: enrollment } = await supabase.from('enrollments')
    .select('*, student:profiles!student_id(*), cohort:cohorts(*)')
    .eq('student_id', id)
    .eq('mentor_id', user.id)
    .single()

  if (!enrollment) notFound()

  const student = enrollment.student as any
  const cohort = enrollment.cohort as any

  // Fetch student activity
  const { data: tasks } = await supabase.from('tasks')
    .select('*')
    .eq('enrollment_id', enrollment.id)
    .order('submitted_at', { ascending: false })

  const { data: journals } = await supabase.from('journals')
    .select('*')
    .eq('student_id', id)
    .eq('is_shared', true)
    .order('updated_at', { ascending: false })

  const voiceJournals = await getVoiceJournals(id)

  // Calculate Engagement Health
  const taskSubmissionRate = tasks?.length ? (tasks.filter(t => t.status !== 'pending').length / (cohort.current_week * 1)) * 100 : 0
  const progress = Math.round(((enrollment.current_week - 1) / 12) * 100)

  return (
    <div className="max-w-6xl mx-auto pb-20">
      <div className="mb-8 flex items-center gap-4">
        <Link href="/mentor" className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center hover:bg-gray-50 transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-400" />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Mentee Profile</h1>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Cohort: {cohort.name}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Summary & Notes */}
        <div className="lg:col-span-4 space-y-8">
          {/* Student Summary Card */}
          <section className="card overflow-hidden">
            <div className="h-24 bg-teal-700 relative">
              <div className="absolute -bottom-10 left-6">
                <div className="w-20 h-20 rounded-3xl bg-white p-1 shadow-xl">
                  <div className="w-full h-full rounded-[1.2rem] bg-teal-100 text-teal-700 flex items-center justify-center text-2xl font-black">
                    {getInitials(student.full_name)}
                  </div>
                </div>
              </div>
            </div>
            <div className="pt-14 p-6 pb-6">
              <h2 className="text-xl font-black text-gray-900">{student.full_name}</h2>
              <p className="text-xs font-bold text-teal-600 uppercase tracking-widest mb-4">{student.institution} · {student.institution_type}</p>

              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="p-3 bg-gray-50 rounded-2xl">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Week</p>
                  <p className="text-lg font-black text-gray-900">{enrollment.current_week}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-2xl">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Pillar</p>
                  <p className="text-lg font-black text-gray-900">{enrollment.current_pillar}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-1.5">
                    <span className="text-gray-400">Journey Progress</span>
                    <span className="text-teal-700">{progress}%</span>
                  </div>
                  <div className="progress-bar h-2">
                    <div className="progress-fill" style={{ width: `${progress}%` }} />
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-50">
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Engagement Health</p>
                   <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 text-emerald-700 rounded-xl">
                     <Zap className="w-4 h-4" />
                     <span className="text-xs font-bold">{taskSubmissionRate > 80 ? 'Excellent' : 'On Track'}</span>
                   </div>
                </div>
              </div>
            </div>
          </section>

          {/* Private Mentor Notes */}
          <MentorNotes studentId={id} mentorId={user.id} />
        </div>

        {/* Right Column: Tasks & Journals */}
        <div className="lg:col-span-8 space-y-8">
          <div className="flex gap-1 p-1 bg-gray-100 rounded-2xl w-fit">
             <button className="px-6 py-2 bg-white rounded-xl text-xs font-black uppercase tracking-widest shadow-sm">Submissions</button>
             <button className="px-6 py-2 text-xs font-black text-gray-400 uppercase tracking-widest hover:text-gray-600">Communication</button>
          </div>

          {/* Task Submissions */}
          <section className="space-y-4">
            <h2 className="text-xs font-black text-emerald-600 uppercase tracking-[0.2em]">Task Submissions</h2>
            {!tasks?.length ? (
              <div className="card p-12 text-center">
                <Clock className="w-10 h-10 text-gray-200 mx-auto mb-4" />
                <p className="text-sm text-gray-500 font-medium">No tasks submitted yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {tasks.map(task => (
                  <div key={task.id} className="card overflow-hidden">
                    <div className="px-6 py-4 bg-gray-50/50 border-b border-gray-100 flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-bold text-gray-900">{task.title}</h3>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Pillar {task.pillar_number} · Week {task.week_number}</p>
                      </div>
                      <span className={cn(
                        "text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full",
                        task.status === 'reviewed' ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                      )}>
                        {task.status}
                      </span>
                    </div>
                    <div className="p-6 space-y-6">
                      <div className="prose prose-sm max-w-none text-gray-600 italic">
                        "{task.submission}"
                      </div>

                      {task.status === 'submitted' ? (
                        <TaskFeedbackForm taskId={task.id} />
                      ) : (
                        <div className="bg-emerald-50 rounded-2xl p-5 border border-emerald-100">
                           <div className="flex items-center gap-2 text-emerald-900 font-black text-[10px] uppercase tracking-widest mb-2">
                             <CheckCircle className="w-3.5 h-3.5" /> Your Feedback
                           </div>
                           <p className="text-sm text-emerald-800 leading-relaxed font-medium">
                             {task.mentor_feedback}
                           </p>
                           <p className="text-[10px] text-emerald-600/60 mt-3 font-bold">Reviewed on {task.reviewed_at && formatDate(task.reviewed_at)}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Shared Journal Entries */}
          <section className="space-y-4">
             <div className="flex items-center gap-2">
               <h2 className="text-xs font-black text-emerald-600 uppercase tracking-[0.2em]">Shared Journal Entries</h2>
               <div className="w-4 h-4 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[10px] font-black">{(journals?.length||0) + (voiceJournals?.length||0)}</div>
             </div>

             {voiceJournals?.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {voiceJournals.map((v: any) => (
                        <div key={v._id} className="card p-5 bg-teal-50 border-teal-100">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <Mic2 className="w-4 h-4 text-teal-600" />
                                    <span className="text-[10px] font-black text-teal-700 uppercase tracking-widest">Voice Reflection</span>
                                </div>
                                <span className="text-[9px] text-teal-600/60 font-bold uppercase">Week {v.weekNumber}</span>
                            </div>
                            <audio src={v.audioFile?.asset?.url} controls className="w-full h-8" />
                            <p className="text-[9px] text-teal-600/60 mt-2 font-bold uppercase tracking-tighter">Uploaded {formatDate(v.publishedAt)}</p>
                        </div>
                    ))}
                </div>
             )}

             {!journals?.length && !voiceJournals?.length ? (
                <div className="card p-10 text-center bg-blue-50/30 border-dashed border-blue-200">
                  <BookOpen className="w-8 h-8 text-blue-200 mx-auto mb-3" />
                  <p className="text-xs text-blue-400 font-bold uppercase tracking-wider">No journal entries shared yet</p>
                </div>
             ) : (
                <div className="space-y-4">
                  {journals.map(entry => (
                    <div key={entry.id} className="card p-6 border-l-4 border-l-blue-500">
                      <div className="flex items-center justify-between mb-4">
                         <div className="flex items-center gap-2">
                           <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-1 rounded-lg">Week {entry.week_number}</span>
                           <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{formatDate(entry.updated_at)}</span>
                         </div>
                         <MessageSquare className="w-4 h-4 text-gray-300" />
                      </div>
                      <div className="text-sm text-gray-700 leading-relaxed font-medium">
                        {entry.content}
                      </div>
                      <div className="mt-6 flex justify-end">
                         <Link href="/mentor/messages" className="text-[10px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-1.5 hover:text-blue-800 transition-colors">
                           Reply in Message Thread <ArrowRight className="w-3.5 h-3.5" />
                         </Link>
                      </div>
                    </div>
                  ))}
                </div>
             )}
          </section>
        </div>
      </div>
    </div>
  )
}
