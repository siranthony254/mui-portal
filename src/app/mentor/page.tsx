import { createClient } from '@/lib/supabase/server'
export const dynamic = 'force-dynamic'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getInitials, formatDate } from '@/lib/utils'
import { Clock, Users, MessageSquare, CheckCircle, BookOpen, ArrowRight } from '@/components/icons'
import { MentorOnboarding } from '@/components/mentor/MentorOnboarding'
import { MenteeOverview } from '@/components/mentor/MenteeOverview'
import { ProgrammeExplorer } from '@/components/mentor/ProgrammeExplorer'
import { Metadata } from 'next'
import { AnimatedNumber } from '@/components/ui/AnimatedNumber'

export const metadata: Metadata = { title: 'Mentor Dashboard' }

export default async function MentorDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 text-center">
        <div className="max-w-md">
          <h1 className="text-2xl font-bold mb-4">Profile Not Found</h1>
          <p className="text-gray-500 mb-6">We couldn't find your mentor profile data. Please try signing out and in again.</p>
          <a href="/auth/login" className="btn-primary">Back to Login</a>
        </div>
      </div>
    )
  }

  const { data: enrollments } = await supabase.from('enrollments').select('*,student:profiles!student_id(id,full_name,institution,institution_type,year_of_study),cohort:cohorts(id,name,current_week)').eq('mentor_id',user.id).in('status',['enrolled','active']).order('enrolled_at',{ascending:false})

  const { data: allActiveCohorts } = await supabase.from('cohorts').select('id, name, current_week, pillars_config').eq('applications_open', false).order('created_at', { ascending: false })

  const studentIds = enrollments?.map(e=>(e.student as any)?.id).filter(Boolean)||[]

  // Fetch completions for all mentees
  const { data: allCompletions } = studentIds.length
    ? await supabase.from('session_homework_completions').select('*').in('student_id', studentIds)
    : { data: [] }

  const completionsMap = (allCompletions || []).reduce<Record<string, number>>((acc, c) => {
    acc[c.student_id] = (acc[c.student_id] || 0) + 1
    return acc
  }, {})

  // Calculate progress
  const progressMap: Record<string, number> = {}
  enrollments?.forEach(enrollment => {
    const studentId = (enrollment.student as any).id
    const completedSessions = completionsMap[studentId] || 0
    progressMap[studentId] = Math.min(100, Math.round((completedSessions / 12) * 100)) // Assuming 12 sessions total for now
  })

  if (!profile.onboarded) {
    const mentees = enrollments?.map(e => {
      const s = e.student as any
      return {
        id: s.id,
        full_name: s.full_name,
        institution: s.institution || 'Unknown Institution'
      }
    }) || []
    return <MentorOnboarding mentorName={profile.full_name} mentees={mentees} />
  }

  const { data: pendingTasks } = studentIds.length
    ? await supabase.from('tasks').select('*,student:profiles!student_id(id,full_name)').in('student_id',studentIds).eq('status','submitted').order('submitted_at',{ascending:true})
    : { data:[] }

  const { data: sharedJournals } = studentIds.length
    ? await supabase.from('journals').select('*,student:profiles!student_id(id,full_name)').in('student_id',studentIds).eq('is_shared',true).order('updated_at',{ascending:false})
    : { data:[] }

  const overdueTasksByStudent: Record<string, number> = {}
  if (studentIds.length && enrollments) {
    for (const enrollment of enrollments) {
      const studentId = (enrollment.student as any).id
      const { count } = await supabase.from('tasks')
        .select('*', { count: 'exact', head: true })
        .eq('student_id', studentId)
        .eq('status', 'pending')
        .lt('week_number', (enrollment.cohort as any).current_week)

      overdueTasksByStudent[studentId] = count || 0
    }
  }

  const { data: convos } = await supabase.from('conversations').select('*').contains('participant_ids',[user.id])
  const { count: unreadCount } = convos?.length ? await supabase.from('messages').select('id',{count:'exact',head:true}).in('conversation_id',convos.map(c=>c.id)).not('read_by','cs',`{${user.id}}`).neq('sender_id',user.id) : { count:0 }

  const stats = [
    {label:'My students',value:enrollments?.length||0,icon:Users,href:'/mentor/students'},
    {label:'Tasks to review',value:pendingTasks?.length||0,icon:Clock,href:'/mentor/tasks'},
    {label:'Unread messages',value:unreadCount||0,icon:MessageSquare,href:'/mentor/messages'},
    {label:'Shared Journals',value:sharedJournals?.length||0,icon:BookOpen,href:'/mentor/tasks'},
  ]

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20 px-4">
      <div className="page-header">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight uppercase">Mentor Dashboard</h1>
          <p className="text-sm text-gray-500 font-medium">Accompanying {enrollments?.length||0} emerging leaders</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {stats.map(s=>{ const Icon=s.icon; return (
          <Link key={s.label} href={s.href} className="card p-4 sm:p-5 hover:shadow-card-hover transition-all group">
            <div className="w-10 h-10 bg-teal-50 rounded-2xl flex items-center justify-center mb-3 group-hover:bg-teal-700 transition-colors">
              <Icon className="w-5 h-5 text-teal-700 group-hover:text-white transition-colors" />
            </div>
            <p className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tighter">
                <AnimatedNumber value={s.value} />
            </p>
            <p className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">{s.label}</p>
          </Link>
        )})}
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-black text-emerald-600 uppercase tracking-[0.2em]">Mentee Overview</h2>
          <Link href="/mentor/students" className="text-[10px] font-black text-gray-400 hover:text-emerald-700 uppercase tracking-widest">See all students</Link>
        </div>

        {!enrollments?.length ? (
          <div className="card p-10 text-center">
            <Users className="w-10 h-10 text-gray-200 mx-auto mb-4" />
            <p className="text-sm text-gray-500 font-medium">No mentees assigned to you yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {enrollments.map(enrollment => {
              const studentId = (enrollment.student as any).id
              return (
                <MenteeOverview
                  key={enrollment.id}
                  enrollment={enrollment}
                  overdueTasks={overdueTasksByStudent[studentId] || 0}
                  sessionsCompleted={completionsMap[studentId] || 0}
                  progress={progressMap[studentId] || 0}
                />
              )
            })}
          </div>
        )}
      </div>

      <section className="space-y-4">
        <h2 className="text-xs font-black text-emerald-600 uppercase tracking-[0.2em]">Pending Actions</h2>
        <div className="card divide-y divide-gray-50">
          {pendingTasks?.length === 0 && sharedJournals?.length === 0 && (
            <div className="p-10 text-center">
              <CheckCircle className="w-8 h-8 text-emerald-100 mx-auto mb-2" />
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">All caught up!</p>
            </div>
          )}

          {pendingTasks?.map(task => (
            <Link key={task.id} href="/mentor/tasks" className="flex items-start gap-3 p-4 hover:bg-gray-50 group">
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                <Clock className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-black text-amber-600 uppercase tracking-[0.1em] mb-0.5">Task Review</p>
                <p className="text-sm font-bold text-gray-900 leading-tight">{(task.student as any).full_name} submitted "{task.title}"</p>
                <p className="text-[10px] text-gray-400 mt-1 font-medium">{task.submitted_at && formatDate(task.submitted_at)}</p>
              </div>
            </Link>
          ))}

          {sharedJournals?.map(journal => (
            <Link key={journal.id} href="/mentor/tasks" className="flex items-start gap-3 p-4 hover:bg-gray-50 group">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <BookOpen className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.1em] mb-0.5">Journal Shared</p>
                <p className="text-sm font-bold text-gray-900 leading-tight">{(journal.student as any).full_name} shared a Week {journal.week_number} entry</p>
                <p className="text-[10px] text-gray-400 mt-1 font-medium">{formatDate(journal.updated_at)}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <ProgrammeExplorer cohorts={allActiveCohorts || []} />

      <section className="space-y-4">
         <h2 className="text-xs font-black text-emerald-600 uppercase tracking-[0.2em]">Group Activity</h2>
         <div className="card p-6 bg-emerald-900 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 p-6 opacity-10">
              <MessageSquare className="w-24 h-24" />
            </div>
            <div className="relative z-10">
              <p className="text-xs font-bold text-emerald-300 uppercase tracking-widest mb-4">Cohort Chat</p>
              <p className="text-sm font-medium leading-relaxed mb-6 text-emerald-50">
                Stay present in the community. Your substantive presence signals that students' voices are being heard.
              </p>
              <Link href="/mentor/messages" className="inline-flex items-center gap-2 bg-emerald-700 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-colors shadow-lg shadow-black/20">
                Open Group Chat <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
         </div>
      </section>
    </div>
  )
}
