'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('orderId')
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (orderId) {
      // Fetch order details
      fetch(`/api/orders?orderId=${orderId}`)
        .then((res) => res.json())
        .then((data) => {
          setOrder(data)
          setLoading(false)
        })
        .catch((err) => {
          console.error('[v0] Error fetching order:', err)
          setLoading(false)
        })
    }
  }, [orderId])

  return (
    <main className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4 max-w-md">
        <Card className="p-8 text-center">
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h1 className="text-3xl font-bold mb-2">Payment Successful!</h1>
            <p className="text-foreground/60 mb-4">
              Thank you for your purchase. Your order has been confirmed.
            </p>
          </div>

          {!loading && order && (
            <div className="bg-background border rounded-lg p-4 mb-6 text-left">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-foreground/60">Order ID</p>
                  <p className="font-mono font-bold text-sm">{order.id.slice(0, 8)}</p>
                </div>
                <div>
                  <p className="text-sm text-foreground/60">Amount</p>
                  <p className="font-bold">{order.total_amount.toFixed(2)} TND</p>
                </div>
                <div>
                  <p className="text-sm text-foreground/60">Status</p>
                  <p className="font-bold capitalize text-green-600">
                    {order.status}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-foreground/60">Date</p>
                  <p className="font-bold text-sm">
                    {new Date(order.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          )}

          <p className="text-sm text-foreground/60 mb-6">
            A confirmation email has been sent to your email address. You can track
            your order in your account dashboard.
          </p>

          <div className="space-y-3">
            <Link href="/orders">
              <Button className="w-full">View Your Orders</Button>
            </Link>
            <Link href="/products">
              <Button variant="outline" className="w-full">
                Continue Shopping
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </main>
  )
}
