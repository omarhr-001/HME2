'use client'

import { useAuth } from './auth-context'
import { supabase } from './supabase'
import useSWR from 'swr'
import { useEffect, useState } from 'react'
import type { CartItemWithProduct, CheckoutPayload, Order } from './types'

// Helper to get JWT token and create authenticated fetcher
async function getAuthToken() {
  const { data } = await supabase.auth.getSession()
  return data.session?.access_token
}

const authenticatedFetcher = async (url: string) => {
  const token = await getAuthToken()
  const res = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  })
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  return res.json()
}

async function getApiErrorMessage(res: Response, fallback: string) {
  const errorData = await res.json().catch(() => ({}))
  return typeof errorData?.error === 'string' ? errorData.error : fallback
}

export function useCart() {
  const { user } = useAuth()

  const { data: cartItems, mutate, error, isLoading } = useSWR<CartItemWithProduct[]>(
    user ? `/api/cart` : null,
    authenticatedFetcher,
    { revalidateOnFocus: false, dedupingInterval: 5000 }
  )

  useEffect(() => {
    if (!user?.id) return

    // ✅ Évite de recréer un canal déjà existant
    const existingChannel = supabase.getChannels().find(
      (ch) => ch.topic === `realtime:cart-items-${user.id}`
    )
    if (existingChannel) return

    const channel = supabase
      .channel(`cart-items-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'cart_items',
          filter: `user_id=eq.${user.id}`,
        },
        () => mutate()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [mutate, user?.id])

  const addToCart = async (productId: string, quantity: number) => {
    if (!user) throw new Error('User not authenticated')
    try {
      const token = await getAuthToken()
      if (!token) throw new Error('Failed to get authentication token')

      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId,
          quantity,
        }),
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.error || `Failed to add to cart: ${res.status}`)
      }

      const data = await res.json()
      mutate()
      return data
    } catch (err) {
      console.error('[v0] Error adding to cart:', err)
      throw err
    }
  }

  const updateCartItem = async (itemId: string, quantity: number) => {
    try {
      const token = await getAuthToken()
      if (!token) throw new Error('Failed to get authentication token')

      const res = await fetch(`/api/cart/${itemId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ quantity }),
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.error || `Failed to update cart item: ${res.status}`)
      }

      const data = await res.json()
      mutate()
      return data
    } catch (err) {
      console.error('[v0] Error updating cart item:', err)
      throw err
    }
  }

  const removeFromCart = async (itemId: string) => {
    try {
      const token = await getAuthToken()
      if (!token) throw new Error('Failed to get authentication token')

      const res = await fetch(`/api/cart/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.error || `Failed to remove from cart: ${res.status}`)
      }

      mutate()
    } catch (err) {
      console.error('[v0] Error removing from cart:', err)
      throw err
    }
  }

  const cartTotal = (cartItems || []).reduce((total: number, item: CartItemWithProduct) => {
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

  const createOrder = async (payload: CheckoutPayload) => {
    if (!user) return
    try {
      const token = await getAuthToken()
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...payload,
          status: payload.status || 'pending',
        }),
      })
      if (!res.ok) throw new Error(await getApiErrorMessage(res, 'Erreur lors de la création de la commande'))
      mutate()
      return await res.json()
    } catch (err) {
      console.error('[v0] Error creating order:', err)
      throw err
    }
  }

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const token = await getAuthToken()
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
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
      const token = await getAuthToken()
      const res = await fetch(`/api/orders/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
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
      const token = await getAuthToken()
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId,
          quantity,
        }),
      })
      if (!res.ok) throw new Error(await getApiErrorMessage(res, 'Failed to add to cart'))
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
      const token = await getAuthToken()
      const res = await fetch(`/api/cart/${cartItemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      if (!res.ok) throw new Error(await getApiErrorMessage(res, 'Failed to remove from cart'))
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
      const token = await getAuthToken()
      const res = await fetch(`/api/cart/${cartItemId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ quantity }),
      })
      if (!res.ok) throw new Error(await getApiErrorMessage(res, 'Failed to update quantity'))
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
  const [error, setError] = useState<string | null>(null)

  const trigger = async (payload: CheckoutPayload) => {
    if (!user) return
    setIsMutating(true)
    setError(null)
    try {
      const token = await getAuthToken()
      if (!token) {
        setError('Session expirée. Veuillez vous reconnecter.')
        return null
      }

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...payload,
          status: payload.status || 'pending',
        }),
      })

      if (!res.ok) {
        const message = await getApiErrorMessage(res, 'Erreur lors de la création de la commande')
        setError(message)
        return null
      }

      return await res.json()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors de la création de la commande'
      setError(message)
      return null
    } finally {
      setIsMutating(false)
    }
  }

  return { trigger, isMutating, error }
}
