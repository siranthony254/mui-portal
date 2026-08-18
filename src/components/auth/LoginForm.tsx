'use client'

import { useState } from 'react'
import { signInWithPassword } from '@/lib/actions/auth'
import { useRouter } from 'next/navigation'

interface LoginFormProps {
  isConfirmed?: boolean
  initialError?: string
}

export function LoginForm({ isConfirmed, initialError }: LoginFormProps) {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ error?: string; success?: string } | null>(
    initialError ? { error: initialError } : null
  )
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setResult(null)
    const res = await signInWithPassword(new FormData(e.currentTarget))
    if (res.error) {
      setResult({ error: res.error })
      setLoading(false)
    } else if (res.success) {
      // Delay to ensure session cookie is set before redirect
      await new Promise(resolve => setTimeout(resolve, 500))
      router.push('/dashboard')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Email address
        </label>
        <input name="email" type="email" required
          autoComplete="email" placeholder="you@example.com" className="input" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Password
        </label>
        <input name="password" type="password" required
          autoComplete="current-password" placeholder="••••••••" className="input" />
      </div>
      {result?.error && (
        <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-700">
          {result.error}
        </div>
      )}
      <button type="submit" disabled={loading} className="btn-primary w-full">
        {loading ? 'Signing in...' : 'Sign In'}
      </button>
    </form>
  )
}

