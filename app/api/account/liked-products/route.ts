import { createServiceClient } from '@/lib/server-supabase'
import { NextRequest, NextResponse } from 'next/server'
import { mapProduct } from '@/lib/products'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const userId = searchParams.get('user_id')

  if (!userId) {
    return NextResponse.json(
      { error: 'user_id is required' },
      { status: 400 }
    )
  }

  try {
    const supabase = createServiceClient()
    
    const { data, error } = await supabase
      .from('liked_products')
      .select(`
        id,
        user_id,
        product_id,
        created_at,
        products(*, categories(*), brands(*), product_images(*))
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error

    const likedProducts = (data || []).map((liked) => ({
      ...liked,
      product_id: liked.product_id?.toString(),
      products: liked.products ? mapProduct(liked.products) : null,
    }))

    return NextResponse.json(likedProducts)
  } catch (error) {
    console.error('[v0] Error fetching liked products:', error)
    return NextResponse.json(
      { error: 'Failed to fetch liked products' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { user_id, product_id, isLiked } = body

    if (!user_id || !product_id) {
      return NextResponse.json(
        { error: 'user_id and product_id are required' },
        { status: 400 }
      )
    }

    const supabase = createServiceClient()

    if (isLiked) {
      // Add to liked products
      const { error } = await supabase
        .from('liked_products')
        .insert({
          user_id,
          product_id,
        })
        .select()

      if (error && error.code !== '23505') throw error // 23505 is unique constraint error
    } else {
      // Remove from liked products
      const { error } = await supabase
        .from('liked_products')
        .delete()
        .eq('user_id', user_id)
        .eq('product_id', product_id)

      if (error) throw error
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[v0] Error toggling liked product:', error)
    return NextResponse.json(
      { error: 'Failed to toggle liked product' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()
    const { user_id, product_id } = body

    if (!user_id || !product_id) {
      return NextResponse.json(
        { error: 'user_id and product_id are required' },
        { status: 400 }
      )
    }

    const supabase = createServiceClient()

    const { error } = await supabase
      .from('liked_products')
      .delete()
      .eq('user_id', user_id)
      .eq('product_id', product_id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[v0] Error deleting liked product:', error)
    return NextResponse.json(
      { error: 'Failed to delete liked product' },
      { status: 500 }
    )
  }
}
