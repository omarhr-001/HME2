import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'
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
    const KONNECT_API_KEY = process.env.KONNECT_API_KEY
    const KONNECT_BASE_URL = 'https://api.konnect.network'
    const supabase = getSupabaseClient()

    const searchParams = request.nextUrl.searchParams
    const paymentRef = searchParams.get('paymentRef')
    const orderId = searchParams.get('orderId')

    if (!paymentRef || !orderId) {
      return NextResponse.json(
        { error: 'Payment reference and order ID required' },
        { status: 400 }
      )
    }

    if (!KONNECT_API_KEY) {
      return NextResponse.json(
        { error: 'Payment gateway not configured' },
        { status: 500 }
      )
    }

    // Verify payment with Konnect
    const response = await axios.get(
      `${KONNECT_BASE_URL}/gateway/check-payment-request/${paymentRef}`,
      {
        headers: {
          'api-key': KONNECT_API_KEY,
        },
      }
    )

    const paymentData = response.data

    if (paymentData.result?.isConfirmed) {
      // Update order status in Supabase
      const { error } = await supabase
        .from('orders')
        .update({
          status: 'paid',
          payment_id: paymentRef,
          updated_at: new Date().toISOString(),
        })
        .eq('id', orderId)

      if (error) {
        console.error('Error updating order:', error)
      }

      return NextResponse.json({
        success: true,
        message: 'Payment confirmed',
        paymentData: paymentData,
        orderId: orderId,
      })
    } else {
      return NextResponse.json({
        success: false,
        message: 'Payment not confirmed',
        paymentData: paymentData,
      })
    }
  } catch (error: any) {
    console.error('Payment verify error:', error.response?.data || error.message)
    return NextResponse.json(
      {
        error: 'Failed to verify payment',
        details: error.response?.data?.message || error.message,
      },
      { status: 500 }
    )
  }
}
