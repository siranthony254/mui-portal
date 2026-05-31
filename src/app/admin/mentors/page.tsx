import { createClient } from '@/lib/supabase/server'
export const dynamic = 'force-dynamic'
import { redirect } from 'next/navigation'
import { formatDate } from '@/lib/utils'
import { MentorActions } from '@/components/cohort/MentorActions'
import { Metadata } from 'next'
export const metadata: Metadata = { title: 'Mentors' }

export default async function MentorsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: mentors } = await supabase.from('profiles').select('*').eq('role','mentor').order('created_at',{ascending:false})
  const { data: assignments } = await supabase.from('enrollments').select('mentor_id').not('mentor_id','is',null)
  const assignMap = (assignments||[]).reduce<Record<string,number>>((acc,e) => { if(e.mentor_id) acc[e.mentor_id]=(acc[e.mentor_id]||0)+1; return acc }, {})

  const pending = mentors?.filter(m=>!m.approved)||[]
  const approved = mentors?.filter(m=>m.approved)||[]

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="page-header">
        <h1 className="page-title">Mentors</h1>
        <div className="flex gap-2">
          {pending.length>0 && <span className="badge badge-amber">{pending.length} pending</span>}
          <span className="badge badge-teal">{approved.length} approved</span>
        </div>
      </div>

      {pending.length > 0 && (
        <div className="card overflow-hidden">
          <div className="px-5 py-3.5 bg-amber-50 border-b border-amber-100">
            <p className="text-sm font-semibold text-amber-800">Pending approval — {pending.length}</p>
          </div>
          <div className="divide-y divide-gray-50">
            {pending.map(mentor => (
              <div key={mentor.id} className="px-5 py-4 flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-sm font-semibold flex-shrink-0">{mentor.full_name.split(' ').map((n:string)=>n[0]).join('').slice(0,2)}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900">{mentor.full_name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{mentor.email}</p>
                  {mentor.bio && <p className="text-xs text-gray-600 mt-1.5 line-clamp-2">{mentor.bio}</p>}
                  <p className="text-xs text-gray-400 mt-1">Applied {formatDate(mentor.created_at)}</p>
                </div>
                <MentorActions mentorId={mentor.id} approved={false} />
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card overflow-hidden">
        <div className="px-5 py-3.5 border-b border-gray-100 bg-gray-50"><p className="text-sm font-semibold text-gray-700">Approved mentors — {approved.length}</p></div>
        <div className="divide-y divide-gray-50">
          {approved.length===0 ? <div className="px-5 py-8 text-center"><p className="text-sm text-gray-400">No approved mentors yet.</p></div>
          : approved.map(mentor => (
            <div key={mentor.id} className="px-5 py-4 flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-semibold flex-shrink-0">{mentor.full_name.split(' ').map((n:string)=>n[0]).join('').slice(0,2)}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2"><p className="text-sm font-semibold text-gray-900">{mentor.full_name}</p><span className="badge badge-teal text-xs">Approved</span></div>
                <p className="text-xs text-gray-400 mt-0.5">{mentor.email}</p>
                {mentor.bio && <p className="text-xs text-gray-600 mt-1.5 line-clamp-2">{mentor.bio}</p>}
                <p className="text-xs text-gray-400 mt-1">{assignMap[mentor.id]||0} students assigned</p>
              </div>
              <MentorActions mentorId={mentor.id} approved={true} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
