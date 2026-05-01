'use client'

import React, { createContext, useContext } from 'react'
import { useCart, useAddToCart, useRemoveFromCart, useUpdateQuantity, useClearCart } from '@/lib/hooks'

interface CartContextType {
  items: any[]
  loading: boolean
  addItem: (productId: string, quantity: number) => Promise<void>
  removeItem: (cartItemId: string) => Promise<void>
  updateQuantity: (cartItemId: string, quantity: number) => Promise<void>
  clear: () => Promise<void>
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { data: items = [], isLoading: loading, mutate } = useCart()
  const { trigger: addItem } = useAddToCart()
  const { trigger: removeItem } = useRemoveFromCart()
  const { trigger: updateQuantity } = useUpdateQuantity()
  const { trigger: clearCart } = useClearCart()

  const handleAddItem = async (productId: string, quantity: number) => {
    await addItem({ productId, quantity })
    mutate()
  }

  const handleRemoveItem = async (cartItemId: string) => {
    await removeItem({ cartItemId })
    mutate()
  }

  const handleUpdateQuantity = async (cartItemId: string, quantity: number) => {
    await updateQuantity({ cartItemId, quantity })
    mutate()
  }

  const handleClearCart = async () => {
    await clearCart()
    mutate()
  }

  return (
    <CartContext.Provider
      value={{
        items,
        loading,
        addItem: handleAddItem,
        removeItem: handleRemoveItem,
        updateQuantity: handleUpdateQuantity,
        clear: handleClearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCartContext() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCartContext must be used within CartProvider')
  }
  return context
}
