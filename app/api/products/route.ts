import { NextRequest, NextResponse } from 'next/server'
import { getProducts } from '@/lib/products'
import { STATIC_WRITE_DISABLED_MESSAGE } from '@/lib/static-mode'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get('search')?.trim().toLocaleLowerCase()
  const categoryId = searchParams.get('categoryId')
  const brandId = searchParams.get('brandId')
  const products = await getProducts()
  const filteredProducts = products.filter((product) => {
    if (categoryId && product.category_id !== categoryId) return false
    if (brandId && product.brand_id !== brandId) return false
    if (query && !`${product.name} ${product.description ?? ''} ${product.brand?.name ?? ''}`.toLocaleLowerCase().includes(query)) return false
    return true
  })

  return NextResponse.json(filteredProducts, {
    headers: { 'Cache-Control': 'public, max-age=60, s-maxage=300, stale-while-revalidate=600' },
  })
}

export async function POST() {
  return NextResponse.json({ error: STATIC_WRITE_DISABLED_MESSAGE }, { status: 503 })
}
