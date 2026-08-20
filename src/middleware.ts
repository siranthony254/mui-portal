import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          response = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const { pathname } = request.nextUrl

  // 0. EXCLUDE STATIC ASSETS
  const isStaticAsset = pathname.includes('.') ||
                        pathname.startsWith('/_next') ||
                        pathname === '/favicon.ico'

  if (isStaticAsset) return response

  // Define public routes
  const publicPaths = ['/auth/login', '/auth/register', '/auth/callback', '/auth/pending', '/auth/mentor-apply', '/auth/activate']
  const isLandingPage = pathname === '/'
  const isPublicPath = publicPaths.some(p => pathname === p || pathname.startsWith(`${p}/`))

  // 1. Protection Logic
  if (!user && !isPublicPath && !isLandingPage) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    return NextResponse.redirect(url)
  }

  if (user) {
    // 2. Prevent logged in users from seeing auth pages
    if (isPublicPath && pathname !== '/auth/activate' && pathname !== '/auth/pending') {
      const url = request.nextUrl.clone()
      url.pathname = '/dashboard'
      return NextResponse.redirect(url)
    }

    // 3. Role-Based Access Control
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, approved, status')
      .eq('id', user.id)
      .single()

    if (profile) {
      if (pathname.startsWith('/admin') && profile.role !== 'admin') {
        const url = request.nextUrl.clone()
        url.pathname = '/dashboard'
        return NextResponse.redirect(url)
      }

      if (pathname.startsWith('/mentor')) {
        if (profile.role !== 'mentor' && profile.role !== 'admin') {
          const url = request.nextUrl.clone()
          url.pathname = '/dashboard'
          return NextResponse.redirect(url)
        }

        const isApproved = profile.approved || profile.status === 'approved'
        if (profile.role === 'mentor' && !isApproved && pathname !== '/auth/pending') {
          const url = request.nextUrl.clone()
          url.pathname = '/auth/pending'
          return NextResponse.redirect(url)
        }
      }
    }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
