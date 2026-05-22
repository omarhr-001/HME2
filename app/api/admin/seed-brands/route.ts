import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/server-supabase'

// Brand data organized by category
const brandsData = {
  'Électroménager': [
    { name: 'Samsung', slug: 'samsung', description: 'Électroménagers de haute technologie' },
    { name: 'LG', slug: 'lg', description: 'Appareils innovants et efficaces' },
    { name: 'Whirlpool', slug: 'whirlpool', description: 'Qualité et durabilité' },
    { name: 'Bosch', slug: 'bosch', description: 'Technologie allemande premium' },
    { name: 'Electrolux', slug: 'electrolux', description: 'Innovation suédoise' }
  ]
}

export async function POST(request: Request) {
  try {
    // Security check - in production, verify admin token
    const authHeader = request.headers.get('authorization')
    if (!authHeader || authHeader !== `Bearer ${process.env.ADMIN_SECRET}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const supabase = createServiceClient()

    let totalBrandsCreated = 0
    let totalAssociationsCreated = 0

    // Process each category and its brands
    for (const [categoryName, brands] of Object.entries(brandsData)) {
      // Get category ID
      const { data: categoryData, error: categoryError } = await supabase
        .from('categories')
        .select('id')
        .eq('name', categoryName)
        .single()

      if (categoryError || !categoryData) {
        console.error(`[v0] Category not found: ${categoryName}`)
        continue
      }

      const categoryId = categoryData.id

      // Insert brands
      for (const brand of brands) {
        const { data: brandData, error: brandError } = await supabase
          .from('brands')
          .upsert(
            { ...brand, slug: brand.slug.toLowerCase() },
            { onConflict: 'slug' }
          )
          .select()
          .single()

        if (brandError) {
          console.error(`[v0] Error inserting brand ${brand.name}:`, brandError)
          continue
        }

        if (brandData) {
          totalBrandsCreated++

          // Create association
          const { data: assocData, error: assocError } = await supabase
            .from('category_brands')
            .upsert({
              category_id: categoryId,
              brand_id: brandData.id
            }, { onConflict: 'category_id,brand_id' })
            .select()
            .single()

          if (assocError) {
            console.error(`[v0] Error creating association for ${brand.name}:`, assocError)
          } else if (assocData) {
            totalAssociationsCreated++
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Brands and associations seeded successfully',
      brands_created: totalBrandsCreated,
      associations_created: totalAssociationsCreated
    })
  } catch (error) {
    console.error('[v0] Seed error:', error)
    return NextResponse.json(
      { error: 'Failed to seed brands' },
      { status: 500 }
    )
  }
}
