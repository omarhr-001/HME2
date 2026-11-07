import { NextResponse } from 'next/server'
import { STATIC_WRITE_DISABLED_MESSAGE } from '@/lib/static-mode'

function unavailable() {
  return NextResponse.json({ error: STATIC_WRITE_DISABLED_MESSAGE }, { status: 503 })
}

export async function PATCH() {
  return unavailable()
}

export async function DELETE() {
  return unavailable()
}
