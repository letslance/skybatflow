/**
 * BFF activate route.
 *
 * Proxies POST /api/auth/activate to Spring Boot using the fpc access_token cookie.
 * On success: clears the fpc cookie (sessions are expired server-side) and returns
 * the one-time transaction code so the frontend can display it.
 *
 * The access_token cookie is sent automatically (withCredentials) — Spring Cloud Gateway
 * reads it, validates the fpc JWT, and forwards X-User-Id to user-service.
 */
import { NextRequest, NextResponse } from 'next/server'

const BACKEND = process.env.BACKEND_URL || 'http://localhost:7080'

const COOKIE_OPTS = {
  httpOnly: true,
  secure:   process.env.COOKIE_SECURE === 'true',
  sameSite: 'strict' as const,
  path:     '/',
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Forward the fpc access_token cookie to the gateway
    const accessToken = request.cookies.get('access_token')?.value ?? ''

    const backendRes = await fetch(`${BACKEND}/api/auth/activate`, {
      method:  'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie':        `access_token=${accessToken}`,
        'X-Forwarded-For': request.headers.get('x-forwarded-for') ??
                           request.headers.get('x-real-ip') ?? '',
      },
      body: JSON.stringify(body),
    })

    const data = await backendRes.json()

    if (!backendRes.ok) {
      return NextResponse.json(data, { status: backendRes.status })
    }

    // Activation succeeded — clear the fpc cookie (sessions expired server-side).
    // User must log in fresh with their new password.
    const response = NextResponse.json({
      success: true,
      data: {
        transactionCode: data.data?.transactionCode,
        message:         data.data?.message,
      },
    })

    response.cookies.set('access_token', '', {
      ...COOKIE_OPTS,
      maxAge: 0,
    })

    return response
  } catch (err) {
    console.error('[auth/activate] error:', err)
    return NextResponse.json({ success: false, message: 'Activation failed' }, { status: 502 })
  }
}
