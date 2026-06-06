import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/auth-middleware'
import { createServiceClient } from '@/lib/server-supabase'
import type { CheckoutAddress } from '@/lib/types'
import { calculateShippingFee } from '@/lib/shipping'
import { getShippingSettings } from '@/lib/server-shipping-settings'
import { sendMetaPurchaseEvent } from '@/lib/server-meta-capi'

const VALID_STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'] as const
const VALID_PAYMENT_METHODS = ['cash_on_delivery', 'bank_transfer'] as const

export async function GET(req: NextRequest) {
  return withAuth(req, async (req, user) => {
    try {
      const supabase = createServiceClient()

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
      const {
        items,
        shippingAddress,
        billingAddress,
        paymentMethod = 'cash_on_delivery',
        notes,
        status = 'pending',
      } = await req.json()

      if (!VALID_STATUSES.includes(status)) {
        return NextResponse.json(
          { error: 'Invalid order status' },
          { status: 400 }
        )
      }

      if (!isValidAddress(shippingAddress)) {
        return NextResponse.json(
          { error: 'Invalid shipping address' },
          { status: 400 }
        )
      }

      if (!VALID_PAYMENT_METHODS.includes(paymentMethod)) {
        return NextResponse.json(
          { error: 'Invalid payment method' },
          { status: 400 }
        )
      }

      const supabase = createServiceClient()
      const requestedCartItemIds = Array.isArray(items)
        ? new Set(items.map((item: any) => item.id).filter(Boolean))
        : null

      const normalizedShippingAddress = normalizeAddress(shippingAddress)
      const normalizedBillingAddress = isValidAddress(billingAddress)
        ? normalizeAddress(billingAddress)
        : normalizedShippingAddress

      const orderData = await createOrderWithApplicationFlow({
        req,
        supabase,
        userId: user.id,
        requestedCartItemIds,
        shippingAddress: normalizedShippingAddress,
        billingAddress: normalizedBillingAddress,
        paymentMethod,
        paymentStatus: 'pending',
        notes,
        status,
      })

      return NextResponse.json(orderData)
    } catch (error) {
      console.error('[v0] Error creating order:', error)
      const message = error instanceof Error ? error.message : 'Failed to create order'
      return NextResponse.json(
        { error: message },
        { status: getCreateOrderErrorStatus(message) }
      )
    }
  })
}

function isValidAddress(address: unknown): address is CheckoutAddress {
  if (!address || typeof address !== 'object') return false
  const value = address as Partial<CheckoutAddress>
  return Boolean(
    value.firstName &&
    value.lastName &&
    value.email &&
    value.phone &&
    value.address &&
    value.city &&
    value.postalCode,
  )
}

function normalizeAddress(address: CheckoutAddress) {
  return {
    firstName: address.firstName.trim(),
    lastName: address.lastName.trim(),
    email: address.email.trim(),
    phone: address.phone.trim(),
    address: address.address.trim(),
    city: address.city.trim(),
    postalCode: address.postalCode.trim(),
    country: address.country || 'Tunisia',
  }
}

