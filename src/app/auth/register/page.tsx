import { Metadata } from 'next'
export const dynamic = 'force-dynamic'
import Link from 'next/link'
import { RegisterForm } from '@/components/auth/RegisterForm'
export const metadata: Metadata = { title: 'Apply for Cohort' }
export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-teal-700 flex items-center justify-center"><div className="w-3 h-3 rounded-full bg-white" /></div>
            <span className="text-lg font-semibold text-gray-900">MUI Portal</span>
          </div>
          <h1 className="text-xl font-semibold text-gray-900">Apply for the cohort</h1>
          <p className="text-sm text-gray-500 mt-1">15–25 students · Online & intercampus · Free</p>
        </div>
        <div className="card p-6"><RegisterForm /></div>
        <p className="text-center text-sm text-gray-500 mt-4">Already have an account? <Link href="/auth/login" className="text-teal-700 hover:underline font-medium">Sign in</Link></p>
      </div>
    </div>
  )
}
