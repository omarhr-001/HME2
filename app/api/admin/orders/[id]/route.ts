import { NextRequest, NextResponse } from 'next/server'
import { requireAdminRequest, jsonError } from '@/lib/admin/auth'

const VALID_ORDER_STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'] as const
const VALID_PAYMENT_STATUSES = ['pending', 'paid', 'failed', 'refunded'] as const

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminRequest(req)
  if ('response' in auth) return auth.response

  try {
    const { id } = await params
    const body = await req.json()
    const payload: Record<string, string> = { updated_at: new Date().toISOString() }

    if (body.status) {
      if (!VALID_ORDER_STATUSES.includes(body.status)) {
        return NextResponse.json({ error: 'Invalid order status' }, { status: 400 })
      }
      payload.status = body.status
    }

    if (body.payment_status) {
      if (!VALID_PAYMENT_STATUSES.includes(body.payment_status)) {
        return NextResponse.json({ error: 'Invalid payment status' }, { status: 400 })
      }
      payload.payment_status = body.payment_status
    }

    if (!payload.status && !payload.payment_status) {
      return NextResponse.json({ error: 'No valid order fields to update' }, { status: 400 })
    }

    const { data, error } = await auth.context.supabase
      .from('orders')
      .update(payload)
      .eq('id', id)
      .select('*, order_items(*, products(id, name, image_url))')
      .single()

    if (error) throw error
    return NextResponse.json(data)
  } catch (error) {
    return jsonError(error, 'Failed to update order')
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminRequest(req)
  if ('response' in auth) return auth.response

  try {
    const { id } = await params
    const { error: itemsError } = await auth.context.supabase.from('order_items').delete().eq('order_id', id)
    if (itemsError) throw itemsError

    const { error } = await auth.context.supabase.from('orders').delete().eq('id', id)
    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    return jsonError(error, 'Failed to delete order')
  }
}
