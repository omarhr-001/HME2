import { NextResponse } from 'next/server'
import { STATIC_AUTH_DISABLED_MESSAGE } from '@/lib/static-mode'

export async function POST() {
  return NextResponse.json({ error: STATIC_AUTH_DISABLED_MESSAGE }, { status: 503 })
}
