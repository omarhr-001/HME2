import { NextRequest, NextResponse } from 'next/server'
import { getBrandsByCategoryFromSupabase } from '@/lib/brands'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ categoryId: string }> }
) {
  try {
    const { categoryId } = await params

    if (!categoryId) {
      return NextResponse.json(
        { error: 'Category ID is required' },
        { status: 400 }
      )
    }

    const brands = await getBrandsByCategoryFromSupabase(categoryId)

    return NextResponse.json(brands)
  } catch (error) {
    console.error('[v0] Error fetching brands by category:', error)
    return NextResponse.json(
      { error: 'Failed to fetch brands' },
      { status: 500 }
    )
  }
}
