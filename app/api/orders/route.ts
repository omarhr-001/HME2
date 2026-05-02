import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/auth-middleware'

function createAuthenticatedClient(token: string) {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function GET(req: NextRequest) {
  return withAuth(req, async (req, user) => {
    try {
      const supabase = createAuthenticatedClient(
        req.headers.get('authorization')?.replace('Bearer ', '') || ''
      )

      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            products (*)
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      return NextResponse.json(data || [])
    } catch (error) {
      console.error('[v0] Error fetching orders:', error)
      return NextResponse.json(
        { error: 'Failed to fetch orders' },
        { status: 500 }
      )
    }
  })
}

export async function POST(req: NextRequest) {
  return withAuth(req, async (req, user) => {
    try {
      const { items, totalAmount, status = 'pending' } = await req.json()

      if (!items || items.length === 0 || totalAmount === undefined) {
        return NextResponse.json(
          { error: 'Invalid items or total amount' },
          { status: 400 }
        )
      }

      const supabase = createAuthenticatedClient(
        req.headers.get('authorization')?.replace('Bearer ', '') || ''
      )

      // Verify all items belong to the user's cart
      const { data: cartItems, error: cartError } = await supabase
        .from('cart_items')
        .select('id')
        .eq('user_id', user.id)

      if (cartError || !cartItems) {
        return NextResponse.json(
          { error: 'Failed to verify cart' },
          { status: 400 }
        )
      }

      const cartItemIds = new Set(cartItems.map(item => item.id))
      const requestItemIds = new Set(items.map((item: any) => item.id))

      // Ensure all requested items are in the user's cart
      for (const id of requestItemIds) {
        if (!cartItemIds.has(id)) {
          return NextResponse.json(
            { error: 'Invalid cart item' },
            { status: 403 }
          )
        }
      }

      // Create order with authenticated user_id (cannot be spoofed)
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert([
          {
            user_id: user.id,
            total_amount: totalAmount,
            status,
            created_at: new Date().toISOString(),
          },
        ])
        .select()

      if (orderError) throw orderError

      const orderId = orderData?.[0]?.id

      // Add order items
      const orderItems = items.map((item: any) => ({
        order_id: orderId,
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.price,
      }))

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems)

      if (itemsError) throw itemsError

      // Clear user's cart items
      const { error: clearError } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id)

      if (clearError) throw clearError

      return NextResponse.json(orderData?.[0])
    } catch (error) {
      console.error('[v0] Error creating order:', error)
      return NextResponse.json(
        { error: 'Failed to create order' },
        { status: 500 }
      )
    }
  })
}
