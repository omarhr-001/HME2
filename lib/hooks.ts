'use client'

import { useAuth } from './auth-context'
import useSWR from 'swr'
import { useState } from 'react'
import { STATIC_AUTH_DISABLED_MESSAGE, STATIC_WRITE_DISABLED_MESSAGE } from './static-mode'
import type { CartItemWithProduct, CheckoutPayload, Order } from './types'

const fetcher = async (url: string) => {
  const response = await fetch(url, { headers: { 'Content-Type': 'application/json' } })
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(typeof errorData?.error === 'string' ? errorData.error : `API error: ${response.status}`)
  }
  return response.json()
}

function unavailableMutation() {
  throw new Error(STATIC_WRITE_DISABLED_MESSAGE)
}

export function useCart() {
  const { user } = useAuth()
  const { data: cartItems, mutate, error, isLoading } = useSWR<CartItemWithProduct[]>(
    user ? '/api/cart' : null,
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 5000 },
  )

  const cartTotal = (cartItems || []).reduce(
    (total, item) => total + (item.products?.price || 0) * item.quantity,
    0,
  )

  return {
    cartItems: cartItems || [],
    cartTotal,
    addToCart: async (_productId: string, _quantity: number) => unavailableMutation(),
    updateCartItem: async (_itemId: string, _quantity: number) => unavailableMutation(),
    removeFromCart: async (_itemId: string) => unavailableMutation(),
    isLoading,
    error,
    mutate,
  }
}

export function useOrders() {
  const { user } = useAuth()
  const { data: orders, mutate, error, isLoading } = useSWR<Order[]>(
    user ? '/api/orders' : null,
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 5000 },
  )

  return {
    orders: orders || [],
    createOrder: async (_payload: CheckoutPayload) => unavailableMutation(),
    updateOrderStatus: async (_orderId: string, _status: string) => unavailableMutation(),
    getOrderById: async (_orderId: string) => unavailableMutation(),
    isLoading,
    error,
    mutate,
  }
}

export function useAddToCart() {
  const [isMutating, setIsMutating] = useState(false)
  const trigger = async (_input: { productId: string; quantity: number }) => {
    setIsMutating(true)
    try {
      unavailableMutation()
    } finally {
      setIsMutating(false)
    }
  }
  return { trigger, isMutating }
}

export function useRemoveFromCart() {
  const [isMutating, setIsMutating] = useState(false)
  const trigger = async (_input: { cartItemId: string }) => {
    setIsMutating(true)
    try {
      unavailableMutation()
    } finally {
      setIsMutating(false)
    }
  }
  return { trigger, isMutating }
}

export function useUpdateQuantity() {
  const [isMutating, setIsMutating] = useState(false)
  const trigger = async (_input: { cartItemId: string; quantity: number }) => {
    setIsMutating(true)
    try {
      unavailableMutation()
    } finally {
      setIsMutating(false)
    }
  }
  return { trigger, isMutating }
}

export function useCreateOrder() {
  const [isMutating, setIsMutating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const trigger = async (_payload: CheckoutPayload) => {
    setIsMutating(true)
    setError(null)
    try {
      unavailableMutation()
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : STATIC_AUTH_DISABLED_MESSAGE)
      return null
    } finally {
      setIsMutating(false)
    }
  }
  return { trigger, isMutating, error }
}
