'use client'

import type { CartItemWithProduct, Order, Product } from './types'

export const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID || '2470196180100029'
export const META_PIXEL_CURRENCY = 'TND'

type MetaPixelEvent =
  | 'PageView'
  | 'ViewContent'
  | 'AddToCart'
  | 'InitiateCheckout'
  | 'Purchase'

type MetaPixelParameters = Record<string, string | number | string[] | undefined>
type MetaPixelOptions = {
  eventID?: string
}

declare global {
  interface Window {
    fbq?: (
      action: 'track',
      event: MetaPixelEvent,
      parameters?: MetaPixelParameters,
      options?: MetaPixelOptions,
    ) => void
  }
}

function track(event: MetaPixelEvent, parameters?: MetaPixelParameters, options?: MetaPixelOptions) {
  if (typeof window === 'undefined' || !window.fbq) return
  window.fbq('track', event, parameters, options)
}

export function trackPageView() {
  track('PageView')
}

export function trackViewContent(product: Product) {
  track('ViewContent', {
    content_ids: [product.id],
    content_name: product.name,
    content_category: product.category,
    content_type: 'product',
    value: product.price,
    currency: META_PIXEL_CURRENCY,
  })
}

export function trackAddToCart(product: Product, quantity = 1) {
  track('AddToCart', {
    content_ids: [product.id],
    content_name: product.name,
    content_category: product.category,
    content_type: 'product',
    num_items: quantity,
    value: product.price * quantity,
    currency: META_PIXEL_CURRENCY,
  })
}

export function trackInitiateCheckout(items: CartItemWithProduct[], total: number) {
  track('InitiateCheckout', {
    content_ids: items.map((item) => String(item.product_id)),
    content_type: 'product',
    num_items: items.reduce((sum, item) => sum + item.quantity, 0),
    value: total,
    currency: META_PIXEL_CURRENCY,
  })
}

export function trackPurchase(order: Order, items: CartItemWithProduct[], total: number) {
  const eventID = order.id

  track('Purchase', {
    content_ids: items.map((item) => String(item.product_id)),
    content_type: 'product',
    num_items: items.reduce((sum, item) => sum + item.quantity, 0),
    value: total,
    currency: META_PIXEL_CURRENCY,
    order_id: order.order_number || order.id,
  }, {
    eventID,
  })
}
