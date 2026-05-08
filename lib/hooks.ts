'use client'

import { useAuth } from './auth-context'
import { createAuthHeaders } from './auth-token'
import useSWR from 'swr'
import { useState } from 'react'

export type CartItem = {
  id: string
  product_id?: string
  product_name?: string
  quantity: number
  products?: {
    name?: string
    price?: number
    image_url?: string | null
    category?: string | null
  } | null
}

export type Order = {
  id: string
  status?: string
  total_amount?: number
  created_at?: string
  order_items?: Array<{
    id: string
    quantity: number
    unit_price: number
  }>
}

// Helper to create authenticated fetch requests with the current access token.
const authenticatedFetcher = async (url: string) => {
  const res = await fetch(url, {
    headers: await createAuthHeaders(true),
  })
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  return res.json()
}

export function useCart() {
  const { user } = useAuth()
  
  const { data: cartItems, mutate, error, isLoading } = useSWR<CartItem[]>(
    user ? `/api/cart` : null,
    authenticatedFetcher,
    { revalidateOnFocus: false, dedupingInterval: 5000 }
  )

  const addToCart = async (productId: string, quantity: number) => {
    if (!user) return
    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: await createAuthHeaders(true),
        body: JSON.stringify({
          productId,
          quantity,
        }),
      })
      if (res.ok) {
        mutate()
      }
    } catch (err) {
      console.error('[v0] Error adding to cart:', err)
    }
  }

  const updateCartItem = async (itemId: string, quantity: number) => {
    try {
      const res = await fetch(`/api/cart/${itemId}`, {
        method: 'PUT',
        headers: await createAuthHeaders(true),
        body: JSON.stringify({ quantity }),
      })
      if (res.ok) {
        mutate()
      }
    } catch (err) {
      console.error('[v0] Error updating cart item:', err)
    }
  }

  const removeFromCart = async (itemId: string) => {
    try {
      const res = await fetch(`/api/cart/${itemId}`, {
        method: 'DELETE',
        headers: await createAuthHeaders(),
      })
      if (res.ok) {
        mutate()
      }
    } catch (err) {
      console.error('[v0] Error removing from cart:', err)
    }
  }

  const cartTotal = (cartItems || []).reduce((total: number, item: CartItem) => {
    return total + (item.products?.price || 0) * item.quantity
  }, 0)

  return {
    cartItems: cartItems || [],
    cartTotal,
    addToCart,
    updateCartItem,
    removeFromCart,
    isLoading,
    error,
    mutate,
  }
}

export function useOrders() {
  const { user } = useAuth()
  
  const { data: orders, mutate, error, isLoading } = useSWR<Order[]>(
    user ? `/api/orders` : null,
    authenticatedFetcher,
    { revalidateOnFocus: false, dedupingInterval: 5000 }
  )

  const createOrder = async (items: any[], totalAmount: number) => {
    if (!user) return
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: await createAuthHeaders(true),
        body: JSON.stringify({
          items,
          totalAmount,
          status: 'pending',
        }),
      })
      if (res.ok) {
        mutate()
        return await res.json()
      }
    } catch (err) {
      console.error('[v0] Error creating order:', err)
    }
  }

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: await createAuthHeaders(true),
        body: JSON.stringify({ status }),
      })
      if (res.ok) {
        mutate()
      }
    } catch (err) {
      console.error('[v0] Error updating order:', err)
    }
  }

  const getOrderById = async (orderId: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        headers: await createAuthHeaders(),
      })
      if (res.ok) {
        return await res.json()
      }
    } catch (err) {
      console.error('[v0] Error fetching order:', err)
    }
  }

  return {
    orders: orders || [],
    createOrder,
    updateOrderStatus,
    getOrderById,
    isLoading,
    error,
    mutate,
  }
}

// Simple mutation hooks that track loading state
export function useAddToCart() {
  const { user } = useAuth()
  const [isMutating, setIsMutating] = useState(false)

  const trigger = async ({ productId, quantity }: { productId: string; quantity: number }) => {
    if (!user) return
    setIsMutating(true)
    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: await createAuthHeaders(true),
        body: JSON.stringify({
          productId,
          quantity,
        }),
      })
      if (!res.ok) throw new Error('Failed to add to cart')
      return await res.json()
    } finally {
      setIsMutating(false)
    }
  }

  return { trigger, isMutating }
}

export function useRemoveFromCart() {
  const [isMutating, setIsMutating] = useState(false)

  const trigger = async ({ cartItemId }: { cartItemId: string }) => {
    setIsMutating(true)
    try {
      const res = await fetch(`/api/cart/${cartItemId}`, {
        method: 'DELETE',
        headers: await createAuthHeaders(),
      })
      if (!res.ok) throw new Error('Failed to remove from cart')
      return await res.json()
    } finally {
      setIsMutating(false)
    }
  }

  return { trigger, isMutating }
}

export function useUpdateQuantity() {
  const [isMutating, setIsMutating] = useState(false)

  const trigger = async ({ cartItemId, quantity }: { cartItemId: string; quantity: number }) => {
    setIsMutating(true)
    try {
      const res = await fetch(`/api/cart/${cartItemId}`, {
        method: 'PUT',
        headers: await createAuthHeaders(true),
        body: JSON.stringify({ quantity }),
      })
      if (!res.ok) throw new Error('Failed to update quantity')
      return await res.json()
    } finally {
      setIsMutating(false)
    }
  }

  return { trigger, isMutating }
}

export function useCreateOrder() {
  const { user } = useAuth()
  const [isMutating, setIsMutating] = useState(false)

  const trigger = async ({ items }: { items: any[] }) => {
    if (!user) return
    setIsMutating(true)
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: await createAuthHeaders(true),
        body: JSON.stringify({
          items,
          status: 'pending',
        }),
      })
      if (!res.ok) throw new Error('Failed to create order')
      return await res.json()
    } finally {
      setIsMutating(false)
    }
  }

  return { trigger, isMutating }
}
