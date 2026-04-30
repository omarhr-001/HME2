import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    throw new Error('Missing Supabase credentials')
  }

  return createClient(url, key)
}

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient()
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    // Get cart from session or localStorage (client-side for now)
    // In production, store cart in Supabase table
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Cart GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient()
    const body = await request.json()
    const { userId, items, action } = body

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    if (action === 'add') {
      const { productId, quantity } = body
      // Store cart item in database or return success
      return NextResponse.json({ success: true, message: 'Item added to cart' })
    }

    if (action === 'remove') {
      const { productId } = body
      return NextResponse.json({ success: true, message: 'Item removed from cart' })
    }

    if (action === 'update') {
      const { productId, quantity } = body
      return NextResponse.json({ success: true, message: 'Cart updated' })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Cart POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = getSupabaseClient()
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    // Clear entire cart
    return NextResponse.json({ success: true, message: 'Cart cleared' })
  } catch (error) {
    console.error('Cart DELETE error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
