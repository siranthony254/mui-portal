'use client'
import { useState, useEffect } from 'react'
import { submitTask } from '@/lib/actions/cohort'
import { useRouter } from 'next/navigation'
import { CloudOff, CheckCircle, Sparkles } from '@/components/icons'
import { triggerSuccessConfetti } from '@/components/ui/Confetti'

export function TaskSubmitForm({ taskId }: { taskId: string }) {
  const [submission, setSubmission] = useState('')
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [isOnline, setIsOnline] = useState(true)
  const [showSuccess, setShowSuccess] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setIsOnline(navigator.onLine)
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Load draft from localStorage
    const savedDraft = localStorage.getItem(`task_draft_${taskId}`)
    if (savedDraft) {
      const { text, url: savedUrl } = JSON.parse(savedDraft)
      setSubmission(text)
      setUrl(savedUrl)
    }

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [taskId])

  // Save draft as user types
  useEffect(() => {
    if (submission || url) {
      localStorage.setItem(`task_draft_${taskId}`, JSON.stringify({ text: submission, url }))
    }
  }, [submission, url, taskId])

  const wordCount = submission.trim().split(/\s+/).filter(Boolean).length

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!submission.trim()) return

    if (!navigator.onLine) {
      setResult({ error: 'You are offline. Your response has been saved as a draft locally and will be ready to submit once you are back online.' })
      return
    }

    setLoading(true)
    const res = await submitTask(taskId, submission, url || undefined)
    setResult(res)
    setLoading(false)
    if (res.success) {
      triggerSuccessConfetti()
      setShowSuccess(true)
      localStorage.removeItem(`task_draft_${taskId}`)
      setTimeout(() => router.refresh(), 2000)
    }
  }

  if (showSuccess) {
    return (
      <div className="card p-12 text-center space-y-4 animate-reveal">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-700/10">
          <CheckCircle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-gray-900 tracking-tight uppercase">Submission Received!</h2>
        <p className="text-gray-500 max-w-xs mx-auto font-medium">Your response has been successfully sent to your mentor. Great work!</p>
        <div className="pt-4 flex justify-center">
            <button onClick={() => router.push('/dashboard')} className="btn-primary text-xs font-black uppercase tracking-widest flex items-center gap-2">
                Back to Dashboard <Sparkles className="w-4 h-4" />
            </button>
        </div>
      </div>
    )
  }

  return (
    <div className="card p-5 relative overflow-hidden">
      {!isOnline && (
        <div className="absolute top-0 right-0 p-2">
          <span className="flex items-center gap-1 text-[10px] text-amber-600 font-bold bg-amber-50 px-2 py-1 rounded-bl-xl border-l border-b border-amber-100">
            <CloudOff className="w-3 h-3" /> Offline Mode
          </span>
        </div>
      )}
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
