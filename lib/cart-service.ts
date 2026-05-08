import { supabase } from './supabase'

export interface CartItem {
  id: string
  user_id: string
  product_id: string
  quantity: number
  created_at: string
  updated_at: string
  product?: {
    id: string
    name: string
    price: number
    image_url?: string
  }
}

export interface CartResponse {
  success: boolean
  data?: any
  error?: string
}

/**
 * Get all cart items for a user
 */
export async function getCartItems(userId: string): Promise<CartResponse> {
  try {
    const { data, error } = await supabase
      .from('cart_items')
      .select('*')
      .eq('user_id', userId)

    if (error) throw error

    return { success: true, data }
  } catch (error) {
    console.error('Error fetching cart items:', error)
    return { success: false, error: (error as Error).message }
  }
}

/**
 * Add item to cart
 */
export async function addToCart(
  userId: string,
  productId: string,
  quantity: number
): Promise<CartResponse> {
  try {
    // Check if item already in cart
    const { data: existing } = await supabase
      .from('cart_items')
      .select('*')
      .eq('user_id', userId)
      .eq('product_id', productId)
      .single()

    if (existing) {
      // Update quantity
      const { data, error } = await supabase
        .from('cart_items')
        .update({
          quantity: existing.quantity + quantity,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id)
        .select()

      if (error) throw error
      return { success: true, data: data?.[0] }
    } else {
      // Insert new item
      const { data, error } = await supabase
        .from('cart_items')
        .insert({
          user_id: userId,
          product_id: productId,
          quantity,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()

      if (error) throw error
      return { success: true, data: data?.[0] }
    }
  } catch (error) {
    console.error('Error adding to cart:', error)
    return { success: false, error: (error as Error).message }
  }
}

/**
 * Update cart item quantity
 */
export async function updateCartItem(
  userId: string,
  cartItemId: string,
  quantity: number
): Promise<CartResponse> {
  try {
    if (quantity <= 0) {
      // Remove if quantity is 0 or less
      return removeFromCart(userId, cartItemId)
    }

    const { data, error } = await supabase
      .from('cart_items')
      .update({
        quantity,
        updated_at: new Date().toISOString(),
      })
      .eq('id', cartItemId)
      .eq('user_id', userId)
      .select()

    if (error) throw error

    return { success: true, data: data?.[0] }
  } catch (error) {
    console.error('Error updating cart item:', error)
    return { success: false, error: (error as Error).message }
  }
}

/**
 * Remove item from cart
 */
export async function removeFromCart(
  userId: string,
  cartItemId: string
): Promise<CartResponse> {
  try {
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', cartItemId)
      .eq('user_id', userId)

    if (error) throw error

    return { success: true }
  } catch (error) {
    console.error('Error removing from cart:', error)
    return { success: false, error: (error as Error).message }
  }
}

/**
 * Clear entire cart for a user
 */
export async function clearCart(userId: string): Promise<CartResponse> {
  try {
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', userId)

    if (error) throw error

    return { success: true }
  } catch (error) {
    console.error('Error clearing cart:', error)
    return { success: false, error: (error as Error).message }
  }
}

/**
 * Get cart totals
 */
export async function getCartTotal(userId: string): Promise<number> {
  try {
    const { data, error } = await supabase
      .from('cart_items')
      .select('quantity, product_id')
      .eq('user_id', userId)

    if (error) throw error

    let total = 0
    if (data) {
      for (const item of data) {
        const { data: productData } = await supabase
          .from('products')
          .select('price')
          .eq('id', item.product_id)
          .single()

        if (productData) {
          total += (productData.price as number) * item.quantity
        }
      }
    }

    return total
  } catch (error) {
    console.error('Error calculating cart total:', error)
    return 0
  }
}
