import { NextRequest, NextResponse } from 'next/server'
import * as XLSX from 'xlsx'
import { requireAdminRequest, jsonError } from '@/lib/admin/auth'
import { sanitizeProduct, slugify } from '@/lib/admin/forms'

type ImportRow = Record<string, unknown>

const headerAliases: Record<string, string> = {
  product: 'name',
  product_name: 'name',
  nom: 'name',
  nom_produit: 'name',
  titre: 'name',
  description: 'description',
  prix: 'price',
  price: 'price',
  original_price: 'original_price',
  old_price: 'original_price',
  prix_original: 'original_price',
  cost: 'cost',
  cout: 'cost',
  stock: 'stock_quantity',
  quantity: 'stock_quantity',
  stock_quantity: 'stock_quantity',
  quantite: 'stock_quantity',
  category: 'category',
  categorie: 'category',
  category_name: 'category',
  category_id: 'category_id',
  image: 'image_url',
  image_url: 'image_url',
  photo: 'image_url',
  sku: 'sku',
  reference: 'sku',
  active: 'is_active',
  is_active: 'is_active',
  in_stock: 'in_stock',
}

export async function POST(req: NextRequest) {
  const auth = await requireAdminRequest(req)
  if ('response' in auth) return auth.response

  try {
    const formData = await req.formData()
    const file = formData.get('file')

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const workbook = XLSX.read(buffer, { type: 'buffer' })
    const firstSheetName = workbook.SheetNames[0]
    if (!firstSheetName) {
      return NextResponse.json({ error: 'The file does not contain a sheet' }, { status: 400 })
    }

    const sheet = workbook.Sheets[firstSheetName]
    const rawRows = XLSX.utils.sheet_to_json<ImportRow>(sheet, { defval: '' })

    if (!rawRows.length) {
      return NextResponse.json({ error: 'The file is empty' }, { status: 400 })
    }

    const { data: existingCategories, error: categoryError } = await auth.context.supabase
      .from('categories')
      .select('*')

    if (categoryError) throw categoryError

    const categoryMap = new Map<string, string>()
    for (const category of existingCategories || []) {
      categoryMap.set(String(category.name).toLowerCase(), category.id)
      categoryMap.set(String(category.slug).toLowerCase(), category.id)
    }

    const products = []
    const errors: Array<{ row: number; error: string }> = []

    for (const [index, rawRow] of rawRows.entries()) {
      const row = normalizeRow(rawRow)
      const rowNumber = index + 2

      if (!row.name) {
        errors.push({ row: rowNumber, error: 'Missing product name' })
        continue
      }

      if (!row.price || Number.isNaN(Number(row.price))) {
        errors.push({ row: rowNumber, error: 'Missing or invalid price' })
        continue
      }

      if (!row.category_id && row.category) {
        const categoryName = String(row.category).trim()
        const categoryKey = categoryName.toLowerCase()
        let categoryId = categoryMap.get(categoryKey)

        if (!categoryId) {
          const { data: newCategory, error } = await auth.context.supabase
            .from('categories')
            .insert({
              name: categoryName,
              slug: slugify(categoryName),
              emoji: null,
            })
            .select()
            .single()

          if (error || !newCategory?.id) {
            errors.push({ row: rowNumber, error: `Category error: ${error?.message || 'category was not created'}` })
            continue
          }

          categoryId = String(newCategory.id)
          categoryMap.set(categoryKey, categoryId)
        }

        row.category_id = categoryId
      }

      products.push(
        sanitizeProduct({
          ...row,
          is_active: parseBoolean(row.is_active, true),
          in_stock: parseBoolean(row.in_stock, Number(row.stock_quantity || 0) > 0),
        }),
      )
    }

    if (!products.length) {
      return NextResponse.json({ inserted: 0, errors }, { status: 400 })
    }

    const { data, error } = await auth.context.supabase
      .from('products')
      .insert(products)
      .select('id, name')

    if (error) throw error

    return NextResponse.json({
      inserted: data?.length || 0,
      skipped: errors.length,
      errors,
      products: data || [],
    })
  } catch (error) {
    return jsonError(error, 'Failed to import products')
  }
}

function normalizeRow(rawRow: ImportRow) {
  const row: Record<string, unknown> = {}

  for (const [key, value] of Object.entries(rawRow)) {
    const normalizedKey = normalizeKey(key)
    const mappedKey = headerAliases[normalizedKey] || normalizedKey
    row[mappedKey] = typeof value === 'string' ? value.trim() : value
  }

  return row
}

function normalizeKey(key: string) {
  return key
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/(^_|_$)/g, '')
}

function parseBoolean(value: unknown, fallback: boolean) {
  if (value === undefined || value === null || value === '') return fallback
  if (typeof value === 'boolean') return value
  const text = String(value).trim().toLowerCase()
  if (['true', 'yes', 'oui', '1', 'active', 'actif'].includes(text)) return true
  if (['false', 'no', 'non', '0', 'inactive', 'inactif'].includes(text)) return false
  return fallback
}
