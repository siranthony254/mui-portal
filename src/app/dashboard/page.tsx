import { redirect } from 'next/navigation'
export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase/server'
import { WaitlistScreen } from '@/components/cohort/WaitlistScreen'
import { StudentDashboard } from '@/components/cohort/StudentDashboard'
import { MentorPendingScreen } from '@/components/auth/MentorPendingScreen'
import { StudentOnboarding } from '@/components/cohort/StudentOnboarding'
import { Metadata } from 'next'
import { Zap } from '@/components/icons'
import Link from 'next/link'

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
    .maybeSingle()

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
    .maybeSingle()

  if (waitlistEntry) return <WaitlistScreen waitlistEntry={waitlistEntry} />

  // Fetch open cohorts if not enrolled or waitlisted
  const { data: openCohorts } = await supabase.from('cohorts')
    .select('*')
    .eq('applications_open', true)
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <div className="text-center py-12 px-6 bg-teal-900 rounded-[2.5rem] text-white overflow-hidden relative mb-8">
        <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12">
            <Zap className="w-40 h-40 fill-white" />
        </div>
        <div className="relative z-10 space-y-4">
            <h1 className="text-4xl font-black tracking-tighter uppercase">Welcome to MUI Forge, {profile.full_name.split(' ')[0]}</h1>
            <p className="text-teal-100/80 max-w-lg mx-auto font-medium">Your platform for formation, critical thinking, and cultural influence.</p>
        </div>
      </div>

      {openCohorts && openCohorts.length > 0 ? (
        <section className="space-y-6">
            <div className="flex items-center justify-between px-2">
                <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Open Applications</h2>
                <span className="badge badge-teal text-[10px] animate-pulse">New Cycle</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {openCohorts.map(cohort => (
                    <div key={cohort.id} className="card p-8 group hover:border-teal-600 transition-all space-y-6">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <h3 className="text-2xl font-black text-gray-900 group-hover:text-teal-700 transition-colors uppercase tracking-tight">{cohort.name}</h3>
                            </div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{cohort.semester} {cohort.year}</p>
                        </div>
                        {cohort.description && <p className="text-sm text-gray-500 leading-relaxed line-clamp-3">{cohort.description}</p>}
                        <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
                            <span className="text-[10px] font-black text-teal-600 uppercase tracking-widest">Applications Open</span>
                            <Link href="/dashboard/apply" className="btn-primary text-xs font-black uppercase tracking-widest py-3 px-6 rounded-xl">Apply Now</Link>
                        </div>
                    </div>
                ))}
            </div>
        </section>
      ) : (
        <div className="max-w-lg mx-auto text-center py-16">
            <div className="w-16 h-16 bg-teal-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <div className="w-7 h-7 rounded-full bg-teal-700" />
            </div>
            <h1 className="text-xl font-semibold text-gray-900 mb-2">No Active Cohorts</h1>
            <p className="text-sm text-gray-500 mb-6">There are no cohorts currently accepting applications. Check back soon for the next cycle.</p>
            <a href="https://micdupinitiative.site" target="_blank" rel="noopener noreferrer" className="btn-secondary">Visit MUI website</a>
        </div>
      )}
    </div>
  )
}
