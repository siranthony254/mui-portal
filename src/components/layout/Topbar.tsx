'use client'
import { useState } from 'react'
import { signOut } from '@/lib/actions/auth'
import { getInitials } from '@/lib/utils'
import type { Profile } from '@/types'
import { Bell, LogOut, ChevronDown } from '@/components/icons'

export function Topbar({ profile }: { profile: Profile }) {
  const [open, setOpen] = useState(false)
  return (
    <header className="h-14 bg-white border-b border-gray-100 px-6 flex items-center justify-between flex-shrink-0">
      <div className="flex items-center gap-2 text-sm text-gray-400">
        <span>MUI Portal</span><span className="text-gray-200">/</span>
        <span className="font-medium text-gray-700 capitalize">{profile.role}</span>
      </div>
      <div className="flex items-center gap-3">
        <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
          <Bell className="w-4 h-4" />
        </button>
        <div className="relative">
          <button onClick={() => setOpen(!open)} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="w-7 h-7 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-xs font-semibold">
              {getInitials(profile.full_name)}
            </div>
            <span className="text-sm font-medium text-gray-700 hidden sm:block">{profile.full_name.split(' ')[0]}</span>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
          </button>
          {open && (
            <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-100 rounded-xl shadow-lg z-50 py-1">
              <div className="px-3 py-2 border-b border-gray-50">
                <p className="text-xs font-medium text-gray-900">{profile.full_name}</p>
                <p className="text-xs text-gray-400">{profile.email}</p>
              </div>
              <form action={signOut}>
                <button type="submit" className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors">
                  <LogOut className="w-4 h-4" />Sign out
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
