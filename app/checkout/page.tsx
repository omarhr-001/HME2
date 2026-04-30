'use client'

export const dynamic = 'force-dynamic'
export const revalidate = 0

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCart } from '@/lib/cart-context'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import Link from 'next/link'

export default function CheckoutPage() {
  const router = useRouter()
  const { items, getTotalPrice, clearCart } = useCart()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    email: user?.email || '',
    firstName: user?.user_metadata?.first_name || '',
    lastName: user?.user_metadata?.last_name || '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'Tunisia',
  })

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md p-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Sign in to continue</h1>
            <p className="text-foreground/60 mb-6">
              You need to be logged in to complete your purchase
            </p>
            <Link href="/auth/login">
              <Button className="w-full">Sign in</Button>
            </Link>
          </div>
        </Card>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md p-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
            <p className="text-foreground/60 mb-6">Add items to proceed with checkout</p>
            <Link href="/products">
              <Button className="w-full">Continue Shopping</Button>
            </Link>
          </div>
        </Card>
      </div>
    )
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Create order first
      const orderResponse = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          items,
          totalAmount: getTotalPrice(),
        }),
      })

      if (!orderResponse.ok) {
        throw new Error('Failed to create order')
      }

      const order = await orderResponse.json()

      // Initialize payment with Konnect
      const paymentResponse = await fetch('/api/payment/init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: getTotalPrice(),
          orderId: order.id,
          userId: user.id,
          email: formData.email,
          items,
          description: `Order ${order.id}`,
        }),
      })

      if (!paymentResponse.ok) {
        throw new Error('Failed to initiate payment')
      }

      const paymentData = await paymentResponse.json()

      // Clear cart and redirect to payment
      clearCart()
      window.location.href = paymentData.paymentUrl
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      console.error('[v0] Checkout error:', err)
    } finally {
      setLoading(false)
    }
  }

  const totalPrice = getTotalPrice()

  return (
    <main className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-4">
              <h2 className="text-xl font-bold mb-4">Order Summary</h2>
              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <div key={item.productId} className="flex justify-between pb-4 border-b">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-foreground/60">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-medium">
                      {(item.price * item.quantity).toFixed(2)} TND
                    </p>
                  </div>
                ))}
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between mb-2">
                  <span>Subtotal</span>
                  <span>{totalPrice.toFixed(2)} TND</span>
                </div>
                <div className="flex justify-between mb-4 text-sm text-foreground/60">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>{totalPrice.toFixed(2)} TND</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <Card className="p-8">
              <h1 className="text-3xl font-bold mb-8">Checkout</h1>

              {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Shipping Information */}
                <div>
                  <h2 className="text-xl font-bold mb-4">Shipping Information</h2>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <Input
                      placeholder="First Name"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                    />
                    <Input
                      placeholder="Last Name"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <Input
                    placeholder="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="mb-4"
                  />
                  <Input
                    placeholder="Phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="mb-4"
                  />
                  <Textarea
                    placeholder="Address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    required
                    className="mb-4"
                  />
                  <div className="grid grid-cols-3 gap-4">
                    <Input
                      placeholder="City"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      required
                    />
                    <Input
                      placeholder="Postal Code"
                      name="postalCode"
                      value={formData.postalCode}
                      onChange={handleChange}
                      required
                    />
                    <Input
                      placeholder="Country"
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                      disabled
                    />
                  </div>
                </div>

                {/* Payment Method */}
                <div className="border-t pt-6">
                  <h2 className="text-xl font-bold mb-4">Payment Method</h2>
                  <Card className="p-4 bg-background border-2">
                    <p className="text-sm text-foreground/60 mb-2">
                      Secure payment powered by Konnect Network
                    </p>
                    <p className="font-medium">
                      Available methods: Wallet, Bank Card, E-Dinars
                    </p>
                  </Card>
                </div>

                {/* Submit Button */}
                <div className="border-t pt-6">
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full"
                    disabled={loading}
                  >
                    {loading ? 'Processing...' : 'Proceed to Payment'}
                  </Button>
                  <Link href="/cart">
                    <Button variant="outline" className="w-full mt-2">
                      Back to Cart
                    </Button>
                  </Link>
                </div>
              </form>
            </Card>
          </div>
        </div>
      </div>
    </main>
  )
}
