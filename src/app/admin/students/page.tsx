import { createClient } from '@/lib/supabase/server'
export const dynamic = 'force-dynamic'
import { redirect } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Metadata } from 'next'
import { QueryParamSelect } from '@/components/admin/QueryParamSelect'
export const metadata: Metadata = { title: 'Students' }

export default async function StudentsPage({ searchParams }: { searchParams: Promise<{ cohort?: string }> }) {
  const { cohort: cohortFilter } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  let q = supabase.from('enrollments').select('*,student:profiles!student_id(id,full_name,email,institution,institution_type,year_of_study,county),mentor:profiles!mentor_id(id,full_name),cohort:cohorts(id,name,current_week)').in('status',['enrolled','active','completed']).order('enrolled_at',{ascending:false})
  if (cohortFilter) q = q.eq('cohort_id', cohortFilter)
  const { data: enrollments } = await q.limit(100)
  const { data: cohorts } = await supabase.from('cohorts').select('id,name').order('created_at',{ascending:false})

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="page-header"><h1 className="page-title">Students</h1><span className="badge badge-teal">{enrollments?.length||0} enrolled</span></div>

      <div className="card p-4 flex items-center gap-3">
        <label className="text-sm font-medium text-gray-600">Filter by cohort:</label>
        <QueryParamSelect name="cohort" defaultValue={cohortFilter||''} className="select w-auto">
          <option value="">All cohorts</option>
          {cohorts?.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
        </QueryParamSelect>
      </div>

      <div className="card overflow-hidden">
        <div className="px-5 py-3.5 border-b border-gray-100 bg-gray-50 grid grid-cols-12 gap-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
          <span className="col-span-3">Student</span><span className="col-span-2">Institution</span><span className="col-span-1">Type</span><span className="col-span-2">Cohort</span><span className="col-span-1">Mentor</span><span className="col-span-2">Progress</span><span className="col-span-1">Status</span>
        </div>
        <div className="divide-y divide-gray-50">
          {enrollments?.length===0 ? <div className="px-5 py-10 text-center"><p className="text-sm text-gray-400">No students enrolled yet.</p></div>
          : enrollments?.map(e => {
            const s = e.student as any; const m = e.mentor as any; const c = e.cohort as any
            if (!s) return null
            const pct = Math.round(((e.current_week-1)/12)*100)
            return (
              <div key={e.id} className="grid grid-cols-12 gap-3 px-5 py-3.5 items-center hover:bg-gray-50">
                <div className="col-span-3 flex items-center gap-2 min-w-0">
                  <div className="w-7 h-7 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-xs font-semibold flex-shrink-0">{s.full_name?.split(' ').map((n:string)=>n[0]).join('').slice(0,2)}</div>
                  <div className="min-w-0"><p className="text-sm font-medium text-gray-900 truncate">{s.full_name}</p><p className="text-xs text-gray-400">{s.county}</p></div>
                </div>
                <div className="col-span-2 min-w-0"><p className="text-xs text-gray-700 truncate">{s.institution}</p><p className="text-xs text-gray-400">{s.year_of_study}</p></div>
                <div className="col-span-1"><span className={`badge text-xs ${s.institution_type==='tvet'?'badge-blue':s.institution_type==='kmtc'?'badge-purple':'badge-teal'}`}>{s.institution_type||'uni'}</span></div>
                <div className="col-span-2 min-w-0"><p className="text-xs text-gray-700 truncate">{c?.name}</p><p className="text-xs text-gray-400">W{e.current_week}/12</p></div>
                <div className="col-span-1"><p className="text-xs text-gray-600 truncate">{m?.full_name?.split(' ')[0]||'—'}</p></div>
                <div className="col-span-2"><div className="progress-bar"><div className="progress-fill" style={{width:`${pct}%`}} /></div><p className="text-xs text-gray-400 mt-0.5">{pct}%</p></div>
                <div className="col-span-1"><span className={cn('badge text-xs',{'badge-teal':e.status==='completed','badge-blue':e.status==='active','badge-gray':true})}>{e.status}</span></div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
