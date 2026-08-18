'use client'

import { useState } from 'react'
import { promoteToAdmin, demoteToMentor } from '@/lib/actions/admin'
import { ShieldCheck, UserCheck, ChevronDown } from '@/components/icons'
import { cn } from '@/lib/utils'

export function RolePromoter({ userId, currentRole }: { userId: string; currentRole: string }) {
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)

  const handleRoleChange = async (role: string) => {
    setLoading(true)
    if (role === 'admin') await promoteToAdmin(userId)
    if (role === 'mentor') await demoteToMentor(userId)
    setLoading(false)
    setOpen(false)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        disabled={loading}
        className={cn(
          "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
          currentRole === 'admin' ? "bg-red-50 text-red-700" : "bg-blue-50 text-blue-700 hover:bg-blue-100"
        )}
      >
        {currentRole === 'admin' ? <ShieldCheck className="w-3 h-3" /> : <UserCheck className="w-3 h-3" />}
        {currentRole}
        <ChevronDown className="w-3 h-3" />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-32 bg-white border border-gray-100 rounded-xl shadow-xl z-50 py-1 overflow-hidden">
          <button
            onClick={() => handleRoleChange('student')}
            className="w-full px-4 py-2 text-left text-[10px] font-bold text-gray-500 hover:bg-gray-50 uppercase tracking-widest"
          >
            Student
          </button>
          <button
            onClick={() => handleRoleChange('mentor')}
            className="w-full px-4 py-2 text-left text-[10px] font-bold text-blue-600 hover:bg-blue-50 uppercase tracking-widest"
          >
            Mentor
          </button>
          <button
            onClick={() => handleRoleChange('admin')}
            className="w-full px-4 py-2 text-left text-[10px] font-bold text-red-600 hover:bg-red-50 uppercase tracking-widest border-t border-gray-50"
          >
            Promote to Admin
          </button>
        </div>
      )}
    </div>
  )
}
