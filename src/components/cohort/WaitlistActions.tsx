'use client'
import { useState } from 'react'
import { openCohort, admitStudent } from '@/lib/actions/cohort'
import { useRouter } from 'next/navigation'

export function WaitlistActions({ cohortId, count, waitlistId, studentId, single=false }: { cohortId?: string; count?: number; waitlistId?: string; studentId?: string; single?: boolean }) {
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const router = useRouter()

  async function handleAdmitAll() {
    if (!cohortId) return
    if (!confirm(`Admit all ${count} waitlisted students?`)) return
    setLoading(true)
    await openCohort(cohortId)
    setLoading(false); router.refresh()
  }

  async function handleAdmitOne() {
    if (!waitlistId || !cohortId || !studentId) return
    setLoading(true)
    const res = await admitStudent(waitlistId, cohortId, studentId)
    setLoading(false)
    if (res.success) { setDone(true); router.refresh() }
  }

  if (done) return <span className="badge badge-teal text-xs">Admitted</span>
  if (single) return <button onClick={handleAdmitOne} disabled={loading} className="btn-primary text-xs py-1 px-2.5">{loading?'...':'Admit'}</button>
  return <button onClick={handleAdmitAll} disabled={loading} className="btn-primary text-sm">{loading?'Opening...':`Open cohort & admit ${count}`}</button>
}
