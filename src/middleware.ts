/**
 * Next.js Edge Middleware — route protection.
 *
 * Runs at the edge BEFORE any page renders. Checks for the access_token httpOnly cookie
 * and redirects unauthenticated users to /login.
 *
 * Admin routes additionally check the user_role cookie (non-httpOnly, for routing only;
 * actual role enforcement is done server-side in the gateway via JWT claims).
 */
import { NextRequest, NextResponse } from 'next/server'
import { ADMIN_ROLES } from '@/types'

/** Public paths that never require authentication. */
const PUBLIC_PATHS = ['/login', '/admin/login', '/register', '/api/auth', '/api/health', '/transaction-code']

/** Admin-only path prefix. */
const ADMIN_PATH = '/admin'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Let public paths through
  if (PUBLIC_PATHS.some(p => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  // Let Next.js internals through
  if (pathname.startsWith('/_next') || pathname.startsWith('/favicon')) {
    return NextResponse.next()
  }

  const accessToken = request.cookies.get('access_token')
  const userRole    = request.cookies.get('user_role')?.value ?? ''

  // Not authenticated — redirect to appropriate login page
  if (!accessToken) {
    const url = request.nextUrl.clone()
    url.pathname = pathname.startsWith('/admin') ? '/admin/login' : '/login'
    url.searchParams.set('from', pathname)
    return NextResponse.redirect(url)
  }

  // Force-password-change state: access_token cookie exists but no user_role cookie.
  // This means the user has a fpc JWT (short-lived, issued at first login) and must
  // complete the /activate flow before accessing anything else.
  if (!userRole && !pathname.startsWith('/activate')) {
    return NextResponse.redirect(new URL('/activate', request.url))
  }

  // Admin route — verify role from non-httpOnly routing cookie
  if (pathname.startsWith(ADMIN_PATH)) {
    if (!ADMIN_ROLES.includes(userRole as import('@/types').UserRole)) {
      // Authenticated but not an admin — send to home
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  // Match all routes except static files and Next.js internals
  matcher: ['/((?!_next/static|_next/image|favicon.ico|icons).*)'],
}
