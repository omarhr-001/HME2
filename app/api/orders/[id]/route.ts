import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/auth-middleware'

function createAuthenticatedClient(token: string) {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAuth(req, async (req, user) => {
    try {
      const orderId = params.id

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
        .eq('id', orderId)
        .eq('user_id', user.id)
        .single()

      if (error || !data) {
        return NextResponse.json(
          { error: 'Order not found' },
          { status: 404 }
        )
      }

      return NextResponse.json(data)
    } catch (error) {
      console.error('[v0] Error fetching order:', error)
      return NextResponse.json(
        { error: 'Failed to fetch order' },
        { status: 500 }
      )
    }
  })
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAuth(req, async (req, user) => {
    try {
      const { status } = await req.json()
      const orderId = params.id

      if (!status) {
        return NextResponse.json(
          { error: 'Status required' },
          { status: 400 }
        )
      }

      const supabase = createAuthenticatedClient(
        req.headers.get('authorization')?.replace('Bearer ', '') || ''
      )

      // Verify that this order belongs to the authenticated user
      const { data: orderData, error: fetchError } = await supabase
        .from('orders')
        .select('user_id')
        .eq('id', orderId)
        .single()

      if (fetchError || !orderData) {
        return NextResponse.json(
          { error: 'Order not found' },
          { status: 404 }
        )
      }

      if (orderData.user_id !== user.id) {
        return NextResponse.json(
          { error: 'Forbidden: You can only update your own orders' },
          { status: 403 }
        )
      }

      const { data, error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId)
        .eq('user_id', user.id)
        .select()

      if (error) throw error

      return NextResponse.json(data?.[0])
    } catch (error) {
      console.error('[v0] Error updating order:', error)
      return NextResponse.json(
        { error: 'Failed to update order' },
        { status: 500 }
      )
    }
  })
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAuth(req, async (req, user) => {
    try {
      const orderId = params.id

      const supabase = createAuthenticatedClient(
        req.headers.get('authorization')?.replace('Bearer ', '') || ''
      )

      // Verify that this order belongs to the authenticated user
      const { data: orderData, error: fetchError } = await supabase
        .from('orders')
        .select('user_id')
        .eq('id', orderId)
        .single()

      if (fetchError || !orderData) {
        return NextResponse.json(
          { error: 'Order not found' },
          { status: 404 }
        )
      }

      if (orderData.user_id !== user.id) {
        return NextResponse.json(
          { error: 'Forbidden: You can only delete your own orders' },
          { status: 403 }
        )
      }

      // Delete order items first
      const { error: itemsError } = await supabase
        .from('order_items')
        .delete()
        .eq('order_id', orderId)

      if (itemsError) throw itemsError

      // Delete order
      const { error: orderError } = await supabase
        .from('orders')
        .delete()
        .eq('id', orderId)
        .eq('user_id', user.id)

      if (orderError) throw orderError

      return NextResponse.json({ success: true })
    } catch (error) {
      console.error('[v0] Error deleting order:', error)
      return NextResponse.json(
        { error: 'Failed to delete order' },
        { status: 500 }
      )
    }
  })
}
