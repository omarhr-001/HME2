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

      const requestedQuantity = Number(quantity)

      if (!productId || !Number.isInteger(requestedQuantity) || requestedQuantity <= 0) {
        return NextResponse.json(
          { error: 'Invalid product ID or quantity' },
          { status: 400 }
        )
      }

      const supabase = createUserScopedClient(
        req.headers.get('authorization')?.replace('Bearer ', '') || ''
      )

      // Check if product exists and has enough stock.
      const { data: product, error: productError } = await supabase
        .from('products')
        .select('id, name, stock_quantity, in_stock, is_active')
        .eq('id', productId)
        .single()

      if (productError || !product) {
        return NextResponse.json(
          { error: 'Product not found' },
          { status: 404 }
        )
      }

      if (!product.is_active || !product.in_stock || Number(product.stock_quantity || 0) <= 0) {
        return NextResponse.json(
          { error: `${product.name || 'Product'} is out of stock` },
          { status: 409 }
        )
      }

      // Check if item already exists in cart
      const { data: existingItem } = await supabase
        .from('cart_items')
        .select()
        .eq('user_id', user.id)
        .eq('product_id', productId)
        .single()

      const nextQuantity = Number(existingItem?.quantity || 0) + requestedQuantity

      if (nextQuantity > Number(product.stock_quantity || 0)) {
        return NextResponse.json(
          { error: `${product.name || 'Product'} only has ${product.stock_quantity} in stock` },
          { status: 409 }
        )
      }

      if (existingItem) {
        // Update quantity
        const { data, error } = await supabase
          .from('cart_items')
          .update({ quantity: nextQuantity })
          .eq('id', existingItem.id)
          .eq('user_id', user.id)
          .select()

        if (error) throw error
        return NextResponse.json(data?.[0])
      }

      // Add new item with authenticated user_id
      const { data, error } = await supabase
        .from('cart_items')
        .insert([{ user_id: user.id, product_id: productId, quantity: requestedQuantity }])
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
