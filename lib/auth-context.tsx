'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from './supabase'
import type { User } from '@supabase/supabase-js'

type AuthContextType = {
  user: User | null
  loading: boolean
  sessionId: string | null
  role: 'admin' | 'client' | null
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [role, setRole] = useState<'admin' | 'client' | null>(null)

  useEffect(() => {
    let mounted = true

    // Fetch user role from API (bypasses RLS)
    const fetchUserRole = async (token: string) => {
      try {
        console.log('[v0] Auth context: Fetching user role with token')
        const response = await fetch('/api/auth/user-role', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        
        console.log('[v0] Auth context: API response status:', response.status)
        
        if (!response.ok) {
          console.warn('[v0] Auth context: API returned error status')
          return 'client'
        }
        
        const data = await response.json()
        console.log('[v0] Auth context: Got role from API:', data.role)
        return (data.role as 'admin' | 'client') || 'client'
      } catch (err) {
        console.error('[v0] Auth context: Error fetching user role:', err)
        return 'client'
      }
    }

    // 1. initial session
    supabase.auth.getSession().then(async ({ data }) => {
      if (!mounted) return
      const authUser = data.session?.user ?? null
      const token = data.session?.access_token
      setUser(authUser)
      
      // Set session ID from user ID
      if (authUser && token) {
        setSessionId(authUser.id)
        const userRole = await fetchUserRole(token)
        if (mounted) {
          setRole(userRole)
        }
      }
      
      setLoading(false)
    })

    // 2. listen auth changes
    const { data: { subscription } } =
      supabase.auth.onAuthStateChange(async (_event, session) => {
        const authUser = session?.user ?? null
        const token = session?.access_token
        setUser(authUser)
        
        if (authUser && token) {
          setSessionId(authUser.id)
          const userRole = await fetchUserRole(token)
          if (mounted) {
            setRole(userRole)
          }
        } else {
          setSessionId(null)
          setRole(null)
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
    setRole(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, sessionId, role, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
