'use client'

import { useAuth } from '@/lib/auth-context'
import { useCart, useAddToCart, useRemoveFromCart, useUpdateQuantity, useCreateOrder } from '@/lib/hooks'
import { useState } from 'react'
import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then(res => res.json())

export default function SessionDemoPage() {
  const { user, sessionId, loading } = useAuth()
  const { data: cartItems = [], isLoading: cartLoading, mutate: mutateCart } = useSWR(
    user ? `/api/cart?userId=${user.id}` : null,
    fetcher
  )
  const { trigger: addToCart, isMutating: isAdding } = useAddToCart()
  const { trigger: removeItem, isMutating: isRemoving } = useRemoveFromCart()
  const { trigger: updateQuantity } = useUpdateQuantity()
  const { trigger: createOrder, isMutating: isCreating } = useCreateOrder()
  const [demoProductId] = useState('demo-123')

  if (loading) return <div className="p-4">Loading auth...</div>
  if (!user) return <div className="p-4">Please login first</div>

  const handleAddDemo = async () => {
    try {
      await addToCart({
        productId: demoProductId,
        quantity: 1
      })
      mutateCart()
    } catch (err) {
      console.error('Failed to add to cart:', err)
    }
  }

  const handleCheckout = async () => {
    if (!cartItems.length) {
      alert('Cart is empty')
      return
    }
    
    try {
      const order = await createOrder({
        items: cartItems
      })
      alert(`Order created: ${order?.id}`)
      mutateCart()
    } catch (err) {
      console.error('Failed to create order:', err)
      alert('Failed to create order')
    }
  }

  const cartTotal = (cartItems || []).reduce((total, item) => {
    return total + (item.products?.price || 0) * item.quantity
  }, 0)

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Session System Demo</h1>

      {/* Auth Info */}
      <div className="bg-blue-50 p-4 rounded-lg mb-6">
        <h2 className="text-xl font-semibold mb-2">User & Session Info</h2>
        <p><strong>User:</strong> {user.email}</p>
        <p><strong>User ID:</strong> {user.id}</p>
        <p><strong>Session ID:</strong> {sessionId || 'Loading...'}</p>
      </div>

      {/* Cart Section */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <h2 className="text-xl font-semibold mb-4">Shopping Cart (Persistent)</h2>
        
        {cartLoading ? (
          <p>Loading cart...</p>
        ) : cartItems.length === 0 ? (
          <p className="text-gray-500">Cart is empty</p>
        ) : (
          <div className="space-y-3 mb-4">
            {cartItems.map((item: any) => (
              <div key={item.id} className="bg-white p-3 rounded flex justify-between items-center">
                <div>
                  <p className="font-semibold">{item.product_name || item.product_id}</p>
                  <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => updateQuantity({ cartItemId: item.id, quantity: item.quantity + 1 })}
                    className="px-2 py-1 bg-gray-200 rounded"
                  >
                    +
                  </button>
                  <button
                    onClick={() => {
                      removeItem({ cartItemId: item.id })
                      mutateCart()
                    }}
                    disabled={isRemoving}
                    className="px-3 py-1 bg-red-500 text-white rounded"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={handleAddDemo}
          disabled={isAdding}
          className="w-full px-4 py-2 bg-green-500 text-white rounded font-semibold disabled:opacity-50"
        >
          {isAdding ? 'Adding...' : 'Add Demo Product to Cart'}
        </button>
      </div>

      {/* Cart Total */}
      <div className="bg-yellow-50 p-4 rounded-lg mb-6">
        <h2 className="text-xl font-semibold">Cart Total</h2>
        <p className="text-2xl font-bold text-green-600">${cartTotal.toFixed(2)}</p>
      </div>

      {/* Checkout */}
      <div className="bg-green-50 p-4 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Checkout</h2>
        <button
          onClick={handleCheckout}
          disabled={isCreating || !cartItems.length}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded font-semibold disabled:opacity-50"
        >
          {isCreating ? 'Creating Order...' : `Place Order (${cartItems.length} items)`}
        </button>
      </div>

      {/* Info */}
      <div className="mt-6 p-4 bg-gray-100 rounded text-sm">
        <p className="mb-2"><strong>This demo shows:</strong></p>
        <ul className="list-disc list-inside space-y-1 text-gray-700">
          <li>User session automatically created on login</li>
          <li>Cart persists in database across sessions</li>
          <li>Add, update, remove items from persistent cart</li>
          <li>Create orders from cart items</li>
          <li>Real-time data sync with SWR</li>
        </ul>
      </div>
    </div>
  )
}
