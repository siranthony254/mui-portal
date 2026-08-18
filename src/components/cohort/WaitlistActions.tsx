'use client'
import { useState } from 'react'
import { openCohort, admitStudent } from '@/lib/actions/cohort'
import { useRouter } from 'next/navigation'
import { PersonalizedAcceptanceForm } from '@/components/admin/PersonalizedAcceptanceForm'
import { Zap } from '@/components/icons'

export function WaitlistActions({ cohortId, count, waitlistId, studentId, student, single=false }: { cohortId?: string; count?: number; waitlistId?: string; studentId?: string; student?: any; single?: boolean }) {
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [showSequence, setShowSequence] = useState(false)
  const router = useRouter()

  async function handleAdmitAll() {
    if (!cohortId) return
    if (!confirm(`Admit all ${count} waitlisted students?`)) return
    setLoading(true)
    await openCohort(cohortId)
    setLoading(false); router.refresh()
  }

  if (showSequence && student && cohortId) {
    return (
        <div className="fixed inset-0 z-[100] bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-6">
            <div className="max-w-2xl w-full">
                <PersonalizedAcceptanceForm
                    student={student}
                    cohortId={cohortId}
                    onClose={() => {
                        setShowSequence(false)
                        router.refresh()
                    }}
                />
            </div>
        </div>
    )
  }

  if (done) return <span className="badge badge-teal text-xs">Admitted</span>
  if (single) return (
    <button
        onClick={() => setShowSequence(true)}
        className="btn-primary text-[10px] font-black uppercase tracking-widest py-1.5 px-3 flex items-center gap-1.5 active:scale-95 transition-all"
    >
        <Zap className="w-3 h-3 fill-white" />
        Sequence
    </button>
  )
  return <button onClick={handleAdmitAll} disabled={loading} className="btn-primary text-sm">{loading?'Opening...':`Open cohort & admit ${count}`}</button>
}

