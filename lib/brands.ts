'use server'

import storeData from './store-data.json'
import type { Brand } from './products'
import { getProducts } from './products'

const staticBrands = storeData.brands as Brand[]

export async function getBrands(): Promise<Brand[]> {
  return staticBrands.map((brand) => ({ ...brand })).sort((left, right) => left.name.localeCompare(right.name))
}

export async function getBrandsByCategory(categoryId: string): Promise<Brand[]> {
  const productBrands = new Set(
    (await getProducts())
      .filter((product) => product.category_id === categoryId)
      .map((product) => product.brand_id),
  )

  return staticBrands
    .filter((brand) => productBrands.has(brand.id))
    .map((brand) => ({ ...brand }))
    .sort((left, right) => left.name.localeCompare(right.name))
}

export async function getProductsByBrand(brandId: string, limit = 50) {
  return (await getProducts())
    .filter((product) => product.brand_id === brandId)
    .slice(0, Math.max(0, limit))
}

export async function addBrandToCategory(_categoryId: string, _brandId: string): Promise<boolean> {
  return false
}

export async function createBrand(
  _name: string,
  _slug: string,
  _description?: string,
  _logoUrl?: string,
): Promise<Brand | null> {
  return null
}
