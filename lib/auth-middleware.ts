import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export interface AuthenticatedUser {
  id: string
  email?: string
}

/**
 * Middleware to authenticate API requests using JWT tokens
 * Verifies token with Supabase and extracts user information
 */
export async function withAuth(
  req: NextRequest,
  handler: (req: NextRequest, user: AuthenticatedUser) => Promise<NextResponse>
) {
  try {
    const authHeader = req.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')

    if (!token) {
      console.log('[v0] No token provided')
      return NextResponse.json(
        { error: 'Unauthorized: No token provided' },
        { status: 401 }
      )
    }

    // Verify token with Supabase using service role key
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data, error } = await supabase.auth.getUser(token)

    if (error || !data.user) {
      console.log('[v0] Token verification failed:', error?.message)
      return NextResponse.json(
        { error: 'Unauthorized: Invalid token' },
        { status: 401 }
      )
    }

    const user: AuthenticatedUser = {
      id: data.user.id,
      email: data.user.email,
    }

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
