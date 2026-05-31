import { createClient } from '@/lib/supabase/server'
export const dynamic = 'force-dynamic'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'
import { Metadata } from 'next'
import { Users, Award, Clock, BarChart2, ChevronRight, UserCheck, Lightbulb } from '@/components/icons'
export const metadata: Metadata = { title: 'Admin Dashboard' }

export default async function AdminDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const [
    { count: studentCount },
    { count: mentorCount },
    { count: waitlistCount },
    { data: cohorts },
    { data: recentApps },
    { count: pendingMentors },
  ] = await Promise.all([
    supabase.from('profiles').select('*',{count:'exact',head:true}).eq('role','student'),
    supabase.from('profiles').select('*',{count:'exact',head:true}).eq('role','mentor').eq('approved',true),
    supabase.from('waitlist').select('*',{count:'exact',head:true}).eq('status','waiting'),
    supabase.from('cohorts').select('*').order('created_at',{ascending:false}).limit(3),
    supabase.from('profiles').select('id,full_name,institution,institution_type,created_at').eq('role','student').eq('approved',false).order('created_at',{ascending:false}).limit(5),
    supabase.from('profiles').select('*',{count:'exact',head:true}).eq('role','mentor').eq('approved',false),
  ])

  const activeCohort = cohorts?.find(c => c.status === 'active')
  const stats = [
    { label:'Total students', value:studentCount||0, icon:Users, href:'/admin/students' },
    { label:'Active mentors', value:mentorCount||0, icon:UserCheck, href:'/admin/mentors' },
    { label:'On waitlist', value:waitlistCount||0, icon:Clock, href:'/admin/waitlist' },
    { label:'Mentor approvals', value:pendingMentors||0, icon:Award, href:'/admin/mentors' },
  ]

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="page-header">
        <h1 className="page-title">Admin Dashboard</h1>
        <Link href="/admin/cohorts" className="btn-primary text-sm">Manage cohorts</Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => { const Icon = s.icon; return (
          <Link key={s.label} href={s.href} className="card p-5 hover:shadow-card-hover transition-shadow group">
            <div className="w-9 h-9 bg-teal-50 rounded-xl flex items-center justify-center mb-3"><Icon className="w-4 h-4 text-teal-700" /></div>
            <p className="text-2xl font-bold text-gray-900">{s.value}</p>
            <p className="text-sm text-gray-500 mt-0.5">{s.label}</p>
          </Link>
        )})}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4"><p className="section-title mb-0">Active cohort</p><Link href="/admin/cohorts" className="text-xs text-teal-700 hover:underline">View all</Link></div>
          {activeCohort ? (
            <>
              <div className="flex items-center justify-between mb-3">
                <div><h3 className="font-semibold text-gray-900">{activeCohort.name}</h3><p className="text-xs text-gray-400 mt-0.5">{activeCohort.semester} {activeCohort.year} · Week {activeCohort.current_week}/12</p></div>
                <span className="badge badge-teal">Active</span>
              </div>
              <div className="mb-3">
                <div className="flex justify-between text-xs text-gray-400 mb-1"><span>Week {activeCohort.current_week} of 12</span><span>{Math.round((activeCohort.current_week/12)*100)}%</span></div>
                <div className="progress-bar"><div className="progress-fill" style={{width:`${Math.round((activeCohort.current_week/12)*100)}%`}} /></div>
              </div>
              <div className="mt-4 flex gap-2">
                <Link href={`/admin/cohorts/${activeCohort.id}`} className="btn-primary text-xs flex-1 justify-center">Manage</Link>
                <Link href="/admin/analytics" className="btn-secondary text-xs flex-1 justify-center"><BarChart2 className="w-3.5 h-3.5" />Analytics</Link>
              </div>
            </>
          ) : (
            <div className="text-center py-6"><p className="text-sm text-gray-400 mb-3">No active cohort</p><Link href="/admin/cohorts" className="btn-primary text-sm">Create cohort</Link></div>
          )}
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between mb-4"><p className="section-title mb-0">Recent applications</p><Link href="/admin/waitlist" className="text-xs text-teal-700 hover:underline">View all ({waitlistCount})</Link></div>
          {recentApps?.length ? (
            <div className="space-y-1">
              {recentApps.map(app => (
                <div key={app.id} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50">
                  <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-xs font-semibold flex-shrink-0">{app.full_name.split(' ').map((n:string)=>n[0]).join('').slice(0,2)}</div>
                  <div className="flex-1 min-w-0"><p className="text-sm font-medium text-gray-900 truncate">{app.full_name}</p><p className="text-xs text-gray-400">{app.institution} · {formatDate(app.created_at)}</p></div>
                  <span className={`badge text-xs ${app.institution_type==='tvet'?'badge-blue':app.institution_type==='kmtc'?'badge-purple':'badge-teal'}`}>{app.institution_type||'uni'}</span>
                </div>
              ))}
            </div>
          ) : <p className="text-sm text-gray-400 text-center py-6">No recent applications</p>}
        </div>
      </div>

      <div className="card p-5">
        <p className="section-title">Quick actions</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            {label:'Open cohort',desc:'Admit waitlisted students',href:'/admin/cohorts',icon:Award},
            {label:'Add content',desc:'Upload new resources',href:'/admin/content',icon:BarChart2},
            {label:'Vision clubs',desc:'Activate pending clubs',href:'/admin/vision-clubs',icon:Lightbulb},
            {label:'Approve mentors',desc:`${pendingMentors} pending`,href:'/admin/mentors',icon:UserCheck},
          ].map(a => { const Icon=a.icon; return (
            <Link key={a.label} href={a.href} className="p-4 rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all group">
              <div className="w-8 h-8 bg-teal-50 rounded-lg flex items-center justify-center mb-2.5"><Icon className="w-4 h-4 text-teal-700" /></div>
              <p className="text-sm font-medium text-gray-900">{a.label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{a.desc}</p>
            </Link>
          )})}
        </div>
      </div>
    </div>
  )
}
