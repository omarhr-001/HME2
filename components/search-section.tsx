'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, X } from 'lucide-react'
import { getCategoriesFromSupabase, type Category } from '@/lib/products'
import Link from 'next/link'

export function SearchSection() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const dbCategories = await getCategoriesFromSupabase()
        setCategories(dbCategories)
      } catch (error) {
        console.error('Error fetching categories:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (searchQuery) params.append('search', searchQuery)
    if (selectedCategory) {
      const selectedCat = categories.find(cat => cat.id === selectedCategory)
      if (selectedCat) params.append('category', encodeURIComponent(selectedCat.slug || selectedCat.name))
    }
    window.location.href = `/products?${params.toString()}`
  }

  const selectedCategoryData = selectedCategory ? categories.find(cat => cat.id === selectedCategory) : null

  return (
    <section className="sticky top-17 z-40 bg-white px-[5%] py-4 border-b border-gray-200">
      <form onSubmit={handleSearch} className="flex items-center gap-3">
        {/* Search Input */}
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

        {/* Categories Button & Mega Menu */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setShowDropdown(!showDropdown)}
            disabled={loading}
            className="px-5 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap"
          >
            {selectedCategoryData ? (
              <>
                <span className="text-base">{selectedCategoryData.emoji || '📦'}</span>
                <span className="hidden sm:inline">{selectedCategoryData.name}</span>
              </>
            ) : (
              <>
                <span className="hidden sm:inline">Toutes les catégories</span>
                <span className="sm:hidden">Catégories</span>
              </>
            )}
          </button>

          {/* Mega Menu */}
          {showDropdown && (
            <div className="absolute top-full right-0 mt-2 w-screen max-w-4xl bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
              {/* Header */}
              <div className="sticky top-0 bg-gray-50 border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">Catégories</h3>
                <button
                  type="button"
                  onClick={() => setShowDropdown(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Categories Grid */}
              {!loading && categories.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-0 divide-x divide-y divide-gray-200">
                  {/* All Categories */}
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCategory(null)
                      setShowDropdown(false)
                    }}
                    className={`px-4 py-4 text-center transition-all duration-200 ${
                      selectedCategory === null
                        ? 'bg-green-50'
                        : 'bg-white hover:bg-gray-50'
                    }`}
                  >
                    <div className="text-3xl mb-2">🎯</div>
                    <div className={`text-sm font-medium ${
                      selectedCategory === null ? 'text-green-700' : 'text-gray-700'
                    }`}>
                      Tous
                    </div>
                  </button>

                  {/* Individual Categories */}
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        setSelectedCategory(cat.id)
                        setShowDropdown(false)
                      }}
                      className={`px-4 py-4 text-center transition-all duration-200 ${
                        selectedCategory === cat.id
                          ? 'bg-green-50'
                          : 'bg-white hover:bg-gray-50'
                      }`}
                    >
                      <div className="text-3xl mb-2">{cat.emoji || '📦'}</div>
                      <div className={`text-sm font-medium line-clamp-2 ${
                        selectedCategory === cat.id ? 'text-green-700' : 'text-gray-700'
                      }`}>
                        {cat.name}
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="px-6 py-8 text-center text-gray-500 text-sm">
                  {loading ? 'Chargement des catégories...' : 'Aucune catégorie disponible'}
                </div>
              )}

              {/* Footer */}
              {!loading && categories.length > 0 && (
                <Link
                  href="/products"
                  onClick={() => setShowDropdown(false)}
                  className="block px-6 py-3 border-t border-gray-200 text-center text-sm font-medium text-green-700 hover:bg-gray-50 transition-colors"
                >
                  Voir tous les produits
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Search Button */}
        <button
          type="submit"
          className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium text-sm hover:bg-green-700 transition-all duration-200 whitespace-nowrap"
        >
          <span className="hidden sm:inline">Rechercher</span>
          <span className="sm:hidden">
            <Search size={18} />
          </span>
        </button>
      </form>
    </section>
  )
}
