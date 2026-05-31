'use client'
import { useState } from 'react'
import { activateVisionClub } from '@/lib/actions/cohort'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export function VisionClubActivate({ clubId, mentors, currentMentorId }: { clubId: string; mentors: any[]; currentMentorId?: string|null }) {
  const [loading, setLoading] = useState(false)
  const [mentorId, setMentorId] = useState(currentMentorId||'')
  const [done, setDone] = useState(false)
  const router = useRouter()

  async function handleActivate() {
    if (!confirm('Activate this Vision Club? Students will see it immediately.')) return
    setLoading(true)
    if (mentorId) {
      const supabase = createClient()
      await supabase.from('vision_clubs').update({ mentor_id: mentorId }).eq('id', clubId)
    }
    const res = await activateVisionClub(clubId)
    setLoading(false)
    if (res.success) { setDone(true); router.refresh() }
  }

  if (done) return <span className="badge badge-teal">Activated</span>
  return (
    <div className="flex flex-col gap-2 flex-shrink-0 min-w-40">
      {mentors.length > 0 && (
        <select value={mentorId} onChange={e=>setMentorId(e.target.value)} className="select text-xs py-1.5">
          <option value="">Assign mentor (optional)</option>
          {mentors.map(m=><option key={m.id} value={m.id}>{m.full_name}</option>)}
        </select>
      )}
      <button onClick={handleActivate} disabled={loading} className="btn-primary text-xs py-1.5 justify-center">
        {loading?'Activating...':'Activate club'}
      </button>
    </div>
  )
}
