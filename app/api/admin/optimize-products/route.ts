import { NextResponse } from 'next/server'
import { getCategories, getProducts } from '@/lib/products'
import { STATIC_WRITE_DISABLED_MESSAGE } from '@/lib/static-mode'

export async function GET() {
  const [products, categories] = await Promise.all([getProducts(), getCategories()])
  const productsByCategory = categories.map((category) => ({
    id: category.id,
    name: category.name,
    count: products.filter((product) => product.category_id === category.id).length,
  }))

  return NextResponse.json({
    success: true,
    readOnly: true,
    statistics: {
      totalProducts: products.length,
      productsWithCategory: products.filter((product) => product.category_id).length,
      productsWithBrand: products.filter((product) => product.brand_id).length,
      productsWithoutCategory: products.filter((product) => !product.category_id).length,
      productsWithoutBrand: products.filter((product) => !product.brand_id).length,
      categoryStatistics: productsByCategory,
    },
  })
}

export async function POST() {
  return NextResponse.json({ error: STATIC_WRITE_DISABLED_MESSAGE }, { status: 503 })
}
