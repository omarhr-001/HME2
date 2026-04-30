'use client'

export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function CheckoutFailedPage() {
  return (
    <main className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4 max-w-md">
        <Card className="p-8 text-center">
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
              <svg
                className="w-8 h-8 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h1 className="text-3xl font-bold mb-2">Payment Failed</h1>
            <p className="text-foreground/60 mb-4">
              Unfortunately, your payment could not be processed. Please try again.
            </p>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-left">
            <p className="text-sm text-red-600">
              <strong>What happened?</strong> Your payment was declined or cancelled.
              Please check your payment information and try again.
            </p>
          </div>

          <div className="space-y-3">
            <Link href="/checkout">
              <Button className="w-full">Retry Payment</Button>
            </Link>
            <Link href="/cart">
              <Button variant="outline" className="w-full">
                Back to Cart
              </Button>
            </Link>
            <Link href="/contact">
              <Button variant="ghost" className="w-full">
                Contact Support
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </main>
  )
}
