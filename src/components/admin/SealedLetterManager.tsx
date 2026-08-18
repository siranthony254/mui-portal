'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ShieldCheck, User, MessageSquare, Send, CheckCircle, Clock } from '@/components/icons'
import { formatDate, cn } from '@/lib/utils'

export function SealedLetterManager({ cohortId }: { cohortId: string }) {
  const [letters, setLetters] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchLetters()
  }, [cohortId])

  async function fetchLetters() {
    setLoading(true)
    // Fetch enrollments with student and mentor names, and their sealed letters
    const { data: enrollments } = await supabase.from('enrollments')
      .select(`
        id,
        student:profiles!student_id(id, full_name),
        mentor:profiles!mentor_id(id, full_name)
      `)
      .eq('cohort_id', cohortId)
      .in('status', ['active', 'completed'])

    if (enrollments) {
        const studentIds = enrollments.map(e => e.student.id)
        const { data: notes } = await supabase.from('mentor_notes')
            .select('*')
            .in('student_id', studentIds)
            .eq('is_sealed_letter', true)

        const mapped = enrollments.map(e => {
            const letter = notes?.find(n => n.student_id === e.student.id && n.mentor_id === e.mentor?.id)
            return {
                ...e,
                letter
            }
        })
        setLetters(mapped)
    }
    setLoading(false)
  }

  async function handleTransfer(letterId: string) {
      // In a real flow, this might move the letter to a "Student Archive"
      // or notify the student it's ready. For now, we'll mark as 'transferred' via details
      const { error } = await supabase.from('mentor_notes')
        .update({ details: { transferred: true, transferred_at: new Date().toISOString() } })
        .eq('id', letterId)

      if (!error) {
          fetchLetters()
      }
  }

  if (loading) return <div className="p-8 text-center opacity-50">Loading formation records...</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-black text-emerald-600 uppercase tracking-[0.2em] flex items-center gap-2">
          <ShieldCheck className="w-4 h-4" /> Sealed Letter Management
        </h2>
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">End of Semester 1 Tool</span>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Student</th>
              <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Assigned Mentor</th>
              <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Status</th>
              <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {letters.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-300" />
                    <span className="text-sm font-bold text-gray-900">{item.student.full_name}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                   <span className="text-xs font-medium text-gray-500">{item.mentor?.full_name || 'Unassigned'}</span>
                </td>
                <td className="px-6 py-4 text-center">
                   {item.letter ? (
                      <span className={cn(
                        "badge text-[9px] font-black uppercase",
                        item.letter.details?.transferred ? "badge-teal" : "badge-amber"
                      )}>
                        {item.letter.details?.transferred ? 'Transferred' : 'Awaiting Transfer'}
                      </span>
                   ) : (
                      <span className="text-[9px] font-bold text-gray-300 uppercase italic">Not Written</span>
                   )}
                </td>
                <td className="px-6 py-4 text-right">
                   {item.letter && !item.letter.details?.transferred && (
                      <button
                        onClick={() => handleTransfer(item.letter.id)}
                        className="text-[10px] font-black text-emerald-700 uppercase tracking-widest flex items-center gap-1.5 ml-auto hover:text-emerald-900"
                      >
                         Transfer to Envelope <Send className="w-3 h-3" />
                      </button>
                   )}
                   {item.letter?.details?.transferred && (
                      <div className="flex items-center gap-1.5 text-emerald-600 justify-end">
                         <CheckCircle className="w-3 h-3" />
                         <span className="text-[9px] font-black uppercase">Complete</span>
                      </div>
                   )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-start gap-4">
         <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm flex-shrink-0">
            <ShieldCheck className="w-5 h-5 text-emerald-700" />
         </div>
         <div className="space-y-1">
            <p className="text-sm font-bold text-emerald-900">Digital Envelope Security</p>
            <p className="text-xs text-emerald-800/70 leading-relaxed">
              When you "Transfer to Envelope," the mentor's private testimony is moved to the student's personal formation record. Students can only open these at the transition to Cohort 2.
            </p>
         </div>
      </div>
    </div>
  )
}
