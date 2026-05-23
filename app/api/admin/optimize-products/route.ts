import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/server-supabase'

export async function POST(request: Request) {
  try {
    // Security check
    const authHeader = request.headers.get('authorization')
    if (!authHeader || authHeader !== `Bearer ${process.env.ADMIN_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
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

    const brandMappings: Record<string, string> = {
      Samsung: 'samsung',
      LG: 'lg',
      Whirlpool: 'whirlpool',
      Bosch: 'bosch',
      Electrolux: 'electrolux',
      'Réfrigérateur': 'samsung',
      'Machine à laver': 'bosch',
      Lave: 'bosch',
      'Micro-ondes': 'samsung',
      Four: 'bosch',
      Climatiseur: 'electrolux'
    }

    let updatedCount = 0
    const results: any[] = []

    for (const product of products || []) {
      let brandSlug: string | null = null

      for (const [keyword, slug] of Object.entries(brandMappings)) {
        if (product.name.toLowerCase().includes(keyword.toLowerCase())) {
          brandSlug = slug
          break
        }
      }

      if (!brandSlug) continue

      const brand = brands?.find(b => b.slug === brandSlug)
      if (!brand) continue

      const { error: updateError } = await supabase
        .from('products')
        .update({ brand_id: brand.id })
        .eq('id', product.id)

      if (!updateError) {
        updatedCount++
        results.push({
          productName: product.name,
          brandAssigned: brand.name
        })
      }
    }

    const { data: productsWithoutCategory } = await supabase
      .from('products')
      .select('id')
      .is('category_id', null)

    return NextResponse.json({
      success: true,
      brandsAssigned: updatedCount,
      productsWithoutCategory: productsWithoutCategory?.length || 0,
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

export async function GET() {
  try {
    const supabase = createServiceClient()

    // ✅ FIX IMPORTANT: alias propre (évite arrays confus)
    const { data: products } = await supabase
      .from('products')
      .select(`
        id,
        name,
        category_id,
        brand_id,
        category:categories!products_category_id_fkey(name),
        brand:brands!products_brand_id_fkey(name, slug)
      `)

    const stats = {
      totalProducts: products?.length || 0,
      productsWithCategory: products?.filter(p => p.category_id).length || 0,
      productsWithBrand: products?.filter(p => p.brand_id).length || 0,
      productsWithoutCategory: products?.filter(p => !p.category_id).length || 0,
      productsWithoutBrand: products?.filter(p => !p.brand_id).length || 0,

      sampleProducts: products?.slice(0, 10).map(p => ({
        name: p.name,
        category: p.category?.name || 'Non catégorisé',
        brand: p.brand?.name || 'Pas de marque'
      }))
    }

    return NextResponse.json({
      success: true,
      statistics: stats,
      details: products?.slice(0, 20)
    })
  } catch (error) {
    console.error('[v0] Error:', error)
    return NextResponse.json(
      { error: 'Failed to get statistics' },
      { status: 500 }
    )
  }
}