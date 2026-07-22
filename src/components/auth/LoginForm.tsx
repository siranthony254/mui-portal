'use client'

import { useState } from 'react'
import { signInWithEmail } from '@/lib/actions/auth'

interface LoginFormProps {
  isConfirmed?: boolean
  initialError?: string
}

export function LoginForm({ isConfirmed, initialError }: LoginFormProps) {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ error?: string; success?: string } | null>(
    initialError ? { error: initialError === 'auth_failed' ? 'Sign in link invalid or expired. Please request a new link below.' : initialError } : null
  )

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setResult(null)
    const res = await signInWithEmail(new FormData(e.currentTarget))
    setResult(res)
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {isConfirmed && !result && (
        <div className="p-3 bg-teal-50 border border-teal-100 rounded-lg text-sm text-teal-700 font-medium">
          Email confirmed! Your account is active. Enter your email below to receive your sign-in link.
        </div>
      )}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Email address
        </label>
        <input id="email" name="email" type="email" required
          autoComplete="email" placeholder="you@example.com" className="input" />
      </div>
      {result?.error && (
        <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-700">
          {result.error}
        </div>
      )}
      {result?.success && (
        <div className="p-3 bg-teal-50 border border-teal-100 rounded-lg text-sm text-teal-700">
          {result.success}
        </div>
      )}
      <button type="submit" disabled={loading} className="btn-primary w-full">
        {loading ? 'Sending link...' : 'Send Sign-In Link'}
      </button>
    </form>
  )
}

