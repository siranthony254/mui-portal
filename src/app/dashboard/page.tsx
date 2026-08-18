import { redirect } from 'next/navigation'
export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase/server'
import { WaitlistScreen } from '@/components/cohort/WaitlistScreen'
import { StudentDashboard } from '@/components/cohort/StudentDashboard'
import { MentorPendingScreen } from '@/components/auth/MentorPendingScreen'
import { StudentOnboarding } from '@/components/cohort/StudentOnboarding'
import { Metadata } from 'next'

export const metadata: Metadata = { title: 'Dashboard' }

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()

  if (!profile) {
    // If authenticated but no profile, this is an edge case (e.g. failed signup sync)
    // We should allow them to sign out or contact support, not loop them.
    return (
      <div className="min-h-screen flex items-center justify-center p-6 text-center">
        <div className="max-w-md">
          <h1 className="text-2xl font-bold mb-4">Profile Not Found</h1>
          <p className="text-gray-500 mb-6">We couldn't find your profile data. Please try signing out and in again.</p>
          <form action="/auth/login"><button className="btn-primary">Back to Login</button></form>
        </div>
      </div>
    )
  }

  // 1. Admin bypass
  if (profile.role === 'admin') {
    redirect('/admin')
  }

  // 2. Mentor handling
  if (profile.role === 'mentor') {
    if (!profile.approved) {
      return <MentorPendingScreen profile={profile} />
    }
    redirect('/mentor')
  }

  // 3. Student handling
  const { data: enrollment } = await supabase.from('enrollments')
    .select('*,cohort:cohorts(*),mentor:profiles!mentor_id(id,full_name,bio)')
    .eq('student_id', user.id)
    .in('status',['enrolled','active'])
    .order('enrolled_at',{ascending:false})
    .limit(1)
    .single()

  // Student Onboarding Check
  if (profile.role === 'student' && enrollment) {
    if (!profile.onboarded || !profile.welcome_screen_shown) {
      return <StudentOnboarding profile={profile} cohort={enrollment.cohort} />
    }
  }

  if (enrollment) {
    const { data: tasks } = await supabase.from('tasks')
      .select('*')
      .eq('enrollment_id', enrollment.id)
      .eq('week_number', enrollment.cohort?.current_week || 1)
      .order('pillar_number',{ascending:true})

    const { data: partnershipData } = await supabase.from('accountability_partnerships')
        .select('*, p1:profiles!student_id_1(id, full_name, institution), p2:profiles!student_id_2(id, full_name, institution)')
        .eq('cohort_id', enrollment.cohort_id)
        .or(`student_id_1.eq.${user.id},student_id_2.eq.${user.id}`)
        .maybeSingle()

    let partnership = null
    if (partnershipData) {
      const isP1 = partnershipData.student_id_1 === user.id
      partnership = {
        ...partnershipData,
        partner: isP1 ? partnershipData.p2 : partnershipData.p1
      }
    }

    return <StudentDashboard enrollment={enrollment} tasks={tasks||[]} profile={profile} partnership={partnership} />
  }

  const { data: waitlistEntry } = await supabase.from('waitlist')
    .select('*,cohort:cohorts(name,semester,year)')
    .eq('student_id', user.id)
    .eq('status','waiting')
    .order('applied_at',{ascending:false})
    .limit(1)
    .single()

  if (waitlistEntry) return <WaitlistScreen waitlistEntry={waitlistEntry} />

  return (
    <div className="max-w-lg mx-auto text-center py-16">
      <div className="w-16 h-16 bg-teal-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <div className="w-7 h-7 rounded-full bg-teal-700" />
      </div>
      <h1 className="text-xl font-semibold text-gray-900 mb-2">Welcome, {profile.full_name.split(' ')[0]}</h1>
      <p className="text-sm text-gray-500 mb-6">You are not yet enrolled in a cohort. Apply for the next one to begin your formation journey.</p>
      <a href="/dashboard/apply" className="btn-primary">Apply for next cohort</a>
    </div>
  )
}
