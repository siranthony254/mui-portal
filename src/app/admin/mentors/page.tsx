import { createClient, createAdminClient } from '@/lib/supabase/server'
export const dynamic = 'force-dynamic'
import { redirect } from 'next/navigation'
import { getInitials, formatDate, cn, timeAgo } from '@/lib/utils'
import { UserStatusManager } from '@/components/admin/UserStatusManager'
import { RolePromoter } from '@/components/admin/RolePromoter'
import { DeleteUserButton } from '@/components/admin/DeleteUserButton'
import { Metadata } from 'next'
import { Search, UserCheck, MessageSquare, ExternalLink, Clock } from '@/components/icons'
import Link from 'next/link'

export const metadata: Metadata = { title: 'Mentor Management — People Hub' }

export default async function MentorsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  // Use admin client to bypass RLS and see all mentors
  const admin = await createAdminClient()
  const { data: mentors } = await admin.from('profiles')
    .select('*, enrollments:enrollments!enrollments_mentor_id_fkey(id)')
    .eq('role', 'mentor')
    .order('created_at', { ascending: false })

  const pendingCount = mentors?.filter(m => m.status === 'pending').length || 0
  const activeNowCount = mentors?.filter(m => {
    if (!m.last_login_at) return false
    const mins = (Date.now() - new Date(m.last_login_at).getTime()) / (1000 * 60)
    return mins < 15
  }).length || 0

  return (
    <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8 pb-20 px-4">
      <div className="page-header">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">Mentor Management</h1>
          <p className="text-sm text-gray-500 font-medium">Approve, promote, and oversee MUI formation mentors.</p>
        </div>
        <div className="flex gap-2">
           <span className="badge badge-amber">{pendingCount} Pending</span>
           <span className="badge badge-blue">{activeNowCount} Active Now</span>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="px-4 sm:px-6 py-4 bg-gray-50 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
           <div className="relative max-w-sm w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                placeholder="Search mentors by name or email..."
                className="w-full pl-10 pr-4 py-2 text-sm bg-white border border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-0 transition-all"
              />
           </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="px-4 sm:px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Mentor</th>
                <th className="px-4 sm:px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest hidden sm:table-cell">Bio & Background</th>
                <th className="px-4 sm:px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center hidden sm:table-cell">Students</th>
                <th className="px-4 sm:px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center hidden sm:table-cell">Last Seen</th>
                <th className="px-4 sm:px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest hidden sm:table-cell">Status</th>
                <th className="px-4 sm:px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {mentors?.map(mentor => {
                const isActive = mentor.last_login_at && (Date.now() - new Date(mentor.last_login_at).getTime()) / (1000 * 60) < 15

                return (
                  <tr key={mentor.id} className="group hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 sm:px-6 py-4 sm:py-5">
                      <Link href={`/admin/mentors/${mentor.id}`} className="flex items-center gap-3">
                        <div className="relative">
                          <div className="w-10 h-10 rounded-[0.8rem] bg-teal-100 text-teal-700 flex items-center justify-center font-black text-xs">
                            {getInitials(mentor.full_name)}
                          </div>
                          {isActive && (
                            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-blue-500 border-2 border-white rounded-full animate-pulse shadow-sm" title="Online Now" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-gray-900 leading-none mb-1 truncate">{mentor.full_name}</p>
                          <p className="text-xs text-gray-400 font-medium truncate">{mentor.email}</p>
                        </div>
                      </Link>
                    </td>
                    <td className="px-4 sm:px-6 py-4 sm:py-5 max-w-xs hidden sm:table-cell">
                       <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed italic">
                          {mentor.bio || "No bio provided."}
                       </p>
                    </td>
                    <td className="px-4 sm:px-6 py-4 sm:py-5 text-center hidden sm:table-cell">
                       <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-gray-100 text-gray-600 text-[10px] font-black">
                          {mentor.enrollments?.length || 0}
                       </span>
                    </td>
                    <td className="px-4 sm:px-6 py-4 sm:py-5 text-center hidden sm:table-cell">
                       <div className="flex flex-col items-center gap-0.5">
                         <p className="text-[10px] font-bold text-gray-700">
                           {mentor.last_login_at ? timeAgo(mentor.last_login_at) : 'Never'}
                         </p>
                         <Clock className="w-3 h-3 text-gray-300" />
                       </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4 sm:py-5 hidden sm:table-cell">
                       <UserStatusManager userId={mentor.id} currentStatus={mentor.status || 'pending'} />
                    </td>
                    <td className="px-4 sm:px-6 py-4 sm:py-5">
                       <div className="flex items-center justify-end gap-2">
                          <RolePromoter userId={mentor.id} currentRole={mentor.role} />
                          <Link
                            href={`/admin/messages?user=${mentor.id}`}
                            className="p-2 hover:bg-white rounded-lg border border-transparent hover:border-gray-100 text-gray-400 hover:text-teal-600 transition-all"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </Link>
                          <DeleteUserButton userId={mentor.id} userName={mentor.full_name} />
                       </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

