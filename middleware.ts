import { NextResponse } from 'next/server'

/**
 * Supabase keeps the current browser session in client-side storage in this app.
 * The old middleware checked for a custom `auth-token` cookie that is never set
 * during login, so authenticated users were redirected back to `/auth/login`
 * when opening pages like `/cart` or `/account`.
 *
 * Page-level client guards and API Bearer-token validation handle auth here.
 */
export function middleware() {
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/cart/:path*',
    '/checkout/:path*',
    '/orders/:path*',
    '/account/:path*',
    '/session-demo/:path*',
  ],
}
