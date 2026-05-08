'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from './supabase'
import type { Session, User } from '@supabase/supabase-js'

type AuthContextType = {
  user: User | null
  loading: boolean
  sessionId: string | null
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

function decodeBase64Url(value: string) {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/')
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=')

  return atob(padded)
}

function getSessionId(session: Session | null) {
  const accessToken = session?.access_token

  if (!accessToken) {
    return null
  }

  try {
    const [, payload] = accessToken.split('.')

    if (!payload) {
      return null
    }

    const claims = JSON.parse(decodeBase64Url(payload)) as { session_id?: unknown }

    return typeof claims.session_id === 'string' ? claims.session_id : null
  } catch (error) {
    console.warn('Unable to read Supabase session_id claim:', error)
    return null
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [sessionId, setSessionId] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    async function loadUser() {
      const [{ data: sessionData }, { data: userData, error }] = await Promise.all([
        supabase.auth.getSession(),
        supabase.auth.getUser(),
      ])

      if (!mounted) {
        return
      }

      if (error || !userData.user) {
        setUser(null)
        setSessionId(null)
      } else {
        setUser(userData.user)
        setSessionId(getSessionId(sessionData.session))
      }

      setLoading(false)
    }

    loadUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setSessionId(getSessionId(session ?? null))
      setLoading(false)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()

    if (error) {
      throw error
    }

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
