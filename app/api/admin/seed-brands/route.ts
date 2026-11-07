import { NextResponse } from 'next/server'
import { STATIC_WRITE_DISABLED_MESSAGE } from '@/lib/static-mode'

export async function POST() {
  return NextResponse.json({ error: STATIC_WRITE_DISABLED_MESSAGE }, { status: 503 })
}
