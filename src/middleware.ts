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
const PUBLIC_PATHS = ['/login', '/register', '/api/auth']

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

  // Not authenticated — redirect to login
  if (!accessToken) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('from', pathname)
    return NextResponse.redirect(url)
  }

  // Admin route — verify role from non-httpOnly routing cookie
  if (pathname.startsWith(ADMIN_PATH)) {
    const role = request.cookies.get('user_role')?.value ?? ''
    if (!ADMIN_ROLES.includes(role as import('@/types').UserRole)) {
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
