'use client'

import { useMemo, useState, type FormEvent, type KeyboardEvent } from 'react'
import { Search } from 'lucide-react'

const propertyTypes = ['Villas & maisons', 'Appartements', 'Maisons de bord de mer']

function normalizeText(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
}

interface SearchSectionProps {
  onSearchChange: (query: string) => void
}

export function SearchSection({ onSearchChange }: SearchSectionProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const normalizedQuery = useMemo(() => normalizeText(searchQuery.trim()), [searchQuery])
  const suggestions = useMemo(
    () => normalizedQuery
      ? propertyTypes.filter((type) => normalizeText(type).includes(normalizedQuery)).slice(0, 3)
      : [],
    [normalizedQuery],
  )

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onSearchChange(searchQuery.trim())
    document.getElementById('biens')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && (event.nativeEvent.isComposing || event.keyCode === 229)) {
      event.preventDefault()
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion)
    onSearchChange(suggestion)
  }

  return (
    <section className="sticky top-[68px] z-40 border-b border-brand-ink/10 bg-brand-paper px-4 py-3 md:px-[5%] md:py-4">
      <form onSubmit={handleSubmit} className="relative mx-auto max-w-4xl">
        <label htmlFor="property-search" className="sr-only">Rechercher un univers immobilier</label>
        <div className="flex items-center gap-3">
          <div className="relative min-w-0 flex-1">
            <Search aria-hidden="true" size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-brand-muted" />
            <input
              id="property-search"
              type="search"
              placeholder="Villas, appartements, bord de mer…"
              autoComplete="off"
              value={searchQuery}
              onChange={(event) => {
                setSearchQuery(event.target.value)
                onSearchChange(event.target.value)
              }}
              onKeyDown={handleKeyDown}
              className="w-full rounded-lg border border-brand-ink/15 bg-brand-ivory py-3 pl-12 pr-4 text-sm text-brand-ink outline-none transition focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20"
            />
          </div>
          <button type="submit" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-brand-ink px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-gold hover:text-brand-ink sm:px-6">
            <span className="hidden sm:inline">Explorer</span>
            <Search aria-hidden="true" size={18} className="sm:hidden" />
          </button>
        </div>

        {suggestions.length > 0 && (
          <div aria-label="Suggestions de recherche" className="absolute left-0 right-0 z-50 mt-2 overflow-hidden rounded-xl border border-brand-ink/10 bg-brand-paper shadow-lg">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => handleSuggestionClick(suggestion)}
                className="w-full px-4 py-3 text-left text-sm text-brand-ink transition hover:bg-brand-gold/10"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </form>
    </section>
  )
}
