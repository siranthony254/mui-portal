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

  // Use a more resilient upsert that doesn't select '*' immediately
  // to avoid potential missing column issues in the return type
  const { data: upsertData, error: upsertError } = await admin
    .from('profiles')
    .upsert(
      {
        id: user.id,
        email,
        full_name: fullName,
        role: 'admin',
        approved: true,
      },
      { onConflict: 'id' }
    )
    .select()

  if (upsertError) {
    console.error('[ensureAdminProfile] Upsert error:', upsertError)
    // If it's a "column doesn't exist" error, we need to know
    throw new Error(`Admin profile sync failed: ${upsertError.message} (${upsertError.code})`)
  }

  return upsertData?.[0] || null
}
