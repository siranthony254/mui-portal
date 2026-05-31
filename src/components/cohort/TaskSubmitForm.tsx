'use client'
import { useState } from 'react'
import { submitTask } from '@/lib/actions/cohort'
import { useRouter } from 'next/navigation'

export function TaskSubmitForm({ taskId }: { taskId: string }) {
  const [submission, setSubmission] = useState('')
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const router = useRouter()
  const wordCount = submission.trim().split(/\s+/).filter(Boolean).length

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!submission.trim()) return
    setLoading(true)
    const res = await submitTask(taskId, submission, url || undefined)
    setResult(res); setLoading(false)
    if (res.success) setTimeout(() => router.refresh(), 1000)
  }

  return (
    <div className="card p-5">
      <p className="section-title">Your response</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <textarea value={submission} onChange={e => setSubmission(e.target.value)} rows={10} required
            placeholder="Write your response here. Be honest — not the answer you think sounds good, but the actual answer."
            className="textarea" />
          <p className={`text-xs mt-1 text-right ${wordCount < 100 ? 'text-gray-400' : 'text-teal-600'}`}>
            {wordCount} words {wordCount < 100 && '(aim for at least 100)'}
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Attachment URL <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <input type="url" value={url} onChange={e => setUrl(e.target.value)}
            placeholder="Link to video, audio, Google Doc, etc." className="input" />
          <p className="text-xs text-gray-400 mt-1">For capstone tasks: paste your YouTube or Google Drive link here.</p>
        </div>
        {result?.error && <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-700">{result.error}</div>}
        {result?.success && <div className="p-3 bg-teal-50 border border-teal-100 rounded-lg text-sm text-teal-700">{result.success}</div>}
        <div className="flex items-center gap-3">
          <button type="submit" disabled={loading || !submission.trim()} className="btn-primary">
            {loading ? 'Submitting...' : 'Submit response'}
          </button>
          <p className="text-xs text-gray-400">Your mentor will review and provide feedback.</p>
        </div>
      </form>
    </div>
  )
}
