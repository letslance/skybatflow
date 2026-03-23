/**
 * BFF (Backend-for-Frontend) login route.
 *
 * Proxies the login request to Spring Boot and sets httpOnly, Secure, SameSite=Strict
 * cookies so the JWT never touches JavaScript. This eliminates the localStorage XSS risk.
 *
 * Flow:
 *   Browser → POST /api/auth/login (Next.js) → POST /api/auth/login (Spring Boot)
 *                                            ← 200 + AuthResponse
 *   ← 200 + user info  (Set-Cookie: access_token + refresh_token, both httpOnly)
 */
import { NextRequest, NextResponse } from 'next/server'

const BACKEND = process.env.BACKEND_URL || 'http://localhost:7080'

const COOKIE_OPTS = {
  httpOnly: true,
  secure:   process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  path:     '/',
}

export async function POST(request: NextRequest) {
  try {
    const body   = await request.json()
    const tenant = request.headers.get('X-Tenant-Id') ?? '00000000-0000-0000-0000-000000000001'

    const fingerprint = request.headers.get('X-Client-Fingerprint') ?? ''

    const backendRes = await fetch(`${BACKEND}/api/auth/login`, {
      method:  'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Tenant-Id':  tenant,
        'X-Forwarded-For': request.headers.get('x-forwarded-for') ??
                           request.headers.get('x-real-ip') ?? '',
        'X-Client-Fingerprint': fingerprint,
      },
      body: JSON.stringify(body),
    })

    const data = await backendRes.json()

    if (!backendRes.ok) {
      return NextResponse.json(data, { status: backendRes.status })
    }

    // Spring Boot AuthResponse uses `userId`; frontend AuthUser expects `id` — rename here.
    const { accessToken, refreshToken, expiresIn, userId, ...rest } = data.data
    const userInfo = { id: userId, ...rest }

    const response = NextResponse.json({ success: true, data: userInfo })

    // Set tokens as httpOnly cookies — inaccessible to JavaScript
    response.cookies.set('access_token', accessToken, {
      ...COOKIE_OPTS,
      maxAge: expiresIn ?? 3600,
    })
    response.cookies.set('refresh_token', refreshToken, {
      ...COOKIE_OPTS,
      maxAge: 7 * 24 * 3600,   // 7 days
    })
    // Non-httpOnly cookie for role-based middleware routing (not a secret)
    response.cookies.set('user_role', userInfo.role ?? '', {
      httpOnly: false,
      secure:   process.env.NODE_ENV === 'production',
      sameSite: 'strict' as const,
      path:     '/',
      maxAge:   expiresIn ?? 3600,
    })

    return response
  } catch (err) {
    console.error('[auth/login] error:', err)
    return NextResponse.json({ success: false, message: 'Login failed' }, { status: 502 })
  }
}
