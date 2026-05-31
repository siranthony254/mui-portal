'use client'
import { useState } from 'react'
import { joinWaitlist } from '@/lib/actions/cohort'
import { useRouter } from 'next/navigation'

export function ApplyForm({ cohorts, userId }: { cohorts: any[]; userId: string }) {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [selectedCohort, setSelectedCohort] = useState(cohorts[0]?.id||'')
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setLoading(true); setResult(null)
    const data = new FormData(e.currentTarget)
    const res = await joinWaitlist(selectedCohort, data.get('essay') as string, data.get('motivation') as string)
    setResult(res); setLoading(false)
    if (res.success) setTimeout(()=>router.push('/dashboard'),2000)
  }

  if (result?.success) return (
    <div className="card p-8 text-center">
      <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4"><svg className="w-6 h-6 text-teal-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg></div>
      <h2 className="text-lg font-semibold text-gray-900 mb-2">Application submitted!</h2>
      <p className="text-sm text-gray-500">{result.success}</p>
    </div>
  )

  return (
    <div className="card p-6">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Select cohort *</label>
          <select value={selectedCohort} onChange={e=>setSelectedCohort(e.target.value)} required className="select">
            {cohorts.map(c=><option key={c.id} value={c.id}>{c.name} — {c.semester} {c.year}</option>)}
          </select>
        </div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Why do you want to join MUI? *</label>
          <textarea name="motivation" required rows={4} className="textarea" placeholder="What brings you to MUI? What are you hoping to develop?" />
          <p className="text-xs text-gray-400 mt-1">Be honest — not the answer you think sounds good.</p>
        </div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">A real problem you have observed on your campus or community *</label>
          <textarea name="essay" required rows={5} className="textarea" placeholder="Describe a specific problem — not a general complaint. Who does it affect? What evidence do you have?" />
          <p className="text-xs text-gray-400 mt-1">Minimum 100 words.</p>
        </div>
        {result?.error && <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-700">{result.error}</div>}
        <button type="submit" disabled={loading} className="btn-primary w-full">{loading?'Submitting...':'Submit application'}</button>
        <div className="bg-gray-50 rounded-lg p-3"><p className="text-xs text-gray-500 font-medium mb-1">What happens next</p><ul className="text-xs text-gray-400 space-y-0.5"><li>• You will be placed on the waitlist</li><li>• When the cohort opens, your dashboard unlocks automatically</li><li>• You will receive an email notification when admitted</li><li>• The cohort is fully online — no physical attendance required</li></ul></div>
      </form>
    </div>
  )
}
