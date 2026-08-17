'use client'

import { Clock, ShieldCheck } from '@/components/icons'
import { signOut } from '@/lib/actions/auth'

export function MentorPendingScreen({ profile }: { profile: any }) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-8">
        <div className="space-y-4">
          <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center mx-auto text-blue-600 shadow-sm">
            <ShieldCheck className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Mentor Application Pending</h1>
            <p className="text-gray-500 text-sm leading-relaxed">
              Thank you for applying to be a mentor, <span className="font-semibold text-gray-700">{profile.full_name}</span>.
              Our team is currently reviewing your professional background and expertise.
            </p>
          </div>
        </div>

        <div className="card p-6 bg-white border border-gray-100 text-left space-y-4 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-amber-50 rounded-lg text-amber-600">
               <Clock className="w-5 h-5" />
            </div>
            <div>
               <p className="text-sm font-semibold text-gray-900">What happens next?</p>
               <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                 Once approved, you will receive an email confirmation. You will then have access to the Mentor Portal to manage students and review tasks.
               </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <p className="text-xs text-gray-400 italic">
            Check your inbox regularly for updates from the MUI team.
          </p>
          <button
            onClick={() => signOut()}
            className="text-sm font-medium text-teal-700 hover:text-teal-800 transition-colors"
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  )
}
