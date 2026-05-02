import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const secret = new TextEncoder().encode(
  process.env.SUPABASE_JWT_SECRET || 'your-secret-key'
)

export interface AuthenticatedUser {
  id: string
  email?: string
  aud?: string
  role?: string
}

/**
 * Middleware to authenticate API requests using JWT tokens
 * Verifies JWT signature and extracts user information
 */
export async function withAuth(
  req: NextRequest,
  handler: (req: NextRequest, user: AuthenticatedUser) => Promise<NextResponse>
) {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')

    if (!token) {
      console.log('[v0] No token provided')
      return NextResponse.json(
        { error: 'Unauthorized: No token provided' },
        { status: 401 }
      )
    }

    // Verify JWT token
    const verified = await jwtVerify(token, secret)
    const user = verified.payload as AuthenticatedUser

    if (!user || !user.id) {
      console.log('[v0] Invalid token payload')
      return NextResponse.json(
        { error: 'Unauthorized: Invalid token' },
        { status: 401 }
      )
    }

    // Call the handler with the authenticated user
    return await handler(req, user)
  } catch (err) {
    console.error('[v0] Auth middleware error:', err)
    return NextResponse.json(
      { error: 'Unauthorized: Invalid token' },
      { status: 401 }
    )
  }
}

/**
 * Helper to validate that a user can access a specific resource
 */
export function validateUserOwnership(userId: string, resourceUserId: string) {
  if (userId !== resourceUserId) {
    return {
      valid: false,
      response: NextResponse.json(
        { error: 'Forbidden: You can only access your own data' },
        { status: 403 }
      ),
    }
  }
  return { valid: true }
}
