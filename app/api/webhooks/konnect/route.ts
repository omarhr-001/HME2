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

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient()
    const body = await request.json()
    const { paymentRef, orderId, result, metadata } = body

    console.log('[v0] Konnect webhook received:', { paymentRef, orderId, result })

    if (!paymentRef) {
      return NextResponse.json(
        { error: 'Missing payment reference' },
        { status: 400 }
      )
    }

    if (result?.isConfirmed) {
      // Payment confirmed - update order status
      const { error } = await supabase
        .from('orders')
        .update({
          status: 'paid',
          payment_id: paymentRef,
          updated_at: new Date().toISOString(),
        })
        .eq('id', orderId)

      if (error) {
        console.error('[v0] Error updating order:', error)
        return NextResponse.json({ error: 'Failed to update order' }, { status: 500 })
      }

      console.log('[v0] Order updated to paid:', orderId)

      // TODO: Send confirmation email to user
      // await sendOrderConfirmationEmail(order)

      return NextResponse.json({ success: true, message: 'Payment confirmed' })
    } else {
      // Payment failed or cancelled
      const { error } = await supabase
        .from('orders')
        .update({
          status: 'cancelled',
          updated_at: new Date().toISOString(),
        })
        .eq('id', orderId)

      if (error) {
        console.error('[v0] Error cancelling order:', error)
      }

      return NextResponse.json({ success: true, message: 'Payment failed' })
    }
  } catch (error: any) {
    console.error('[v0] Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}
