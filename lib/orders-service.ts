import { supabase } from './supabase'
import { clearCart, getCartItems, getCartTotal } from './cart-service'

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  quantity: number
  price: number
  created_at: string
}

export interface Order {
  id: string
  user_id: string
  total_amount: number
  status: OrderStatus
  address_id?: string
  created_at: string
  updated_at: string
  items?: OrderItem[]
}

export interface OrderResponse {
  success: boolean
  data?: any
  error?: string
}

/**
 * Create a new order from cart
 */
export async function createOrderFromCart(
  userId: string,
  addressId?: string
): Promise<OrderResponse> {
  try {
    // Get cart items
    const cartResponse = await getCartItems(userId)
    if (!cartResponse.success || !cartResponse.data || cartResponse.data.length === 0) {
      return { success: false, error: 'Cart is empty' }
    }

    // Calculate total
    const total = await getCartTotal(userId)

    // Create order
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: userId,
        total_amount: total,
        status: 'pending',
        address_id: addressId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()

    if (orderError) throw orderError

    const order = orderData?.[0]
    if (!order) throw new Error('Failed to create order')

    // Create order items from cart
    const orderItems = cartResponse.data.map((item: any) => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      // Price will be fetched from products table
      created_at: new Date().toISOString(),
    }))

    // Fetch product prices and insert order items
    for (const item of orderItems) {
      const { data: productData } = await supabase
        .from('products')
        .select('price')
        .eq('id', item.product_id)
        .single()

      if (productData) {
        const { error: itemError } = await supabase
          .from('order_items')
          .insert({
            ...item,
            price: (productData.price as number) * item.quantity,
          })

        if (itemError) throw itemError
      }
    }

    // Clear cart
    await clearCart(userId)

    return { success: true, data: order }
  } catch (error) {
    console.error('Error creating order:', error)
    return { success: false, error: (error as Error).message }
  }
}

/**
 * Get all orders for a user
 */
export async function getUserOrders(userId: string): Promise<OrderResponse> {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error

    return { success: true, data }
  } catch (error) {
    console.error('Error fetching user orders:', error)
    return { success: false, error: (error as Error).message }
  }
}

/**
 * Get order details with items
 */
export async function getOrderDetails(
  orderId: string,
  userId: string
): Promise<OrderResponse> {
  try {
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .eq('user_id', userId)
      .single()

    if (orderError) throw orderError

    const { data: itemsData, error: itemsError } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', orderId)

    if (itemsError) throw itemsError

    return {
      success: true,
      data: {
        ...orderData,
        items: itemsData,
      },
    }
  } catch (error) {
    console.error('Error fetching order details:', error)
    return { success: false, error: (error as Error).message }
  }
}

/**
 * Update order status
 */
export async function updateOrderStatus(
  orderId: string,
  userId: string,
  status: OrderStatus
): Promise<OrderResponse> {
  try {
    const { data, error } = await supabase
      .from('orders')
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId)
      .eq('user_id', userId)
      .select()

    if (error) throw error

    return { success: true, data: data?.[0] }
  } catch (error) {
    console.error('Error updating order status:', error)
    return { success: false, error: (error as Error).message }
  }
}

/**
 * Cancel an order
 */
export async function cancelOrder(orderId: string, userId: string): Promise<OrderResponse> {
  try {
    const { data, error } = await supabase
      .from('orders')
      .update({
        status: 'cancelled',
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId)
      .eq('user_id', userId)
      .select()

    if (error) throw error

    return { success: true, data: data?.[0] }
  } catch (error) {
    console.error('Error cancelling order:', error)
    return { success: false, error: (error as Error).message }
  }
}
