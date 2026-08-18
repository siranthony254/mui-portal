import { createClient } from '@/lib/supabase/server'
export const dynamic = 'force-dynamic'
import { notFound, redirect } from 'next/navigation'
import { ProfileForm } from '@/components/auth/ProfileForm'
import { getInitials, formatDate } from '@/lib/utils'
import { ArrowLeft, MessageSquare, Award } from '@/components/icons'
import Link from 'next/link'
import { Metadata } from 'next'

export const metadata: Metadata = { title: 'Manage Student — MUI Admin' }

export default async function AdminStudentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', id).single()
  if (!profile || profile.role !== 'student') notFound()

  const { data: enrollment } = await supabase.from('enrollments')
    .select('*, cohort:cohorts(name)')
    .eq('student_id', id)
    .single()

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <Link href="/admin/students" className="inline-flex items-center gap-1.5 text-xs font-black text-gray-400 uppercase tracking-widest hover:text-gray-900 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to students
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 space-y-6">
          <div className="card p-8 text-center">
            <div className="w-20 h-20 rounded-[2rem] bg-emerald-100 text-emerald-700 flex items-center justify-center text-3xl font-black mx-auto mb-4">
              {getInitials(profile.full_name)}
            </div>
            <h2 className="text-xl font-black text-gray-900">{profile.full_name}</h2>
            <p className="text-sm text-gray-400 font-medium">{profile.email}</p>

            <div className="mt-6 pt-6 border-t border-gray-100 flex flex-col gap-2">
                {enrollment ? (
                    <div className="bg-teal-50 p-4 rounded-2xl border border-teal-100">
                        <p className="text-[10px] font-black text-teal-600 uppercase tracking-widest mb-1 flex items-center justify-center gap-1.5">
                            <Award className="w-3 h-3" /> Active Enrollment
                        </p>
                        <p className="text-sm font-bold text-teal-900">{enrollment.cohort.name}</p>
                    </div>
                ) : (
                    <p className="text-xs text-gray-400 italic">Not currently enrolled in any cohort.</p>
                )}
                <Link href={`/admin/messages?user=${profile.id}`} className="btn-secondary w-full justify-center py-3 text-xs">
                    <MessageSquare className="w-4 h-4" /> Message Student
                </Link>
            </div>
          </div>

          <div className="card p-6 bg-gray-50 border-dashed border-gray-200">
             <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Audit Info</p>
             <p className="text-[11px] text-gray-500">Account Created: {formatDate(profile.created_at)}</p>
             <p className="text-[11px] text-gray-500">Last Login: {profile.last_login_at ? formatDate(profile.last_login_at) : 'Never'}</p>
          </div>
        </div>

        <div className="lg:col-span-8">
           <div className="card p-8">
              <h3 className="text-xs font-black text-emerald-600 uppercase tracking-[0.2em] mb-8">Edit Student Profile</h3>
              <ProfileForm profile={profile} />
           </div>
        </div>
      </div>
    </div>
  )
}
