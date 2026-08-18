'use client'

import { useState } from 'react'
import { CheckCircle, Users, BookOpen, ShieldCheck, ArrowRight } from '@/components/icons'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface Mentee {
  id: string
  full_name: string
  institution: string
}

interface Props {
  mentorName: string
  mentees: Mentee[]
}

export function MentorOnboarding({ mentorName, mentees }: Props) {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  const finishOnboarding = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.from('profiles').update({ onboarded: true }).eq('id', user.id)
      router.refresh()
    }
  }

  const steps = [
    {
      title: "Welcome to MUI Portal",
      content: (
        <div className="space-y-4 text-gray-600">
          <p>Hello {mentorName.split(' ')[0]}, welcome to the Mic'd Up Initiative mentor community.</p>
          <p>MUI is a transformation movement. As a mentor, you are not just a supervisor; you are a companion on a 12-week formation journey for emerging student leaders.</p>
          <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
            <h4 className="text-emerald-900 font-bold text-sm mb-1 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" /> The Mission
            </h4>
            <p className="text-emerald-800 text-xs leading-relaxed">
              We are shaping voices that shape culture. Your role is to help students distinguish wisdom from information and character from personality.
            </p>
          </div>
        </div>
      ),
      icon: ShieldCheck
    },
    {
      title: "Your Role & Responsibilities",
      content: (
        <div className="space-y-4">
          <ul className="space-y-3">
            {[
              { t: "Review Tasks", d: "Read and provide personal feedback on weekly pillar submissions." },
              { t: "Respond to Journals", d: "Engage with reflections students explicitly share with you." },
              { t: "1-on-1 Check-ins", d: "Host a conversation every two weeks to monitor growth." },
              { t: "Community Presence", d: "Be a substantive presence in the cohort discussion board." }
            ].map((item, i) => (
              <li key={i} className="flex gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">{i+1}</div>
                <div>
                  <h5 className="text-sm font-bold text-gray-900">{item.t}</h5>
                  <p className="text-xs text-gray-500">{item.d}</p>
                </div>
              </li>
            ))}
          </ul>
          <a href="#" className="inline-flex items-center gap-2 text-xs font-bold text-emerald-700 hover:underline mt-2">
            <BookOpen className="w-4 h-4" /> Open Mentor Handbook (PDF)
          </a>
        </div>
      ),
      icon: BookOpen
    },
    {
      title: "Your Assigned Mentees",
      content: (
        <div className="space-y-4">
          <p className="text-sm text-gray-500">You have been assigned {mentees.length} mentees for this cohort:</p>
          <div className="space-y-2">
            {mentees.map(m => (
              <div key={m.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                <div>
                  <h5 className="text-sm font-bold text-gray-900">{m.full_name}</h5>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider">{m.institution}</p>
                </div>
                <button className="text-[10px] font-bold text-emerald-700 bg-white px-3 py-1 rounded-lg border border-emerald-50 shadow-sm">View Profile</button>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-amber-600 bg-amber-50 p-2 rounded-lg italic">
            Note: You can reach out to them via the messaging portal immediately after completing this setup.
          </p>
        </div>
      ),
      icon: Users
    }
  ]

  const currentStep = steps[step - 1]
  const Icon = currentStep.icon

  return (
    <div className="fixed inset-0 z-[100] bg-white flex items-center justify-center p-4">
      <div className="max-w-xl w-full">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-emerald-700 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-emerald-700/20 rotate-3">
            <Icon className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xs font-black text-emerald-600 uppercase tracking-[0.3em] mb-2">Step {step} of {steps.length}</h2>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">{currentStep.title}</h1>
        </div>

        <div className="card p-8 md:p-10 mb-8 shadow-2xl border-emerald-50 relative overflow-hidden">
           <div className="absolute top-0 right-0 p-8 opacity-[0.03]">
             <Icon className="w-32 h-32 text-emerald-900" />
           </div>
           <div className="relative z-10">
            {currentStep.content}
           </div>
        </div>

        <div className="flex items-center justify-between">
          <button
            onClick={() => setStep(s => Math.max(1, s - 1))}
            className="text-sm font-bold text-gray-400 hover:text-gray-900 transition-colors disabled:opacity-0"
            disabled={step === 1}
          >
            Back
          </button>

          {step < steps.length ? (
            <button
              onClick={() => setStep(s => s + 1)}
              className="bg-emerald-700 text-white px-8 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-emerald-800 transition-all shadow-lg shadow-emerald-700/20"
            >
              Next Step <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={finishOnboarding}
              disabled={loading}
              className="bg-emerald-700 text-white px-8 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-emerald-800 transition-all shadow-lg shadow-emerald-700/20"
            >
              {loading ? 'Initializing...' : 'Enter Portal'} <CheckCircle className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
