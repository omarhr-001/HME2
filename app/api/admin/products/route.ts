import { NextRequest, NextResponse } from 'next/server'
import { requireAdminRequest, jsonError } from '@/lib/admin/auth'
import { sanitizeProduct } from '@/lib/admin/forms'
import { normalizeProductImages, syncMainProductImage } from '@/lib/admin/product-images'

export async function GET(req: NextRequest) {
  const auth = await requireAdminRequest(req)
  if ('response' in auth) return auth.response

  try {
    const search = req.nextUrl.searchParams.get('search')?.trim().toLowerCase()
    const { data, error } = await auth.context.supabase
      .from('products')
      .select('*, categories(*), product_images(*)')
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
    const { data: createdProduct, error } = await auth.context.supabase
      .from('products')
      .insert(payload)
      .select('id')
      .single()
    if (error) throw error

    await syncMainProductImage(auth.context.supabase, createdProduct.id, payload.image_url)

    const { data, error: fetchError } = await auth.context.supabase
      .from('products')
      .select('*, categories(*), product_images(*)')
      .eq('id', createdProduct.id)
      .single()
    if (fetchError) throw fetchError

    return NextResponse.json(normalizeProductImages(data))
  } catch (error) {
    return jsonError(error, 'Failed to create product')
  }
}
