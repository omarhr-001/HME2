import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const KONNECT_API_KEY = process.env.KONNECT_API_KEY
    const KONNECT_BASE_URL = 'https://api.konnect.network'
    
    const body = await request.json()
    const { amount, description, orderId, userId, items, email } = body

    if (!amount || !orderId || !userId || !email) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (!KONNECT_API_KEY) {
      return NextResponse.json(
        { error: 'Payment gateway not configured' },
        { status: 500 }
      )
    }

    // Create payment invoice with Konnect
    const paymentData = {
      amount: Math.round(amount * 1000), // Amount in millimes (smallest unit)
      description: description || `Order ${orderId}`,
      orderId: orderId,
      firstName: email.split('@')[0],
      email: email,
      phone: '',
      webhookUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/konnect`,
      successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?orderId=${orderId}`,
      failureUrl: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/failed?orderId=${orderId}`,
      acceptedPaymentMethods: ['wallet', 'bank_card', 'e_DINARS'],
      liabilityAmount: Math.round(amount * 1000),
    }

    const response = await axios.post(
      `${KONNECT_BASE_URL}/gateway/create-payment-request`,
      paymentData,
      {
        headers: {
          'Content-Type': 'application/json',
          'api-key': KONNECT_API_KEY,
        },
      }
    )

    if (!response.data.paymentUrl) {
      throw new Error('No payment URL received from Konnect')
    }

    return NextResponse.json({
      success: true,
      paymentUrl: response.data.paymentUrl,
      paymentRef: response.data.paymentRef || response.data.reference,
      orderId: orderId,
    })
  } catch (error: any) {
    console.error('Payment init error:', error.response?.data || error.message)
    return NextResponse.json(
      {
        error: 'Failed to initiate payment',
        details: error.response?.data?.message || error.message,
      },
      { status: 500 }
    )
  }
}
