'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, ArrowLeft, Percent, Clock } from 'lucide-react'
import { getTopOffers, type Offer } from '@/lib/offers'

export function Hero() {
  const [topOffers, setTopOffers] = useState<Offer[]>([])
  const [maxDiscount, setMaxDiscount] = useState(0)
  let offersEl: HTMLDivElement | null = null

  useEffect(() => {
    const loadOffers = async () => {
      const offers = await getTopOffers(3)
      setTopOffers(offers)
      const maxDisc = offers.length > 0 ? Math.max(...offers.map((offer) => offer.discount)) : 0
      setMaxDiscount(maxDisc)
    }

    loadOffers()
  }, [])

  const scrollByAmount = (amount: number) => {
    const el = offersEl
    if (!el) return
    el.scrollBy({ left: amount, behavior: 'smooth' })
  }

  const handlePrev = () => scrollByAmount(-240)
  const handleNext = () => scrollByAmount(240)

  return (
    <section className="relative pt-24 md:pt-32 pb-16 md:pb-20 px-4 md:px-[5%] min-h-screen flex items-center overflow-hidden">
      <div className="absolute inset-0 w-full h-full">
        <video
          autoPlay
          muted
          loop
          className="w-full h-full object-cover"
        >
          <source src="/affiche4.mp4" type="video/mp4" />
        </video>
      </div>

      <div className="absolute inset-0 bg-gradient-to-r from-gray-900/30 via-gray-900/20 to-gray-900/10" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-900/10 to-gray-900/30" />

      <div
        className="absolute -top-30 -right-20 w-96 h-96 rounded-full opacity-10 pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(220,38,38,0.14) 0%, transparent 70%)' }}
      />
      <div
        className="absolute -bottom-15 left-1/3 w-64 h-64 rounded-full opacity-5 pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(220,38,38,0.08) 0%, transparent 70%)' }}
      />

      <div className="w-full max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-8 px-4 md:px-0">
        <div className="max-w-2xl relative z-10">
          <div className="flex gap-3.5 flex-wrap animate-fade-in-up" style={{ animationDelay: '0.3s' }}>

          </div>
        </div>

        <div className="relative z-10 animate-fade-in-up lg:mr-8 w-full md:w-auto" style={{ animationDelay: '0.4s' }}>
          <div className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-4 md:p-6 w-full md:w-96 shadow-2xl">
            <div className="absolute -inset-1 bg-gradient-to-r from-red-500/25 to-rose-500/20 rounded-2xl blur-xl opacity-60" />

            <div className="relative">
              <div className="flex items-center gap-3 mb-10">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-rose-700 flex items-center justify-center shadow-lg shadow-red-500/30">
                  <Percent className="text-white" size={24} />
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg">Offres Spéciales !</h3>
                  <p className="text-white/60 text-sm">Économisez jusqu&apos;à {maxDiscount}%</p>
                </div>
              </div>

              <div className="mb-5">
                {topOffers.length > 0 ? (
                  <div className="relative group">
                    <div className="flex gap-4 overflow-x-auto scrollbar-hide items-stretch" ref={(el) => { offersEl = el }}>
                      {topOffers.map((offer) => {
                        return (
                          <div
                            key={offer.id}
                            className="min-w-[320px] shrink-0 relative rounded-2xl overflow-hidden border border-white/15 hover:border-red-400/60 transition-all duration-300 group cursor-pointer hover:shadow-xl hover:shadow-red-500/20"
                          >
                            {offer.image && (
                              <div className="absolute inset-0 w-full h-full">
                                <Image
                                  src={offer.image}
                                  alt={offer.title}
                                  fill
                                  sizes="320px"
                                  className="object-cover opacity-40 group-hover:opacity-50 transition-opacity duration-300"
                                />
                              </div>
                            )}

                            <div className="absolute inset-0 bg-gradient-to-r from-gray-950/96 via-gray-950/86 to-red-950/70" />

                            <div className="relative p-4 space-y-3">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <h4 className="text-white font-bold text-base group-hover:text-red-300 transition-colors">{offer.title}</h4>
                                  <p className="text-white/60 text-xs leading-relaxed">{offer.description}</p>
                                </div>
                                {offer.discount > 0 && (
                                  <span className="flex-shrink-0 bg-gradient-to-r from-red-500 to-rose-700 text-white text-xs font-bold px-3 py-1.5 rounded-full ml-2 whitespace-nowrap">
                                    -{offer.discount}%
                                  </span>
                                )}
                              </div>

                              {offer.products && offer.products.length > 0 && (
                                <div className="pt-2 -mx-3">
                                  <div className="relative overflow-x-auto px-3 scrollbar-hide">
                                    <div className="flex flex-nowrap gap-4 items-start snap-x snap-mandatory">
                                      {offer.products.slice(0, 3).map((product) => {
                                        return (
                                          <div
                                            key={product.id}
                                            className={`shrink-0 snap-start w-[200px] relative group/product overflow-hidden rounded-lg border border-white/15 bg-white/5 transition-transform duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-red-500/20`}
                                          >
                                            <div className={`h-40 relative w-full bg-white/5`}>
                                              {product.image_url ? (
                                                <Image
                                                  src={product.image_url}
                                                  alt={product.name}
                                                  fill
                                                  sizes={'200px'}
                                                  className="object-cover transition-transform duration-400 group-hover/product:scale-110"
                                                />
                                              ) : (
                                                <div className="grid h-full w-full place-items-center text-[12px] font-bold text-white/50">Image</div>
                                              )}
                                            </div>

                                            <div className="p-2 flex flex-col h-full">
                                              <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                  <h5 className="text-white font-semibold text-sm line-clamp-2 group-hover/product:text-red-200 transition-colors">{product.name}</h5>
                                                  <p className="text-white/60 text-xs mt-1 line-clamp-2">{(product as any).short_description || (product as any).description || ''}</p>
                                                </div>
                                                {product.discount > 0 && (
                                                  <span className="flex-shrink-0 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-md ml-2">-{product.discount}%</span>
                                                )}
                                              </div>

                                              <div className="mt-auto flex items-center justify-between gap-2 pt-3">
                                                <div>
                                                  <span className="text-red-300 text-base font-bold">{product.price.toFixed(2)}</span>
                                                  <span className="text-white/50 text-xs ml-1">DT</span>
                                                </div>
                                                {/* buttons removed: view and add-to-cart */}
                                              </div>

                                              {product.originalPrice && product.originalPrice > product.price && (
                                                <span className="text-white/40 text-xs line-through mt-2">{product.originalPrice.toFixed(2)} DT</span>
                                              )}
                                            </div>
                                          </div>
                                        )
                                      })}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    {/* nav buttons */}
                    <button aria-label="Précédent" onClick={handlePrev} className="absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-white/10 hover:bg-white/20 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto">
                      <ArrowLeft size={16} />
                    </button>
                    <button aria-label="Suivant" onClick={handleNext} className="absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-white/10 hover:bg-white/20 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto">
                      <ArrowRight size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="text-white/50 text-sm text-center py-6">Chargement des offres...</div>
                )}
              </div>

              <div className="flex items-center gap-2 text-white/60 text-xs mb-4">
                <Clock size={14} className="text-red-400" />
                <span>Offre valable jusqu&apos;au {topOffers[0]?.expiresAt || '31 Mai 2026'}</span>
              </div>

              <Link href="/products?filter=promo" className="block w-full bg-gradient-to-r from-red-500 to-rose-700 text-white text-center font-semibold py-3 rounded-xl hover:from-red-600 hover:to-rose-800 transition-all shadow-lg shadow-red-500/25 hover:shadow-red-500/40">
                Voir toutes les offres
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
