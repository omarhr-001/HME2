import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

/**
 * Middleware to authenticate API requests
 * Validates that the user making the request matches the user_id in the request
 */

export async function withAuth(
  req: NextRequest,
  handler: (req: NextRequest, user: any) => Promise<NextResponse>
) {
  try {
    // Get token from Authorization header or cookies
    const authHeader = req.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized: No token provided' },
        { status: 401 }
      )
    }

    // Verify token with Supabase
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token)

    if (error || !user) {
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
      { error: 'Authentication failed' },
      { status: 500 }
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
