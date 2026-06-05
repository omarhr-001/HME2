'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, BadgePercent, Clock3, ShoppingBag } from 'lucide-react'
import { getTopOffers, type Offer } from '@/lib/offers'

function formatPrice(value: number) {
  return `${Number(value || 0).toLocaleString('fr-FR')} DT`
}

function PromoSkeleton() {
  return (
    <section className="px-4 md:px-[5%] py-10 md:py-14">
      <div className="mb-7 h-8 w-56 animate-pulse rounded bg-gray-200" />
      <div className="grid gap-4 lg:grid-cols-[1.4fr_0.9fr]">
        <div className="h-64 md:h-80 animate-pulse rounded-lg bg-gray-200" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
          <div className="h-32 md:h-38 animate-pulse rounded-lg bg-gray-200" />
          <div className="h-32 md:h-38 animate-pulse rounded-lg bg-gray-200" />
        </div>
      </div>
    </section>
  )
}

function SmallOfferCard({ offer }: { offer: Offer }) {
  const productCount = offer.products?.length || 0
  const previewImage = offer.image || offer.products?.find((product) => product.image_url)?.image_url

  return (
    <Link
      href="/products"
      className="group relative flex min-h-40 flex-col justify-between overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 text-gray-900 no-underline shadow-sm transition hover:-translate-y-1 hover:border-green-200 hover:shadow-lg"
    >
      {previewImage && (
        <Image
          src={previewImage}
          alt={offer.title}
          fill
          sizes="(min-width: 1024px) 34vw, 90vw"
          className="object-cover opacity-5 transition group-hover:scale-105 group-hover:opacity-8"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-br from-white via-white/97 to-white/90" />
      <div className="relative z-10 flex h-full flex-col justify-between">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-green-700">
              <BadgePercent size={14} />
              Promotion
            </p>
            <h3 className="line-clamp-2 text-lg font-bold leading-tight text-gray-900">
              {offer.title}
            </h3>
          </div>
          {offer.discount > 0 && (
            <span className="shrink-0 rounded-full bg-green-100 px-3 py-1 text-sm font-bold text-green-700">
              -{offer.discount}%
            </span>
          )}
        </div>

        <div className="mt-4 flex items-center justify-between gap-3 text-sm text-gray-500">
          <span className="flex items-center gap-1.5">
            <ShoppingBag size={15} />
            {productCount} produit{productCount > 1 ? 's' : ''}
          </span>
          <ArrowRight size={17} className="text-green-700 transition group-hover:translate-x-1" />
        </div>
      </div>
    </Link>
  )
}

export function PromoBanner() {
  const [offers, setOffers] = useState<Offer[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadOffers = async () => {
      try {
        const data = await getTopOffers(3)
        setOffers(data)
      } catch (error) {
        console.error('[v0] Error loading offers:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadOffers()
  }, [])

  const mainOffer = offers[0]
  const secondaryOffers = offers.slice(1, 3)
  const featuredProducts = useMemo(() => mainOffer?.products?.slice(0, 3) || [], [mainOffer])

  if (isLoading) {
    return <PromoSkeleton />
  }

  if (!mainOffer) {
    return null
  }

  return (
    <section className="px-4 md:px-[5%] py-10 md:py-14">
      <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-green-600">
            <BadgePercent size={15} />
            Offres sélectionnées
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">Découvrez nos séjours</h2>
        </div>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 text-sm font-semibold text-green-700 no-underline transition hover:gap-3 hover:text-green-800"
        >
          Voir toutes les offres
          <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.4fr_0.9fr]">
        <article className="relative overflow-hidden rounded-2xl border border-gray-200 bg-gradient-to-br from-white via-gray-50 to-white shadow-lg transition-shadow hover:shadow-xl">
          {mainOffer.image && (
            <Image
              src={mainOffer.image}
              alt={mainOffer.title}
              fill
              sizes="(min-width: 1024px) 58vw, 90vw"
              className="object-cover opacity-8"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-br from-white/85 via-white/75 to-white/60" />

          <div className="relative z-10 grid min-h-64 md:min-h-80 gap-6 md:gap-8 p-6 md:p-10 lg:grid-cols-[1fr_0.85fr]">
            <div className="flex flex-col justify-between gap-8">
              <div>
                <div className="mb-6 flex flex-wrap items-center gap-3">
                  {mainOffer.discount > 0 && (
                    <span className="rounded-full bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 px-4 py-2 text-sm font-bold text-green-700">
                      Jusqu'à -{mainOffer.discount}%
                    </span>
                  )}
                  <span className="flex items-center gap-2 rounded-full bg-gray-100 px-3.5 py-2 text-xs font-semibold text-gray-700">
                    <Clock3 size={14} className="text-gray-500" />
                    Jusqu'au {mainOffer.expiresAt}
                  </span>
                </div>
                <h3 className="max-w-2xl text-3xl md:text-4xl font-bold leading-tight text-gray-900">
                  {mainOffer.title}
                </h3>
                {mainOffer.description && (
                  <p className="mt-4 max-w-lg text-base leading-7 text-gray-600">
                    {mainOffer.description}
                  </p>
                )}
              </div>

              <Link href="/products" className="btn-primary w-fit bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg px-6 py-3 transition">
                Découvrir l'offre
              </Link>
            </div>

            {featuredProducts.length > 0 && (
              <div className="grid content-end gap-3">
                {featuredProducts.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
                        {product.image_url ? (
                          <Image src={product.image_url} alt={product.name} fill sizes="64px" className="object-cover" />
                        ) : (
                          <div className="grid h-full w-full place-items-center text-xs font-semibold text-gray-400">Image</div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-gray-900">{product.name}</p>
                        <p className="text-xs text-gray-600">
                          {formatPrice(product.price)}
                          {product.originalPrice > product.price && (
                            <span className="ml-2 line-through opacity-70">{formatPrice(product.originalPrice)}</span>
                          )}
                        </p>
                      </div>
                    </div>
                    {product.discount > 0 && (
                      <span className="shrink-0 rounded-full bg-green-50 border border-green-200 px-2.5 py-1 text-xs font-bold text-green-700">
                        -{product.discount}%
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </article>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
          {secondaryOffers.length > 0 ? (
            secondaryOffers.map((offer) => <SmallOfferCard key={offer.id} offer={offer} />)
          ) : (
            <SmallOfferCard offer={mainOffer} />
          )}
        </div>
      </div>
    </section>
  )
}
