import { createClient } from '@/lib/supabase/server'
export const dynamic = 'force-dynamic'
import { redirect } from 'next/navigation'
import { getInitials } from '@/lib/utils'
import Link from 'next/link'
import { MessageSquare, ChevronRight } from '@/components/icons'
import { Metadata } from 'next'
export const metadata: Metadata = { title: 'My Students' }

export default async function MentorStudentsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: enrollments } = await supabase.from('enrollments').select('*,student:profiles!student_id(id,full_name,email,institution,institution_type,year_of_study,county,bio),cohort:cohorts(id,name,current_week,status)').eq('mentor_id',user.id).in('status',['enrolled','active','completed']).order('enrolled_at',{ascending:false})
  const studentIds = enrollments?.map(e=>(e.student as any)?.id).filter(Boolean)||[]
  const { data: taskStats } = studentIds.length ? await supabase.from('tasks').select('student_id,status').in('student_id',studentIds) : { data:[] }
  const taskMap = (taskStats||[]).reduce<Record<string,{total:number;approved:number;pending:number}>>((acc,t)=>{ if(!acc[t.student_id]) acc[t.student_id]={total:0,approved:0,pending:0}; acc[t.student_id]!.total++; if(t.status==='approved') acc[t.student_id]!.approved++; if(t.status==='pending') acc[t.student_id]!.pending++; return acc },{})

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="page-header"><h1 className="page-title">My Students</h1><span className="badge badge-teal">{enrollments?.length||0} assigned</span></div>
      {!enrollments?.length ? <div className="card p-10 text-center"><p className="text-sm text-gray-400">No students assigned to you yet.</p></div> : (
        <div className="space-y-3">
          {enrollments.map(enrollment=>{
            const s = enrollment.student as any; const c = enrollment.cohort as any; if (!s) return null
            const tasks = taskMap[s.id]||{total:0,approved:0,pending:0}
            const progress = Math.round(((enrollment.current_week-1)/12)*100)
            const onTrack = tasks.pending===0
            return (
              <div key={enrollment.id} className="card p-5">
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-sm font-semibold flex-shrink-0">{getInitials(s.full_name)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="font-semibold text-gray-900">{s.full_name}</h3>
                      <span className={`badge text-xs ${onTrack?'badge-teal':'badge-amber'}`}>{onTrack?'On track':`${tasks.pending} pending`}</span>
                      <span className={`badge text-xs ${s.institution_type==='tvet'?'badge-blue':s.institution_type==='kmtc'?'badge-purple':'badge-teal'}`}>{s.institution_type||'university'}</span>
                    </div>
                    <p className="text-xs text-gray-500">{s.institution} · {s.year_of_study} · {s.county}</p>
                    <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div><p className="text-xs text-gray-400">Cohort</p><p className="text-sm font-medium text-gray-700 truncate">{c?.name}</p></div>
                      <div><p className="text-xs text-gray-400">Week</p><p className="text-sm font-medium text-gray-700">{enrollment.current_week}/12</p></div>
                      <div><p className="text-xs text-gray-400">Tasks done</p><p className="text-sm font-medium text-gray-700">{tasks.approved}/{tasks.total}</p></div>
                      <div><p className="text-xs text-gray-400">Progress</p><p className="text-sm font-medium text-gray-700">{progress}%</p></div>
                    </div>
                    <div className="mt-3 progress-bar"><div className="progress-fill" style={{width:`${progress}%`}} /></div>
                  </div>
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    <Link href={`/mentor/students/${s.id}`} className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1">View Details <ChevronRight className="w-3.5 h-3.5" /></Link>
                    <Link href="/mentor/messages" className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1"><MessageSquare className="w-3.5 h-3.5" />Message</Link>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
