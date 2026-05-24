'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Percent, Clock, Sparkles } from 'lucide-react'
import { getTopOffers, type Offer } from '@/lib/offers'

export function Hero() {
  const [topOffers, setTopOffers] = useState<Offer[]>([])
  const [maxDiscount, setMaxDiscount] = useState(0)

  useEffect(() => {
    const loadOffers = async () => {
      const offers = await getTopOffers(3)
      setTopOffers(offers)
      const maxDisc = offers.length > 0 ? Math.max(...offers.map(o => o.discount)) : 0
      setMaxDiscount(maxDisc)
    }
    loadOffers()
  }, [])

  return (
    <section className="relative pt-32 pb-20 px-[5%] min-h-screen flex items-center overflow-hidden">
      {/* Background image with elegant overlay */}
      <div className="absolute inset-0 w-full h-full">
        <Image
          src="/hero-bg.jpg"
          alt="Modern home interior"
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Multi-layer gradient overlay for elegance */}
      <div className="absolute inset-0 bg-gradient-to-r from-gray-900/95 via-gray-900/80 to-gray-900/70" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-900/40 to-gray-900/80" />
      
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
          <div className="inline-flex items-center gap-1.5 bg-indigo-100 border border-indigo-300 text-indigo-700 px-4 py-2 rounded-lg text-xs font-bold tracking-wider uppercase mb-6 animate-fade-in-up" style={{ animationDelay: '0s' }}>
            <Sparkles size={14} /> Nouvelle Collection
          </div>

          {/* Heading */}
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-5 leading-tight animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            Transformez votre intérieur avec nos <span className="text-indigo-400">meubles et électroménagers</span>
          </h1>

          {/* Description */}
          <p className="text-lg text-white/65 leading-relaxed mb-9 max-w-md animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            Explorez notre collection complète de meubles élégants et d&apos;appareils électroménagers innovants pour créer la maison de vos rêves.
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
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-2xl blur-xl opacity-50" />

            <div className="relative">
              {/* Header */}
              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                  <Percent className="text-white" size={24} />
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg">Offres Spéciales</h3>
                  <p className="text-white/60 text-sm">Économisez jusqu&apos;à {maxDiscount}%</p>
                </div>
              </div>

              {/* Offers list */}
              <div className="space-y-4 mb-5">
                {topOffers.length > 0 ? (
                  topOffers.map((offer) => (
                    <div 
                      key={offer.id} 
                      className="relative rounded-xl overflow-hidden border border-white/15 hover:border-indigo-400/50 transition-all duration-300 group cursor-pointer hover:shadow-xl hover:shadow-indigo-500/20"
                    >
                      {/* Background with offer image */}
                      {offer.image && (
                        <div className="absolute inset-0 w-full h-full">
                          <Image
                            src={offer.image}
                            alt={offer.title}
                            fill
                            className="object-cover opacity-40 group-hover:opacity-50 transition-opacity duration-300"
                          />
                        </div>
                      )}
                      
                      {/* Gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-r from-gray-900/95 via-gray-900/85 to-gray-900/70" />
                      
                      {/* Content */}
                      <div className="relative p-4 space-y-3">
                        {/* Header */}
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="text-white font-bold text-base group-hover:text-green-400 transition-colors">{offer.title}</h4>
                            <p className="text-white/60 text-xs leading-relaxed">{offer.description}</p>
                          </div>
                          <span className="flex-shrink-0 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xs font-bold px-3 py-1.5 rounded-full ml-2 whitespace-nowrap">
                            -{offer.discount}%
                          </span>
                        </div>

                        {/* Products showcase */}
                        {offer.products && offer.products.length > 0 && (
                          <div className="grid grid-cols-3 gap-2 pt-1">
                            {offer.products.slice(0, 3).map((product) => (
                              <div 
                                key={product.id} 
                                className="group/product bg-white/10 backdrop-blur-sm rounded-lg p-2 border border-white/20 hover:border-indigo-400/60 hover:bg-white/15 transition-all duration-200 hover:shadow-lg hover:shadow-indigo-500/10"
                              >
                                <div className="flex flex-col h-full">
                                  <p className="text-white/90 text-xs font-medium line-clamp-2 mb-2 group-hover/product:text-indigo-300 transition-colors">{product.name}</p>
                                  <div className="mt-auto flex items-baseline gap-1">
                                    <span className="text-indigo-400 text-sm font-bold">{product.price.toFixed(2)}</span>
                                    <span className="text-white/50 text-xs">DT</span>
                                  </div>
                                  {product.originalPrice && product.originalPrice > product.price && (
                                    <span className="text-white/40 text-xs line-through">{product.originalPrice.toFixed(2)} DT</span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-white/50 text-sm text-center py-6">Chargement des offres...</div>
                )}
              </div>

              {/* Timer */}
              <div className="flex items-center gap-2 text-white/60 text-xs mb-4">
                <Clock size={14} className="text-indigo-400" />
                <span>Offre valable jusqu&apos;au {topOffers[0]?.expiresAt || '31 Mai 2026'}</span>
              </div>

              {/* CTA */}
              <Link href="/products?filter=promo" className="block w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-center font-semibold py-3 rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40">
                Voir toutes les offres
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
