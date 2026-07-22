import { NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'
import { createAdminClient, createClient } from '@/lib/supabase/server'
import { ensureAdminProfile } from '@/lib/auth/admin-profile'
import { getAppUrl } from '@/lib/app-url'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next')
  const baseUrl = getAppUrl()

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const admin = await createAdminClient()
        await ensureAdminProfile(admin, user)
      }

      if (next && next !== '/auth/login') {
        return NextResponse.redirect(`${baseUrl}${next}`)
      }
      return NextResponse.redirect(`${baseUrl}/auth/login?confirmed=true`)
    }
  }
  return NextResponse.redirect(`${baseUrl}/auth/login?error=auth_failed`)
}

