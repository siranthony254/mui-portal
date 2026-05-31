import { NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'
import { createAdminClient, createClient } from '@/lib/supabase/server'
import { ensureAdminProfile } from '@/lib/auth/admin-profile'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const admin = await createAdminClient()
        await ensureAdminProfile(admin, user)
      }

      return NextResponse.redirect(`${origin}/`)
    }
  }
  return NextResponse.redirect(`${origin}/auth/login?error=auth_failed`)
}
