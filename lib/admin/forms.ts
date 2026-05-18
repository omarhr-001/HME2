import { z } from 'zod'

const productSchema = z.object({
  name: z.string().trim().min(1, 'Product name is required'),
  description: z.string().trim().optional().nullable(),
  category: z.string().trim().optional().nullable(),
  price: z.coerce.number().min(0, 'Price cannot be negative'),
  original_price: z.coerce.number().min(0).optional().nullable(),
  cost: z.coerce.number().min(0).optional().nullable(),
  stock_quantity: z.coerce.number().int().min(0, 'Stock cannot be negative').default(0),
  category_id: z.string().trim().uuid().optional().nullable().or(z.literal('')),
  image_url: z.string().trim().optional().nullable(),
  is_active: z.boolean().default(true),
  in_stock: z.boolean().default(true),
  sku: z.string().trim().optional().nullable(),
})

const categorySchema = z.object({
  name: z.string().trim().min(1, 'Category name is required'),
  slug: z.string().trim().optional(),
  emoji: z.string().trim().max(12).optional().nullable(),
})

export const customerRoleSchema = z.object({
  role: z.enum(['admin', 'client']),
})

export function sanitizeProduct(body: any) {
  const product = productSchema.parse(body)

  return {
    name: product.name,
    description: product.description || null,
    category: product.category || null,
    price: product.price,
    original_price: product.original_price ?? null,
    cost: product.cost ?? null,
    stock_quantity: product.stock_quantity,
    category_id: product.category_id || null,
    image_url: product.image_url || null,
    is_active: product.is_active,
    in_stock: product.in_stock && product.stock_quantity > 0,
    sku: product.sku || null,
  }
}

export function sanitizeCategory(body: any) {
  const category = categorySchema.parse(body)

  return {
    name: category.name,
    slug: category.slug || slugify(category.name),
    emoji: category.emoji || null,
  }
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}
