import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  // Create an initial response
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const { pathname } = request.nextUrl

  // 0. EXCLUDE STATIC ASSETS AND SYSTEM ROUTES
  // Next.js handles many of these, but we need to be explicit for some
  const isStaticAsset = pathname.includes('.') ||
                        pathname.startsWith('/_next') ||
                        pathname === '/favicon.ico' ||
                        pathname === '/sw.js' ||
                        pathname.startsWith('/manifest') ||
                        pathname.endsWith('.webmanifest')

  if (isStaticAsset) return response

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
            request: {
              headers: request.headers,
            },
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Use getUser() instead of getSession() for security/verification
  const { data: { user } } = await supabase.auth.getUser()

  // Define public routes
  const publicPaths = ['/auth/login', '/auth/register', '/auth/callback', '/auth/pending', '/auth/mentor-apply', '/auth/activate']
  const isLandingPage = pathname === '/'
  const isPublicPath = publicPaths.some(p => pathname === p || pathname.startsWith(`${p}/`))

  // 1. If user is NOT logged in and trying to access a PROTECTED route, redirect to login
  if (!user && !isPublicPath && !isLandingPage) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    return NextResponse.redirect(url)
  }

  // 2. If user IS logged in and trying to access LOGIN/REGISTER, redirect to dashboard
  if (user && isPublicPath && pathname !== '/auth/activate') {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return response
}

export default proxy

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - sw.js, manifest.json etc
     */
    '/((?!_next/static|_next/image|favicon.ico|sw.js|manifest.*|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
