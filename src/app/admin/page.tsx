import { createClient } from '@/lib/supabase/server'
export const dynamic = 'force-dynamic'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { formatDate, cn } from '@/lib/utils'
import { Metadata } from 'next'
import {
  Users, Award, Clock, BarChart2, ChevronRight,
  UserCheck, Lightbulb, Zap, ShieldCheck, AlertCircle,
  MessageSquare, TrendingUp
} from '@/components/icons'
import { AnimatedNumber } from '@/components/ui/AnimatedNumber'
import { EnrollmentTrends, TaskDistribution } from '@/components/admin/DashboardCharts'
import { AdminContentActions } from '@/components/admin/AdminContentActions'
import { PILLARS } from '@/types'

export const metadata: Metadata = { title: 'Admin Dashboard' }

export default async function AdminDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  if (!profile || profile.role !== 'admin') redirect('/dashboard')

  // Fetch all necessary data for the operational overview
  const now = new Date()
  const seventyTwoHoursAgo = new Date(now.getTime() - (72 * 60 * 60 * 1000)).toISOString()
  const fiveDaysAgo = new Date(now.getTime() - (5 * 24 * 60 * 60 * 1000)).toISOString()
  const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay())).toISOString()

  const [
    { count: studentCount },
    { count: mentorCount },
    { data: activeCohorts },
    { data: recentTasks },
    { data: activeProfiles },
    { data: recentPosts },
    { data: taskStatusData },
    { data: cohortsList }
  ] = await Promise.all([
    supabase.from('enrollments').select('*',{count:'exact',head:true}).eq('status','active'),
    supabase.from('profiles').select('*',{count:'exact',head:true}).eq('role','mentor').eq('approved',true),
    supabase.from('cohorts').select('*').eq('status','active'),
    // Students who submitted this week's task
    supabase.from('tasks').select('student_id').eq('status','submitted').gte('submitted_at', startOfWeek),
    // Students logged in within last 72h
    supabase.from('profiles').select('id, full_name, last_login_at, institution').eq('role','student').gte('last_login_at', seventyTwoHoursAgo),
    // Students who posted on discussion board this week
    supabase.from('discussion_posts').select('author_id').gte('created_at', startOfWeek),
    // All task status for distribution
    supabase.from('tasks').select('status'),
    // Full cohort list for actions
    supabase.from('cohorts').select('id, name, pillars_config').order('created_at', { ascending: false })
  ])

  // Fetch enrollment trends data from database
  const { data: enrollmentTrends } = await supabase
    .from('enrollments')
    .select('enrolled_at')
    .gte('enrolled_at', new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000)).toISOString())
    .order('enrolled_at', { ascending: true })

  // Group by day of week
  const trendData = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => {
    const count = enrollmentTrends?.filter(e => {
      const date = new Date(e.enrolled_at)
      return date.toLocaleDateString('en-US', { weekday: 'short' }) === day
    }).length || 0
    return { date: day, count }
  })

  // Task distribution data
  const statusCounts = (taskStatusData || []).reduce<Record<string, number>>((acc, t) => {
    acc[t.status] = (acc[t.status] || 0) + 1
    return acc
  }, {})

  const pieData = Object.entries(statusCounts).map(([name, value]) => ({ name, value }))

  const totalEnrolled = studentCount || 1
  const uniqueTaskSubmitters = new Set(recentTasks?.map(t => t.student_id)).size
  const uniqueActiveLogins = activeProfiles?.length || 0
  const uniquePosters = new Set(recentPosts?.map(p => p.author_id)).size

  const taskRate = (uniqueTaskSubmitters / totalEnrolled) * 100
  const loginRate = (uniqueActiveLogins / totalEnrolled) * 100
  const postRate = (uniquePosters / totalEnrolled) * 100
  const healthScore = Math.round((taskRate + loginRate + postRate) / 3)

  // Students at Risk Logic
  const { data: atRiskProfiles } = await supabase.from('profiles')
    .select('id, full_name, last_login_at, institution')
    .eq('role', 'student')
    .or(`last_login_at.lt.${fiveDaysAgo},last_login_at.is.null`)
    .limit(5)

  const stats = [
    { label:'Enrolled students', value:studentCount||0, icon:Users, href:'/admin/students' },
    { label:'Active mentors', value:mentorCount||0, icon:UserCheck, href:'/admin/mentors' },
    { label:'Engagement rate', value:healthScore, suffix: '%', icon:Zap, href:'/admin/analytics' },
    { label:'Active cohorts', value:activeCohorts?.length||0, icon:Award, href:'/admin/cohorts' },
  ]

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20 px-4">
      <div className="page-header">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight uppercase">Operational Overview</h1>
          <p className="text-sm text-gray-500 font-medium">Programme-wide visibility and health metrics</p>
        </div>
        <AdminContentActions cohorts={cohortsList || []} />
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => { const Icon = s.icon; return (
          <Link key={s.label} href={s.href} className="card p-4 sm:p-6 hover:shadow-card-hover transition-all group">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-teal-50 rounded-2xl flex items-center justify-center mb-3 sm:mb-4 group-hover:bg-teal-700 transition-colors shadow-sm">
              <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-teal-700 group-hover:text-white transition-colors" />
            </div>
            <p className="text-2xl sm:text-4xl font-black text-gray-900 tracking-tighter">
                <AnimatedNumber value={s.value} suffix={s.suffix} />
            </p>
            <p className="text-[9px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">{s.label}</p>
          </Link>
        )})}
      </div>

      {/* Engagement Health Score Card - Priority 1 */}
      <section className="card p-6 sm:p-8 bg-emerald-900 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 p-6 opacity-10">
          <BarChart2 className="w-24 h-24 sm:w-40 sm:h-40" />
        </div>
        <div className="relative z-10 flex flex-col sm:flex-row gap-6 sm:gap-8 items-center">
          <div className="relative w-28 h-28 sm:w-32 sm:h-32 flex-shrink-0">
             <svg className="w-full h-full" viewBox="0 0 36 36">
                <path className="text-emerald-800" strokeDasharray="100, 100" strokeWidth="3" fill="none" stroke="currentColor" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                <path className="text-emerald-400" strokeDasharray={`${healthScore}, 100`} strokeWidth="3" strokeLinecap="round" fill="none" stroke="currentColor" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
             </svg>
             <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl sm:text-3xl font-black">{healthScore}%</span>
             </div>
          </div>
          <div className="flex-1 space-y-4 text-center sm:text-left">
            <div>
              <h2 className="text-lg sm:text-xl font-black mb-1 uppercase tracking-tight">Engagement Health</h2>
              <p className="text-emerald-100/70 text-sm leading-relaxed font-medium">
                Composite score of task submissions, 72h login activity, and community participation.
              </p>
            </div>
            <div className="flex flex-wrap justify-center sm:justify-start gap-3 sm:gap-4 text-[9px] sm:text-[10px] font-black uppercase tracking-widest">
               <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-400" /> Tasks: {Math.round(taskRate)}%</span>
               <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-400" /> Logins: {Math.round(loginRate)}%</span>
               <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-400" /> Posts: {Math.round(postRate)}%</span>
            </div>
          </div>
        </div>
      </section>

      {/* Charts - Priority 2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <section className="card p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-500" /> Enrollment Trends
                </h2>
            </div>
            <EnrollmentTrends data={trendData} />
        </section>

        <section className="card p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-500" /> Task Status
                </h2>
            </div>
            <TaskDistribution data={pieData} />
        </section>
      </div>

      {/* Active Cohorts List - Priority 3 */}
      <section className="space-y-4">
         <h2 className="text-xs font-black text-emerald-600 uppercase tracking-[0.2em]">Active Cohorts</h2>
         <div className="grid grid-cols-1 gap-4">
            {activeCohorts?.map(cohort => {
              const pillars = cohort.pillars_config || PILLARS
              const currentPillar = pillars.find((p: any) => {
                if (!p.weeks) return false
                const weeksRange = p.weeks.match(/\d+/g)
                if (!weeksRange) return false
                const start = parseInt(weeksRange[0])
                const end = parseInt(weeksRange[1] || weeksRange[0])
                return cohort.current_week >= start && cohort.current_week <= end
              }) || pillars[0]

              return (
                <div key={cohort.id} className="card p-4 sm:p-5 hover:bg-gray-50 transition-all group">
                  <div className="flex items-center justify-between mb-4">
                     <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-black">
                          {cohort.name[0]}
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900 group-hover:text-teal-700 transition-colors">{cohort.name}</h3>
                          <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{cohort.semester} {cohort.year}</p>
                        </div>
                     </div>
                     <Link href={`/admin/cohorts/${cohort.id}`} className="p-2 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-gray-100">
                       <ChevronRight className="w-4 h-4 text-gray-400" />
                     </Link>
                  </div>
                  <div>
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-1.5">
                      <span className="text-gray-400">Week {cohort.current_week} of 12</span>
                      <span className="text-teal-700">Pillar {currentPillar?.number}: {currentPillar?.name}</span>
                    </div>
                    <div className="progress-bar h-1.5">
                       <div className="progress-fill" style={{ width: `${(cohort.current_week/12)*100}%` }} />
                    </div>
                  </div>
                </div>
              )
            })}
            {!activeCohorts?.length && (
              <div className="card p-10 text-center text-gray-400 italic text-sm">No active cohorts currently running.</div>
            )}
         </div>
      </section>

      {/* Students at Risk - Priority 4 */}
      <section className="space-y-4">
         <div className="flex items-center justify-between px-1">
           <h2 className="text-xs font-black text-red-600 uppercase tracking-[0.2em] flex items-center gap-2">
             <AlertCircle className="w-4 h-4" /> Students at Risk
           </h2>
           <Link href="/admin/students" className="text-[10px] font-black text-gray-400 uppercase tracking-widest">View All</Link>
         </div>
         <div className="card divide-y divide-gray-50 overflow-hidden">
            {atRiskProfiles?.map(student => (
              <div key={student.id} className="p-4 hover:bg-red-50/30 transition-colors group">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                     <div className="w-8 h-8 rounded-full bg-red-50 text-red-700 flex items-center justify-center text-[10px] font-black">
                       {student.full_name[0]}
                     </div>
                     <div>
                       <p className="text-sm font-bold text-gray-900">{student.full_name}</p>
                       <p className="text-[10px] text-gray-400 font-medium">{student.institution}</p>
                     </div>
                  </div>
                  <div className="text-right">
                     <p className="text-[10px] font-black text-red-600 uppercase tracking-widest">
                       {!student.last_login_at ? 'Never' : `${Math.floor((now.getTime() - new Date(student.last_login_at).getTime()) / (1000 * 60 * 60 * 24))}d`}
                     </p>
                     <Link href={`/admin/students/${student.id}`} className="text-[9px] font-bold text-gray-400 hover:text-gray-600 underline">Intervene</Link>
                  </div>
                </div>
              </div>
            ))}
            {!atRiskProfiles?.length && (
              <div className="p-10 text-center bg-emerald-50/30">
                <ShieldCheck className="w-8 h-8 text-emerald-200 mx-auto mb-2" />
                <p className="text-xs text-emerald-600 font-bold uppercase tracking-widest">No risks flagged</p>
              </div>
            )}
         </div>
      </section>

      {/* Quick Actions - Priority 5 */}
      <section className="space-y-4">
         <h2 className="text-xs font-black text-emerald-600 uppercase tracking-[0.2em]">Operational Actions</h2>
         <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Waitlist', count: 'Review', href: '/admin/waitlist', icon: Clock, color: 'bg-teal-50 text-teal-700' },
              { label: 'Messages', count: 'Urgent', href: '/admin/messages', icon: MessageSquare, color: 'bg-blue-50 text-blue-700' },
              { label: 'Mentors', count: 'Approve', href: '/admin/mentors', icon: Award, color: 'bg-amber-50 text-amber-700' },
              { label: 'Clubs', count: 'Activate', href: '/admin/vision-clubs', icon: Lightbulb, color: 'bg-purple-50 text-purple-700' },
            ].map(action => (
              <Link key={action.label} href={action.href} className="card p-4 hover:bg-gray-50 transition-all">
                 <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center mb-3", action.color)}>
                   <action.icon className="w-4 h-4" />
                 </div>
                 <p className="text-sm font-bold text-gray-900">{action.label}</p>
                 <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{action.count}</p>
              </Link>
            ))}
         </div>
      </section>
    </div>
  )
}
