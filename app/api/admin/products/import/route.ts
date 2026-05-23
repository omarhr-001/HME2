import { NextRequest, NextResponse } from 'next/server'
import ExcelJS from 'exceljs'
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
  meubles_salons: 'is_salon',
  meuble_salon: 'is_salon',
  salon: 'is_salon',
  salons: 'is_salon',
  meubles_chambres: 'is_chambre',
  meuble_chambre: 'is_chambre',
  chambre: 'is_chambre',
  chambres: 'is_chambre',
  brand: 'brand',
  marque: 'brand',
  tags: 'tags',
  tag: 'tags',
  etiquettes: 'tags',
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
    const rawRows = await readImportRows(file.name, buffer)

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

      // If user provided furniture checkbox columns, map them to sensible categories
      try {
        if (!row.category) {
          if (parseBoolean(row.is_salon, false)) row.category = 'Meubles/Salons'
          else if (parseBoolean(row.is_chambre, false)) row.category = 'Meubles/Chambres'
        }
      } catch (err) {
        // ignore parsing errors and continue
      }

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

      try {
        products.push(sanitizeProduct({
          ...row,
          is_active: parseBoolean(row.is_active, true),
          in_stock: parseBoolean(row.in_stock, Number(row.stock_quantity || 0) > 0),
        }))
      } catch (error) {
        errors.push({
          row: rowNumber,
          error: error instanceof Error ? error.message : 'Invalid product data',
        })
      }
    }

    if (!products.length) {
      return NextResponse.json({ inserted: 0, errors }, { status: 400 })
    }

    const { data, error } = await auth.context.supabase
      .from('products')
      .insert(products)
      .select('id, name, image_url')

    if (error) throw error

    const mainImages = (data || [])
      .filter((product: any) => product.image_url)
      .map((product: any) => ({
        product_id: product.id,
        image_url: product.image_url,
        is_main: true,
        sort_order: 0,
      }))

    if (mainImages.length) {
      const { error: imageError } = await auth.context.supabase
        .from('product_images')
        .insert(mainImages)
      if (imageError) throw imageError
    }

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

async function readImportRows(filename: string, buffer: Buffer): Promise<ImportRow[]> {
  const lowerName = filename.toLowerCase()

  if (lowerName.endsWith('.csv')) {
    return parseCsv(buffer.toString('utf8'))
  }

  if (!lowerName.endsWith('.xlsx')) {
    throw new Error('Only .xlsx and .csv files are supported')
  }

  const workbook = new ExcelJS.Workbook()
  await workbook.xlsx.load(buffer as any)

  const worksheet = workbook.worksheets[0]
  if (!worksheet) {
    throw new Error('The file does not contain a sheet')
  }

  const headers = getRowValues(worksheet.getRow(1)).map((value) => String(value).trim())
  const rows: ImportRow[] = []

  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return

    const values = getRowValues(row)
    const item: ImportRow = {}

    headers.forEach((header, index) => {
      if (!header) return
      item[header] = values[index] ?? ''
    })

    if (Object.values(item).some((value) => String(value).trim() !== '')) {
      rows.push(item)
    }
  })

  return rows
}

function getRowValues(row: ExcelJS.Row) {
  const values = Array.isArray(row.values) ? row.values.slice(1) : []
  return values.map((value) => {
    if (value && typeof value === 'object' && 'text' in value) {
      return String(value.text)
    }
    if (value instanceof Date) return value.toISOString()
    return value ?? ''
  })
}

function parseCsv(input: string): ImportRow[] {
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let quoted = false

  for (let index = 0; index < input.length; index += 1) {
    const char = input[index]
    const next = input[index + 1]

    if (char === '"' && quoted && next === '"') {
      field += '"'
      index += 1
    } else if (char === '"') {
      quoted = !quoted
    } else if (char === ',' && !quoted) {
      row.push(field)
      field = ''
    } else if ((char === '\n' || char === '\r') && !quoted) {
      if (char === '\r' && next === '\n') index += 1
      row.push(field)
      rows.push(row)
      row = []
      field = ''
    } else {
      field += char
    }
  }

  row.push(field)
  rows.push(row)

  const headers = rows.shift()?.map((header) => header.trim()) || []

  return rows
    .filter((values) => values.some((value) => value.trim() !== ''))
    .map((values) => {
      const item: ImportRow = {}
      headers.forEach((header, index) => {
        if (header) item[header] = values[index]?.trim() || ''
      })
      return item
    })
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
