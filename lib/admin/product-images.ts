import type { SupabaseClient } from '@supabase/supabase-js'

export type ProductImage = {
  id: string
  product_id: number
  image_url: string
  is_main: boolean
  sort_order: number
  created_at: string
}

export type ProductWithImages = {
  image_url?: string | null
  product_images?: ProductImage[] | null
}

export function getMainProductImage(product: ProductWithImages) {
  const images = product.product_images || []
  return (
    images.find((image) => image.is_main)?.image_url ||
    images.sort((a, b) => a.sort_order - b.sort_order)[0]?.image_url ||
    product.image_url ||
    null
  )
}

export function normalizeProductImages<T extends ProductWithImages>(product: T): T {
  return {
    ...product,
    image_url: getMainProductImage(product),
  }
}

export async function syncMainProductImage(
  supabase: SupabaseClient,
  productId: number | string,
  imageUrl: string | null,
) {
  await syncProductImages(supabase, productId, imageUrl ? [imageUrl] : [])
}

export async function syncProductImages(
  supabase: SupabaseClient,
  productId: number | string,
  imageUrls: string[],
) {
  const { error: deleteError } = await supabase
    .from('product_images')
    .delete()
    .eq('product_id', productId)

  if (deleteError) throw deleteError

  const cleanedUrls = [...new Set(imageUrls.map((url) => url.trim()).filter(Boolean))]
  if (cleanedUrls.length === 0) return

  const { error: insertError } = await supabase
    .from('product_images')
    .insert(cleanedUrls.map((imageUrl, index) => ({
      product_id: productId,
      image_url: imageUrl,
      is_main: index === 0,
      sort_order: index,
    })))

  if (insertError) throw insertError
}
