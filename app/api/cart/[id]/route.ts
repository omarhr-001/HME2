import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/auth-middleware'

function createAuthenticatedClient(token: string) {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAuth(req, async (req, user) => {
    try {
      const cartItemId = params.id

      const supabase = createAuthenticatedClient(
        req.headers.get('authorization')?.replace('Bearer ', '') || ''
      )

      // Verify that this cart item belongs to the authenticated user
      const { data: cartItem, error: fetchError } = await supabase
        .from('cart_items')
        .select('user_id')
        .eq('id', cartItemId)
        .single()

      if (fetchError || !cartItem) {
        return NextResponse.json(
          { error: 'Cart item not found' },
          { status: 404 }
        )
      }

      if (cartItem.user_id !== user.id) {
        return NextResponse.json(
          { error: 'Forbidden: You can only delete your own cart items' },
          { status: 403 }
        )
      }

      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', cartItemId)
        .eq('user_id', user.id)

      if (error) throw error

      return NextResponse.json({ success: true })
    } catch (error) {
      console.error('[v0] Error deleting cart item:', error)
      return NextResponse.json(
        { error: 'Failed to delete cart item' },
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
      const { quantity } = await req.json()
      const cartItemId = params.id

      if (quantity === undefined || quantity < 0) {
        return NextResponse.json(
          { error: 'Invalid quantity' },
          { status: 400 }
        )
      }

      const supabase = createAuthenticatedClient(
        req.headers.get('authorization')?.replace('Bearer ', '') || ''
      )

      // Verify that this cart item belongs to the authenticated user
      const { data: cartItem, error: fetchError } = await supabase
        .from('cart_items')
        .select('user_id')
        .eq('id', cartItemId)
        .single()

      if (fetchError || !cartItem) {
        return NextResponse.json(
          { error: 'Cart item not found' },
          { status: 404 }
        )
      }

      if (cartItem.user_id !== user.id) {
        return NextResponse.json(
          { error: 'Forbidden: You can only update your own cart items' },
          { status: 403 }
        )
      }

      if (quantity === 0) {
        // Delete if quantity is 0
        const { error } = await supabase
          .from('cart_items')
          .delete()
          .eq('id', cartItemId)
          .eq('user_id', user.id)

        if (error) throw error
        return NextResponse.json({ success: true })
      }

      const { data, error } = await supabase
        .from('cart_items')
        .update({ quantity })
        .eq('id', cartItemId)
        .eq('user_id', user.id)
        .select()

      if (error) throw error
      return NextResponse.json(data?.[0])
    } catch (error) {
      console.error('[v0] Error updating cart item:', error)
      return NextResponse.json(
        { error: 'Failed to update cart item' },
        { status: 500 }
      )
    }
  })
}
