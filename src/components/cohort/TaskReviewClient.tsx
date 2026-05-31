'use client'
import { useState } from 'react'
import { reviewTask } from '@/lib/actions/cohort'
import { useRouter } from 'next/navigation'

export function TaskReviewClient({ taskId }: { taskId: string }) {
  const [feedback, setFeedback] = useState('')
  const [approved, setApproved] = useState(false)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!feedback.trim()) return
    setLoading(true)
    const res = await reviewTask(taskId, feedback, approved)
    setLoading(false)
    if (res.success) { setDone(true); router.refresh() }
  }

  if (done) return <div className="p-3 bg-teal-50 border border-teal-100 rounded-lg text-sm text-teal-700">✓ Review submitted successfully.</div>

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Your feedback *</label>
        <textarea value={feedback} onChange={e => setFeedback(e.target.value)} rows={4} required
          placeholder="Give specific, honest feedback. What did they do well? Where can they go deeper?"
          className="textarea" />
      </div>
      <label className="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" checked={approved} onChange={e => setApproved(e.target.checked)}
          className="w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500" />
        <span className="text-sm font-medium text-gray-700">Approve this submission</span>
      </label>
      <button type="submit" disabled={loading || !feedback.trim()} className="btn-primary text-sm">
        {loading ? 'Submitting...' : approved ? 'Submit & approve' : 'Submit feedback'}
      </button>
    </form>
  )
}
