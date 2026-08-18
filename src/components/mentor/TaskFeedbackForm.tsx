'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Send, CheckCircle } from '@/components/icons'

export function TaskFeedbackForm({ taskId }: { taskId: string }) {
  const [feedback, setFeedback] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!feedback.trim()) return

    setLoading(true)
    const { error } = await supabase.from('tasks').update({
      mentor_feedback: feedback,
      status: 'reviewed',
      reviewed_at: new Date().toISOString()
    }).eq('id', taskId)

    if (!error) {
      setSuccess(true)
      setTimeout(() => {
        router.refresh()
      }, 1500)
    }
    setLoading(false)
  }

  if (success) {
    return (
      <div className="bg-emerald-50 rounded-2xl p-6 text-center border border-emerald-100 animate-fade-in">
        <div className="w-10 h-10 bg-emerald-700 rounded-full flex items-center justify-center mx-auto mb-3">
          <CheckCircle className="w-6 h-6 text-white" />
        </div>
        <p className="text-sm font-bold text-emerald-900">Feedback Submitted Successfully</p>
        <p className="text-xs text-emerald-600 mt-1">The student has been notified.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="relative">
        <textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="Write your feedback here... Be substantive, personal, and encouraging."
          className="w-full min-h-[120px] p-5 text-sm bg-gray-50 border-gray-100 rounded-2xl focus:ring-emerald-500 focus:border-emerald-500 transition-all placeholder:text-gray-300"
          required
        />
      </div>
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading || !feedback.trim()}
          className="bg-emerald-700 text-white px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:bg-emerald-800 disabled:opacity-50 transition-all shadow-lg shadow-emerald-700/20"
        >
          {loading ? 'Submitting...' : 'Submit Feedback'}
          <Send className="w-3.5 h-3.5" />
        </button>
      </div>
    </form>
  )
}
