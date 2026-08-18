'use client'

import { useState } from 'react'
import { toggleUserApproval } from '@/lib/actions/admin'
import { cn } from '@/lib/utils'

export function UserStatusToggle({ userId, initialStatus }: { userId: string; initialStatus: boolean }) {
  const [approved, setApproved] = useState(initialStatus)
  const [loading, setLoading] = useState(false)

  const handleToggle = async () => {
    setLoading(true)
    const nextStatus = !approved
    const res = await toggleUserApproval(userId, nextStatus)
    if (res.success) {
      setApproved(nextStatus)
    }
    setLoading(false)
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={cn(
        "relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2 disabled:opacity-50",
        approved ? "bg-emerald-600" : "bg-gray-200"
      )}
    >
      <span
        className={cn(
          "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
          approved ? "translate-x-5" : "translate-x-0"
        )}
      />
    </button>
  )
}
