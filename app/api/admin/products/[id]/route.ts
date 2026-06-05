import { NextRequest, NextResponse } from 'next/server'
import { requireAdminRequest, jsonError } from '@/lib/admin/auth'
import { sanitizeProduct } from '@/lib/admin/forms'
import { normalizeProductImages, syncProductImages } from '@/lib/admin/product-images'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminRequest(req)
  if ('response' in auth) return auth.response

  try {
    const { id } = await params
    const body = await req.json()
    const payload = sanitizeProduct(body)
    const imageUrls = Array.isArray(body.image_urls)
      ? body.image_urls.map((url: unknown) => String(url).trim()).filter(Boolean)
      : []
    if (imageUrls.length > 0) payload.image_url = imageUrls[0]

    // Validate SKU uniqueness if provided and changed
    if (payload.sku) {
      const { data: currentData, error: curErr } = await auth.context.supabase
        .from('products')
        .select('sku')
        .eq('id', id)
        .single()
      if (curErr) throw curErr

      const currentSku = currentData?.sku
      if (currentSku !== payload.sku) {
        const { data: existing, error: checkError } = await auth.context.supabase
          .from('products')
          .select('id')
          .eq('sku', payload.sku)
          .neq('id', id)
          .limit(1)
        if (checkError) throw checkError
        if (existing && Array.isArray(existing) && existing.length > 0) {
          return jsonError(new Error('SKU already exists'), 'SKU already exists')
        }
      }
    }

    const { error } = await auth.context.supabase
      .from('products')
      .update({ ...payload, updated_at: new Date().toISOString() })
      .eq('id', id)
    if (error) throw error

    await syncProductImages(auth.context.supabase, id, imageUrls.length > 0 ? imageUrls : payload.image_url ? [payload.image_url] : [])

    const { data, error: fetchError } = await auth.context.supabase
      .from('products')
      .select('*, categories(*), brands(*), product_images(*)')
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
