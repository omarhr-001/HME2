'use client'

import { useState, useEffect } from 'react'
import { Search, ChevronDown } from 'lucide-react'
import { getCategoriesFromSupabase, type Category } from '@/lib/products'
import Link from 'next/link'

export function SearchSection() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showDropdown, setShowDropdown] = useState(false)

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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // Implement search functionality
    const params = new URLSearchParams()
    if (searchQuery) params.append('search', searchQuery)
    if (selectedCategory !== 'all') params.append('category', selectedCategory)
    window.location.href = `/products?${params.toString()}`
  }

  const selectedCategoryLabel = selectedCategory === 'all'
    ? 'Toutes les catégories'
    : categories.find(cat => cat.id === selectedCategory)?.name || 'Catégories'

  const selectedCategoryEmoji = selectedCategory !== 'all'
    ? categories.find(cat => cat.id === selectedCategory)?.emoji
    : undefined

  return (
    <section className="sticky top-17 z-40 bg-white px-[5%] py-5 border-b border-gray-200">
      <form onSubmit={handleSearch} className="flex gap-3 max-w-4xl">
        {/* Search Input */}
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Rechercher des produits..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 pl-12 border-2 border-gray-200 rounded-3xl text-sm bg-gray-50 outline-none transition-all duration-300 focus:border-green-500 focus:bg-white focus:shadow-sm"
            style={{ boxShadow: 'focus:0 0 0 3px rgba(34,197,94,0.1)' }}
          />
        </div>

        {/* Category Dropdown */}
        <div className="relative min-w-max">
          <button
            type="button"
            onClick={() => setShowDropdown(!showDropdown)}
            disabled={loading}
            className="px-4 py-3 border-2 border-gray-200 rounded-3xl text-sm bg-gray-50 text-gray-800 outline-none cursor-pointer transition-all duration-300 focus:border-green-500 focus:bg-white flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:border-green-300"
          >
            {selectedCategoryEmoji && <span className="text-lg">{selectedCategoryEmoji}</span>}
            <span className="hidden sm:inline">{selectedCategoryLabel}</span>
            <span className="sm:hidden">{selectedCategoryLabel === 'Toutes les catégories' ? 'Tous' : selectedCategoryLabel}</span>
            <ChevronDown size={16} className={`transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown Menu */}
          {showDropdown && (
            <div className="absolute top-full right-0 mt-1 bg-white border-2 border-gray-200 rounded-2xl shadow-lg z-50 min-w-max max-h-96 overflow-y-auto">
              {/* All Categories Option */}
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory('all')
                  setShowDropdown(false)
                }}
                className={`block w-full text-left px-4 py-3 text-sm transition-all ${
                  selectedCategory === 'all'
                    ? 'bg-green-100 text-green-800 font-semibold border-l-4 border-green-500'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                Toutes les catégories
              </button>

              {/* Category Options */}
              {categories.map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    setSelectedCategory(cat.id)
                    setShowDropdown(false)
                  }}
                  className={`block w-full text-left px-4 py-3 text-sm transition-all flex items-center gap-3 ${
                    selectedCategory === cat.id
                      ? 'bg-green-100 text-green-800 font-semibold border-l-4 border-green-500'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-lg">{cat.emoji || '📦'}</span>
                  <span>{cat.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Search Button */}
        <button
          type="submit"
          className="px-6 py-3 bg-green-600 text-white rounded-3xl font-semibold text-sm hover:bg-green-700 transition-all duration-300 whitespace-nowrap"
        >
          Rechercher
        </button>
      </form>
    </section>
  )
}
