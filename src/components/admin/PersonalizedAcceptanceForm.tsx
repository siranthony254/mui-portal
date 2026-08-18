'use client'

import { useState } from 'react'
import { admitStudentWithSequence } from '@/lib/actions/admin'
import { Zap, ShieldCheck, User, ArrowRight, X, Calendar } from '@/components/icons'
import { cn } from '@/lib/utils'

export function PersonalizedAcceptanceForm({ student, cohortId, onClose }: { student: any, cohortId: string, onClose: () => void }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const defaultMessage = `Hello ${student.full_name.split(' ')[0]}, we are thrilled to welcome you to the MUI Forge! Your application stood out, and we believe you have a vital voice to contribute to African campus culture. Welcome to the movement.`

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const formData = new FormData(e.currentTarget)
    const res = await admitStudentWithSequence({
        studentId: student.id,
        cohortId,
        personalMessage: formData.get('message') as string,
        firstSessionDate: formData.get('firstSession') as string
    })

    if (res.error) {
      setError(res.error)
    } else {
      setSuccess(true)
      setTimeout(onClose, 2000)
    }
    setLoading(false)
  }

  return (
    <div className="card p-8 shadow-2xl border-emerald-50 bg-white relative overflow-hidden">
      <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-xl transition-colors z-20">
        <X className="w-5 h-5 text-gray-400" />
      </button>

      {success ? (
         <div className="py-12 text-center space-y-4 animate-reveal">
            <div className="w-20 h-20 bg-emerald-700 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-emerald-700/20">
                <ShieldCheck className="w-10 h-10 text-white" />
             </div>
            <h3 className="text-2xl font-black text-emerald-900">Student Admitted</h3>
            <p className="text-emerald-700 font-medium">Acceptance sequence triggered. {student.full_name} is now enrolled.</p>
         </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-8">
           <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center font-black text-xl">
                 {student.full_name[0]}
              </div>
              <div>
                 <h2 className="text-xl font-black text-gray-900 leading-tight">Acceptance Sequence</h2>
                 <p className="text-sm text-gray-400 font-medium tracking-tight">Personalise the welcome for {student.full_name}</p>
              </div>
           </div>

           <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Personal Welcome Message</label>
                <textarea
                    name="message"
                    required
                    rows={4}
                    defaultValue={defaultMessage}
                    className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-emerald-500 focus:ring-0 text-sm font-medium leading-relaxed italic text-gray-600"
                />
                <p className="mt-2 text-[10px] text-gray-400 font-bold uppercase tracking-widest flex items-center gap-1.5">
                   <Zap className="w-3 h-3 text-amber-500" /> A human touch makes the difference.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">First Webinar Date</label>
                    <div className="relative">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input name="firstSession" type="date" required className="w-full pl-11 pr-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-emerald-500 focus:ring-0 font-bold text-sm" />
                    </div>
                 </div>
              </div>
           </div>

           {error && <p className="text-xs font-bold text-red-600 bg-red-50 p-3 rounded-xl">{error}</p>}

           <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={loading}
                className="bg-emerald-700 text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-emerald-800 transition-all shadow-xl shadow-emerald-700/20 disabled:opacity-50"
              >
                {loading ? 'Admitting...' : 'Trigger Acceptance'}
                <ArrowRight className="w-4 h-4" />
              </button>
           </div>
        </form>
      )}
    </div>
  )
}
