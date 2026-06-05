export interface Product {
  id: string
  name: string
  category: string
  category_id?: string
  category_image_url?: string
  brand_id?: string
  brand?: Brand
  price: number
  originalPrice: number
  image: string
  image_url?: string
  product_images?: ProductImage[]
  description: string
  specs: Record<string, string>
  inStock: boolean
  stock_quantity?: number
  sku?: string
  is_active?: boolean
}

export interface ProductImage {
  id: string
  product_id: string | number
  image_url: string
  is_main: boolean
  sort_order: number
  created_at: string
}

export interface Category {
  id: string
  name: string
  slug: string
  emoji?: string
  image_url?: string
  createdAt: string
}

export interface Brand {
  id: string
  name: string
  slug: string
  logo_url?: string
}

// Supabase functions for fetching products from database
export async function getProductsFromSupabase(): Promise<Product[]> {
  try {
    if (typeof window !== 'undefined') {
      const response = await fetch('/api/products', { cache: 'no-store' })
      if (!response.ok) return []
      return response.json()
    }

    const { supabase } = await import('./supabase')
    const { data, error } = await supabase
      .from('products')
      .select('*, categories(*), brands(*), product_images(*)')

    if (error) {
      console.error('Error fetching products from Supabase:', error)
      const fallback = await supabase.from('products').select('*')
      if (fallback.error) return []
      return (fallback.data || []).map(mapProduct)
    }

    if (!data) return []

    return data.map(mapProduct)
  } catch (error) {
    console.error('Error loading Supabase client:', error)
    return []
  }
}

export async function getProductByIdFromSupabase(id: string): Promise<Product | undefined> {
  try {
    if (typeof window !== 'undefined') {
      const response = await fetch(`/api/products/${id}`, { cache: 'no-store' })
      if (!response.ok) return undefined
      return response.json()
    }

    const { supabase } = await import('./supabase')
    const { data, error } = await supabase
      .from('products')
      .select('*, categories(*), brands(*), product_images(*)')
      .eq('id', parseInt(id))
      .single()

    if (error || !data) {
      console.error('Error fetching product from Supabase:', error)
      const fallback = await supabase
        .from('products')
        .select('*')
        .eq('id', parseInt(id))
        .single()

      if (fallback.error || !fallback.data) return undefined
      return mapProduct(fallback.data)
    }

    return mapProduct(data)
  } catch (error) {
    console.error('Error loading from Supabase:', error)
    return undefined
  }
}

export function mapProduct(item: any): Product {
  const image = getMainImage(item)
  const price = toNumber(item.price)
  const originalPrice = item.original_price === null || item.original_price === undefined
    ? price
    : toNumber(item.original_price)

  return {
    id: item.id.toString(),
    name: item.name,
    category: item.categories?.name || item.category || 'Produit',
    category_id: item.category_id,
    category_image_url: item.categories?.image_url || undefined,
    brand_id: item.brand_id,
    brand: normalizeBrand(item.brands),
    price,
    originalPrice,
    image: image || '',
    image_url: image || undefined,
    product_images: item.product_images || [],
    description: item.description || '',
    specs: normalizeSpecs(item.specs),
    inStock: item.in_stock !== false,
    stock_quantity: Number(item.stock_quantity || 0),
    sku: item.sku || undefined,
    is_active: item.is_active !== false,
  }
}

function normalizeBrand(value: unknown): Brand | undefined {
  const brandValue = Array.isArray(value) ? value[0] : value
  if (!brandValue || typeof brandValue !== 'object') return undefined

  const brand = brandValue as Partial<Brand>
  if (!brand.id || !brand.name) return undefined

  return {
    id: brand.id,
    name: brand.name,
    slug: brand.slug || brand.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    logo_url: brand.logo_url ?? undefined,
  }
}

function getMainImage(item: any) {
  const images = Array.isArray(item.product_images) ? item.product_images : []
  return (
    images.find((image: ProductImage) => image.is_main)?.image_url ||
    images.sort((a: ProductImage, b: ProductImage) => a.sort_order - b.sort_order)[0]?.image_url ||
    item.image_url ||
    null
  )
}

function normalizeSpecs(specs: unknown): Record<string, string> {
  if (!specs) return {}
  if (typeof specs === 'string') {
    try {
      return JSON.parse(specs)
    } catch {
      return {}
    }
  }
  if (typeof specs === 'object') return specs as Record<string, string>
  return {}
}

function toNumber(value: unknown) {
  return typeof value === 'number' ? value : Number(value || 0)
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
      .select('id, name, slug, emoji, image_url, created_at')
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
      image_url: item.image_url || undefined,
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

/**
 * Fetch only categories that have at least one product
 */
export async function getCategoriesWithProductsFromSupabase(): Promise<Category[]> {
  try {
    const [categories, products] = await Promise.all([
      getCategoriesFromSupabase(),
      getProductsFromSupabase()
    ])

    // Get unique category IDs from products
    const categoriesWithProducts = new Set(
      products
        .filter(p => p.category_id)
        .map(p => p.category_id)
    )

    // Return only categories that have products
    return categories.filter(cat => categoriesWithProducts.has(cat.id))
  } catch (error) {
    console.error('Error fetching categories with products:', error)
    return []
  }
}
