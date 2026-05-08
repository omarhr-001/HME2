'use server'

import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

/**
 * Server-side Supabase client
 * Uses SERVICE_ROLE_KEY for admin operations and cookie-based auth for user operations
 */

export async function getServerSupabaseClient() {
  const cookieStore = await cookies()
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        persistSession: false,
      },
    }
  )

  // Get session from cookies
  const authToken = cookieStore.get('sb-access-token')?.value

  if (authToken) {
    supabase.auth.setAuth(authToken)
  }

  return supabase
}

/**
 * Get authenticated user from session
 * This validates that the user has a valid Supabase session
 */
export async function getAuthenticatedUser() {
  const supabase = await getServerSupabaseClient()
  
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error || !user) {
      return { user: null, error: 'Unauthorized' }
    }

    return { user, error: null }
  } catch (error) {
    return { user: null, error: 'Authentication failed' }
  }
}
