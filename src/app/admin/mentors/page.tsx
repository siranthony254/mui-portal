import { createClient } from '@/lib/supabase/server'
export const dynamic = 'force-dynamic'
import { redirect } from 'next/navigation'
import { getInitials, formatDate, cn } from '@/lib/utils'
import { UserStatusToggle } from '@/components/admin/UserStatusToggle'
import { RolePromoter } from '@/components/admin/RolePromoter'
import { DeleteUserButton } from '@/components/admin/DeleteUserButton'
import { Metadata } from 'next'
import { Search, UserCheck, MessageSquare, ExternalLink } from '@/components/icons'
import Link from 'next/link'

export const metadata: Metadata = { title: 'Mentor Management — People Hub' }

export default async function MentorsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: mentors } = await supabase.from('profiles')
    .select('*, enrollments:enrollments(id)')
    .eq('role', 'mentor')
    .order('created_at', { ascending: false })

  const pendingCount = mentors?.filter(m => !m.approved).length || 0

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      <div className="page-header">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Mentor Management</h1>
          <p className="text-sm text-gray-500 font-medium">Approve, promote, and oversee MUI formation mentors.</p>
        </div>
        <div className="flex gap-2">
           <span className="badge badge-amber">{pendingCount} Pending</span>
           <span className="badge badge-teal">{(mentors?.length || 0) - pendingCount} Active</span>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
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
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Mentor</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Bio & Background</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Students</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Access Status</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {mentors?.map(mentor => (
                <tr key={mentor.id} className="group hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                       <div className="w-10 h-10 rounded-[0.8rem] bg-teal-100 text-teal-700 flex items-center justify-center font-black text-xs">
                         {getInitials(mentor.full_name)}
                       </div>
                       <div>
                         <p className="text-sm font-bold text-gray-900 leading-none mb-1">{mentor.full_name}</p>
                         <p className="text-xs text-gray-400 font-medium">{mentor.email}</p>
                       </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 max-w-xs">
                     <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed italic">
                        {mentor.bio || "No bio provided."}
                     </p>
                  </td>
                  <td className="px-6 py-5 text-center">
                     <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-gray-100 text-gray-600 text-[10px] font-black">
                        {mentor.enrollments?.length || 0}
                     </span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                       <UserStatusToggle userId={mentor.id} initialStatus={mentor.approved} />
                       <span className={cn(
                         "text-[9px] font-black uppercase tracking-widest",
                         mentor.approved ? "text-emerald-600" : "text-amber-500"
                       )}>
                         {mentor.approved ? 'Active' : 'Pending'}
                       </span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
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
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

