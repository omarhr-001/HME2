import { NextRequest, NextResponse } from 'next/server'
import { getProducts } from '@/lib/products'

export async function GET(request: NextRequest) {
  const sku = request.nextUrl.searchParams.get('sku')?.trim().toLocaleLowerCase()
  const excludeId = request.nextUrl.searchParams.get('excludeId')

  if (!sku) {
    return NextResponse.json({ available: false }, { status: 400 })
  }

  const products = await getProducts()
  const available = !products.some((product) =>
    product.id !== excludeId && product.sku.trim().toLocaleLowerCase() === sku,
  )

  return NextResponse.json({ available, readOnly: true })
}
