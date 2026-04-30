'use client'

export const dynamic = 'force-dynamic'
export const revalidate = 0

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface Order {
  id: string
  total_amount: number
  status: string
  created_at: string
  order_items: Array<{
    id: string
    product_id: string
    quantity: number
    price: number
  }>
}

export default function OrdersPage() {
  const { user } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user) return

    const fetchOrders = async () => {
      try {
        const response = await fetch(`/api/orders?userId=${user.id}`)
        if (!response.ok) throw new Error('Failed to fetch orders')
        const data = await response.json()
        setOrders(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error fetching orders')
        console.error('[v0] Error fetching orders:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [user])

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md p-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Sign in required</h1>
            <p className="text-foreground/60 mb-6">Sign in to view your orders</p>
            <Link href="/auth/login">
              <Button className="w-full">Sign in</Button>
            </Link>
          </div>
        </Card>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800'
      case 'processing':
        return 'bg-blue-100 text-blue-800'
      case 'shipped':
        return 'bg-blue-100 text-blue-800'
      case 'delivered':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <main className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold mb-8">My Orders</h1>

        {error && (
          <Card className="p-4 mb-6 bg-red-50 border-red-200">
            <p className="text-red-600">{error}</p>
          </Card>
        )}

        {loading ? (
          <div className="grid grid-cols-1 gap-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="p-6 h-32 bg-gray-100 animate-pulse" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <Card className="p-12 text-center">
            <h2 className="text-2xl font-bold mb-4">No orders yet</h2>
            <p className="text-foreground/60 mb-6">
              Start shopping to place your first order
            </p>
            <Link href="/products">
              <Button>Browse Products</Button>
            </Link>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {orders.map((order) => (
              <Card key={order.id} className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-foreground/60">Order ID</p>
                    <p className="font-mono font-bold text-sm">
                      {order.id.slice(0, 8)}...
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-foreground/60">Date</p>
                    <p className="font-bold">
                      {new Date(order.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-foreground/60">Items</p>
                    <p className="font-bold">
                      {order.order_items.reduce((sum, item) => sum + item.quantity, 0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-foreground/60">Amount</p>
                    <p className="font-bold">
                      {order.total_amount.toFixed(2)} TND
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-foreground/60">Status</p>
                    <p className={`font-bold capitalize px-3 py-1 rounded-full text-xs w-fit ${getStatusColor(order.status)}`}>
                      {order.status}
                    </p>
                  </div>
                </div>
                <div className="border-t pt-4">
                  <div className="mb-4">
                    <p className="text-sm font-semibold mb-2">Items in order:</p>
                    <div className="flex flex-wrap gap-2">
                      {order.order_items.map((item) => (
                        <span
                          key={item.id}
                          className="text-xs bg-gray-100 px-2 py-1 rounded"
                        >
                          Qty: {item.quantity} × {item.price.toFixed(2)} TND
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        <div className="mt-8">
          <Link href="/products">
            <Button variant="outline">Continue Shopping</Button>
          </Link>
        </div>
      </div>
    </main>
  )
}