async function createOrderWithApplicationFlow({
  req,
  supabase,
  userId,
  requestedCartItemIds,
  shippingAddress,
  billingAddress,
  paymentMethod,
  paymentStatus,
  notes,
  status,
}: {
  req: NextRequest
  supabase: ReturnType<typeof createServiceClient>
  userId: string
  requestedCartItemIds: Set<string> | null
  shippingAddress: ReturnType<typeof normalizeAddress>
  billingAddress: ReturnType<typeof normalizeAddress>
  paymentMethod: typeof VALID_PAYMENT_METHODS[number]
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded'
  notes: unknown
  status: string
}) {
  const { data: cartItems, error: cartError } = await supabase
    .from('cart_items')
    .select(`
      id,
      product_id,
      quantity,
      products (
        id,
        name,
        price,
        stock_quantity,
        in_stock,
        is_active
      )
    `)
    .eq('user_id', userId)

  if (cartError) throw cartError

  const selectedCartItems = (cartItems || []).filter((item: any) => {
    return !requestedCartItemIds?.size || requestedCartItemIds.has(item.id)
  })

  if (!selectedCartItems.length) {
    throw new Error('Cart is empty')
  }

  for (const item of selectedCartItems as any[]) {
    const product = Array.isArray(item.products) ? item.products[0] : item.products

    if (!product || !product.is_active) {
      throw new Error(`Product ${item.product_id} is unavailable`)
    }

    if (!product.in_stock || product.stock_quantity < item.quantity) {
      throw new Error(`${product.name} does not have enough stock`)
    }
  }

  const subtotal = (selectedCartItems as any[]).reduce((sum, item) => {
    const product = Array.isArray(item.products) ? item.products[0] : item.products
    return sum + Number(product.price || 0) * Number(item.quantity || 0)
  }, 0)
  const shippingSettings = await getShippingSettings()
  const shippingFee = calculateShippingFee(subtotal, shippingAddress.city, shippingSettings)

  const orderPayload = {
    user_id: userId,
    order_number: createOrderNumber(),
    total_amount: subtotal + shippingFee,
    shipping_fee: shippingFee,
    status,
    shipping_address: shippingAddress,
    billing_address: billingAddress,
    payment_method: paymentMethod,
    payment_status: paymentStatus,
    notes: typeof notes === 'string' ? notes.trim() || null : null,
  }

  let { data: orderData, error: orderError } = await supabase
    .from('orders')
    .insert([orderPayload])
    .select()
    .single()

  if (orderError && orderError.message?.includes('shipping_fee')) {
    const { shipping_fee: _shippingFee, ...fallbackPayload } = orderPayload
    const fallback = await supabase
      .from('orders')
      .insert([fallbackPayload])
      .select()
      .single()
    orderData = fallback.data
    orderError = fallback.error
  }

  if (orderError) throw orderError
  if (!orderData?.id) throw new Error('Order was not created')

  const orderItems = (selectedCartItems as any[]).map((item) => {
    const product = Array.isArray(item.products) ? item.products[0] : item.products
    return {
      order_id: orderData.id,
      product_id: item.product_id,
      quantity: item.quantity,
      price: Number(product.price || 0),
    }
  })

  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItems)

  if (itemsError) throw itemsError

  for (const item of selectedCartItems as any[]) {
    const product = Array.isArray(item.products) ? item.products[0] : item.products
    const nextQuantity = Math.max(0, Number(product.stock_quantity || 0) - Number(item.quantity || 0))
    const { error: stockError } = await supabase
      .from('products')
      .update({
        stock_quantity: nextQuantity,
        in_stock: nextQuantity > 0,
        updated_at: new Date().toISOString(),
      })
      .eq('id', item.product_id)

    if (stockError) throw stockError
  }

  const { error: clearError } = await supabase
    .from('cart_items')
    .delete()
    .in('id', selectedCartItems.map((item: any) => item.id))
    .eq('user_id', userId)

  if (clearError) throw clearError

  await sendMetaPurchaseEvent({
    req,
    eventId: orderData.id,
    orderId: orderData.order_number || orderData.id,
    total: Number(orderData.total_amount || subtotal + shippingFee),
    address: shippingAddress,
    items: orderItems.map((item) => ({
      productId: String(item.product_id),
      quantity: Number(item.quantity || 0),
      price: Number(item.price || 0),
    })),
  })

  return orderData
}

function createOrderNumber() {
  const date = new Date()
  const yyyymmdd = date.toISOString().slice(0, 10).replace(/-/g, '')
  const suffix = Math.random().toString(36).slice(2, 8).toUpperCase()
  return `HME-${yyyymmdd}-${suffix}`
}

function getCreateOrderErrorStatus(message?: string) {
  if (!message) return 500
  const normalizedMessage = message.toLowerCase()
  if (normalizedMessage.includes('stock')) return 409
  if (
    normalizedMessage.includes('cart is empty') ||
    normalizedMessage.includes('unavailable') ||
    normalizedMessage.includes('invalid order status') ||
    normalizedMessage.includes('invalid payment method') ||
    normalizedMessage.includes('invalid payment status') ||
    normalizedMessage.includes('user is required')
  ) {
    return 400
  }
  return 500
}
