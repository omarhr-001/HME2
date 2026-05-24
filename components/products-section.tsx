'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ProductCard } from './product-card'
import { getProductsFromSupabase, getCategoriesFromSupabase, type Category } from '@/lib/products'
import { ArrowRight } from 'lucide-react'
import type { Product } from '@/lib/types'

export function ProductsSection() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  // Fetch products and categories on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsData, categoriesData] = await Promise.all([
          getProductsFromSupabase(),
          getCategoriesFromSupabase()
        ])
        setProducts(productsData)
        setCategories(categoriesData)
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const displayedProducts = selectedCategory
    ? products
        .filter(p => p.category_id === selectedCategory)
        .slice(0, 8)
    : products.slice(0, 8)

  return (
    <section className="px-6 py-20 bg-white">
      {/* Section Header */}
      <div className="max-w-7xl mx-auto flex items-center justify-between mb-10">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Produits à la une</h2>
          <p className="text-sm text-gray-600">Découvrez notre sélection exclusive de meubles et électroménagers</p>
        </div>
        <Link href="/products" className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-2 transition-all duration-300 no-underline">
          Voir tous
          <ArrowRight size={16} />
        </Link>
      </div>

      {/* Category Tabs - Dynamic from Database */}
      <div className="max-w-7xl mx-auto flex gap-0 overflow-x-auto mb-10 pb-4 border-b border-gray-200">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`px-5 py-3 text-sm font-medium whitespace-nowrap transition-all duration-300 border-b-2 ${
            selectedCategory === null
              ? 'text-indigo-600 border-indigo-600 font-semibold'
              : 'text-gray-600 border-transparent hover:text-indigo-600'
          }`}
        >
          Toutes les catégories
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-5 py-3 text-sm font-medium whitespace-nowrap transition-all duration-300 border-b-2 flex items-center gap-2 ${
              selectedCategory === cat.id
                ? 'text-indigo-600 border-indigo-600 font-semibold'
                : 'text-gray-600 border-transparent hover:text-indigo-600'
            }`}
          >
            <span className="text-base">{cat.emoji || '📦'}</span>
            {cat.name}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto">
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Chargement des produits...</p>
          </div>
        ) : displayedProducts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Aucun produit trouvé</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {displayedProducts.map((product) => (
              <ProductCard
                key={product.id}
                {...product}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

