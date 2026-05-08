import { type NextRequest, NextResponse } from 'next/server'

/*
 * Supabase's browser client stores the current session in browser storage for
 * this project. The old middleware expected a custom `auth-token` cookie that
 * was never created, so authenticated users were redirected away from protected
 * pages. Page-level client guards and API-level `supabase.auth.getUser(token)`
 * validation now own authorization until the app is migrated to cookie-based
 * SSR auth with @supabase/ssr.
 */
export function middleware(_request: NextRequest) {
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
