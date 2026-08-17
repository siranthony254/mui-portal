import { createClient } from '@/lib/supabase/server'
export const dynamic = 'force-dynamic'
import { redirect } from 'next/navigation'
import { Lock, Lightbulb } from '@/components/icons'
import { joinVisionClub } from '@/lib/actions/cohort'
import { Metadata } from 'next'
export const metadata: Metadata = { title: 'Vision Clubs' }

export default async function VisionClubsStudentPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: enrollment } = await supabase.from('enrollments').select('*,cohort:cohorts(id,name,vision_clubs_enabled)').eq('student_id',user.id).in('status',['enrolled','active']).single()
  const cohort = enrollment?.cohort as any
  const clubsEnabled = cohort?.vision_clubs_enabled===true

  const { data: clubs } = clubsEnabled && cohort?.id
    ? await supabase.from('vision_clubs').select('*,mentor:profiles!mentor_id(id,full_name),members:vision_club_members(id,role,student:profiles!student_id(id,full_name,institution_type))').eq('cohort_id',cohort.id).eq('status','active')
    : { data:[] }

  const { data: myMembership } = await supabase.from('vision_club_members').select('club_id,role').eq('student_id',user.id).single()

  if (!clubsEnabled) return (
    <div className="max-w-lg mx-auto py-16 text-center">
      <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-5"><Lock className="w-7 h-7 text-gray-400" /></div>
      <h1 className="text-xl font-semibold text-gray-900 mb-2">Vision Clubs not yet active</h1>
      <p className="text-sm text-gray-500 mb-4">Vision Clubs are activated by the MUI team after cohort participants have completed their formation journey. Keep progressing through your pillars.</p>
      <div className="bg-teal-50 rounded-xl p-4 text-left"><p className="text-xs font-medium text-teal-800 mb-1">What is a Vision Club?</p><p className="text-xs text-teal-700">A Vision Club is a small intercampus group that works together on a specific real-world problem over a full semester — with a mentor, a clear goal, and a documented Vision Report at the end.</p></div>
    </div>
  )

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="page-header"><h1 className="page-title">Vision Clubs</h1><span className="badge badge-teal">{clubs?.length||0} active</span></div>
      <div className="bg-teal-50 rounded-xl p-4"><p className="text-sm font-medium text-teal-800 mb-1">What is a Vision Club?</p><p className="text-xs text-teal-700">Vision Clubs are small intercampus groups that steward a specific solution together over a full semester. Each club has a problem statement, a mentor, and produces a documented Vision Report.</p></div>
      {clubs?.length===0 ? (
        <div className="card p-10 text-center"><Lightbulb className="w-8 h-8 text-gray-300 mx-auto mb-3" /><p className="text-sm text-gray-400">No Vision Clubs active yet. Check back soon.</p></div>
      ) : (
        <div className="space-y-4">
          {clubs?.map((club:any)=>{
            const members = club.members as any[]
            const mentor = club.mentor as any
            const isMember = myMembership?.club_id===club.id
            return (
              <div key={club.id} className="card p-5">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1"><h3 className="font-semibold text-gray-900">{club.name}</h3>{isMember&&<span className="badge badge-teal text-xs">Joined</span>}</div>
                    <p className="text-sm text-gray-600 mb-2">{club.problem_statement}</p>
                    {club.description && <p className="text-xs text-gray-500">{club.description}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-400 mb-3">
                  {mentor?.full_name && <span>Mentor: <span className="text-gray-600 font-medium">{mentor.full_name}</span></span>}
                  <span>{members?.length||0} members</span><span>{club.campus_count} campus{club.campus_count>1?'es':''}</span>
                </div>
                {members?.length>0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {members.map((m:any)=>(
                      <div key={m.id} className="flex items-center gap-1 bg-gray-50 rounded-lg px-2 py-1">
                        <span className="text-xs text-gray-700">{m.student?.full_name?.split(' ')[0]}</span>
                        {m.role==='founder'&&<span className="badge badge-amber text-xs py-0">founder</span>}
                      </div>
                    ))}
                  </div>
                )}
                {!isMember && !myMembership && (
                  <JoinClubButton clubId={club.id} />
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function JoinClubButton({ clubId }: { clubId: string }) {
  const joinClubWithId = async (_formData: FormData) => {
    'use server'
    await joinVisionClub(clubId)
  }
  return (
    <form action={joinClubWithId}>
      <button type="submit" className="btn-secondary text-xs">Request to join</button>
    </form>
  )
}
