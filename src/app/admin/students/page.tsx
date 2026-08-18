import { createClient } from '@/lib/supabase/server'
export const dynamic = 'force-dynamic'
import { redirect } from 'next/navigation'
import { getInitials, cn } from '@/lib/utils'
import { Metadata } from 'next'
import { Search, UserCheck, MessageSquare, AlertCircle } from '@/components/icons'
import Link from 'next/link'
import { UserStatusToggle } from '@/components/admin/UserStatusToggle'
import { CohortAndMentorPicker } from '@/components/admin/CohortAndMentorPicker'
import { DeleteUserButton } from '@/components/admin/DeleteUserButton'

export const metadata: Metadata = { title: 'Student Management — People Hub' }

export default async function StudentsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const [
    { data: students },
    { data: cohorts },
    { data: mentors },
  ] = await Promise.all([
    supabase.from('profiles').select('*, enrollments:enrollments(*, cohort:cohorts(id, name))').eq('role', 'student').order('created_at', { ascending: false }),
    supabase.from('cohorts').select('id, name').order('year', { ascending: false }),
    supabase.from('profiles').select('id, full_name').eq('role', 'mentor').eq('approved', true)
  ])

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20">
      <div className="page-header">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Student Management</h1>
          <p className="text-sm text-gray-500 font-medium">Oversee formation, assign mentors, and track engagement.</p>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
           <div className="relative max-w-sm w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                placeholder="Search students by name, email or campus..."
                className="w-full pl-10 pr-4 py-2 text-sm bg-white border border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-0 transition-all"
              />
           </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Student</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Institution</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Formation Assignment</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Progress</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Access</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {students?.map(student => {
                const enrollment = student.enrollments?.[0] as any
                const pct = enrollment ? Math.round(((enrollment.current_week - 1) / 12) * 100) : 0

                return (
                  <tr key={student.id} className="group hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-[0.8rem] bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-xs">
                           {getInitials(student.full_name)}
                         </div>
                         <div>
                           <p className="text-sm font-bold text-gray-900 leading-none mb-1">{student.full_name}</p>
                           <p className="text-[10px] text-gray-400 font-medium">{student.email}</p>
                         </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                       <p className="text-xs font-bold text-gray-700 mb-0.5">{student.institution}</p>
                       <span className={cn(
                         "text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md",
                         student.institution_type === 'tvet' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'
                       )}>
                         {student.institution_type || 'uni'}
                       </span>
                    </td>
                    <td className="px-6 py-5">
                       <CohortAndMentorPicker
                        studentId={student.id}
                        currentCohortId={enrollment?.cohort_id}
                        currentMentorId={enrollment?.mentor_id}
                        cohorts={cohorts || []}
                        mentors={mentors || []}
                       />
                    </td>
                    <td className="px-6 py-5">
                      {enrollment ? (
                        <div className="w-32">
                          <div className="flex justify-between text-[9px] font-black uppercase tracking-widest mb-1">
                             <span className="text-gray-400">Week {enrollment.current_week}</span>
                             <span className="text-teal-700">{pct}%</span>
                          </div>
                          <div className="progress-bar h-1">
                             <div className="progress-fill" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      ) : (
                        <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">Not Enrolled</span>
                      )}
                    </td>
                    <td className="px-6 py-5">
                       <UserStatusToggle userId={student.id} initialStatus={student.approved} />
                    </td>
                    <td className="px-6 py-5">
                       <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/students/${student.id}`}
                            className="p-2 hover:bg-white rounded-lg border border-transparent hover:border-gray-100 text-gray-400 hover:text-teal-600 transition-all"
                          >
                            <AlertCircle className="w-4 h-4" />
                          </Link>
                          <Link
                            href={`/admin/messages?user=${student.id}`}
                            className="p-2 hover:bg-white rounded-lg border border-transparent hover:border-gray-100 text-gray-400 hover:text-teal-600 transition-all"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </Link>
                          <DeleteUserButton userId={student.id} userName={student.full_name} />
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

