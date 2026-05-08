import { supabase } from './supabase'

export interface UserSession {
  id: string
  email: string
  userId: string
  createdAt: Date
  lastActivityAt: Date
}

/**
 * Create or get a user session
 * Called when user logs in
 */
export async function createSession(userId: string, email: string) {
  try {
    // Store session in a simple way - we'll use the auth session
    // In a real app, you might want to store additional session data
    return {
      success: true,
      userId,
      email,
    }
  } catch (error) {
    console.error('Error creating session:', error)
    return { success: false, error: (error as Error).message }
  }
}

/**
 * Destroy user session
 * Called when user logs out
 */
export async function destroySession(userId: string) {
  try {
    // Clean up session data if needed
    return { success: true }
  } catch (error) {
    console.error('Error destroying session:', error)
    return { success: false, error: (error as Error).message }
  }
}

/**
 * Get current user session from auth
 */
export async function getCurrentSession() {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession()
    return session
  } catch (error) {
    console.error('Error getting current session:', error)
    return null
  }
}

/**
 * Get user ID from current session
 */
export async function getCurrentUserId(): Promise<string | null> {
  const session = await getCurrentSession()
  return session?.user?.id ?? null
}
