'use client'

import React, { createContext, useContext, useEffect, useState, useRef } from 'react'
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

async function fetchUserRole(userId: string) {
  try {
    console.log('[v0] Fetching role for user:', userId)
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single()
    
    if (error) {
      console.error('[v0] Error fetching role:', error.message)
      return 'client'
    }
    
    const userRole = (profile?.role as 'admin' | 'client') || 'client'
    console.log('[v0] User role fetched:', userRole, 'for user:', userId)
    return userRole
  } catch (err) {
    console.error('[v0] Error in fetchUserRole:', err)
    return 'client'
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [role, setRole] = useState<'admin' | 'client' | null>(null)
  const subscriptionRef = useRef<any>(null)

  useEffect(() => {
    let mounted = true
    let roleTimeout: NodeJS.Timeout

    const initializeAuth = async () => {
      try {
        // Get initial session
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
          console.error('[v0] Error getting session:', sessionError)
        }
        
        if (!mounted) return
        
        const authUser = sessionData?.session?.user ?? null
        setUser(authUser)
        
        if (authUser) {
          setSessionId(authUser.id)
          // Fetch role asynchronously to avoid blocking
          roleTimeout = setTimeout(async () => {
            if (mounted) {
              const userRole = await fetchUserRole(authUser.id)
              if (mounted) {
                setRole(userRole)
              }
            }
          }, 0)
        } else {
          setSessionId(null)
          setRole(null)
        }
        
        setLoading(false)
      } catch (err) {
        console.error('[v0] Error in initializeAuth:', err)
        if (mounted) {
          setLoading(false)
        }
      }
    }

    initializeAuth()

    // Listen for auth state changes
    try {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (_event, session) => {
          if (!mounted) return
          
          const authUser = session?.user ?? null
          setUser(authUser)
          
          if (authUser) {
            setSessionId(authUser.id)
            // Fetch role with timeout to avoid race conditions
            roleTimeout = setTimeout(async () => {
              if (mounted) {
                const userRole = await fetchUserRole(authUser.id)
                if (mounted) {
                  setRole(userRole)
                }
              }
            }, 0)
          } else {
            setSessionId(null)
            setRole(null)
          }
          
          setLoading(false)
        }
      )
      subscriptionRef.current = subscription
    } catch (err) {
      console.error('[v0] Error setting up auth listener:', err)
    }

    return () => {
      mounted = false
      if (roleTimeout) {
        clearTimeout(roleTimeout)
      }
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe()
      }
    }
  }, [])

  const signOut = async () => {
    try {
      await supabase.auth.signOut()
      setUser(null)
      setSessionId(null)
      setRole(null)
    } catch (err) {
      console.error('[v0] Error signing out:', err)
    }
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
