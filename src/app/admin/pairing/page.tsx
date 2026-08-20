import { createClient } from '@/lib/supabase/server'
export const dynamic = 'force-dynamic'
import { redirect } from 'next/navigation'
import { Metadata } from 'next'
import { PairingManager } from '@/components/admin/PairingManager'

export const metadata: Metadata = { title: 'Pairing & Grouping — Control Room' }

export default async function PairingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const [
    { data: cohorts },
    { data: students },
    { data: mentors },
    { data: partnerships }
  ] = await Promise.all([
    supabase.from('cohorts').select('id, name, semester, year').order('created_at', { ascending: false }),
    supabase.from('profiles').select('id, full_name, email, institution, role').eq('role', 'student'),
    supabase.from('profiles').select('id, full_name, email, bio').eq('role', 'mentor').eq('approved', true),
    supabase.from('accountability_partnerships').select('*, p1:profiles!student_id_1(id, full_name), p2:profiles!student_id_2(id, full_name)')
  ])

  // Fetch enrollments to know who is in which cohort and who has which mentor
  const { data: enrollments } = await supabase.from('enrollments').select('*')

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20">
      <div className="page-header">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase">Pairing & Grouping</h1>
          <p className="text-sm text-gray-500 font-medium">Match students for peer accountability and assign mentors to cohorts.</p>
        </div>
      </div>

      <PairingManager
        cohorts={cohorts || []}
        students={students || []}
        mentors={mentors || []}
        partnerships={partnerships || []}
        enrollments={enrollments || []}
      />
    </div>
  )
}
