'use client'

import { useState, useEffect, Suspense } from 'react'
import { ShieldCheck, Phone, ArrowRight, CheckCircle, Zap } from '@/components/icons'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'

function ActivateContent() {
  const [step, setStep] = useState(1) // 1: Phone, 2: OTP
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!phone) return
    setLoading(true)
    setError('')

    // Simulate Supabase Phone Auth trigger
    // In production: await supabase.auth.signInWithOtp({ phone })
    setTimeout(() => {
      setStep(2)
      setLoading(false)
    }, 1000)
  }

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    const otpString = otp.join('')
    if (otpString.length < 6) return
    setLoading(true)

    // Simulate verification
    // In production: await supabase.auth.verifyOtp({ phone, token: otpString, type: 'sms' })
    setTimeout(() => {
      window.location.href = '/dashboard'
      setLoading(false)
    }, 1500)
  }

  const handleOtpInput = (index: number, value: string) => {
    if (isNaN(Number(value))) return
    const newOtp = [...otp]
    newOtp[index] = value.slice(-1)
    setOtp(newOtp)

    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus()
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full">
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-emerald-100 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-emerald-100/20">
            <Zap className="w-8 h-8 text-emerald-600" />
          </div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Activate Account</h1>
          <p className="text-sm text-gray-500 mt-2 font-medium">Verify your phone to join your cohort dashboard.</p>
        </div>

        <div className="card p-8 shadow-2xl border-emerald-50">
          {step === 1 ? (
            <form onSubmit={handleSendOTP} className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+254 700 000 000"
                    className="w-full pl-11 pr-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-emerald-500 focus:ring-emerald-500 transition-all font-bold"
                    required
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-700 text-white py-4 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-emerald-800 transition-all shadow-lg shadow-emerald-700/20"
              >
                {loading ? 'Sending...' : 'Send Verification Code'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP} className="space-y-8">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 text-center">Enter 6-digit Code</label>
                <div className="flex justify-between gap-2">
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      id={`otp-${i}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpInput(i, e.target.value)}
                      className="w-12 h-14 text-center text-2xl font-black bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-emerald-500 focus:ring-emerald-500 transition-all"
                    />
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                <button
                  type="submit"
                  disabled={loading || otp.join('').length < 6}
                  className="w-full bg-emerald-700 text-white py-4 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-emerald-800 transition-all shadow-lg shadow-emerald-700/20 disabled:opacity-50"
                >
                  {loading ? 'Verifying...' : 'Activate Account'}
                  <CheckCircle className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-full text-xs font-bold text-gray-400 hover:text-gray-600 transition-colors"
                >
                  Edit phone number
                </button>
              </div>
            </form>
          )}
        </div>

        <p className="mt-8 text-center text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-relaxed">
          Secured by MUI Forge OTP Infrastructure <br />
          No password required for your security.
        </p>
      </div>
    </div>
  )
}

export default function ActivatePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading activation...</div>}>
      <ActivateContent />
    </Suspense>
  )
}
