'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Percent, Clock, Sparkles } from 'lucide-react'
import { getTopOffers, type Offer } from '@/lib/offers'

export function Hero() {
  const [topOffers, setTopOffers] = useState<Offer[]>([])
  const [maxDiscount, setMaxDiscount] = useState(0)

  useEffect(() => {
    const offers = getTopOffers(3)
    setTopOffers(offers)
    const maxDisc = Math.max(...offers.map(o => o.discount))
    setMaxDiscount(maxDisc)
  }, [])

  return (
    <section className="relative bg-gradient-to-br from-gray-800 via-gray-900 to-blue-gray-900 pt-32 pb-20 px-[5%] min-h-screen flex items-center overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute -top-30 -right-20 w-96 h-96 rounded-full opacity-10 pointer-events-none" style={{
        background: 'radial-gradient(circle, rgba(34,197,94,0.12) 0%, transparent 70%)'
      }} />
      <div className="absolute -bottom-15 left-1/3 w-64 h-64 rounded-full opacity-5 pointer-events-none" style={{
        background: 'radial-gradient(circle, rgba(34,197,94,0.07) 0%, transparent 70%)'
      }} />

      <div className="w-full max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-8">
        {/* Left content */}
        <div className="max-w-2xl relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 bg-green-500/15 border border-green-500/30 text-green-500 px-3.5 py-1 rounded-full text-xs font-bold tracking-wider uppercase mb-6 animate-fade-in-up" style={{ animationDelay: '0s' }}>
            <Sparkles size={14} /> Nouvelle Collection
          </div>

          {/* Heading */}
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-5 leading-tight animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            Équipez votre maison avec les meilleurs <span className="text-green-500">appareils électroménagers</span>
          </h1>

          {/* Description */}
          <p className="text-lg text-white/65 leading-relaxed mb-9 max-w-md animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            Découvrez notre large sélection d&apos;équipements de qualité supérieure pour votre cuisine, votre buanderie et plus encore.
          </p>

          {/* Buttons */}
          <div className="flex gap-3.5 flex-wrap animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <button className="btn-primary flex items-center gap-2">
              Explorez les produits
              <ArrowRight size={18} />
            </button>
            <button className="btn-secondary">
              En savoir plus
            </button>
          </div>
        </div>

        {/* Floating Special Offers Card */}
        <div className="relative z-10 animate-fade-in-up lg:mr-8" style={{ animationDelay: '0.4s' }}>
          <div className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-6 w-80 shadow-2xl">
            {/* Glow effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-2xl blur-xl opacity-50" />
            
            <div className="relative">
              {/* Header */}
              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/30">
                  <Percent className="text-white" size={24} />
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg">Offres Spéciales</h3>
                  <p className="text-white/60 text-sm">Économisez jusqu&apos;à {maxDiscount}%</p>
                </div>
              </div>

              {/* Offers list */}
              <div className="space-y-3 mb-5">
                {topOffers.length > 0 ? (
                  topOffers.map((offer) => (
                    <div key={offer.id} className="bg-white/10 rounded-xl p-3 border border-white/10 hover:border-green-500/30 transition-colors cursor-pointer group">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white font-medium text-sm group-hover:text-green-400 transition-colors">{offer.title}</p>
                          <p className="text-white/50 text-xs">{offer.description}</p>
                        </div>
                        <span className="bg-green-500/20 text-green-400 text-xs font-bold px-2 py-1 rounded-full">-{offer.discount}%</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-white/50 text-sm text-center py-4">Chargement des offres...</div>
                )}
              </div>

              {/* Timer */}
              <div className="flex items-center gap-2 text-white/60 text-xs mb-4">
                <Clock size={14} className="text-green-500" />
                <span>Offre valable jusqu&apos;au {topOffers[0]?.expiresAt || '31 Mai 2026'}</span>
              </div>

              {/* CTA */}
              <Link href="/products?filter=promo" className="block w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white text-center font-semibold py-3 rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg shadow-green-500/25 hover:shadow-green-500/40">
                Voir toutes les offres
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
