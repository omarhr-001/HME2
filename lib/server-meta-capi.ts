import crypto from 'crypto'
import type { NextRequest } from 'next/server'

const META_PIXEL_ID = process.env.META_PIXEL_ID || process.env.NEXT_PUBLIC_META_PIXEL_ID || '2470196180100029'
const META_CAPI_GRAPH_VERSION = process.env.META_CAPI_GRAPH_VERSION || 'v23.0'
const META_CAPI_ACCESS_TOKEN = process.env.META_CAPI_ACCESS_TOKEN
const META_CURRENCY = 'TND'

type MetaPurchaseItem = {
  productId: string
  quantity: number
  price: number
}

type MetaPurchaseAddress = {
  email?: string
  phone?: string
  firstName?: string
  lastName?: string
  city?: string
  postalCode?: string
  country?: string
}

type SendMetaPurchaseEventInput = {
  req: NextRequest
  eventId: string
  orderId: string
  total: number
  items: MetaPurchaseItem[]
  address: MetaPurchaseAddress
}

export async function sendMetaPurchaseEvent({
  req,
  eventId,
  orderId,
  total,
  items,
  address,
}: SendMetaPurchaseEventInput) {
  if (!META_CAPI_ACCESS_TOKEN || !META_PIXEL_ID) return

  const eventSourceUrl = req.headers.get('referer') || new URL('/checkout', req.url).toString()
  const userAgent = req.headers.get('user-agent') || undefined
  const forwardedFor = req.headers.get('x-forwarded-for')
  const clientIpAddress = forwardedFor?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || undefined

  const userData = removeEmptyValues({
    em: hashValue(address.email),
    ph: hashPhone(address.phone),
    fn: hashValue(address.firstName),
    ln: hashValue(address.lastName),
    ct: hashValue(address.city),
    zp: hashValue(address.postalCode),
    country: hashValue(address.country || 'Tunisia'),
    client_ip_address: clientIpAddress,
    client_user_agent: userAgent,
    fbp: req.cookies.get('_fbp')?.value,
    fbc: req.cookies.get('_fbc')?.value,
  })

  const payload = {
    data: [
      {
        event_name: 'Purchase',
        event_time: Math.floor(Date.now() / 1000),
        event_id: eventId,
        action_source: 'website',
        event_source_url: eventSourceUrl,
        user_data: userData,
        custom_data: {
          currency: META_CURRENCY,
          value: Number(total.toFixed(2)),
          order_id: orderId,
          content_type: 'product',
          content_ids: items.map((item) => item.productId),
          contents: items.map((item) => ({
            id: item.productId,
            quantity: item.quantity,
            item_price: Number(item.price.toFixed(2)),
          })),
          num_items: items.reduce((sum, item) => sum + item.quantity, 0),
        },
      },
    ],
  }

  try {
    const response = await fetch(
      `https://graph.facebook.com/${META_CAPI_GRAPH_VERSION}/${META_PIXEL_ID}/events?access_token=${META_CAPI_ACCESS_TOKEN}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      },
    )

    if (!response.ok) {
      const message = await response.text().catch(() => '')
      console.error('[meta-capi] Purchase event failed:', response.status, message)
    }
  } catch (error) {
    console.error('[meta-capi] Purchase event failed:', error)
  }
}

function hashValue(value?: string) {
  const normalized = value?.trim().toLowerCase()
  if (!normalized) return undefined
  return crypto.createHash('sha256').update(normalized).digest('hex')
}

function hashPhone(value?: string) {
  const normalized = value?.replace(/[^\d+]/g, '')
  return hashValue(normalized)
}

function removeEmptyValues<T extends Record<string, unknown>>(value: T) {
  return Object.fromEntries(
    Object.entries(value).filter(([, item]) => item !== undefined && item !== ''),
  )
}
