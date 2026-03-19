/**
 * BFF logout route.
 * Notifies the backend to revoke the session (JTI blacklist) then clears all auth cookies.
 */
import { NextRequest, NextResponse } from 'next/server'

const BACKEND = process.env.BACKEND_URL || 'http://localhost:7080'

export async function POST(request: NextRequest) {
  const accessToken = request.cookies.get('access_token')?.value

  // Best-effort call to revoke the server-side session — don't fail if it errors
  if (accessToken) {
    try {
      await fetch(`${BACKEND}/api/auth/logout`, {
        method:  'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type':  'application/json',
        },
      })
    } catch { /* ignore network errors on logout */ }
  }

  const response = NextResponse.json({ success: true, message: 'Logged out' })

  // Clear all auth cookies immediately
  const cookieClear = { httpOnly: true, secure: process.env.NODE_ENV === 'production',
                        sameSite: 'strict' as const, path: '/', maxAge: 0 }
  response.cookies.set('access_token',  '', cookieClear)
  response.cookies.set('refresh_token', '', cookieClear)
  response.cookies.set('user_role',     '', { ...cookieClear, httpOnly: false })

  return response
}
