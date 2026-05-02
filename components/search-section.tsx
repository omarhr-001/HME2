'use client'

import { useState } from 'react'
import { Search } from 'lucide-react'

export function SearchSection() {
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (searchQuery) params.append('search', searchQuery)
    window.location.href = `/products?${params.toString()}`
  }

  return (
    <section className="sticky top-17 z-40 bg-white px-[5%] py-4 border-b border-gray-200">
      <form onSubmit={handleSearch} className="flex items-center gap-3 max-w-2xl">
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
