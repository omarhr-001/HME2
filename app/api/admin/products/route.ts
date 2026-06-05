import { NextRequest, NextResponse } from 'next/server'
import { requireAdminRequest, jsonError } from '@/lib/admin/auth'
import { sanitizeProduct } from '@/lib/admin/forms'
import { normalizeProductImages, syncProductImages } from '@/lib/admin/product-images'
import { makeSkuBase } from '@/lib/utils'

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
    const generateFlag = body.generate_sku === undefined ? true : !!body.generate_sku

    // If admin requested manual SKU and none provided, return error
    if (!generateFlag && (!payload.sku || String(payload.sku).trim() === '')) {
      return jsonError(new Error('SKU is required when manual SKU generation is selected'), 'SKU is required')
    }

    // Generate SKU if not provided and generation allowed
    if (generateFlag && !payload.sku) {
      try {
        let categoryLabel = payload.category || null
        if (!categoryLabel && payload.category_id) {
          const { data: catData } = await auth.context.supabase
            .from('categories')
            .select('slug,name')
            .eq('id', payload.category_id)
            .single()
          if (catData) categoryLabel = catData.slug || catData.name
        }

        const base = makeSkuBase(categoryLabel, payload.name)

        // find unique suffix
        for (let i = 1; i < 1000; i++) {
          const suffix = String(i).padStart(2, '0')
          const candidate = `${base}-${suffix}`
          const { data: existing, error: checkError } = await auth.context.supabase
            .from('products')
            .select('id')
            .eq('sku', candidate)
            .limit(1)

          if (checkError) continue
          if (!existing || (Array.isArray(existing) && existing.length === 0)) {
            payload.sku = candidate
            break
          }
        }
        // If loop ended without setting sku, set a fallback
        if (!payload.sku) payload.sku = `${base}-00`
      } catch (err) {
        // ignore SKU generation errors and continue
        console.error('SKU generation failed', err)
      }
    }
    // Validate SKU uniqueness when provided
    if (payload.sku) {
      const { data: existing, error: checkError } = await auth.context.supabase
        .from('products')
        .select('id')
        .eq('sku', payload.sku)
        .limit(1)

      if (checkError) throw checkError
      if (existing && Array.isArray(existing) && existing.length > 0) {
        return jsonError(new Error('SKU already exists'), 'SKU already exists')
      }
    }

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
