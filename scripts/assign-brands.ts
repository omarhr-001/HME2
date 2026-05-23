import { createServiceClient } from '@/lib/server-supabase'

const productBrandMapping = {
  // Électroménager products
  'Samsung Réfrigérateur': 'samsung',
  'Samsung Lave-linge': 'samsung',
  'LG Réfrigérateur': 'lg',
  'LG Lave-linge': 'lg',
  'Whirlpool Réfrigérateur': 'whirlpool',
  'Bosch Lave-linge': 'bosch',
  'Electrolux Climatiseur': 'electrolux'
}

async function assignBrandsToProducts() {
  try {
    const supabase = createServiceClient()

    console.log('[v0] Starting brand assignment process...')

    // Get all products
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, name, category_id')

    if (productsError) throw productsError

    console.log(`[v0] Found ${products?.length || 0} products to process`)

    // Get brands and categories
    const { data: brands, error: brandsError } = await supabase
      .from('brands')
      .select('id, slug, name')

    if (brandsError) throw brandsError

    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('id, name')

    if (categoriesError) throw categoriesError

    console.log(`[v0] Found ${brands?.length || 0} brands and ${categories?.length || 0} categories`)

    let updatedCount = 0
    let skippedCount = 0

    // Process each product
    for (const product of products || []) {
      // Find matching brand by product name
      let brandSlug = null
      for (const [productName, slug] of Object.entries(productBrandMapping)) {
        if (product.name.includes(productName.split(' ')[0])) {
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

          if (updateError) {
            console.error(`[v0] Error updating product ${product.id}:`, updateError)
            skippedCount++
          } else {
            console.log(`[v0] Updated product "${product.name}" with brand "${brand.name}"`)
            updatedCount++
          }
        }
      } else {
        skippedCount++
      }
    }

    // Verify categories
    console.log('\n[v0] Verifying category assignments...')
    const { data: productsWithCategory, error: verifyError } = await supabase
      .from('products')
      .select('id, name, category_id, categories(name)')
      .is('category_id', null)

    if (verifyError) {
      console.error('[v0] Error verifying categories:', verifyError)
    } else {
      const unassignedCount = productsWithCategory?.length || 0
      if (unassignedCount > 0) {
        console.warn(`[v0] Found ${unassignedCount} products without categories:`)
        productsWithCategory?.forEach(p => console.log(`  - ${p.name} (ID: ${p.id})`))
      } else {
        console.log('[v0] All products are properly categorized!')
      }
    }

    console.log(`\n[v0] Brand assignment complete!`)
    console.log(`[v0] Updated: ${updatedCount}, Skipped: ${skippedCount}`)

    return {
      success: true,
      updated: updatedCount,
      skipped: skippedCount,
      unassigned: productsWithCategory?.length || 0
    }
  } catch (error) {
    console.error('[v0] Error in assignBrandsToProducts:', error)
    throw error
  }
}

// Run the script
assignBrandsToProducts()
  .then(result => {
    console.log('[v0] Final result:', result)
    process.exit(0)
  })
  .catch(error => {
    console.error('[v0] Script failed:', error)
    process.exit(1)
  })
