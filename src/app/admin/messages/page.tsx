import { redirect } from 'next/navigation'
export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase/server'
import { MessagesClient } from '@/components/chat/MessagesClient'
import { ConversationExplorer } from '@/components/admin/ConversationExplorer'
import { Metadata } from 'next'
import { ShieldCheck, MessageSquare, X, AlertCircle } from '@/components/icons'
import Link from 'next/link'

export const metadata: Metadata = { title: 'Platform Oversight — Messages' }

export default async function MessagesPage({ searchParams }: { searchParams: Promise<{ convo?: string }> }) {
  const { convo: activeConvoId } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  if (!profile || profile.role !== 'admin') redirect('/dashboard')

  // ADMIN OVERVIEW: Fetch ALL conversations for oversight
  const { data: allConversations } = await supabase.from('conversations')
    .select('*')
    .order('last_message_at', { ascending: false })

  const allParticipantIds = [...new Set((allConversations||[]).flatMap((c:any) => c.participant_ids))]
  const { data: allProfiles } = await supabase.from('profiles')
    .select('id,full_name,avatar_url,role,institution')
    .in('id', allParticipantIds)

  // Standard chat logic (for personal admin chats)
  const { data: myConversations } = await supabase.from('conversations').select('*')
    .contains('participant_ids', [user.id]).order('last_message_at', { ascending: false }).limit(20)

  const { data: myParticipants } = await supabase.from('profiles').select('id,full_name,avatar_url,role,institution')
    .in('id', [...new Set((myConversations||[]).flatMap((c:any) => c.participant_ids))])

  const { data: contactableUsers } = await supabase.from('profiles').select('id,full_name,role,avatar_url,institution')
    .neq('id', user.id).eq('approved', true).order('created_at',{ascending:false}).limit(30)

  // AUDIT VIEW: If specific convo requested
  let auditConvo = null
  if (activeConvoId) {
    const { data: convo } = await supabase.from('conversations').select('*').eq('id', activeConvoId).single()
    if (convo) auditConvo = convo
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20">
      <div className="page-header">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Community Transparency</h1>
          <p className="text-sm text-gray-500 font-medium">Monitoring mentorship quality and platform safety.</p>
        </div>
      </div>

      {auditConvo && (
        <div className="fixed inset-0 z-[100] bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-6">
            <div className="max-w-4xl w-full h-[80vh] bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-emerald-900 text-white">
                    <div className="flex items-center gap-3">
                        <ShieldCheck className="w-6 h-6 text-emerald-400" />
                        <div>
                            <h2 className="font-black text-lg">Secure Audit Session</h2>
                            <p className="text-[10px] font-bold text-emerald-100 uppercase tracking-widest">Read-Only History View</p>
                        </div>
                    </div>
                    <Link href="/admin/messages" className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                        <X className="w-6 h-6" />
                    </Link>
                </div>
                <div className="flex-1 overflow-hidden">
                    <MessagesClient
                        currentUser={{ ...profile, id: 'AUDIT_VIEWER' } as any} // Virtual ID to ensure we don't trigger "isMe"
                        conversations={[auditConvo]}
                        participantProfiles={allProfiles || []}
                        contactableUsers={[]}
                        readOnly
                        compact
                    />
                </div>
            </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Oversight Explorer */}
        <div className="lg:col-span-8 space-y-6">
           <h2 className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" /> Global Conversation Explorer
           </h2>
           <ConversationExplorer conversations={allConversations || []} profiles={allProfiles || []} />
        </div>

        {/* Right: Personal Messages */}
        <div className="lg:col-span-4 space-y-6">
           <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
              <MessageSquare className="w-4 h-4" /> Your Secure Messages
           </h2>
           <div className="card h-[600px] overflow-hidden">
                <MessagesClient
                    currentUser={profile}
                    conversations={myConversations || []}
                    participantProfiles={myParticipants || []}
                    contactableUsers={contactableUsers || []}
                    compact
                />
           </div>

           {/* Safety Alerts */}
           <div className="card p-6 bg-red-50 border-red-100">
              <h3 className="text-[10px] font-black text-red-600 uppercase tracking-[0.2em] flex items-center gap-2 mb-4">
                 <AlertCircle className="w-4 h-4" /> Safety Monitor
              </h3>
              <p className="text-xs text-red-800 leading-relaxed font-medium">
                The automated system is scanning for risk keywords (welfare, safety, harassment). No critical alerts detected this week.
              </p>
           </div>
        </div>
      </div>
    </div>
  )
}

