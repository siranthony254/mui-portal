import { redirect } from 'next/navigation'
export const dynamic = 'force-dynamic'
import { createAdminClient, createClient } from '@/lib/supabase/server'
import { isAdminEmail } from '@/lib/auth/admin-emails'
import { ensureAdminProfile } from '@/lib/auth/admin-profile'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')
  const admin = await createAdminClient()
  let { data: profile } = await admin.from('profiles').select('role,approved').eq('id', user.id).single()

  if (isAdminEmail(user.email)) {
    profile = await ensureAdminProfile(admin, user)
  }

  if (!profile) redirect('/auth/pending')

  if (profile.role === 'admin') redirect('/admin')
  if (profile.role === 'mentor' && !profile.approved) redirect('/auth/pending')
  if (profile.role === 'mentor') redirect('/mentor')
  redirect('/dashboard')
}
