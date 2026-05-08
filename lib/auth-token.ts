import { supabase } from './supabase'

export async function getAccessToken() {
  const { data, error } = await supabase.auth.getSession()
  const token = data.session?.access_token

  if (error || !token) {
    throw new Error('Session Supabase absente ou expirée')
  }

  return token
}

export async function createAuthHeaders(includeJson = false) {
  const token = await getAccessToken()

  return {
    Authorization: `Bearer ${token}`,
    ...(includeJson ? { 'Content-Type': 'application/json' } : {}),
  }
}
