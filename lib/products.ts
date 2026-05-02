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

export interface Category {
  id: string
  name: string
  slug: string
  emoji?: string
  createdAt: string
}

// Supabase functions for fetching products from database
export async function getProductsFromSupabase(): Promise<Product[]> {
  try {
    const { supabase } = await import('./supabase')
    const { data, error } = await supabase
      .from('products')
      .select('*')

    if (error) {
      console.error('Error fetching products from Supabase:', error)
      return []
    }

    if (!data) return []

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
    console.error('Error loading Supabase client:', error)
    return []
  }
}

export async function getProductByIdFromSupabase(id: string): Promise<Product | undefined> {
  try {
    const { supabase } = await import('./supabase')
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', parseInt(id))
      .single()

    if (error || !data) {
      console.error('Error fetching product from Supabase:', error)
      return undefined
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
    console.error('Error loading from Supabase:', error)
    return undefined
  }
}

/**
 * Fetch all categories from the categories table
 * Includes emoji and slug for better UI presentation
 */
export async function getCategoriesFromSupabase(): Promise<Category[]> {
  try {
    const { supabase } = await import('./supabase')
    const { data, error } = await supabase
      .from('categories')
      .select('id, name, slug, emoji, created_at')
      .order('name', { ascending: true })

    if (error) {
      console.error('Error fetching categories from Supabase:', error)
      return []
    }

    if (!data) return []

    // Transform Supabase data to match Category interface
    return data.map((item: any) => ({
      id: item.id,
      name: item.name,
      slug: item.slug,
      emoji: item.emoji,
      createdAt: item.created_at
    }))
  } catch (error) {
    console.error('Error loading categories from Supabase:', error)
    return []
  }
}

/**
 * Get categories as simple string array (for backward compatibility)
 */
export async function getCategoryNamesFromSupabase(): Promise<string[]> {
  try {
    const categories = await getCategoriesFromSupabase()
    return categories.map(cat => cat.name)
  } catch (error) {
    console.error('Error getting category names:', error)
    return []
  }
}
