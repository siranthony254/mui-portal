'use client'

import { useState } from 'react'
import { updateStudentCohort, assignMentorToStudent } from '@/lib/actions/admin'
import { Users, Award, ChevronDown } from '@/components/icons'
import { cn } from '@/lib/utils'

interface Props {
  studentId: string
  currentCohortId?: string
  currentMentorId?: string
  cohorts: { id: string, name: string }[]
  mentors: { id: string, full_name: string }[]
}

export function CohortAndMentorPicker({ studentId, currentCohortId, currentMentorId, cohorts, mentors }: Props) {
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState<'cohort' | 'mentor' | null>(null)

  const handleCohortChange = async (cohortId: string | null) => {
    setLoading(true)
    await updateStudentCohort(studentId, cohortId)
    setLoading(false)
    setOpen(null)
  }

  const handleMentorChange = async (mentorId: string | null) => {
    setLoading(true)
    await assignMentorToStudent(studentId, mentorId)
    setLoading(false)
    setOpen(null)
  }

  const selectedCohort = cohorts.find(c => c.id === currentCohortId)
  const selectedMentor = mentors.find(m => m.id === currentMentorId)

  return (
    <div className="flex items-center gap-2">
      {/* Cohort Picker */}
      <div className="relative">
        <button
          onClick={() => setOpen(open === 'cohort' ? null : 'cohort')}
          disabled={loading}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all border",
            selectedCohort ? "bg-teal-50 border-teal-100 text-teal-700" : "bg-gray-50 border-gray-100 text-gray-400"
          )}
        >
          <Award className="w-3 h-3" />
          {selectedCohort ? selectedCohort.name : 'No Cohort'}
          <ChevronDown className="w-3 h-3 opacity-50" />
        </button>

        {open === 'cohort' && (
          <div className="absolute left-0 top-full mt-1 w-48 bg-white border border-gray-100 rounded-xl shadow-xl z-50 py-1 overflow-hidden">
             <button
              onClick={() => handleCohortChange(null)}
              className="w-full px-4 py-2 text-left text-[10px] font-bold text-red-600 hover:bg-red-50 uppercase tracking-widest"
            >
              Unenroll
            </button>
            {cohorts.map(c => (
              <button
                key={c.id}
                onClick={() => handleCohortChange(c.id)}
                className={cn(
                  "w-full px-4 py-2 text-left text-[10px] font-bold uppercase tracking-widest hover:bg-gray-50",
                  currentCohortId === c.id ? "bg-teal-50 text-teal-700" : "text-gray-600"
                )}
              >
                {c.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Mentor Picker */}
      <div className="relative">
        <button
          onClick={() => setOpen(open === 'mentor' ? null : 'mentor')}
          disabled={loading || !currentCohortId}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all border",
            selectedMentor ? "bg-blue-50 border-blue-100 text-blue-700" : "bg-gray-50 border-gray-100 text-gray-400",
            !currentCohortId && "opacity-30 cursor-not-allowed"
          )}
        >
          <Users className="w-3 h-3" />
          {selectedMentor ? selectedMentor.full_name.split(' ')[0] : 'No Mentor'}
          <ChevronDown className="w-3 h-3 opacity-50" />
        </button>

        {open === 'mentor' && (
          <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-100 rounded-xl shadow-xl z-50 py-1 overflow-hidden max-h-64 overflow-y-auto">
             <button
              onClick={() => handleMentorChange(null)}
              className="w-full px-4 py-2 text-left text-[10px] font-bold text-red-600 hover:bg-red-50 uppercase tracking-widest"
            >
              Remove Mentor
            </button>
            {mentors.map(m => (
              <button
                key={m.id}
                onClick={() => handleMentorChange(m.id)}
                className={cn(
                  "w-full px-4 py-2 text-left text-[10px] font-bold uppercase tracking-widest hover:bg-gray-50",
                  currentMentorId === m.id ? "bg-blue-50 text-blue-700" : "text-gray-600"
                )}
              >
                {m.full_name}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
