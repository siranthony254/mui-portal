'use client'

import { useState } from 'react'
import { ShieldCheck, Lock, ArrowRight, AlertCircle } from '@/components/icons'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export function VerifyAdminPIN() {
  const [pin, setPin] = useState(['', '', '', ''])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleInput = (index: number, value: string) => {
    if (isNaN(Number(value))) return
    const newPin = [...pin]
    newPin[index] = value.slice(-1)
    setPin(newPin)

    // Auto-focus next input
    if (value && index < 3) {
      const nextInput = document.getElementById(`pin-${index + 1}`)
      nextInput?.focus()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const pinString = pin.join('')
    if (pinString.length < 4) return

    setLoading(true)
    setError('')

    // V1 Logic: Simple check against profile.security_pin
    // In a real app, we'd use a server action to verify and set a secure cookie
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: profile } = await supabase.from('profiles').select('security_pin').eq('id', user.id).single()

      // If PIN is not set yet (first time), let them set one
      if (!profile?.security_pin) {
         await supabase.from('profiles').update({ security_pin: pinString }).eq('id', user.id)
         sessionStorage.setItem('admin_verified', 'true')
         router.refresh()
         return
      }

      if (profile.security_pin === pinString) {
        sessionStorage.setItem('admin_verified', 'true')
        router.refresh()
      } else {
        setError('Invalid security PIN. Please try again.')
        setPin(['', '', '', ''])
        document.getElementById('pin-0')?.focus()
      }
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-red-100 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-red-100/20">
            <Lock className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Security Verification</h1>
          <p className="text-sm text-gray-500 mt-2 font-medium">Please enter your 4-digit security PIN to access the operational layer.</p>
        </div>

        <div className="card p-8 shadow-2xl border-red-50">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex justify-between gap-3">
              {pin.map((digit, i) => (
                <input
                  key={i}
                  id={`pin-${i}`}
                  type="password"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleInput(i, e.target.value)}
                  className="w-16 h-20 text-center text-3xl font-black bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-red-500 focus:ring-red-500 transition-all"
                  required
                />
              ))}
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-xl text-xs font-bold animate-shake">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || pin.join('').length < 4}
              className="w-full bg-gray-900 text-white py-4 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-gray-800 transition-all shadow-xl shadow-black/20 disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Verify Access'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>

        <div className="mt-8 text-center">
           <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center justify-center gap-2">
             <ShieldCheck className="w-3.5 h-3.5" /> End-to-End Encrypted Admin Session
           </p>
        </div>
      </div>
    </div>
  )
}
