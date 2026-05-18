'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { getTopOffers, type Offer } from '@/lib/offers'

export function PromoBanner() {
  const [topOffer, setTopOffer] = useState<Offer | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadOffer = async () => {
      try {
        const offers = await getTopOffers(1)
        if (offers.length > 0) {
          setTopOffer(offers[0])
        }
      } catch (error) {
        console.error('[v0] Error loading top offer:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadOffer()
  }, [])

  if (isLoading) {
    return (
      <section className="mx-[5%] mb-10 bg-gradient-to-br from-gray-800 to-teal-900 rounded-2xl p-12 h-40 animate-pulse" />
    )
  }

  if (!topOffer) {
    return null
  }

  return (
    <section className="mx-[5%] mb-10 rounded-2xl overflow-hidden relative group">
      {/* Background image */}
      {topOffer.image && (
        <div className="absolute inset-0 w-full h-full">
          <Image
            src={topOffer.image}
            alt={topOffer.title}
            fill
            className="object-cover opacity-30 group-hover:opacity-40 transition-opacity duration-500"
          />
        </div>
      )}

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-gray-900/95 via-teal-900/85 to-teal-900/70" />

      {/* Content */}
      <div className="relative z-10 p-12 flex items-center justify-between">
        <div>
          <p className="text-xs font-bold text-green-500 uppercase tracking-wider mb-2">
            {topOffer.title}
          </p>
          <h3 className="text-4xl font-bold text-white mb-3" style={{ fontFamily: 'Syne' }}>
            Jusqu'à <span className="text-green-500">{topOffer.discount}% de réduction</span>
          </h3>
          <p className="text-base text-white/70">{topOffer.description}</p>
        </div>

        <Link 
          href="/products"
          className="btn-primary relative z-10 flex-shrink-0 ml-6"
        >
          Découvrir l'offre
        </Link>
      </div>
    </section>
  )
}
