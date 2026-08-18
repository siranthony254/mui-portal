'use client'

import { useState } from 'react'
import { MessageSquare, User, Users, ShieldCheck, Search, ChevronRight, Clock } from '@/components/icons'
import { formatDate, cn } from '@/lib/utils'
import Link from 'next/link'

export function ConversationExplorer({ conversations, profiles }: { conversations: any[], profiles: any[] }) {
  const [search, setSearch] = useState('')

  const getProfile = (id: string) => profiles.find(p => p.id === id)

  const filtered = conversations.filter(c => {
    const participants = c.participant_ids.map((id: string) => getProfile(id)?.full_name || '').join(' ').toLowerCase()
    return participants.includes(search.toLowerCase()) || (c.last_message || '').toLowerCase().includes(search.toLowerCase())
  })

  return (
    <div className="space-y-6">
      <div className="card p-4 flex items-center gap-3">
         <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search across all active conversations..."
                className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 border-gray-100 rounded-xl focus:border-emerald-500 focus:ring-0 transition-all"
            />
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(convo => {
          const participants = convo.participant_ids.map((id: string) => getProfile(id)).filter(Boolean)
          const isGroup = convo.participant_ids.length > 2

          return (
            <Link
                key={convo.id}
                href={`/admin/messages?convo=${convo.id}`}
                className="card p-5 hover:bg-gray-50/50 transition-all group border-l-4 border-l-transparent hover:border-l-teal-600"
            >
              <div className="flex justify-between items-start mb-3">
                 <div className="flex -space-x-2">
                    {participants.slice(0, 3).map((p: any) => (
                      <div key={p.id} className="w-8 h-8 rounded-full bg-white p-0.5 border border-gray-100">
                        <div className="w-full h-full rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-[10px] font-black">
                           {p.full_name[0]}
                        </div>
                      </div>
                    ))}
                 </div>
                 <div className="text-right">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                       {convo.last_message_at ? formatDate(convo.last_message_at) : 'No Activity'}
                    </p>
                 </div>
              </div>

              <div className="space-y-2">
                 <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-gray-900 truncate max-w-[200px]">
                       {participants.map((p: any) => p.full_name).join(', ')}
                    </p>
                    {isGroup && <span className="badge badge-blue text-[8px] py-0">Group</span>}
                 </div>
                 <p className="text-xs text-gray-500 line-clamp-1 italic font-medium">
                    "{convo.last_message || 'No messages yet.'}"
                 </p>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                 <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> Audit Access
                 </span>
                 <ChevronRight className="w-4 h-4 text-gray-400" />
              </div>
            </Link>
          )
        })}
      </div>

      {filtered.length === 0 && (
          <div className="card p-12 text-center text-gray-400 italic text-sm">
             No conversations match your search criteria.
          </div>
      )}
    </div>
  )
}
