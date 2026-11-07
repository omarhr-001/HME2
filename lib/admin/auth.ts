import { NextResponse } from 'next/server'
import { STATIC_AUTH_DISABLED_MESSAGE } from '@/lib/static-mode'

export interface AdminContext {
  user: { id: string; email?: string }
  supabase: any
}

export type AdminAuthResult = { response: NextResponse } | { context: AdminContext }

export async function requireAdminRequest(_request: Request): Promise<AdminAuthResult> {
  return {
    response: NextResponse.json({ error: STATIC_AUTH_DISABLED_MESSAGE }, { status: 503 }),
  }
}

export function isAdmin(_user: unknown): boolean {
  return false
}

export function toNumber(value: unknown): number {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

export function jsonError(error: unknown, fallback = 'Une erreur est survenue') {
  const message = error instanceof Error ? error.message : fallback
  return NextResponse.json({ error: message }, { status: 500 })
}
