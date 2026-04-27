'use client'

import { useState } from 'react'
import { Search } from 'lucide-react'

export function SearchSection() {
  const [searchQuery, setSearchQuery] = useState('')
  const [category, setCategory] = useState('all')

  const categories = [
    { id: 'all', label: 'Toutes les catégories' },
    { id: 'refrigerators', label: 'Réfrigérateurs' },
    { id: 'washing', label: 'Lave-linge' },
    { id: 'cooking', label: 'Cuisinières' },
    { id: 'ovens', label: 'Fours' },
    { id: 'dishwashers', label: 'Lave-vaisselle' },
  ]

  return (
    <section className="sticky top-17 z-40 bg-white px-[5%] py-5 border-b border-gray-200">
      <div className="flex gap-3 max-w-4xl">
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

        {/* Category Select */}
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="px-4 py-3 border-2 border-gray-200 rounded-3xl text-sm bg-gray-50 text-gray-800 outline-none cursor-pointer min-w-max transition-all duration-300 focus:border-green-500 focus:bg-white appearance-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%238aa898' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 14px center',
            paddingRight: '36px'
          }}
        >
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.label}</option>
          ))}
        </select>
      </div>
    </section>
  )
}
