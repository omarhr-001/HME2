import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { DEMO_PRODUCTS } from '@/lib/demo-products'

export const dynamic = 'force-dynamic'

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    throw new Error('Missing Supabase credentials')
  }

  return createClient(url, key)
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient()

    // Transform demo products to Supabase format
    const productsToInsert = DEMO_PRODUCTS.map(product => ({
      name: product.name,
      category: product.category,
      price: product.price,
      original_price: product.originalPrice,
      image_url: product.image,
      rating: product.rating,
      reviews_count: product.reviews,
      description: product.description,
      in_stock: product.inStock,
      specs: {},
      created_at: new Date().toISOString(),
    }))

    // Check if products already exist
    const { data: existingProducts } = await supabase
      .from('products')
      .select('count', { count: 'exact' })

    if (existingProducts && existingProducts.length > 0) {
      return NextResponse.json({
        message: 'Products already exist in database',
        count: existingProducts.length,
      })
    }

    // Insert products
    const { data, error } = await supabase
      .from('products')
      .insert(productsToInsert)
      .select()

    if (error) {
      console.error('[v0] Seed error:', error)
      return NextResponse.json(
        { error: 'Failed to seed products', details: error.message },
        { status: 500 }
      )
    }

    console.log('[v0] Successfully seeded', data?.length, 'products')

    return NextResponse.json({
      success: true,
      message: `Successfully seeded ${data?.length || 0} products`,
      productsCount: data?.length || 0,
    })
  } catch (error: any) {
    console.error('[v0] Seed API error:', error)
    return NextResponse.json(
      {
        error: 'Seed API error',
        message: error.message,
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient()

    // Get product count
    const { count } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })

    return NextResponse.json({
      message: 'Product count',
      count: count || 0,
      demoProductsAvailable: DEMO_PRODUCTS.length,
    })
  } catch (error: any) {
    return NextResponse.json({
      message: 'Supabase not configured. Demo products available.',
      demoProductsCount: DEMO_PRODUCTS.length,
    })
  }
}
