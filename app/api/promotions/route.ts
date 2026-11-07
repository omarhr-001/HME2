import { NextResponse } from 'next/server'
import { getPromotionApiData } from '@/lib/offers'

export async function GET() {
  const promotions = await getPromotionApiData()
  return NextResponse.json(promotions, {
    headers: { 'Cache-Control': 'public, max-age=60, s-maxage=300, stale-while-revalidate=600' },
  })
}
