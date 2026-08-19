import { redirect } from 'next/navigation'
import { createAdminClient, createClient } from '@/lib/supabase/server'
import { isAdminEmail } from '@/lib/auth/admin-emails'
import { ensureAdminProfile } from '@/lib/auth/admin-profile'
import { DashboardShell } from '@/components/layout/DashboardShell'
import { AdminSecurityGate } from '@/components/admin/AdminSecurityGate'

import { getMyNotifications } from '@/lib/actions/notifications'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const notifications = await getMyNotifications()
  const admin = await createAdminClient()
  let { data: profile } = await admin.from('profiles').select('*').eq('id', user.id).single()

  if (isAdminEmail(user.email)) {
    try {
      profile = await ensureAdminProfile(admin, user)
    } catch (e) {
      console.error('[AdminLayout] Profile sync failed:', e)
      // Fallback: manually fetch if upsert fails
      const { data } = await admin.from('profiles').select('*').eq('id', user.id).single()
      profile = data
    }
  }

  if (!profile || profile.role !== 'admin') redirect('/dashboard')

  return (
    <DashboardShell profile={profile} notifications={notifications}>
      {children}
    </DashboardShell>
  )
}
