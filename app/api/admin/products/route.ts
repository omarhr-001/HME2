import { NextRequest, NextResponse } from 'next/server'
import { requireAdminRequest, jsonError } from '@/lib/admin/auth'
import { sanitizeProduct } from '@/lib/admin/forms'
import { normalizeProductImages, syncProductImages } from '@/lib/admin/product-images'

export async function GET(req: NextRequest) {
  const auth = await requireAdminRequest(req)
  if ('response' in auth) return auth.response

  try {
    const search = req.nextUrl.searchParams.get('search')?.trim().toLowerCase()
    const { data, error } = await auth.context.supabase
      .from('products')
      .select('*, categories(*), brands(*), product_images(*)')
      .order('created_at', { ascending: false })
    if (error) throw error

    const products = search
      ? (data || []).filter((product: any) =>
          [product.name, product.sku, product.category, product.categories?.name].filter(Boolean).join(' ').toLowerCase().includes(search),
        )
      : data || []
    return NextResponse.json(products.map(normalizeProductImages))
  } catch (error) {
    return jsonError(error, 'Failed to load products')
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireAdminRequest(req)
  if ('response' in auth) return auth.response

  try {
    const body = await req.json()
    const payload = sanitizeProduct(body)
    const imageUrls = Array.isArray(body.image_urls)
      ? body.image_urls.map((url: unknown) => String(url).trim()).filter(Boolean)
      : []
    if (imageUrls.length > 0) payload.image_url = imageUrls[0]

    const { data: createdProduct, error } = await auth.context.supabase
      .from('products')
      .insert(payload)
      .select('id')
      .single()
    if (error) throw error

    await syncProductImages(auth.context.supabase, createdProduct.id, imageUrls.length > 0 ? imageUrls : payload.image_url ? [payload.image_url] : [])

    const { data, error: fetchError } = await auth.context.supabase
      .from('products')
      .select('*, categories(*), brands(*), product_images(*)')
      .eq('id', createdProduct.id)
      .single()
    if (fetchError) throw fetchError

    return NextResponse.json(normalizeProductImages(data))
  } catch (error) {
    return jsonError(error, 'Failed to create product')
  }
}
