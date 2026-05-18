import { NextRequest, NextResponse } from 'next/server'
import { requireAdminRequest, jsonError } from '@/lib/admin/auth'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAdminRequest(req)
  if ('response' in auth) return auth.response

  try {
    const body = await req.json()
    const payload: Record<string, string> = { updated_at: new Date().toISOString() }

    if (body.status) payload.status = body.status
    if (body.payment_status) payload.payment_status = body.payment_status

    const { data, error } = await auth.context.supabase
      .from('orders')
      .update(payload)
      .eq('id', params.id)
      .select('*, profiles(*), order_items(*, products(id, name, image_url))')
      .single()

    if (error) throw error
    return NextResponse.json(data)
  } catch (error) {
    return jsonError(error, 'Failed to update order')
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAdminRequest(req)
  if ('response' in auth) return auth.response

  try {
    const { error: itemsError } = await auth.context.supabase.from('order_items').delete().eq('order_id', params.id)
    if (itemsError) throw itemsError

    const { error } = await auth.context.supabase.from('orders').delete().eq('id', params.id)
    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    return jsonError(error, 'Failed to delete order')
  }
}
