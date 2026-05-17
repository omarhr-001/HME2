import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/auth-middleware'
import { createServiceClient } from '@/lib/server-supabase'
import type { CheckoutAddress } from '@/lib/types'

const VALID_STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'] as const

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

      const supabase = createServiceClient()
      const requestedCartItemIds = Array.isArray(items)
        ? new Set(items.map((item: any) => item.id).filter(Boolean))
        : null

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
        .eq('user_id', user.id)

      if (cartError) throw cartError

      const selectedCartItems = (cartItems || []).filter((item: any) => {
        return !requestedCartItemIds?.size || requestedCartItemIds.has(item.id)
      })

      if (!selectedCartItems.length) {
        return NextResponse.json(
          { error: 'Cart is empty' },
          { status: 400 }
        )
      }

      for (const item of selectedCartItems as any[]) {
        const product = Array.isArray(item.products) ? item.products[0] : item.products

        if (!product || !product.is_active) {
          return NextResponse.json(
            { error: `Product ${item.product_id} is unavailable` },
            { status: 400 }
          )
        }

        if (!product.in_stock || product.stock_quantity < item.quantity) {
          return NextResponse.json(
            { error: `${product.name} does not have enough stock` },
            { status: 409 }
          )
        }
      }

      const subtotal = (selectedCartItems as any[]).reduce((sum, item) => {
        const product = Array.isArray(item.products) ? item.products[0] : item.products
        return sum + Number(product.price || 0) * Number(item.quantity || 0)
      }, 0)
      const shippingFee = subtotal > 500 ? 0 : 15
      const totalAmount = subtotal + shippingFee
      const orderNumber = createOrderNumber()
      const normalizedShippingAddress = normalizeAddress(shippingAddress)
      const normalizedBillingAddress = isValidAddress(billingAddress)
        ? normalizeAddress(billingAddress)
        : normalizedShippingAddress

      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert([
          {
            user_id: user.id,
            order_number: orderNumber,
            total_amount: totalAmount,
            status,
            shipping_address: normalizedShippingAddress,
            billing_address: normalizedBillingAddress,
            notes: typeof notes === 'string' ? notes.trim() || null : null,
            created_at: new Date().toISOString(),
          },
        ])
        .select()
        .single()

      if (orderError) throw orderError

      const orderId = orderData?.id
      if (!orderId) throw new Error('Order was not created')

      const orderItems = (selectedCartItems as any[]).map((item) => {
        const product = Array.isArray(item.products) ? item.products[0] : item.products
        return {
        order_id: orderId,
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
        .eq('user_id', user.id)

      if (clearError) throw clearError

      return NextResponse.json(orderData)
    } catch (error) {
      console.error('[v0] Error creating order:', error)
      return NextResponse.json(
        { error: 'Failed to create order' },
        { status: 500 }
      )
    }
  })
}

function createOrderNumber() {
  const date = new Date()
  const yyyymmdd = date.toISOString().slice(0, 10).replace(/-/g, '')
  const suffix = Math.random().toString(36).slice(2, 8).toUpperCase()
  return `HME-${yyyymmdd}-${suffix}`
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
