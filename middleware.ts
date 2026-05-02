import { type NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const secret = new TextEncoder().encode(
  process.env.SUPABASE_JWT_SECRET || 'your-secret-key'
)

// Routes qui nécessitent une authentification
const protectedRoutes = [
  '/cart',
  '/checkout',
  '/orders',
  '/account',
  '/session-demo',
]

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Vérifier si la route est protégée
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))

  if (!isProtectedRoute) {
    return NextResponse.next()
  }

  // Récupérer le token depuis les cookies
  const token = request.cookies.get('auth-token')?.value

  if (!token) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  try {
    // Vérifier le token JWT
    await jwtVerify(token, secret)
    return NextResponse.next()
  } catch (err) {
    // Token invalide ou expiré
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }
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
