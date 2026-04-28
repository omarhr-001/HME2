'use client'

import { useState, useMemo, useEffect } from 'react'
import Image from 'next/image'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { ProductCard } from '@/components/product-card'
import { Search, Filter } from 'lucide-react'
import { getProductsFromSupabase } from '@/lib/products'
import type { Product } from '@/lib/types'

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('newest')
  const [priceRange, setPriceRange] = useState([0, 2000])

  // Fetch products from Supabase on mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getProductsFromSupabase()
        setProducts(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
        console.error('Error fetching products:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  // Get unique categories from products
  const categories = useMemo(() => {
    const cats = new Set(products
      .filter(p => p.category)
      .map(p => p.category as string))
    return Array.from(cats).sort()
  }, [products])

  const filteredProducts = useMemo(() => {
    let filtered = [...products]

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category === selectedCategory)
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    // Filter by price range
    filtered = filtered.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1])

    // Sort
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price)
        break
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price)
        break
      case 'newest':
      default:
        break
    }

    return filtered
  }, [products, selectedCategory, searchTerm, sortBy, priceRange])

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
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white px-[5%] py-16">
          <h1 className="text-4xl font-bold mb-2">Tous les produits</h1>
          <p className="text-green-50">Trouvez le produit parfait pour vos besoins</p>
        </div>

        {loading && (
          <div className="px-[5%] py-16 text-center">
            <p className="text-gray-600">Chargement des produits...</p>
          </div>
        )}

        {error && (
          <div className="px-[5%] py-16 text-center">
            <p className="text-red-600">Erreur: {error}</p>
          </div>
        )}

        {!loading && !error && (
          <div className="px-[5%] py-8">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Sidebar Filters */}
              <aside className="lg:w-64 flex-shrink-0">
              {/* Search */}
              <div className="bg-white rounded-2xl p-6 mb-6 shadow-sm border border-gray-200">
                <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-4 py-2">
                  <Search size={18} className="text-gray-400" />
                  <input
                    type="text"
                    placeholder="Rechercher..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-transparent outline-none text-sm w-full"
                  />
                </div>
              </div>

              {/* Categories */}
              <div className="bg-white rounded-2xl p-6 mb-6 shadow-sm border border-gray-200">
                <h3 className="font-bold text-gray-800 mb-4">Catégories</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className={`block w-full text-left px-4 py-2 rounded-lg transition-all ${
                      selectedCategory === 'all'
                        ? 'bg-green-100 text-green-700 font-semibold'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    Tous les produits
                  </button>
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`block w-full text-left px-4 py-2 rounded-lg transition-all ${
                        selectedCategory === cat
                          ? 'bg-green-100 text-green-700 font-semibold'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                <h3 className="font-bold text-gray-800 mb-4">Gamme de prix</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-gray-600">Min: {priceRange[0]} DT</label>
                    <input
                      type="range"
                      min="0"
                      max="2000"
                      value={priceRange[0]}
                      onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Max: {priceRange[1]} DT</label>
                    <input
                      type="range"
                      min="0"
                      max="2000"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
              </aside>

              {/* Main Content */}
              <div className="flex-1">
              {/* Sort */}
              <div className="flex items-center justify-between mb-8">
                <p className="text-gray-600 text-sm">
                  Affichage de <strong>{filteredProducts.length}</strong> produits
                </p>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-sm outline-none bg-white"
                >
                  <option value="newest">Plus récents</option>
                  <option value="price-low">Prix: Bas à Haut</option>
                  <option value="price-high">Prix: Haut à Bas</option>
                </select>
              </div>

              {/* Products Grid */}
              {filteredProducts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProducts.map(product => (
                    <ProductCard
                      key={product.id}
                      {...product}
                      onAddToCart={handleAddToCart}  
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <p className="text-gray-500 text-lg">Aucun produit trouvé</p>
                  <button
                    onClick={() => {
                      setSearchTerm('')
                      setSelectedCategory('all')
                      setPriceRange([0, 2000])
                    }}
                    className="mt-4 text-green-600 hover:text-green-700 font-semibold"
                  >
                    Réinitialiser les filtres
                  </button>
                </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  )
}
