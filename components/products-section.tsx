'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, ArrowUpRight } from 'lucide-react'

const propertyStyles = [
  {
    id: 'villas',
    title: 'Villas & maisons',
    description: 'Des espaces pour se retrouver et grandir.',
    image: '/real-estate/property-villa.png',
    alt: 'Villa méditerranéenne entourée de verdure',
  },
  {
    id: 'appartements',
    title: 'Appartements',
    description: 'La lumière et le confort au quotidien.',
    image: '/real-estate/property-apartment.png',
    alt: 'Salon lumineux ouvert sur un balcon',
  },
  {
    id: 'bord-de-mer',
    title: 'Maisons de bord de mer',
    description: 'Un autre rythme, à quelques pas de l’horizon.',
    image: '/real-estate/property-coastal.png',
    alt: 'Maison côtière blanche avec une cour fleurie',
  },
]

function normalizeText(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
}

interface ProductsSectionProps {
  searchQuery: string
}

export function ProductsSection({ searchQuery }: ProductsSectionProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const normalizedQuery = normalizeText(searchQuery.trim())
  const displayedProperties = useMemo(
    () => propertyStyles.filter((property) => {
      const matchesCategory = selectedCategory === null || property.id === selectedCategory
      const searchableText = normalizeText(`${property.title} ${property.description}`)
      return matchesCategory && searchableText.includes(normalizedQuery)
    }),
    [normalizedQuery, selectedCategory],
  )

  return (
    <section id="biens" className="scroll-mt-32 px-4 py-12 md:px-[5%] md:py-16">
      <div className="mb-7 flex items-end justify-between gap-4">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-brand-gold-deep">Nos univers</p>
          <h2 className="font-display text-3xl font-semibold text-brand-ink md:text-4xl">Des lieux à votre image.</h2>
          <p className="mt-2 text-sm text-brand-muted">Découvrez les univers qui peuvent accueillir votre prochain chapitre.</p>
        </div>
        <Link href="/#projet" className="hidden shrink-0 items-center gap-1 text-sm font-semibold text-brand-ink transition hover:gap-2 hover:text-brand-gold-deep sm:flex">
          Votre projet <ArrowRight aria-hidden="true" size={16} />
        </Link>
      </div>

      <div className="-mx-[5%] mb-8 flex gap-0 overflow-x-auto border-b border-brand-ink/10 px-[5%] pb-2">
        <button
          type="button"
          onClick={() => setSelectedCategory(null)}
          aria-pressed={selectedCategory === null}
          className={`whitespace-nowrap border-b-2 px-5 py-3.5 text-xs font-medium transition-colors ${selectedCategory === null ? 'border-brand-gold text-brand-gold-deep' : 'border-transparent text-brand-muted hover:text-brand-ink'}`}
        >
          Tous les univers
        </button>
        {propertyStyles.map((property) => (
          <button
            key={property.id}
            type="button"
            onClick={() => setSelectedCategory(property.id)}
            aria-pressed={selectedCategory === property.id}
            className={`flex items-center gap-2 whitespace-nowrap border-b-2 px-5 py-3.5 text-xs font-medium transition-colors ${selectedCategory === property.id ? 'border-brand-gold text-brand-gold-deep' : 'border-transparent text-brand-muted hover:text-brand-ink'}`}
          >
            <span aria-hidden="true" className="inline-flex size-7 items-center justify-center rounded-full border border-brand-gold/30 bg-brand-gold/10 text-[10px] font-semibold text-brand-gold-deep">
              {property.title.slice(0, 1)}
            </span>
            {property.title}
          </button>
        ))}
      </div>

      {displayedProperties.length === 0 ? (
        <div className="rounded-2xl border border-brand-ink/10 bg-brand-paper px-5 py-10 text-center">
          <p className="font-display text-2xl font-semibold text-brand-ink">Aucun univers ne correspond à votre recherche.</p>
          <p className="mt-3 text-sm text-brand-muted">Essayez une autre recherche dans la barre ci-dessus.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-5 lg:grid-cols-3">
          {displayedProperties.map((property, index) => (
            <article key={property.id} className="group overflow-hidden rounded-2xl border border-brand-ink/10 bg-brand-paper transition duration-300 hover:-translate-y-1 hover:border-brand-gold/50 hover:shadow-xl hover:shadow-brand-ink/10">
              <div className="relative h-56 overflow-hidden bg-brand-ink sm:h-64">
                <Image
                  src={property.image}
                  alt={property.alt}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition duration-500 group-hover:scale-[1.04]"
                />
                <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-brand-ink/55 via-transparent to-transparent" />
                <span className="absolute left-4 top-4 rounded-full border border-white/25 bg-brand-ink/50 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-white backdrop-blur">
                  0{index + 1} · Romdhani Immobilier
                </span>
              </div>
              <div className="p-5">
                <h3 className="font-display text-2xl font-semibold text-brand-ink">{property.title}</h3>
                <p className="mt-2 min-h-12 text-sm leading-6 text-brand-muted">{property.description}</p>
                <Link href="/#projet" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-brand-ink transition-colors hover:text-brand-gold-deep">
                  Explorer cet univers <ArrowUpRight aria-hidden="true" className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}
