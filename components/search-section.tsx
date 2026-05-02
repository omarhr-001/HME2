'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, ChevronDown, Grid3x3, Zap } from 'lucide-react'
import { getCategoriesFromSupabase, type Category } from '@/lib/products'
import Link from 'next/link'

export function SearchSection() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
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
    if (selectedCategory !== 'all') {
      const selectedCat = categories.find(cat => cat.id === selectedCategory)
      if (selectedCat) params.append('category', encodeURIComponent(selectedCat.slug || selectedCat.name))
    }
    window.location.href = `/products?${params.toString()}`
  }

  const selectedCategoryLabel = selectedCategory === 'all'
    ? 'Toutes les catégories'
    : categories.find(cat => cat.id === selectedCategory)?.name || 'Catégories'

  const selectedCategoryEmoji = selectedCategory !== 'all'
    ? categories.find(cat => cat.id === selectedCategory)?.emoji
    : undefined

  const categoryCount = categories.length

  return (
    <section className="sticky top-17 z-40 bg-white px-[5%] py-5 border-b border-gray-200 shadow-sm">
      <form onSubmit={handleSearch} className="flex gap-3 max-w-5xl">
        {/* Search Input */}
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Rechercher des produits..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 pl-12 border-2 border-gray-200 rounded-3xl text-sm bg-gray-50 outline-none transition-all duration-300 focus:border-green-500 focus:bg-white"
          />
        </div>

        {/* Category Dropdown - Enhanced */}
        <div className="relative min-w-max" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setShowDropdown(!showDropdown)}
            disabled={loading}
            className="px-4 py-3 border-2 border-gray-200 rounded-3xl text-sm bg-gray-50 text-gray-800 outline-none cursor-pointer transition-all duration-300 focus:border-green-500 focus:bg-white flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:border-green-400 hover:bg-white group"
          >
            {selectedCategoryEmoji ? (
              <span className="text-lg group-hover:scale-110 transition-transform">{selectedCategoryEmoji}</span>
            ) : (
              <Grid3x3 size={16} className="text-green-600" />
            )}
            <span className="hidden sm:inline font-medium">{selectedCategoryLabel}</span>
            <span className="sm:hidden font-medium">{selectedCategoryLabel === 'Toutes les catégories' ? 'Tous' : selectedCategoryLabel}</span>
            <ChevronDown size={16} className={`transition-transform duration-300 ${showDropdown ? 'rotate-180' : ''}`} />
          </button>

          {/* Enhanced Dropdown Menu */}
          {showDropdown && (
            <div className="absolute top-full right-0 mt-2 bg-white border-2 border-gray-200 rounded-2xl shadow-xl z-50 min-w-sm max-h-96 overflow-y-auto divide-y divide-gray-100">
              {/* Header */}
              <div className="sticky top-0 bg-gradient-to-r from-green-50 to-green-100 px-4 py-3 flex items-center gap-2">
                <Grid3x3 size={16} className="text-green-600" />
                <span className="font-semibold text-gray-800">{categoryCount} catégories</span>
                {categoryCount > 0 && (
                  <span className="ml-auto text-xs bg-green-600 text-white px-2 py-1 rounded-full font-medium">
                    Nouvelle
                  </span>
                )}
              </div>

              {/* All Categories Option */}
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory('all')
                  setShowDropdown(false)
                }}
                className={`w-full text-left px-4 py-3 text-sm transition-all flex items-center gap-3 ${
                  selectedCategory === 'all'
                    ? 'bg-green-100 text-green-800 font-semibold border-l-4 border-l-green-600'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span className="text-lg">🎯</span>
                <div className="flex-1">
                  <div className="font-medium">Toutes les catégories</div>
                  <div className="text-xs text-gray-500">Voir tous les produits</div>
                </div>
              </button>

              {/* Divider */}
              {categories.length > 0 && <div />}

              {/* Category Options */}
              <div className="max-h-80 overflow-y-auto">
                {categories.length > 0 ? (
                  categories.map((cat, index) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        setSelectedCategory(cat.id)
                        setShowDropdown(false)
                      }}
                      className={`w-full text-left px-4 py-3 text-sm transition-all flex items-center gap-3 ${
                        selectedCategory === cat.id
                          ? 'bg-green-100 text-green-800 font-semibold border-l-4 border-l-green-600'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <span className="text-lg">{cat.emoji || '📦'}</span>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{cat.name}</div>
                        {index === 0 && (
                          <div className="text-xs text-green-600 flex items-center gap-1">
                            <Zap size={12} />
                            Populaire
                          </div>
                        )}
                      </div>
                      {selectedCategory === cat.id && (
                        <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                      )}
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-6 text-center text-gray-500 text-sm">
                    Aucune catégorie disponible
                  </div>
                )}
              </div>

              {/* Footer */}
              {categories.length > 0 && (
                <Link 
                  href="/products"
                  onClick={() => setShowDropdown(false)}
                  className="block px-4 py-3 text-sm bg-gradient-to-r from-green-50 to-green-100 text-green-700 font-semibold hover:from-green-100 hover:to-green-200 transition-all text-center"
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
          className="px-6 py-3 bg-green-600 text-white rounded-3xl font-semibold text-sm hover:bg-green-700 transition-all duration-300 whitespace-nowrap shadow-md hover:shadow-lg"
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
