import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/auth-middleware'
import { createUserScopedClient } from '@/lib/server-supabase'

export async function GET(req: NextRequest) {
  return withAuth(req, async (req, user) => {
    try {
      const supabase = createUserScopedClient(
        req.headers.get('authorization')?.replace('Bearer ', '') || ''
      )

      const { data, error } = await supabase
        .from('cart_items')
        .select(`
          *,
          products (*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      return NextResponse.json(data || [])
    } catch (error) {
      console.error('[v0] Error fetching cart:', error)
      return NextResponse.json(
        { error: 'Failed to fetch cart' },
        { status: 500 }
      )
    }
  })
}

export async function POST(req: NextRequest) {
  return withAuth(req, async (req, user) => {
    try {
      const { productId, quantity } = await req.json()

      if (!productId || !quantity || quantity <= 0) {
        return NextResponse.json(
          { error: 'Invalid product ID or quantity' },
          { status: 400 }
        )
      }

      const supabase = createUserScopedClient(
        req.headers.get('authorization')?.replace('Bearer ', '') || ''
      )

      // Check if product exists
      const { data: product, error: productError } = await supabase
        .from('products')
        .select('id')
        .eq('id', productId)
        .single()

      if (productError || !product) {
        return NextResponse.json(
          { error: 'Product not found' },
          { status: 404 }
        )
      }

      // Check if item already exists in cart
      const { data: existingItem } = await supabase
        .from('cart_items')
        .select()
        .eq('user_id', user.id)
        .eq('product_id', productId)
        .single()

      if (existingItem) {
        // Update quantity
        const { data, error } = await supabase
          .from('cart_items')
          .update({ quantity: existingItem.quantity + quantity })
          .eq('id', existingItem.id)
          .eq('user_id', user.id)
          .select()

        if (error) throw error
        return NextResponse.json(data?.[0])
      }

      // Add new item with authenticated user_id
      const { data, error } = await supabase
        .from('cart_items')
        .insert([{ user_id: user.id, product_id: productId, quantity }])
        .select()

      if (error) throw error
      return NextResponse.json(data?.[0])
    } catch (error) {
      console.error('[v0] Error adding to cart:', error)
      return NextResponse.json(
        { error: 'Failed to add to cart' },
        { status: 500 }
      )
    }
  })
}
