import Link from 'next/link'
export const dynamic = 'force-dynamic'
import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createAdminClient, createClient } from '@/lib/supabase/server'
import { ensureAdminProfile } from '@/lib/auth/admin-profile'

export const metadata: Metadata = { title: 'Pending Approval' }
export default async function PendingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    const admin = await createAdminClient()
    const profile = await ensureAdminProfile(admin, user)
    if (profile?.role === 'admin') redirect('/admin')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        </div>
        <h1 className="text-xl font-semibold text-gray-900 mb-2">Application under review</h1>
        <p className="text-sm text-gray-500 mb-6">Your mentor application is being reviewed. You will receive an email when approved. This typically takes 1–3 business days.</p>
        <div className="flex flex-col gap-2">
          <a href="https://micdupinitiative.site" target="_blank" rel="noopener noreferrer" className="btn-primary justify-center">Visit MUI website</a>
          <Link href="/auth/login" className="btn-secondary justify-center">Back to login</Link>
        </div>
        <p className="text-xs text-gray-400 mt-4">Questions? <a href="mailto:micdupinitiative@gmail.com" className="text-teal-700 hover:underline">micdupinitiative@gmail.com</a></p>
      </div>
    </div>
  )
}
