import storeData from './store-data.json'
import type { Brand as BrandModel, Product as ProductModel, ProductImage } from './types'

export type Product = ProductModel & {
  id: string
  name: string
  price: number
  originalPrice: number
  stock_quantity: number
  category: string
  category_id: string
  brand_id: string
  brand: Brand
  image: string
  image_url: string
  product_images: ProductImage[]
  sku: string
  specs: Record<string, string>
  inStock: boolean
  is_active: boolean
}

export type Brand = BrandModel

export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  image_url?: string
  emoji?: string
}

const staticProducts = storeData.products as unknown as Product[]
const staticCategories = storeData.categories as Category[]

function copyProduct(product: Product): Product {
  return {
    ...product,
    brand: { ...product.brand },
    specs: { ...product.specs },
    product_images: product.product_images.map((image) => ({ ...image })),
  }
}

export async function getProducts(): Promise<Product[]> {
  return staticProducts.filter((product) => product.is_active).map(copyProduct)
}

export async function getProductById(id: string): Promise<Product | undefined> {
  const product = staticProducts.find((item) => item.id === String(id) && item.is_active)
  return product ? copyProduct(product) : undefined
}

export async function getCategories(): Promise<Category[]> {
  return staticCategories.map((category) => ({ ...category }))
}

export async function getCategoryNames(): Promise<string[]> {
  return staticCategories.map((category) => category.name)
}

export async function getCategoriesWithProducts(): Promise<Category[]> {
  const categoryIds = new Set(staticProducts.filter((product) => product.is_active).map((product) => product.category_id))
  return staticCategories
    .filter((category) => categoryIds.has(category.id))
    .map((category) => ({ ...category }))
}

export async function getProductsByCategory(categoryId: string): Promise<Product[]> {
  return staticProducts
    .filter((product) => product.is_active && product.category_id === categoryId)
    .map(copyProduct)
}

export async function getProductsByBrand(brandId: string, limit = 50): Promise<Product[]> {
  return staticProducts
    .filter((product) => product.is_active && product.brand_id === brandId)
    .slice(0, Math.max(0, limit))
    .map(copyProduct)
}
