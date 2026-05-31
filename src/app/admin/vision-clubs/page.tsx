import { createClient } from '@/lib/supabase/server'
export const dynamic = 'force-dynamic'
import { redirect } from 'next/navigation'
import { formatDate } from '@/lib/utils'
import { VisionClubActivate } from '@/components/cohort/VisionClubActivate'
import { Metadata } from 'next'
export const metadata: Metadata = { title: 'Vision Clubs' }

export default async function VisionClubsAdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: clubs } = await supabase.from('vision_clubs').select('*,mentor:profiles!mentor_id(id,full_name),creator:profiles!created_by(id,full_name),members:vision_club_members(id,role,student:profiles!student_id(id,full_name,institution_type))').order('created_at',{ascending:false})
  const { data: approvedMentors } = await supabase.from('profiles').select('id,full_name').eq('role','mentor').eq('approved',true)

  const pending = clubs?.filter(c=>c.status==='pending')||[]
  const active = clubs?.filter(c=>c.status==='active')||[]

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="page-header">
        <h1 className="page-title">Vision Clubs</h1>
        <div className="flex items-center gap-2">
          {pending.length>0 && <span className="badge badge-amber">{pending.length} pending</span>}
          <span className="badge badge-teal">{active.length} active</span>
        </div>
      </div>

      <div className="card p-4 bg-teal-50 border-teal-100">
        <p className="text-sm font-medium text-teal-800 mb-1">Admin activation required</p>
        <p className="text-xs text-teal-700">Vision Clubs are only visible to students after you manually activate them. Activate only after founding members have completed their formation journey.</p>
      </div>

      {pending.length > 0 && (
        <div className="space-y-3">
          <p className="section-title">Pending activation — {pending.length}</p>
          {pending.map((club:any) => (
            <div key={club.id} className="card p-5">
              <div className="flex items-start gap-4 justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1"><h3 className="font-semibold text-gray-900">{club.name}</h3><span className="badge badge-amber text-xs">Pending</span></div>
                  <p className="text-sm text-gray-600 mb-2">{club.problem_statement}</p>
                  {club.description && <p className="text-xs text-gray-500 mb-3">{club.description}</p>}
                  <div className="flex items-center gap-3 text-xs text-gray-400 flex-wrap">
                    <span>Created by {club.creator?.full_name}</span><span>·</span>
                    <span>{club.members?.length||0} members</span><span>·</span>
                    <span>{formatDate(club.created_at)}</span>
                  </div>
                  {club.members?.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {club.members.map((m:any) => (
                        <div key={m.id} className="flex items-center gap-1 bg-gray-50 rounded-lg px-2 py-1">
                          <span className="text-xs font-medium text-gray-700">{m.student?.full_name?.split(' ')[0]}</span>
                          {m.role==='founder' && <span className="badge badge-teal text-xs py-0">founder</span>}
                          <span className={`badge text-xs py-0 ${m.student?.institution_type==='tvet'?'badge-blue':'badge-gray'}`}>{m.student?.institution_type||'uni'}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <VisionClubActivate clubId={club.id} mentors={approvedMentors||[]} currentMentorId={club.mentor_id} />
              </div>
            </div>
          ))}
        </div>
      )}

      {active.length > 0 && (
        <div className="space-y-3">
          <p className="section-title">Active clubs — {active.length}</p>
          {active.map((club:any) => (
            <div key={club.id} className="card p-5">
              <div className="flex items-center gap-2 mb-1"><h3 className="font-semibold text-gray-900">{club.name}</h3><span className="badge badge-teal text-xs">Active</span></div>
              <p className="text-sm text-gray-600 mb-2">{club.problem_statement}</p>
              <div className="flex items-center gap-3 text-xs text-gray-400">
                {club.mentor?.full_name && <><span>Mentor: {club.mentor.full_name}</span><span>·</span></>}
                <span>{club.members?.length||0} members</span><span>·</span>
                <span>Activated {club.activated_at?formatDate(club.activated_at):'—'}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {clubs?.length===0 && <div className="card p-10 text-center"><p className="text-sm text-gray-400">No vision clubs yet. Students create clubs after completing their formation.</p></div>}
    </div>
  )
}
