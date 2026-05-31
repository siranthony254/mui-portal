'use client'
import { useState } from 'react'
import { signUpMentor } from '@/lib/actions/auth'

export function MentorApplyForm() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setLoading(true)
    const res = await signUpMentor(new FormData(e.currentTarget))
    setResult(res); setLoading(false)
  }

  if (result?.success) return (
    <div className="text-center py-6">
      <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg className="w-6 h-6 text-teal-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
      </div>
      <h2 className="text-lg font-semibold text-gray-900 mb-2">Application submitted</h2>
      <p className="text-sm text-gray-500">{result.success}</p>
    </div>
  )

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div><label className="block text-sm font-medium text-gray-700 mb-1">Full name *</label><input name="full_name" type="text" required className="input" placeholder="Your full name" /></div>
      <div><label className="block text-sm font-medium text-gray-700 mb-1">Email *</label><input name="email" type="email" required className="input" placeholder="you@example.com" /></div>
      <div><label className="block text-sm font-medium text-gray-700 mb-1">Professional background & expertise *</label><textarea name="bio" required rows={4} className="textarea" placeholder="Your background, expertise, and what you can offer MUI students..." /></div>
      {result?.error && <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-700">{result.error}</div>}
      <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? 'Submitting...' : 'Submit mentor application'}</button>
      <p className="text-xs text-gray-400 text-center">MUI mentors are volunteers. One monthly session + occasional student conversations.</p>
    </form>
  )
}
