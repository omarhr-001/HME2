'use client'

import { supabase } from '@/lib/supabase'

export async function adminFetch<T>(input: string, init?: RequestInit): Promise<T> {
  const { data } = await supabase.auth.getSession()
  const headers = new Headers(init?.headers)
  headers.set('content-type', 'application/json')
  if (data.session?.access_token) {
    headers.set('authorization', `Bearer ${data.session.access_token}`)
  }

  const response = await fetch(input, { ...init, headers })
  if (!response.ok) {
    const payload = await response.json().catch(() => ({ error: 'Request failed' }))
    throw new Error(payload.reason || payload.error || 'Request failed')
  }
  return response.json()
}

export async function downloadAdminFile(input: string, filename: string) {
  const { data } = await supabase.auth.getSession()
  const headers = new Headers()
  if (data.session?.access_token) headers.set('authorization', `Bearer ${data.session.access_token}`)

  const response = await fetch(input, { headers })
  if (!response.ok) throw new Error('Export failed')

  const blob = await response.blob()
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}
