/**
 * BFF token refresh route.
 * Reads refresh_token from httpOnly cookie, obtains a new access token from the backend,
 * and rotates both cookies. The new tokens never touch JavaScript.
 */
import { NextRequest, NextResponse } from 'next/server'

const BACKEND = process.env.BACKEND_URL || 'http://localhost:7080'

export async function POST(request: NextRequest) {
  const refreshToken = request.cookies.get('refresh_token')?.value

  if (!refreshToken) {
    return NextResponse.json({ success: false, message: 'No refresh token' }, { status: 401 })
  }

  try {
    const backendRes = await fetch(`${BACKEND}/api/auth/refresh`, {
      method:  'POST',
      headers: {
        'X-Refresh-Token': refreshToken,
        'Content-Type':    'application/json',
      },
    })

    const data = await backendRes.json()

    if (!backendRes.ok) {
      // Refresh failed — clear cookies and force re-login
      const response = NextResponse.json(data, { status: backendRes.status })
      response.cookies.set('access_token',  '', { httpOnly: true, path: '/', maxAge: 0 })
      response.cookies.set('refresh_token', '', { httpOnly: true, path: '/', maxAge: 0 })
      response.cookies.set('user_role',     '', { path: '/', maxAge: 0 })
      return response
    }

    // Spring Boot AuthResponse uses `userId`; frontend AuthUser expects `id` — rename here.
    const { accessToken: token, refreshToken: newRefresh, expiresIn: expirySeconds, userId, ...rest } = data.data
    const userInfo = { id: userId, ...rest }

    const cookieOpts = {
      httpOnly: true,
      secure:   process.env.NODE_ENV === 'production',
      sameSite: 'strict' as const,
      path:     '/',
    }

    const response = NextResponse.json({ success: true, data: userInfo })
    response.cookies.set('access_token',  token,       { ...cookieOpts, maxAge: expirySeconds ?? 3600 })
    response.cookies.set('refresh_token', newRefresh,  { ...cookieOpts, maxAge: 7 * 24 * 3600 })
    response.cookies.set('user_role', userInfo.role ?? '', {
      httpOnly: false, secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict' as const, path: '/', maxAge: expirySeconds ?? 3600,
    })

    return response
  } catch (err) {
    console.error('[auth/refresh] error:', err)
    return NextResponse.json({ success: false, message: 'Refresh failed' }, { status: 502 })
  }
}
