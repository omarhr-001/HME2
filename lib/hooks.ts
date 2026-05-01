'use client'

import { useAuth } from './auth-context'
import useSWR from 'swr'
import { useState } from 'react'

const fetcher = (url: string) => fetch(url).then(res => res.json())

export function useCart() {
  const { user } = useAuth()
  
  const { data: cartItems, mutate, error, isLoading } = useSWR(
    user ? `/api/cart?userId=${user.id}` : null,
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 5000 }
  )

  const addToCart = async (productId: string, quantity: number) => {
    if (!user) return
    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          productId,
          quantity,
        }),
      })
      if (res.ok) {
        mutate()
      }
    } catch (err) {
      console.error('Error adding to cart:', err)
    }
  }

  const updateCartItem = async (itemId: string, quantity: number) => {
    try {
      const res = await fetch(`/api/cart/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity }),
      })
      if (res.ok) {
        mutate()
      }
    } catch (err) {
      console.error('Error updating cart item:', err)
    }
  }

  const removeFromCart = async (itemId: string) => {
    try {
      const res = await fetch(`/api/cart/${itemId}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        mutate()
      }
    } catch (err) {
      console.error('Error removing from cart:', err)
    }
  }

  const cartTotal = (cartItems || []).reduce((total, item) => {
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
  
  const { data: orders, mutate, error, isLoading } = useSWR(
    user ? `/api/orders?userId=${user.id}` : null,
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 5000 }
  )

  const createOrder = async (items: any[], totalAmount: number) => {
    if (!user) return
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
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
      console.error('Error creating order:', err)
    }
  }

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (res.ok) {
        mutate()
      }
    } catch (err) {
      console.error('Error updating order:', err)
    }
  }

  const getOrderById = async (orderId: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`)
      if (res.ok) {
        return await res.json()
      }
    } catch (err) {
      console.error('Error fetching order:', err)
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
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
        headers: { 'Content-Type': 'application/json' },
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
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
