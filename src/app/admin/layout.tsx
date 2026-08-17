import { redirect } from 'next/navigation'
import { createAdminClient, createClient } from '@/lib/supabase/server'
import { isAdminEmail } from '@/lib/auth/admin-emails'
import { ensureAdminProfile } from '@/lib/auth/admin-profile'
import { DashboardShell } from '@/components/layout/DashboardShell'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')
  const admin = await createAdminClient()
  let { data: profile } = await admin.from('profiles').select('*').eq('id', user.id).single()

  if (isAdminEmail(user.email)) {
    profile = await ensureAdminProfile(admin, user)
  }

  if (!profile || profile.role !== 'admin') redirect('/dashboard')

  return (
    <DashboardShell profile={profile}>
      {children}
    </DashboardShell>
  )
}
