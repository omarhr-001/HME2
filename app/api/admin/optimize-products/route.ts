import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/server-supabase'

export async function POST(request: Request) {
  try {
    // Security check
    const authHeader = request.headers.get('authorization')
    if (!authHeader || authHeader !== `Bearer ${process.env.ADMIN_SECRET}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const supabase = createServiceClient()

    console.log('[v0] Starting product and brand assignment...')

    // Get all products
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, name, category_id')

    if (productsError) throw productsError

    // Get brands
    const { data: brands, error: brandsError } = await supabase
      .from('brands')
      .select('id, slug, name')

    if (brandsError) throw brandsError

    // Product to brand mapping - more intelligent matching
    const brandMappings: Record<string, string> = {
      'Samsung': 'samsung',
      'LG': 'lg',
      'Whirlpool': 'whirlpool',
      'Bosch': 'bosch',
      'Electrolux': 'electrolux',
      'Réfrigérateur': 'samsung', // Default for fridges
      'Machine à laver': 'bosch',
      'Lave': 'bosch',
      'Micro-ondes': 'samsung',
      'Four': 'bosch',
      'Climatiseur': 'electrolux'
    }

    let updatedCount = 0
    let categoryCorrectionCount = 0
    const results: any[] = []

    // Process each product
    for (const product of products || []) {
      let brandSlug = null

      // Find matching brand from product name
      for (const [productKeyword, slug] of Object.entries(brandMappings)) {
        if (product.name.toUpperCase().includes(productKeyword.toUpperCase())) {
          brandSlug = slug
          break
        }
      }

      if (brandSlug) {
        const brand = brands?.find(b => b.slug === brandSlug)
        if (brand) {
          const { error: updateError } = await supabase
            .from('products')
            .update({ brand_id: brand.id })
            .eq('id', product.id)

          if (!updateError) {
            updatedCount++
            results.push({
              productName: product.name,
              brandAssigned: brand.name,
              brandId: brand.id
            })
          }
        }
      }
    }

    // Verify category assignments
    const { data: productsWithoutCategory, error: verifyError } = await supabase
      .from('products')
      .select('id, name')
      .is('category_id', null)

    const unassignedCategories = productsWithoutCategory?.length || 0

    // Get products by category for statistics
    const { data: categoryStats } = await supabase
      .from('categories')
      .select(`
        id,
        name,
        products:products(count)
      `)

    return NextResponse.json({
      success: true,
      message: 'Product optimization completed',
      brandsAssigned: updatedCount,
      productsWithoutCategory: unassignedCategories,
      categoryStatistics: categoryStats,
      samplesAssigned: results.slice(0, 5)
    })
  } catch (error) {
    console.error('[v0] Error:', error)
    return NextResponse.json(
      { error: 'Failed to optimize products' },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const supabase = createServiceClient()

    // Get product statistics
    const { data: products } = await supabase
      .from('products')
      .select(`
        id,
        name,
        category_id,
        brand_id,
        categories(id, name),
        brands(id, name, slug)
      `)

    const productsData = (products ?? []) as Array<{
      id: string
      name: string
      category_id: string | null
      brand_id: string | null
      categories?: { name: string } | { name: string }[] | null
      brands?: { name: string } | { name: string }[] | null
    }>

    // Analyze categorization
    const stats = {
      totalProducts: productsData.length,
      productsWithCategory: productsData.filter(p => p.category_id).length,
      productsWithBrand: productsData.filter(p => p.brand_id).length,
      productsWithBoth: productsData.filter(p => p.category_id && p.brand_id).length,
      productsWithoutCategory: productsData.filter(p => !p.category_id).length,
      productsWithoutBrand: productsData.filter(p => !p.brand_id).length,
      sampleProducts: productsData.slice(0, 10).map(p => ({
        name: p.name,
        category: Array.isArray(p.categories) ? p.categories[0]?.name || 'Non catégorisé' : p.categories?.name || 'Non catégorisé',
        brand: Array.isArray(p.brands) ? p.brands[0]?.name || 'Pas de marque' : p.brands?.name || 'Pas de marque'
      }))
    }

    return NextResponse.json({
      success: true,
      statistics: stats,
      details: productsData.slice(0, 20)
    })
  } catch (error) {
    console.error('[v0] Error:', error)
    return NextResponse.json(
      { error: 'Failed to get statistics' },
      { status: 500 }
    )
  }
}
