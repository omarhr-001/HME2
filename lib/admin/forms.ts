export function sanitizeProduct(body: any) {
  return {
    name: body.name,
    description: body.description || null,
    price: Number(body.price || 0),
    original_price: body.original_price ? Number(body.original_price) : null,
    stock_quantity: Number(body.stock_quantity || 0),
    category_id: body.category_id || null,
    image_url: body.image_url || null,
    is_active: Boolean(body.is_active),
    in_stock: Boolean(body.in_stock),
    sku: body.sku || null,
  }
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}
