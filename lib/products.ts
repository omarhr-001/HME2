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
