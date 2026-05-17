import { NextRequest, NextResponse } from 'next/server'
import { requireAdminRequest, jsonError } from '@/lib/admin/auth'
import { sanitizeProduct } from '@/lib/admin/forms'

export async function GET(req: NextRequest) {
  const auth = await requireAdminRequest(req)
  if ('response' in auth) return auth.response

  try {
    const search = req.nextUrl.searchParams.get('search')?.trim().toLowerCase()
    const { data, error } = await auth.context.supabase
      .from('products')
      .select('*, categories(*)')
      .order('created_at', { ascending: false })
    if (error) throw error

    const products = search
      ? (data || []).filter((product: any) =>
          [product.name, product.sku, product.category, product.categories?.name].filter(Boolean).join(' ').toLowerCase().includes(search),
        )
      : data || []
    return NextResponse.json(products)
  } catch (error) {
    return jsonError(error, 'Failed to load products')
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireAdminRequest(req)
  if ('response' in auth) return auth.response

  try {
    const body = await req.json()
    const { data, error } = await auth.context.supabase
      .from('products')
      .insert(sanitizeProduct(body))
      .select('*, categories(*)')
      .single()
    if (error) throw error
    return NextResponse.json(data)
  } catch (error) {
    return jsonError(error, 'Failed to create product')
  }
}
