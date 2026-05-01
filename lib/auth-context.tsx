'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from './supabase'
import type { User } from '@supabase/supabase-js'
import { initializeSession, getCurrentSession } from './session'

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
      
      // Initialize session if user is logged in
      if (authUser) {
        const session = await initializeSession(authUser.id)
        if (mounted) {
          setSessionId(session?.id ?? null)
        }
      }
      
      setLoading(false)
    })

    // 2. listen auth changes
    const { data: { subscription } } =
      supabase.auth.onAuthStateChange(async (_event, session) => {
        const authUser = session?.user ?? null
        setUser(authUser)
        
        if (authUser) {
          const userSession = await initializeSession(authUser.id)
          if (mounted) {
            setSessionId(userSession?.id ?? null)
          }
        } else {
          if (mounted) {
            setSessionId(null)
          }
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
