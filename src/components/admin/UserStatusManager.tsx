'use client'

import { useState } from 'react'
import { updateUserStatus } from '@/lib/actions/admin'
import { cn } from '@/lib/utils'
import { CheckCircle, XCircle, LogOut, Clock, ChevronDown } from '@/components/icons'

type UserStatus = 'pending' | 'approved' | 'rejected' | 'left'

interface Props {
  userId: string
  currentStatus: UserStatus
}

export function UserStatusManager({ userId, currentStatus }: Props) {
  const [status, setStatus] = useState<UserStatus>(currentStatus)
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)

  const handleStatusChange = async (nextStatus: UserStatus) => {
    if (nextStatus === status) return
    setLoading(true)
    const res = await updateUserStatus(userId, nextStatus)
    if (res.success) {
      setStatus(nextStatus)
      setOpen(false)
    }
    setLoading(false)
  }

  const statusConfigs: Record<UserStatus, { label: string, color: string, icon: any }> = {
    pending: { label: 'Pending', color: 'bg-amber-100 text-amber-700 border-amber-200', icon: Clock },
    approved: { label: 'Approved', color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: CheckCircle },
    rejected: { label: 'Rejected', color: 'bg-red-100 text-red-700 border-red-200', icon: XCircle },
    left: { label: 'Left', color: 'bg-gray-100 text-gray-700 border-gray-200', icon: LogOut },
  }

  const config = statusConfigs[status]
  const StatusIcon = config.icon

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        disabled={loading}
        className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest transition-all shadow-sm active:scale-95 disabled:opacity-50",
          config.color
        )}
      >
        <StatusIcon className="w-3 h-3" />
        {config.label}
        <ChevronDown className={cn("w-3 h-3 opacity-50 transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-40 bg-white border border-gray-100 rounded-2xl shadow-2xl z-50 py-2 overflow-hidden animate-reveal">
          {(Object.entries(statusConfigs) as [UserStatus, any][]).map(([key, cfg]) => {
            const Icon = cfg.icon
            return (
              <button
                key={key}
                onClick={() => handleStatusChange(key)}
                className={cn(
                  "w-full px-4 py-2.5 text-left text-[10px] font-black uppercase tracking-widest flex items-center gap-3 transition-colors hover:bg-gray-50",
                  status === key ? "text-teal-600 bg-teal-50/50" : "text-gray-500"
                )}
              >
                <Icon className={cn("w-3.5 h-3.5", status === key ? "text-teal-600" : "text-gray-400")} />
                {cfg.label}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
