import { redirect } from 'next/navigation'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { DashboardShell } from '@/components/layout/DashboardShell'
import { isAdminEmail } from '@/lib/auth/admin-emails'
import { ensureAdminProfile } from '@/lib/auth/admin-profile'
import { getMyNotifications } from '@/lib/actions/notifications'

export default async function MentorLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const notifications = await getMyNotifications()

  // Handle Admin Redirection
  if (isAdminEmail(user.email)) {
    const admin = await createAdminClient()
    await ensureAdminProfile(admin, user)
    redirect('/admin')
  }

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  if (!profile || profile.role !== 'mentor') redirect('/dashboard')
  if (!profile.approved) redirect('/auth/pending')

  return (
    <DashboardShell profile={profile} notifications={notifications}>
      {children}
    </DashboardShell>
  )
}

