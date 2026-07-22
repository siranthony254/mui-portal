import { Metadata } from 'next'
export const dynamic = 'force-dynamic'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { LoginForm } from '@/components/auth/LoginForm'

export const metadata: Metadata = { title: 'Sign In — MUI Portal' }

interface LoginPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }> | { [key: string]: string | string[] | undefined }
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const resolvedSearchParams = await Promise.resolve(searchParams)
  const isConfirmed = resolvedSearchParams?.confirmed === 'true'
  const urlError = resolvedSearchParams?.error

  if (user) {
    redirect('/')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-teal-700 flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-white" />
            </div>
            <span className="text-lg font-semibold text-gray-900">MUI Portal</span>
          </div>
          <p className="text-sm text-gray-500">Form your voice. Shape culture.</p>
        </div>
        <div className="card p-6">
          <h1 className="text-xl font-semibold text-gray-900 mb-1">Welcome back</h1>
          <p className="text-sm text-gray-500 mb-6">Enter your email to receive a sign-in link.</p>
          <LoginForm isConfirmed={isConfirmed} initialError={urlError as string | undefined} />
        </div>
        <div className="text-center mt-4 space-y-2">
          <p className="text-sm text-gray-500">
            New student? <Link href="/auth/register" className="text-teal-700 hover:underline font-medium">Apply for the cohort</Link>
          </p>
          <p className="text-sm text-gray-500">
            Want to mentor? <Link href="/auth/mentor-apply" className="text-teal-700 hover:underline font-medium">Apply as a mentor</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

