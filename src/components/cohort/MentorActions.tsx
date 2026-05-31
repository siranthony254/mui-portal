'use client'
import { useState } from 'react'
import { approveMentor } from '@/lib/actions/cohort'
import { useRouter } from 'next/navigation'

export function MentorActions({ mentorId, approved }: { mentorId: string; approved: boolean }) {
  const [loading, setLoading] = useState<string|null>(null)
  const router = useRouter()

  async function handle(approve: boolean) {
    setLoading(approve?'approve':'reject')
    await approveMentor(mentorId, approve)
    setLoading(null); router.refresh()
  }

  if (!approved) return (
    <div className="flex gap-2 flex-shrink-0">
      <button onClick={() => handle(true)} disabled={loading!==null} className="btn-primary text-xs py-1.5 px-3">{loading==='approve'?'...':'Approve'}</button>
      <button onClick={() => handle(false)} disabled={loading!==null} className="btn-secondary text-xs py-1.5 px-3 text-red-600 hover:bg-red-50">{loading==='reject'?'...':'Reject'}</button>
    </div>
  )
  return <button onClick={() => handle(false)} disabled={loading!==null} className="btn-secondary text-xs py-1.5 px-3 text-red-600 hover:bg-red-50 flex-shrink-0">{loading?'...':'Revoke'}</button>
}
