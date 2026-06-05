'use client'

import { FormEvent, useEffect, useMemo, useState } from 'react'
import { Search } from 'lucide-react'

interface ProductSuggestion {
  id: string
  name: string
}

function normalizeText(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}

export function SearchSection() {
  const [searchQuery, setSearchQuery] = useState('')
  const [products, setProducts] = useState<ProductSuggestion[]>([])

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products', { cache: 'no-store' })
        if (!response.ok) return
        const data = await response.json()
        setProducts(
          (data || []).map((product: any) => ({
            id: product.id,
            name: product.name,
          }))
        )
      } catch (error) {
        console.error('Failed to load product suggestions:', error)
      }
    }

    fetchProducts()
  }, [])

  const normalizedQuery = useMemo(() => normalizeText(searchQuery.trim()), [searchQuery])

  const suggestions = useMemo(() => {
    if (!normalizedQuery) return []

    return products
      .filter((product) => normalizeText(product.name).includes(normalizedQuery))
      .slice(0, 6)
  }, [normalizedQuery, products])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const query = searchQuery.trim()
    const params = new URLSearchParams()
    if (query) params.append('search', query)
    window.location.href = `/products?${params.toString()}`
  }

  const handleSuggestionClick = (name: string) => {
    window.location.href = `/products?search=${encodeURIComponent(name)}`
  }

  return (
    <section className="sticky top-17 z-40 bg-white px-[5%] py-4 border-b border-gray-200">
      <form onSubmit={handleSearch} className="relative max-w-2xl">
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Rechercher des produits..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg text-sm bg-white outline-none transition-all duration-200 focus:border-green-500 focus:ring-1 focus:ring-green-500"
            />
          </div>

          <button
            type="submit"
            className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium text-sm hover:bg-green-700 transition-all duration-200 whitespace-nowrap"
          >
            <span className="hidden sm:inline">Rechercher</span>
            <span className="sm:hidden">
              <Search size={18} />
            </span>
          </button>
        </div>

        {suggestions.length > 0 && (
          <div className="absolute left-0 right-0 z-50 mt-2 rounded-xl border border-gray-200 bg-white shadow-lg">
            {suggestions.map((product) => (
              <button
                key={product.id}
                type="button"
                onMouseDown={() => handleSuggestionClick(product.name)}
                className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-100"
              >
                {product.name}
              </button>
            ))}
          </div>
        )}
      </form>
    </section>
  )
}
