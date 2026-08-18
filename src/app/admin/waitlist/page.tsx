import { createClient } from '@/lib/supabase/server'
export const dynamic = 'force-dynamic'
import { redirect } from 'next/navigation'
import { formatDate } from '@/lib/utils'
import { WaitlistActions } from '@/components/cohort/WaitlistActions'
import { Metadata } from 'next'
export const metadata: Metadata = { title: 'Waitlist' }

export default async function WaitlistPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: cohorts } = await supabase.from('cohorts').select('id,name,semester,year,status').order('created_at',{ascending:false})
  const { data: waitlist } = await supabase.from('waitlist').select('*,student:profiles!student_id(id,full_name,email,institution,institution_type,year_of_study,county,created_at),cohort:cohorts(id,name)').eq('status','waiting').order('applied_at',{ascending:true})

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="page-header">
        <div><h1 className="page-title">Waitlist</h1><p className="text-sm text-gray-500 mt-0.5">{waitlist?.length||0} students waiting</p></div>
      </div>

      {cohorts?.filter(c=>c.status!=='completed').map(cohort => {
        const cw = waitlist?.filter(w=>w.cohort_id===cohort.id)||[]
        if (!cw.length) return null
        return (
          <div key={cohort.id} className="card p-5 border-l-4 border-l-amber-400">
            <div className="flex items-center justify-between gap-4">
              <div><h3 className="font-semibold text-gray-900">{cohort.name}</h3><p className="text-sm text-gray-500">{cw.length} students waiting · {cohort.status.replace('_',' ')}</p></div>
              <WaitlistActions cohortId={cohort.id} count={cw.length} />
            </div>
          </div>
        )
      })}

      <div className="card overflow-hidden">
        <div className="px-5 py-3.5 border-b border-gray-100 bg-gray-50 grid grid-cols-12 gap-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
          <span className="col-span-1">#</span><span className="col-span-3">Student</span><span className="col-span-2">Institution</span><span className="col-span-1">Type</span><span className="col-span-1">Year</span><span className="col-span-2">County</span><span className="col-span-1">Applied</span><span className="col-span-1">Action</span>
        </div>
        <div className="divide-y divide-gray-50">
          {waitlist?.length===0 ? (
            <div className="px-5 py-10 text-center"><p className="text-sm text-gray-400">No students on the waitlist.</p></div>
          ) : waitlist?.map(entry => {
            const s = entry.student as any
            if (!s) return null
            return (
              <div key={entry.id} className="grid grid-cols-12 gap-3 px-5 py-3 items-center hover:bg-gray-50">
                <span className="col-span-1 text-sm font-semibold text-teal-700">#{entry.position}</span>
                <div className="col-span-3 flex items-center gap-2 min-w-0">
                  <div className="w-7 h-7 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-xs font-semibold flex-shrink-0">{s.full_name?.split(' ').map((n:string)=>n[0]).join('').slice(0,2)}</div>
                  <div className="min-w-0"><p className="text-sm font-medium text-gray-900 truncate">{s.full_name}</p><p className="text-xs text-gray-400 truncate">{s.email}</p></div>
                </div>
                <div className="col-span-2 min-w-0"><p className="text-xs text-gray-700 truncate">{s.institution}</p></div>
                <div className="col-span-1"><span className={`badge text-xs ${s.institution_type==='tvet'?'badge-blue':s.institution_type==='kmtc'?'badge-purple':'badge-teal'}`}>{s.institution_type||'uni'}</span></div>
                <div className="col-span-1"><p className="text-xs text-gray-600">{s.year_of_study}</p></div>
                <div className="col-span-2"><p className="text-xs text-gray-600 truncate">{s.county}</p></div>
                <div className="col-span-1"><p className="text-xs text-gray-400">{formatDate(entry.applied_at)}</p></div>
                <div className="col-span-1"><WaitlistActions waitlistId={entry.id} cohortId={entry.cohort_id} studentId={s.id} student={s} single /></div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
