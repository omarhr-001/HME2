import { NextResponse } from 'next/server'
import { STATIC_AUTH_DISABLED_MESSAGE } from '@/lib/static-mode'

function staticModeResponse() {
  return NextResponse.json({ error: STATIC_AUTH_DISABLED_MESSAGE }, { status: 503 })
}

export async function GET() {
  return staticModeResponse()
}

export async function POST() {
  return staticModeResponse()
}

export async function DELETE() {
  return staticModeResponse()
}
