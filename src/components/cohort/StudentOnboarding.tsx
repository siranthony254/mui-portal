'use client'

import { useState } from 'react'
import { CheckCircle, User, BookOpen, ShieldCheck, ArrowRight, Zap, Globe, Camera } from '@/components/icons'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

interface Props {
  profile: any
  cohort: any
}

export function StudentOnboarding({ profile, cohort }: Props) {
  const [step, setStep] = useState(profile.onboarded ? 2 : 1) // 1: Profile, 2: Welcome Screen
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    preferred_name: profile.preferred_name || profile.full_name.split(' ')[0] || '',
    bio: profile.bio || '',
    institution: profile.institution || ''
  })

  const supabase = createClient()
  const router = useRouter()

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.from('profiles').update({
      preferred_name: formData.preferred_name,
      bio: formData.bio,
      institution: formData.institution,
      onboarded: true
    }).eq('id', profile.id)

    if (!error) {
      setStep(2)
    }
    setLoading(false)
  }

  const finishOnboarding = async () => {
    setLoading(true)
    await supabase.from('profiles').update({ welcome_screen_shown: true }).eq('id', profile.id)
    setLoading(false)
    window.location.reload()
  }

  if (step === 1) {
    return (
      <div className="fixed inset-0 z-[100] bg-white flex items-center justify-center p-6 overflow-y-auto">
        <div className="max-w-xl w-full py-12">
          <div className="text-center mb-10">
            <div className="w-16 h-16 bg-emerald-700 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-emerald-700/20">
              <User className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Complete Your Profile</h1>
            <p className="text-sm text-gray-500 mt-2 font-medium">Just a few details to get your journey started.</p>
          </div>

          <div className="card p-8 md:p-10 shadow-2xl border-emerald-50">
            <form onSubmit={saveProfile} className="space-y-6">
              <div className="flex justify-center mb-8">
                <div className="relative group">
                   <div className="w-24 h-24 rounded-[2rem] bg-gray-50 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 group-hover:border-emerald-500 group-hover:text-emerald-500 transition-all cursor-pointer overflow-hidden">
                      <Camera className="w-6 h-6 mb-1" />
                      <span className="text-[10px] font-black uppercase">Upload</span>
                   </div>
                   <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-emerald-700 text-white rounded-full flex items-center justify-center shadow-lg">
                      <Zap className="w-4 h-4 fill-white" />
                   </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Preferred Name</label>
                  <input
                    type="text"
                    required
                    value={formData.preferred_name}
                    onChange={(e) => setFormData({...formData, preferred_name: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-emerald-500 focus:ring-0 font-bold text-gray-900 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Campus / University</label>
                  <input
                    type="text"
                    required
                    value={formData.institution}
                    onChange={(e) => setFormData({...formData, institution: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-emerald-500 focus:ring-0 font-bold text-gray-900 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">One-line Bio (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Aspiring leader, Law student at UoN, Passionate about tech"
                  value={formData.bio}
                  onChange={(e) => setFormData({...formData, bio: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-emerald-500 focus:ring-0 font-medium text-gray-700 transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-700 text-white py-4 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-emerald-800 transition-all shadow-lg shadow-emerald-700/20"
              >
                {loading ? 'Saving...' : 'Save & Continue'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    )
  }

  // Welcome Screen
  return (
    <div className="fixed inset-0 z-[100] bg-white flex items-center justify-center p-6">
      <div className="max-w-2xl w-full">
        <div className="text-center space-y-8">
          <div className="w-20 h-20 bg-emerald-100 rounded-3xl flex items-center justify-center mx-auto shadow-xl shadow-emerald-100/20 rotate-6 animate-bounce">
            <Zap className="w-10 h-10 text-emerald-600" />
          </div>

          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight leading-none">
              Welcome to the <br /> <span className="text-emerald-700">Formation Journey.</span>
            </h1>
            <p className="text-lg text-gray-500 font-medium max-w-lg mx-auto leading-relaxed">
              You are now part of a movement building the fix from inside African campuses. We are glad you are here.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
            <div className="card p-6 border-emerald-50 bg-emerald-50/30">
               <h3 className="font-black text-emerald-900 text-xs uppercase tracking-widest mb-2 flex items-center gap-2">
                 <ShieldCheck className="w-4 h-4" /> The First 2 Weeks
               </h3>
               <p className="text-xs text-emerald-800 leading-relaxed font-medium">
                 Focusing on **Identity & Self**. You'll explore the belief systems that have shaped who you are today.
               </p>
            </div>
            <div className="card p-6 border-teal-50 bg-teal-50/30">
               <h3 className="font-black text-teal-900 text-xs uppercase tracking-widest mb-2 flex items-center gap-2">
                 <BookOpen className="w-4 h-4" /> This Week's Task
               </h3>
               <p className="text-xs text-teal-800 leading-relaxed font-medium">
                 Check your dashboard for "The Mirror" task. Your first journal entry is also due by Sunday.
               </p>
            </div>
          </div>

          <button
            onClick={finishOnboarding}
            disabled={loading}
            className="bg-emerald-700 text-white px-10 py-5 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 mx-auto hover:bg-emerald-800 transition-all shadow-2xl shadow-emerald-700/40 group"
          >
            {loading ? 'Entering...' : 'Go to my cohort home'}
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  )
}
