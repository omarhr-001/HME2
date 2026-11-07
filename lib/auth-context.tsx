'use client'

import { createContext, useContext, type ReactNode } from 'react'

export interface AuthUser {
  id: string
  email?: string
  app_metadata?: Record<string, unknown>
  user_metadata?: Record<string, unknown> & { display_name?: string }
}

interface AuthContextValue {
  user: AuthUser | null
  loading: boolean
  sessionId: string | null
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: false,
  sessionId: null,
  signOut: async () => undefined,
})

export function AuthProvider({ children }: { children: ReactNode }) {
  return <AuthContext.Provider value={{
    user: null,
    loading: false,
    sessionId: null,
    signOut: async () => undefined,
  }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
