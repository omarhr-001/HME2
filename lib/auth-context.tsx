'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from './supabase'
import type { User } from '@supabase/supabase-js'

type AuthContextType = {
  user: User | null
  loading: boolean
  sessionId: string | null
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [sessionId, setSessionId] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    // 1. initial session
    supabase.auth.getSession().then(async ({ data }) => {
      if (!mounted) return
      const authUser = data.session?.user ?? null
      setUser(authUser)
      syncAdminTokenCookie(data.session?.access_token ?? null)
      
      // Set session ID from user ID
      if (authUser) {
        setSessionId(authUser.id)
      }
      
      setLoading(false)
    })

    // 2. listen auth changes
    const { data: { subscription } } =
      supabase.auth.onAuthStateChange(async (_event, session) => {
        const authUser = session?.user ?? null
        setUser(authUser)
        syncAdminTokenCookie(session?.access_token ?? null)
        
        if (authUser) {
          setSessionId(authUser.id)
        } else {
          setSessionId(null)
        }
        
        setLoading(false)
      })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const signOut = async () => {
    await supabase.auth.signOut()
    syncAdminTokenCookie(null)
    setUser(null)
    setSessionId(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, sessionId, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

function syncAdminTokenCookie(token: string | null) {
  if (typeof document === 'undefined') return

  if (!token) {
    document.cookie = 'sb-access-token=; Max-Age=0; Path=/; SameSite=Lax'
    return
  }

  document.cookie = `sb-access-token=${encodeURIComponent(token)}; Path=/; Max-Age=3600; SameSite=Lax`
}
