import type { SupabaseClient } from '@supabase/supabase-js'
import { isAdminEmail } from './admin-emails'

type AuthUser = {
  id: string
  email?: string | null
  user_metadata?: {
    full_name?: string
  }
}

export async function ensureAdminProfile(admin: SupabaseClient, user: AuthUser) {
  if (!isAdminEmail(user.email)) return null

  const email = user.email!.trim().toLowerCase()
  const fullName = user.user_metadata?.full_name || email

  const { data, error } = await admin
    .from('profiles')
    .upsert(
      {
        id: user.id,
        email,
        full_name: fullName,
        role: 'admin',
        approved: true,
      },
      { onConflict: 'id' },
    )
    .select('*')
    .single()

  if (error) throw error
  return data
}
