import { NextRequest, NextResponse } from 'next/server'
import { requireAdminRequest, jsonError } from '@/lib/admin/auth'
import { sanitizeProduct } from '@/lib/admin/forms'
import { normalizeProductImages, syncMainProductImage } from '@/lib/admin/product-images'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminRequest(req)
  if ('response' in auth) return auth.response

  try {
    const { id } = await params
    const body = await req.json()
    const payload = sanitizeProduct(body)
    const { error } = await auth.context.supabase
      .from('products')
      .update({ ...payload, updated_at: new Date().toISOString() })
      .eq('id', id)
    if (error) throw error

    await syncMainProductImage(auth.context.supabase, id, payload.image_url)

    const { data, error: fetchError } = await auth.context.supabase
      .from('products')
      .select('*, categories(*), product_images(*)')
      .eq('id', id)
      .single()
    if (fetchError) throw fetchError

    return NextResponse.json(normalizeProductImages(data))
  } catch (error) {
    return jsonError(error, 'Failed to update product')
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminRequest(req)
  if ('response' in auth) return auth.response

  try {
    const { id } = await params
    const { error: imageError } = await auth.context.supabase.from('product_images').delete().eq('product_id', id)
    if (imageError) throw imageError

    const { error } = await auth.context.supabase.from('products').delete().eq('id', id)
    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (error) {
    return jsonError(error, 'Failed to delete product')
  }
}
