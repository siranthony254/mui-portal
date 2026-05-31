import { redirect } from 'next/navigation'
export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase/server'
import { MessagesClient } from '@/components/chat/MessagesClient'
import { Metadata } from 'next'
export const metadata: Metadata = { title: 'Messages' }

export default async function MessagesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  if (!profile) redirect('/auth/login')

  const { data: conversations } = await supabase.from('conversations').select('*')
    .contains('participant_ids', [user.id]).order('last_message_at', { ascending: false }).limit(20)

  const allIds = [...new Set((conversations||[]).flatMap((c:any) => c.participant_ids).filter((id:string) => id !== user.id))]
  const { data: participantProfiles } = allIds.length
    ? await supabase.from('profiles').select('id,full_name,avatar_url,role,institution').in('id', allIds)
    : { data: [] }

  let contactableUsers: any[] = []
  if (profile.role === 'student') {
    const { data: enrollment } = await supabase.from('enrollments').select('mentor_id,mentor:profiles!mentor_id(id,full_name,role,avatar_url)').eq('student_id', user.id).in('status',['enrolled','active']).single()
    if (enrollment?.mentor) contactableUsers = [enrollment.mentor]
  } else if (profile.role === 'mentor') {
    const { data: enrollments } = await supabase.from('enrollments').select('student:profiles!student_id(id,full_name,role,avatar_url,institution)').eq('mentor_id', user.id).in('status',['enrolled','active'])
    contactableUsers = enrollments?.map((e:any) => e.student).filter(Boolean) || []
  } else if (profile.role === 'admin') {
    const { data: users } = await supabase.from('profiles').select('id,full_name,role,avatar_url,institution').neq('id', user.id).eq('approved', true).order('created_at',{ascending:false}).limit(30)
    contactableUsers = users || []
  }

  return (
    <MessagesClient
      currentUser={profile}
      conversations={conversations || []}
      participantProfiles={participantProfiles || []}
      contactableUsers={contactableUsers}
    />
  )
}
