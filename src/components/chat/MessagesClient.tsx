'use client'
import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { sendMessage, getOrCreateConversation } from '@/lib/actions/messages'
import { uploadSanityAsset } from '@/lib/actions/sanity'
import { getInitials, timeAgo, cn } from '@/lib/utils'
import type { Profile } from '@/types'
import { Send, Plus, Search, ShieldCheck, Mic2, Square, Play, Pause } from '@/components/icons'
import { VoiceRecorder } from '@/components/ui/VoiceRecorder'

interface Props {
  currentUser: Profile
  conversations: any[]
  participantProfiles: any[]
  contactableUsers: any[]
  compact?: boolean
  readOnly?: boolean
}

export function MessagesClient({ currentUser, conversations: initial, participantProfiles, contactableUsers, compact = false, readOnly = false, initialConvoId, initialUserId }: Props & { initialConvoId?: string | null, initialUserId?: string | null }) {
  const [conversations, setConversations] = useState(initial)
  const [activeConvoId, setActiveConvoId] = useState<string|null>(initialConvoId || initial[0]?.id || null)
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [search, setSearch] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  // Handle initial user pre-selection
  useEffect(() => {
    if (initialUserId && !initialConvoId) {
        startConvo(initialUserId)
    }
  }, [initialUserId])
  const supabase = createClient()
  const profileMap = new Map(participantProfiles.map((p:any) => [p.id, p]))

  function getOther(convo: any) {
    const otherId = convo.participant_ids.find((id:string) => id !== currentUser.id)
    return profileMap.get(otherId) || { full_name:'Unknown', role:'student' }
  }

  useEffect(() => {
    if (!activeConvoId) return
    supabase.from('messages').select('*,sender:profiles!sender_id(id,full_name,avatar_url,role)')
      .eq('conversation_id', activeConvoId).order('created_at',{ascending:true}).limit(50)
      .then(({ data }) => setMessages(data || []))

    const channel = supabase.channel(`msgs:${activeConvoId}`)
      .on('postgres_changes',{ event:'INSERT', schema:'public', table:'messages', filter:`conversation_id=eq.${activeConvoId}` },
        async (payload) => {
          const { data } = await supabase.from('messages').select('*,sender:profiles!sender_id(id,full_name,avatar_url,role)').eq('id', payload.new.id).single()
          if (data) setMessages(prev => [...prev, data])
        })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [activeConvoId])

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:'smooth' }) }, [messages])

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    if (!activeConvoId || !newMessage.trim() || sending) return
    setSending(true)
    await sendMessage(activeConvoId, newMessage.trim())
    setNewMessage(''); setSending(false)
  }

  const handleVoiceUpload = async (file: File) => {
    if (!activeConvoId) return
    setSending(true)
    const formData = new FormData()
    formData.append('file', file)
    const resAsset = await uploadSanityAsset(formData)
    if (resAsset.success && resAsset.url) {
        await sendMessage(activeConvoId, '', resAsset.url)
    }
    setSending(false)
  }

  async function startConvo(userId: string) {
    const result = await getOrCreateConversation(userId)
    if (result.conversationId) {
      setActiveConvoId(result.conversationId); setShowNew(false)
      const { data } = await supabase.from('conversations').select('*').contains('participant_ids',[currentUser.id]).order('last_message_at',{ascending:false}).limit(20)
      if (data) setConversations(data)
    }
  }

  const activeConvo = conversations.find(c => c.id === activeConvoId)
  const otherParticipant = activeConvo ? getOther(activeConvo) : null
  const filteredContacts = contactableUsers.filter((u:any) => u.full_name?.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className={cn("flex gap-4", compact ? "h-full w-full" : "h-[calc(100vh-8rem)]")}>
      <div className={cn("flex-shrink-0 card flex flex-col overflow-hidden", compact ? "w-48" : "w-72")}>
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-900">Messages</h2>
          {!readOnly && (
            <button onClick={() => setShowNew(!showNew)} className="w-7 h-7 bg-teal-50 hover:bg-teal-100 text-teal-700 rounded-lg flex items-center justify-center transition-colors">
              <Plus className="w-4 h-4" />
            </button>
          )}
        </div>
        {showNew && !readOnly && (
          <div className="p-3 border-b border-gray-100 bg-gray-50">
            <p className="text-xs font-medium text-gray-500 mb-2">New conversation</p>
            <div className="relative mb-2">
              <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-gray-400" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." className="input pl-8 text-xs py-1.5" />
            </div>
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {filteredContacts.map((u:any) => (
                <button key={u.id} onClick={() => startConvo(u.id)} className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-white text-left">
                  <div className="w-7 h-7 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-xs font-semibold">{getInitials(u.full_name)}</div>
                  <div className="min-w-0"><p className="text-xs font-medium text-gray-900 truncate">{u.full_name}</p><p className="text-xs text-gray-400 capitalize">{u.role}</p></div>
                </button>
              ))}
              {filteredContacts.length === 0 && <p className="text-xs text-gray-400 text-center py-2">No contacts found</p>}
            </div>
          </div>
        )}
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-8">No conversations yet.</p>
          ) : conversations.map(convo => {
            const other = getOther(convo)
            const isActive = convo.id === activeConvoId
            return (
              <button key={convo.id} onClick={() => setActiveConvoId(convo.id)}
                className={cn('w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 border-b border-gray-50 text-left', isActive && 'bg-teal-50 hover:bg-teal-50')}>
                <div className={cn('w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0',
                  other.role==='mentor'?'bg-blue-100 text-blue-700':other.role==='admin'?'bg-purple-100 text-purple-700':'bg-teal-100 text-teal-700')}>
                  {getInitials((other as any).full_name||'U')}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <p className={cn('text-sm truncate', isActive?'font-semibold text-teal-700':'font-medium text-gray-900')}>{(other as any).full_name}</p>
                    {convo.last_message_at && <span className="text-xs text-gray-400 flex-shrink-0">{timeAgo(convo.last_message_at)}</span>}
                  </div>
                  <p className="text-xs text-gray-400 truncate mt-0.5">{convo.last_message || 'Start a conversation'}</p>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      <div className="flex-1 card flex flex-col overflow-hidden">
        {activeConvoId && otherParticipant ? (
          <>
            <div className="px-5 py-3.5 border-b border-gray-100 flex items-center gap-3">
              <div className={cn('w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0',
                (otherParticipant as any).role==='mentor'?'bg-blue-100 text-blue-700':'bg-teal-100 text-teal-700')}>
                {getInitials((otherParticipant as any).full_name||'U')}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{(otherParticipant as any).full_name}</p>
                <p className="text-xs text-gray-400 capitalize">{(otherParticipant as any).role}</p>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              {messages.length === 0 && <p className="text-sm text-gray-400 text-center py-8">No messages yet. Say hello!</p>}
              {messages.map(msg => {
                const isMe = msg.sender_id === currentUser.id
                return (
                  <div key={msg.id} className={cn('flex gap-2', isMe && 'flex-row-reverse')}>
                    {!isMe && <div className="w-7 h-7 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-xs font-semibold flex-shrink-0 mt-auto">{getInitials(msg.sender?.full_name||'U')}</div>}
                    <div className={cn('max-w-xs lg:max-w-md', isMe && 'items-end flex flex-col')}>
                      <div className={cn('px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed', isMe?'chat-bubble-out':'chat-bubble-in')}>
                        {msg.audio_url ? (
                            <div className="flex items-center gap-3 py-1">
                                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                                    <Play className="w-4 h-4 fill-current ml-0.5" />
                                </div>
                                <audio src={msg.audio_url} controls className="max-w-[200px] h-8" />
                            </div>
                        ) : (
                            msg.content
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mt-1 px-1">{timeAgo(msg.created_at)}</p>
                    </div>
                  </div>
                )
              })}
              <div ref={bottomRef} />
            </div>
            {!readOnly && (
              <form onSubmit={handleSend} className="p-4 border-t border-gray-100 flex items-center gap-2">
                <VoiceRecorder onUpload={handleVoiceUpload} compact label="Record message" />
                <input value={newMessage} onChange={e => setNewMessage(e.target.value)} placeholder="Type a message..." className="input flex-1" disabled={sending} />
                <button type="submit" disabled={sending || !newMessage.trim()} className="btn-primary px-3 py-2 transition-all active:scale-95"><Send className="w-4 h-4" /></button>
              </form>
            )}
            {readOnly && (
               <div className="p-4 bg-gray-50 border-t border-gray-100 text-center">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center justify-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5" /> Read-Only Audit Session
                  </p>
               </div>
            )}
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3"><Send className="w-5 h-5 text-gray-400" /></div>
              <p className="text-sm font-medium text-gray-600">Select a conversation</p>
              <p className="text-xs text-gray-400 mt-1">Or start a new one with the + button</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
