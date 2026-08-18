'use client'
import { useState } from 'react'
import { signOut } from '@/lib/actions/auth'
import { getInitials, formatDate } from '@/lib/utils'
import type { Profile } from '@/types'
import { Bell, LogOut, ChevronDown, Menu, CheckCircle, Clock } from '@/components/icons'
import { markAsRead, clearAllNotifications } from '@/lib/actions/notifications'
import Link from 'next/link'

export function Topbar({ profile, onMenuClick, initialNotifications = [] }: { profile: Profile; onMenuClick?: () => void; initialNotifications?: any[] }) {
  const [open, setOpen] = useState(false)
  const [notifsOpen, setNotifsOpen] = useState(false)
  const unreadCount = initialNotifications.filter(n => !n.read).length

  return (
    <header className="h-16 bg-white border-b border-gray-100 px-4 md:px-6 flex items-center justify-between flex-shrink-0">
      <div className="flex items-center gap-3">
        {onMenuClick && (
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 text-gray-500 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <span className="hidden sm:inline">MUI Forge</span><span className="text-gray-200 hidden sm:inline">/</span>
          <span className="font-medium text-gray-700 capitalize">{profile.role}</span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="relative">
          <button
            onClick={() => setNotifsOpen(!notifsOpen)}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors relative"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
            )}
          </button>

          {notifsOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-gray-100 rounded-2xl shadow-2xl z-50 overflow-hidden">
               <div className="p-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">Notifications</h3>
                  {unreadCount > 0 && <span className="badge badge-teal text-[10px]">{unreadCount} New</span>}
               </div>
               <div className="max-h-96 overflow-y-auto divide-y divide-gray-50">
                  {initialNotifications.length === 0 ? (
                    <div className="p-10 text-center text-gray-400 italic text-xs">No notifications yet.</div>
                  ) : initialNotifications.map(n => (
                    <div key={n.id} className="p-4 hover:bg-gray-50 transition-colors group">
                       <div className="flex justify-between items-start gap-3">
                          <div className="space-y-1">
                             <p className="text-sm font-bold text-gray-900 leading-tight">{n.title}</p>
                             <p className="text-xs text-gray-500 leading-relaxed">{n.message}</p>
                             <p className="text-[9px] text-gray-400 font-bold uppercase tracking-tighter pt-1 flex items-center gap-1">
                               <Clock className="w-2.5 h-2.5" /> {formatDate(n.created_at)}
                             </p>
                          </div>
                          {!n.read && (
                            <button
                                onClick={() => markAsRead(n.id)}
                                className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <CheckCircle className="w-3.5 h-3.5" />
                            </button>
                          )}
                       </div>
                    </div>
                  ))}
               </div>
               <div className="p-3 bg-gray-50 border-t border-gray-100 text-center">
                  <button
                    onClick={() => clearAllNotifications()}
                    className="text-[10px] font-black text-emerald-700 uppercase tracking-widest hover:text-emerald-900 transition-colors"
                  >
                    Clear All
                  </button>
               </div>
            </div>
          )}
        </div>
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
