'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ProductCard } from './product-card'
import { products, getAllCategories } from '@/lib/products'
import { ArrowRight } from 'lucide-react'
import type { Product } from '@/lib/products'

export function ProductsSection() {
  const [category, setCategory] = useState('all')
  const categories = getAllCategories()
  
  const displayedProducts = category === 'all' 
    ? products.slice(0, 8)
    : products.filter(p => p.category === category).slice(0, 8)

  const handleAddToCart = (product: Product, quantity: number = 1) => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]')
    const existingItem = cart.find((item: any) => item.id === product.id)
    
    if (existingItem) {
      existingItem.quantity += quantity
    } else {
      cart.push({ ...product, quantity })
    }
    
    localStorage.setItem('cart', JSON.stringify(cart))
    window.dispatchEvent(new Event('cartUpdated'))
  }

  return (
    <section className="px-[5%] py-16">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-7">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-1">Produits à la une</h2>
          <p className="text-sm text-gray-500">Découvrez notre sélection exclusive</p>
        </div>
        <Link href="/products" className="text-sm font-semibold text-green-700 hover:gap-2 flex items-center gap-1 transition-all duration-300 no-underline">
          Voir tous
          <ArrowRight size={16} />
        </Link>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-0 overflow-x-auto mb-8 pb-4 border-b border-gray-200">
        <button
          onClick={() => setCategory('all')}
          className={`px-5 py-3.5 text-xs font-medium whitespace-nowrap transition-all duration-300 border-b-[2.5px] ${
            category === 'all'
              ? 'text-green-700 border-green-500 font-semibold'
              : 'text-gray-500 border-transparent hover:text-green-600'
          }`}
        >
          Tous
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-5 py-3.5 text-xs font-medium whitespace-nowrap transition-all duration-300 border-b-[2.5px] ${
              category === cat
                ? 'text-green-700 border-green-500 font-semibold'
                : 'text-gray-500 border-transparent hover:text-green-600'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {displayedProducts.map((product) => (
          <ProductCard
            key={product.id}
            {...product}
            onAddToCart={handleAddToCart}
          />
        ))}
      </div>
    </section>
  )
}
