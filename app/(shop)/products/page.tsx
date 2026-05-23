'use client'

import { useState, useMemo, useEffect } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { ProductCard } from '@/components/product-card'
import { Search, X, ChevronDown } from 'lucide-react'
import { getProductsFromSupabase, getCategoriesFromSupabase, type Category } from '@/lib/products'
import { getBrandsByCategoryFromSupabase } from '@/lib/brands'
import { getCurrentUser } from '@/lib/auth'
import type { Product, Brand } from '@/lib/types'

export default function ProductsPage() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('newest')
  const [priceRange, setPriceRange] = useState([0, 2000])
  const [showFilters, setShowFilters] = useState(false)

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
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
        console.error('Error fetching data:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Load brands when category is selected
  useEffect(() => {
    const loadBrands = async () => {
      if (selectedCategory) {
        try {
          const brandsData = await getBrandsByCategoryFromSupabase(selectedCategory)
          setBrands(brandsData)
          setSelectedBrand(null) // Reset brand selection when category changes
        } catch (err) {
          console.error('Error fetching brands:', err)
          setBrands([])
        }
      } else {
        setBrands([])
        setSelectedBrand(null)
      }
    }

    loadBrands()
  }, [selectedCategory])

  // Parse search parameters
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const category = params.get('category')
    const search = params.get('search')

    if (category) {
      const cat = categories.find(c => c.slug === category || c.name === category)
      setSelectedCategory(cat?.id || null)
    }
    if (search) {
      setSearchTerm(search)
    }
  }, [categories])

  const filteredProducts = useMemo(() => {
    let filtered = [...products]

    // Filter by category using category_id
    if (selectedCategory) {
      filtered = filtered.filter(p => p.category_id === selectedCategory)
    }

    // Filter by brand
    if (selectedBrand) {
      filtered = filtered.filter(p => p.brand_id === selectedBrand)
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
  }, [products, selectedCategory, selectedBrand, searchTerm, sortBy, priceRange])

  const handleAddToCart = async (product: Product, quantity: number = 1) => {
    // Handled by ProductCard component with useCart hook
  }

  const resetFilters = () => {
    setSelectedCategory(null)
    setSelectedBrand(null)
    setSearchTerm('')
    setPriceRange([0, 2000])
    setSortBy('newest')
  }

  const selectedCategoryData = selectedCategory ? categories.find(c => c.id === selectedCategory) : null

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
              <aside className="lg:w-72 flex-shrink-0">
                {/* Mobile Toggle */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden w-full mb-4 px-4 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                  {showFilters ? 'Masquer les filtres' : 'Afficher les filtres'}
                </button>

                {/* Filters Container */}
                <div className={`space-y-4 ${showFilters ? 'block' : 'hidden lg:block'}`}>
                  {/* Search */}
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <h3 className="font-semibold text-gray-800 mb-3 text-sm">Rechercher</h3>
                    <div className="relative">
                      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Nom du produit..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
                      />
                    </div>
                  </div>

                  {/* Categories */}
                  <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-bold text-sm">
                        ⚙️
                      </div>
                      <h3 className="font-bold text-gray-800 text-base">Catégories</h3>
                      <span className="ml-auto text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                        {categories.length}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <button
                        onClick={() => setSelectedCategory(null)}
                        className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-3 group ${selectedCategory === null
                          ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-md shadow-green-500/20'
                          : 'text-gray-700 hover:bg-gray-100 border border-transparent'
                          }`}
                      >
                        <span className={`text-lg transition-transform ${selectedCategory === null ? 'scale-110' : 'group-hover:scale-105'}`}>🎯</span>
                        Tous les produits
                      </button>
                      {categories.map(cat => (
                        <button
                          key={cat.id}
                          onClick={() => setSelectedCategory(cat.id)}
                          className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-3 group ${selectedCategory === cat.id
                            ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-md shadow-green-500/20'
                            : 'text-gray-700 hover:bg-gray-100 border border-transparent'
                            }`}
                        >
                          <span className={`text-lg transition-transform ${selectedCategory === cat.id ? 'scale-110' : 'group-hover:scale-105'}`}>
                            {cat.emoji || '📦'}
                          </span>
                          <span className="flex-1">{cat.name}</span>
                          <span className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                            {products.filter(p => p.category_id === cat.id).length}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Brands Filter - Only show when category is selected */}
                  {selectedCategory && brands.length > 0 && (
                    <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-5 border-2 border-amber-200 shadow-sm hover:shadow-lg transition-all duration-300 animate-in fade-in slide-in-from-top-2">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white font-bold text-sm">
                          🏷️
                        </div>
                        <h3 className="font-bold text-gray-800 text-base">Marques</h3>
                        <span className="ml-auto text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full font-medium">
                          {brands.length}
                        </span>
                      </div>
                      <div className="space-y-2">
                        <button
                          onClick={() => setSelectedBrand(null)}
                          className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-3 group ${selectedBrand === null
                            ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md shadow-amber-500/20'
                            : 'text-gray-700 hover:bg-amber-100 border border-transparent'
                            }`}
                        >
                          <span className={`transition-transform ${selectedBrand === null ? 'scale-110' : 'group-hover:scale-105'}`}>✓</span>
                          Toutes les marques
                        </button>
                        {brands.map(brand => (
                          <button
                            key={brand.id}
                            onClick={() => setSelectedBrand(brand.id)}
                            className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-3 group ${selectedBrand === brand.id
                              ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md shadow-amber-500/20'
                              : 'text-gray-700 hover:bg-amber-100 border border-transparent'
                              }`}
                          >
                            {brand.logo_url && (
                              <Image
                                src={brand.logo_url}
                                alt={brand.name}
                                width={18}
                                height={18}
                                className="rounded object-contain"
                              />
                            )}
                            {!brand.logo_url && <span className="text-lg">📦</span>}
                            <span className="flex-1">{brand.name}</span>
                            {selectedBrand === brand.id && <span className="text-sm font-bold">●</span>}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Price Range */}
                  <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-white font-bold text-sm">
                        💰
                      </div>
                      <h3 className="font-bold text-gray-800 text-base">Gamme de prix</h3>
                    </div>
                    <div className="space-y-4 bg-white rounded-lg p-4 border border-gray-100">
                      <div>
                        <div className="flex justify-between mb-2">
                          <label className="text-xs font-semibold text-gray-700">Minimum</label>
                          <span className="text-sm font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">{priceRange[0]} DT</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="2000"
                          value={priceRange[0]}
                          onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                          className="w-full h-2 bg-gradient-to-r from-blue-200 to-cyan-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between mb-2">
                          <label className="text-xs font-semibold text-gray-700">Maximum</label>
                          <span className="text-sm font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">{priceRange[1]} DT</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="2000"
                          value={priceRange[1]}
                          onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                          className="w-full h-2 bg-gradient-to-r from-blue-200 to-cyan-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Reset Button */}
                  <button
                    onClick={resetFilters}
                    className="w-full px-4 py-3 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-800 rounded-xl text-sm font-bold transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center gap-2 group"
                  >
                    <span className="group-hover:rotate-180 transition-transform duration-300">↻</span>
                    Réinitialiser les filtres
                  </button>
                </div>
              </aside>

              {/* Main Content */}
              <div className="flex-1">
                {/* Top Bar */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-gray-200">
                  {/* Category Display */}
                  {selectedCategoryData && (
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{selectedCategoryData.emoji || '📦'}</span>
                      <div>
                        <h2 className="font-semibold text-gray-800">{selectedCategoryData.name}</h2>
                        <p className="text-xs text-gray-500">{filteredProducts.length} produits</p>
                      </div>
                      <button
                        onClick={() => setSelectedCategory(null)}
                        className="ml-2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  )}

                  {/* Results and Sort */}
                  <div className="flex items-center justify-between gap-4 w-full sm:w-auto">
                    <p className="text-sm text-gray-600">
                      <strong>{filteredProducts.length}</strong> produit{filteredProducts.length !== 1 ? 's' : ''}
                    </p>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none bg-white hover:border-gray-400 focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-colors"
                    >
                      <option value="newest">Plus récents</option>
                      <option value="price-low">Prix: Bas à Haut</option>
                      <option value="price-high">Prix: Haut à Bas</option>
                    </select>
                  </div>
                </div>

                {/* Products Grid */}
                {filteredProducts.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProducts.map(product => (
                      <ProductCard
                        key={product.id}
                        {...product}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <p className="text-gray-500 text-lg mb-2">Aucun produit trouvé</p>
                    <p className="text-gray-400 text-sm mb-6">Essayez de modifier vos critères de recherche</p>
                    <button
                      onClick={resetFilters}
                      className="inline-block px-6 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
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
