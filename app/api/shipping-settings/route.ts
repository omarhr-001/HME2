import { NextResponse } from 'next/server'
import { getShippingSettings } from '@/lib/server-shipping-settings'
import { STATIC_WRITE_DISABLED_MESSAGE } from '@/lib/static-mode'

export async function GET() {
  return NextResponse.json(await getShippingSettings(), {
    headers: { 'Cache-Control': 'public, max-age=60, s-maxage=300, stale-while-revalidate=600' },
  })
}

export async function PUT() {
  return NextResponse.json({ error: STATIC_WRITE_DISABLED_MESSAGE }, { status: 503 })
}

export async function POST() {
  return NextResponse.json({ error: STATIC_WRITE_DISABLED_MESSAGE }, { status: 503 })
}
