import { createClient } from '@/lib/supabase/server'
export const dynamic = 'force-dynamic'
import { redirect } from 'next/navigation'
import { PILLARS } from '@/types'
import { Metadata } from 'next'
import { QueryParamSelect } from '@/components/admin/QueryParamSelect'
export const metadata: Metadata = { title: 'Analytics' }

export default async function AnalyticsPage({ searchParams }: { searchParams: Promise<{ cohort?: string }> }) {
  const { cohort: cohortFilter } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: cohorts } = await supabase.from('cohorts').select('id,name,semester,year,status,current_week,max_participants').order('created_at',{ascending:false})
  const activeCohortId = cohortFilter || cohorts?.find(c=>c.status==='active')?.id
  const selectedCohort = cohorts?.find(c=>c.id===activeCohortId)

  let stats = { enrolled:0, approved_tasks:0, pending_tasks:0, submitted_tasks:0, inst_breakdown:{} as Record<string,number>, pillar_completion:{} as Record<number,number> }

  if (activeCohortId) {
    const [{ count: enrolled },{ data: tasks },{ data: enrollments }] = await Promise.all([
      supabase.from('enrollments').select('*',{count:'exact',head:true}).eq('cohort_id',activeCohortId).in('status',['enrolled','active']),
      supabase.from('tasks').select('status,pillar_number').eq('cohort_id',activeCohortId),
      supabase.from('enrollments').select('current_pillar,student:profiles!student_id(institution_type)').eq('cohort_id',activeCohortId).in('status',['enrolled','active']),
    ])
    stats.enrolled = enrolled||0
    stats.approved_tasks = tasks?.filter(t=>t.status==='approved').length||0
    stats.pending_tasks = tasks?.filter(t=>t.status==='pending').length||0
    stats.submitted_tasks = tasks?.filter(t=>t.status==='submitted'||t.status==='reviewed').length||0
    enrollments?.forEach((e:any)=>{ const t=e.student?.institution_type||'unknown'; stats.inst_breakdown[t]=(stats.inst_breakdown[t]||0)+1 })
    PILLARS.forEach(p=>{
      const pt=tasks?.filter(t=>t.pillar_number===p.number)||[]
      const approved=pt.filter(t=>t.status==='approved').length
      stats.pillar_completion[p.number]=pt.length>0?Math.round((approved/pt.length)*100):0
    })
  }

  const instColors: Record<string,string> = { university:'bg-teal-500', tvet:'bg-blue-500', college:'bg-amber-500', kmtc:'bg-purple-500', unknown:'bg-gray-300' }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="page-header">
        <h1 className="page-title">Analytics</h1>
        <QueryParamSelect name="cohort" defaultValue={activeCohortId||''} className="select w-auto text-sm">
          <option value="">Select cohort</option>
          {cohorts?.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
        </QueryParamSelect>
      </div>

      {selectedCohort ? (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[{label:'Enrolled',value:stats.enrolled,sub:`of ${selectedCohort.max_participants} max`},{label:'Tasks approved',value:stats.approved_tasks,sub:'fully reviewed'},{label:'Awaiting review',value:stats.submitted_tasks,sub:'submitted'},{label:'Pending',value:stats.pending_tasks,sub:'not submitted'}].map(s=>(
              <div key={s.label} className="card p-4"><p className="text-2xl font-bold text-gray-900">{s.value}</p><p className="text-sm font-medium text-gray-600 mt-0.5">{s.label}</p><p className="text-xs text-gray-400 mt-0.5">{s.sub}</p></div>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="card p-5">
              <p className="section-title">Pillar task completion</p>
              <div className="space-y-3">
                {PILLARS.map(pillar=>{
                  const pct=stats.pillar_completion[pillar.number]||0
                  const isCurrent=Math.ceil(selectedCohort.current_week/2.4)===pillar.number
                  return (
                    <div key={pillar.number}>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2"><span className="text-sm font-medium text-gray-700">P{pillar.number}: {pillar.name}</span>{isCurrent&&<span className="badge badge-teal text-xs">Current</span>}</div>
                        <span className="text-sm font-semibold text-gray-900">{pct}%</span>
                      </div>
                      <div className="progress-bar"><div className="progress-fill" style={{width:`${pct}%`}} /></div>
                    </div>
                  )
                })}
              </div>
            </div>
            <div className="card p-5">
              <p className="section-title">Institution types</p>
              {Object.keys(stats.inst_breakdown).length===0 ? <p className="text-sm text-gray-400">No data yet.</p> : (
                <div className="space-y-3">
                  {Object.entries(stats.inst_breakdown).sort(([,a],[,b])=>b-a).map(([type,count])=>{
                    const pct=Math.round((count/stats.enrolled)*100)
                    return (
                      <div key={type}>
                        <div className="flex items-center justify-between mb-1.5"><span className="text-sm font-medium text-gray-700 capitalize">{type}</span><span className="text-sm text-gray-500">{count} ({pct}%)</span></div>
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden"><div className={`h-full rounded-full ${instColors[type]||'bg-gray-400'}`} style={{width:`${pct}%`}} /></div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
          <div className="card p-5">
            <p className="section-title">Cohort timeline</p>
            <div className="flex items-center gap-1">
              {Array.from({length:12},(_,i)=>{
                const week=i+1; const isPast=week<selectedCohort.current_week; const isCurrent=week===selectedCohort.current_week
                return <div key={week} className={`flex-1 h-8 rounded flex items-center justify-center text-xs font-medium ${isCurrent?'bg-teal-700 text-white':isPast?'bg-teal-100 text-teal-700':'bg-gray-100 text-gray-400'}`}>{week}</div>
              })}
            </div>
            <div className="flex items-center justify-between text-xs text-gray-400 mt-1"><span>Week 1</span><span>Week {selectedCohort.current_week} (current)</span><span>Week 12</span></div>
          </div>
        </>
      ) : <div className="card p-10 text-center"><p className="text-sm text-gray-400">Select a cohort to view analytics.</p></div>}
    </div>
  )
}
