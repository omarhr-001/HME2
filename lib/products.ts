import { DEMO_PRODUCTS } from './demo-products'

export interface Product {
  id: string
  name: string
  category: string
  price: number
  originalPrice: number
  image: string
  rating: number
  reviews: number
  description: string
  specs: Record<string, string>
  inStock: boolean
}

// Supabase functions for fetching products from database
export async function getProductsFromSupabase(): Promise<Product[]> {
  try {
    const { supabase } = await import('./supabase')
    
    // If Supabase is not configured, use demo products
    if (!supabase) {
      console.log('[v0] Supabase not configured, using demo products')
      return DEMO_PRODUCTS as Product[]
    }
    
    const { data, error } = await supabase
      .from('products')
      .select('*')

    if (error) {
      console.error('Error fetching products from Supabase:', error)
      console.log('[v0] Falling back to demo products')
      return DEMO_PRODUCTS as Product[]
    }

    if (!data || data.length === 0) {
      console.log('[v0] No products in Supabase, using demo products')
      return DEMO_PRODUCTS as Product[]
    }

    // Transform Supabase data to match Product interface
    return data.map((item: any) => ({
      id: item.id.toString(),
      name: item.name,
      category: item.category,
      price: item.price,
      originalPrice: item.original_price || item.price,
      image: item.image_url || '',
      rating: item.rating || 0,
      reviews: item.reviews_count || 0,
      description: item.description || '',
      specs: item.specs ? JSON.parse(typeof item.specs === 'string' ? item.specs : JSON.stringify(item.specs)) : {},
      inStock: item.in_stock !== false
    }))
  } catch (error) {
    console.error('Error loading products:', error)
    console.log('[v0] Using demo products due to error')
    return DEMO_PRODUCTS as Product[]
  }
}

export async function getProductByIdFromSupabase(id: string): Promise<Product | undefined> {
  try {
    const { supabase } = await import('./supabase')
    
    if (!supabase) {
      return DEMO_PRODUCTS.find(p => p.id === id) as Product | undefined
    }
    
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', parseInt(id))
      .single()

    if (error || !data) {
      // Fall back to demo product
      return DEMO_PRODUCTS.find(p => p.id === id) as Product | undefined
    }

    // Transform Supabase data to match Product interface
    return {
      id: data.id.toString(),
      name: data.name,
      category: data.category,
      price: data.price,
      originalPrice: data.original_price || data.price,
      image: data.image_url || '',
      rating: data.rating || 0,
      reviews: data.reviews_count || 0,
      description: data.description || '',
      specs: data.specs ? JSON.parse(typeof data.specs === 'string' ? data.specs : JSON.stringify(data.specs)) : {},
      inStock: data.in_stock !== false
    }
  } catch (error) {
    console.error('Error loading product from Supabase:', error)
    return DEMO_PRODUCTS.find(p => p.id === id) as Product | undefined
  }
}
