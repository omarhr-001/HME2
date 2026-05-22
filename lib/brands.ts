'use server'

import { createServiceClient } from './server-supabase'
import type { Brand, CategoryBrand } from './types'

/**
 * Get all brands from Supabase
 */
export async function getBrandsFromSupabase(): Promise<Brand[]> {
  try {
    const supabase = createServiceClient()
    
    const { data, error } = await supabase
      .from('brands')
      .select('*')
      .order('name', { ascending: true })

    if (error) {
      console.error('[v0] Error fetching brands:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('[v0] Error fetching brands:', error)
    return []
  }
}

/**
 * Get brands for a specific category
 */
export async function getBrandsByCategoryFromSupabase(categoryId: string): Promise<Brand[]> {
  try {
    const supabase = createServiceClient()
    
    const { data, error } = await supabase
      .from('category_brands')
      .select('brand_id, brands(*)')
      .eq('category_id', categoryId)

    if (error) {
      console.error('[v0] Error fetching category brands:', error)
      return []
    }

    return data?.map((cb: any) => cb.brands).filter(Boolean) || []
  } catch (error) {
    console.error('[v0] Error fetching category brands:', error)
    return []
  }
}

/**
 * Get products by brand
 */
export async function getProductsByBrandFromSupabase(brandId: string, limit = 50) {
  try {
    const supabase = createServiceClient()
    
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('brand_id', brandId)
      .eq('is_active', true)
      .limit(limit)

    if (error) {
      console.error('[v0] Error fetching products by brand:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('[v0] Error fetching products by brand:', error)
    return []
  }
}

/**
 * Add brand to category relationship
 */
export async function addBrandToCategory(categoryId: string, brandId: string): Promise<boolean> {
  try {
    const supabase = createServiceClient()
    
    const { error } = await supabase
      .from('category_brands')
      .insert({ category_id: categoryId, brand_id: brandId })

    if (error && error.code !== '23505') { // 23505 is unique constraint
      console.error('[v0] Error adding brand to category:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('[v0] Error adding brand to category:', error)
    return false
  }
}

/**
 * Create a new brand
 */
export async function createBrand(name: string, slug: string, description?: string, logo_url?: string): Promise<Brand | null> {
  try {
    const supabase = createServiceClient()
    
    const { data, error } = await supabase
      .from('brands')
      .insert({
        name,
        slug,
        description,
        logo_url,
      })
      .select()
      .single()

    if (error) {
      console.error('[v0] Error creating brand:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('[v0] Error creating brand:', error)
    return null
  }
}
