'use client'

import { useState } from 'react'
import { signUpStudent } from '@/lib/actions/auth'

const COUNTIES = [
  'Nairobi','Mombasa','Kisumu','Nakuru','Eldoret','Thika','Kitui','Machakos',
  'Meru','Nyeri','Muranga','Kiambu','Kajiado','Makueni','Kilifi','Kwale',
  'Garissa','Wajir','Mandera','Marsabit','Isiolo','Samburu','Laikipia',
  'Nyandarua','Kirinyaga','Embu','Tharaka Nithi','Siaya','Kisii','Nyamira',
  'Migori','Homabay','Bomet','Kericho','Baringo','Uasin Gishu','Nandi',
  'Trans Nzoia','Turkana','West Pokot','Bungoma','Busia','Vihiga','Kakamega','Other',
]

export function RegisterForm() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ error?: string; success?: string } | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setResult(null)
    const res = await signUpStudent(new FormData(e.currentTarget))
    setResult(res)
    setLoading(false)
  }

  if (result?.success) {
    return (
      <div className="text-center py-6">
        <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-teal-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Application submitted</h2>
        <p className="text-sm text-gray-500">{result.success}</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Full name *</label>
        <input name="full_name" type="text" required className="input" placeholder="Your full name" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Email address *</label>
        <input name="email" type="email" required className="input" placeholder="you@example.com" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Create Password *</label>
        <input name="password" type="password" required className="input" placeholder="••••••••" minLength={6} />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
        <input name="phone" type="tel" className="input" placeholder="07XX XXX XXX" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Institution *</label>
        <input name="institution" type="text" required className="input"
          placeholder="e.g. Murang'a University of Technology" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Institution type *</label>
          <select name="institution_type" required className="select">
            <option value="">Select...</option>
            <option value="university">University</option>
            <option value="tvet">TVET</option>
            <option value="college">College</option>
            <option value="kmtc">KMTC</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Year of study *</label>
          <select name="year_of_study" required className="select">
            <option value="">Select...</option>
            <option value="1st year">1st year</option>
            <option value="2nd year">2nd year</option>
            <option value="3rd year">3rd year</option>
            <option value="Final year">Final year</option>
          </select>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">County *</label>
        <select name="county" required className="select">
          <option value="">Select county...</option>
          {COUNTIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      {result?.error && (
        <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-700">
          {result.error}
        </div>
      )}
      <button type="submit" disabled={loading} className="btn-primary w-full">
        {loading ? 'Submitting...' : 'Submit application'}
      </button>
      <p className="text-xs text-gray-400 text-center">
        MUI cohorts are free. 15–25 participants per cycle. You may be placed on a waitlist.
      </p>
    </form>
  )
}
