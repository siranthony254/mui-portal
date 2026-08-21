import { createClient, createAdminClient } from '@/lib/supabase/server'
export const dynamic = 'force-dynamic'
import { redirect } from 'next/navigation'
import { getInitials, formatDate } from '@/lib/utils'
import { Users, UserPlus, ArrowLeft, Mail, Phone, Calendar, Award, CheckCircle, XCircle, Clock } from '@/components/icons'
import { assignMentorToStudent } from '@/lib/actions/admin'
import { Metadata } from 'next'

export const metadata: Metadata = { title: 'Mentor Overview' }

export default async function MentorOverviewPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const admin = await createAdminClient()

  // Get mentor details
  const { data: mentor } = await admin
    .from('profiles')
    .select('*')
    .eq('id', params.id)
    .eq('role', 'mentor')
    .single()

  if (!mentor) {
    return (
      <div className="max-w-6xl mx-auto space-y-8 pb-20">
        <div className="page-header">
          <h1 className="page-title uppercase tracking-tighter">Mentor Not Found</h1>
        </div>
        <div className="card p-12 text-center">
          <p className="text-gray-500">This mentor profile does not exist.</p>
        </div>
      </div>
    )
  }

  // Get mentor's current students
  const { data: currentStudents } = await admin
    .from('enrollments')
    .select('*, student:profiles!student_id(id, full_name, email, institution, institution_type, year_of_study, status, created_at), cohort:cohorts(id, name)')
    .eq('mentor_id', params.id)
    .in('status', ['enrolled', 'active'])

  // Get available students without mentors
  const { data: availableStudents } = await admin
    .from('enrollments')
    .select('*, student:profiles!student_id(id, full_name, email, institution, institution_type, year_of_study), cohort:cohorts(id, name)')
    .is('mentor_id', null)
    .in('status', ['enrolled', 'active'])

  // Get mentor's task review stats
  const studentIds = currentStudents?.map(e => (e.student as any)?.id).filter(Boolean) || []
  const { data: pendingTasks } = studentIds.length
    ? await admin.from('tasks').select('*').in('student_id', studentIds).eq('status', 'submitted')
    : { data: [] }

  const { data: completedTasks } = studentIds.length
    ? await admin.from('tasks').select('*').in('student_id', studentIds).eq('status', 'completed')
    : { data: [] }

  // Get mentor's activity
  const lastLogin = mentor.last_login_at ? new Date(mentor.last_login_at) : null
  const daysSinceLogin = lastLogin ? Math.floor((Date.now() - lastLogin.getTime()) / (1000 * 60 * 60 * 24)) : null

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <div className="page-header">
          <a href="/admin/mentors" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Mentors
          </a>
          <h1 className="page-title uppercase tracking-tighter">Mentor Overview</h1>
        </div>
      </div>

      {/* Mentor Profile Card */}
      <div className="card p-6">
        <div className="flex items-start gap-6">
          <div className="w-20 h-20 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center text-2xl font-bold flex-shrink-0">
            {getInitials(mentor.full_name)}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-xl font-bold text-gray-900">{mentor.full_name}</h2>
              <span className={`badge ${mentor.status === 'approved' ? 'badge-emerald' : 'badge-amber'}`}>
                {mentor.status}
              </span>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
              <span className="flex items-center gap-1.5">
                <Mail className="w-4 h-4" /> {mentor.email}
              </span>
              {mentor.phone && (
                <span className="flex items-center gap-1.5">
                  <Phone className="w-4 h-4" /> {mentor.phone}
                </span>
              )}
            </div>
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="text-gray-500">Joined {formatDate(mentor.created_at)}</span>
              </div>
              {daysSinceLogin !== null && (
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className={daysSinceLogin <= 7 ? 'text-emerald-600' : 'text-amber-600'}>
                    Last active {daysSinceLogin === 0 ? 'today' : daysSinceLogin === 1 ? 'yesterday' : `${daysSinceLogin} days ago`}
                  </span>
                </div>
              )}
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-black text-gray-900">{currentStudents?.length || 0}</div>
            <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">Students</div>
          </div>
        </div>
        {mentor.bio && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-sm text-gray-600 leading-relaxed">{mentor.bio}</p>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <div className="text-2xl font-black text-gray-900">{currentStudents?.length || 0}</div>
              <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">Assigned</div>
            </div>
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <div className="text-2xl font-black text-gray-900">{pendingTasks?.length || 0}</div>
              <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">Pending Reviews</div>
            </div>
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-black text-gray-900">{completedTasks?.length || 0}</div>
              <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">Completed Tasks</div>
            </div>
          </div>
        </div>
      </div>

      {/* Current Students */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-black text-emerald-600 uppercase tracking-[0.2em]">Assigned Students</h2>
        </div>
        {!currentStudents?.length ? (
          <div className="card p-8 text-center">
            <Users className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="text-sm text-gray-500">No students assigned to this mentor yet.</p>
          </div>
        ) : (
          <div className="card divide-y divide-gray-50">
            {currentStudents.map((enrollment: any) => {
              const student = enrollment.student
              const cohort = enrollment.cohort
              return (
                <div key={enrollment.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-sm font-bold flex-shrink-0">
                      {getInitials(student.full_name)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">{student.full_name}</p>
                      <p className="text-xs text-gray-500">{student.institution} · {cohort?.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`badge ${student.status === 'approved' ? 'badge-emerald' : 'badge-amber'}`}>
                      {student.status}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Assign New Students */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-black text-emerald-600 uppercase tracking-[0.2em]">Assign New Students</h2>
        </div>
        {!availableStudents?.length ? (
          <div className="card p-8 text-center">
            <UserPlus className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="text-sm text-gray-500">No available students to assign.</p>
          </div>
        ) : (
          <div className="card divide-y divide-gray-50">
            {availableStudents.map((enrollment: any) => {
              const student = enrollment.student
              const cohort = enrollment.cohort
              return (
                <div key={enrollment.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center text-sm font-bold flex-shrink-0">
                      {getInitials(student.full_name)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">{student.full_name}</p>
                      <p className="text-xs text-gray-500">{student.institution} · {cohort?.name}</p>
                    </div>
                  </div>
                  <form action={async () => {
                    'use server'
                    await assignMentorToStudent(student.id, params.id)
                  }}>
                    <button className="btn-primary text-xs">Assign</button>
                  </form>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
