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
  const { error: deleteError } = await supabase
    .from('product_images')
    .delete()
    .eq('product_id', productId)
    .eq('is_main', true)

  if (deleteError) throw deleteError

  if (!imageUrl) return

  const { error: insertError } = await supabase
    .from('product_images')
    .insert({
      product_id: productId,
      image_url: imageUrl,
      is_main: true,
      sort_order: 0,
    })

  if (insertError) throw insertError
}
