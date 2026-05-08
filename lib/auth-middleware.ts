import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export interface AuthenticatedUser {
  id: string
  email?: string
}

function getSupabaseAnonKey() {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
}

/**
 * Middleware to authenticate API requests using Supabase access tokens.
 * The token must come from the current Supabase session and is revalidated
 * with Supabase Auth before the route handler receives the user.
 */
export async function withAuth(
  req: NextRequest,
  handler: (req: NextRequest, user: AuthenticatedUser) => Promise<NextResponse>
) {
  try {
    const authHeader = req.headers.get('authorization')
    const token = authHeader?.startsWith('Bearer ')
      ? authHeader.slice('Bearer '.length).trim()
      : null

    if (!token) {
      console.log('[v0] No token provided')
      return NextResponse.json(
        { error: 'Unauthorized: No token provided' },
        { status: 401 }
      )
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = getSupabaseAnonKey()

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('[v0] Missing Supabase URL or public key')
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey)
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
