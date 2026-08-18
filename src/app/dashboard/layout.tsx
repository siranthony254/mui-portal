import { redirect } from 'next/navigation'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { DashboardShell } from '@/components/layout/DashboardShell'
import { isAdminEmail } from '@/lib/auth/admin-emails'
import { ensureAdminProfile } from '@/lib/auth/admin-profile'
import { getMyNotifications } from '@/lib/actions/notifications'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const notifications = await getMyNotifications()

  // 1. Handle Admin Redirection
  if (isAdminEmail(user.email)) {
    try {
      const admin = await createAdminClient()
      await ensureAdminProfile(admin, user)
    } catch (e) {
      console.error('[DashboardLayout] Admin profile setup failed:', e)
    }
    redirect('/admin')
  }

  // 2. Fetch Profile for Students/Mentors
  const { data: profile, error } = await supabase.from('profiles').select('*').eq('id', user.id).single()

  if (error || !profile) {
    console.error('[DashboardLayout] Profile fetch error or missing:', error)
    redirect('/auth/login')
  }

  // 3. Prevent role-mismatch (e.g. mentor in student dashboard)
  if (profile.role === 'mentor') {
    redirect('/mentor')
  }

  return (
    <DashboardShell profile={profile} notifications={notifications}>
      {children}
    </DashboardShell>
  )
}

