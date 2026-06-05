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
      className="group relative flex min-h-36 flex-col justify-between overflow-hidden rounded-lg border border-red-100 bg-white p-5 text-gray-900 no-underline shadow-sm transition hover:-translate-y-0.5 hover:border-red-300 hover:shadow-md"
    >
      {previewImage && (
        <Image
          src={previewImage}
          alt={offer.title}
          fill
          sizes="(min-width: 1024px) 34vw, 90vw"
          className="object-cover opacity-10 transition group-hover:scale-105 group-hover:opacity-15"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-r from-white via-white/95 to-white/75" />
      <div className="relative z-10 flex h-full flex-col justify-between">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase text-red-700">
              <BadgePercent size={14} />
              Promotion
            </p>
            <h3 className="line-clamp-2 text-lg font-extrabold leading-tight text-gray-900">
              {offer.title}
            </h3>
          </div>
          {offer.discount > 0 && (
            <span className="shrink-0 rounded-full bg-red-100 px-3 py-1 text-sm font-extrabold text-red-700">
              -{offer.discount}%
            </span>
          )}
        </div>

        <div className="mt-5 flex items-center justify-between gap-3 text-sm text-gray-500">
          <span className="flex items-center gap-1.5">
            <ShoppingBag size={15} />
            {productCount} produit{productCount > 1 ? 's' : ''}
          </span>
          <ArrowRight size={17} className="text-red-700 transition group-hover:translate-x-1" />
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
      <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-red-700">
            <BadgePercent size={15} />
            Offres du moment
          </p>
          <h2 className="text-2xl font-extrabold text-gray-900">Offres spéciales sélectionnées</h2>
        </div>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 text-sm font-bold text-red-700 no-underline transition hover:gap-3"
        >
          Voir toutes les offres
          <ArrowRight size={16} />
        </Link>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.4fr_0.9fr]">
        <article className="relative overflow-hidden rounded-lg border border-red-200 bg-red-950 text-white shadow-sm">
          {mainOffer.image && (
            <Image
              src={mainOffer.image}
              alt={mainOffer.title}
              fill
              sizes="(min-width: 1024px) 58vw, 90vw"
              className="object-cover opacity-45"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-red-950 via-red-950/88 to-red-950/45" />

          <div className="relative z-10 grid min-h-64 md:min-h-80 gap-6 md:gap-8 p-4 sm:p-6 md:p-8 lg:grid-cols-[1fr_0.85fr]">
            <div className="flex flex-col justify-between gap-8">
              <div>
                <div className="mb-4 flex flex-wrap items-center gap-3">
                  {mainOffer.discount > 0 && (
                    <span className="rounded-full bg-red-600 px-4 py-1.5 text-sm font-extrabold text-white">
                      Jusqu'à -{mainOffer.discount}%
                    </span>
                  )}
                  <span className="flex items-center gap-1.5 rounded-full bg-white/12 px-3 py-1.5 text-xs font-bold text-white/85">
                    <Clock3 size={14} />
                    Jusqu'au {mainOffer.expiresAt}
                  </span>
                </div>
                <h3 className="max-w-xl text-xl sm:text-2xl md:text-3xl font-extrabold leading-tight md:text-4xl">
                  {mainOffer.title}
                </h3>
                {mainOffer.description && (
                  <p className="mt-3 max-w-lg text-sm leading-6 text-white/75 sm:text-base">
                    {mainOffer.description}
                  </p>
                )}
              </div>

              <Link href="/products" className="btn-primary w-fit">
                Découvrir l'offre
              </Link>
            </div>

            {featuredProducts.length > 0 && (
              <div className="grid content-end gap-2">
                {featuredProducts.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-white/10 p-3 backdrop-blur"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md border border-white/20 bg-white/15">
                        {product.image_url ? (
                          <Image src={product.image_url} alt={product.name} fill sizes="56px" className="object-cover" />
                        ) : (
                          <div className="grid h-full w-full place-items-center text-[10px] font-bold text-white/65">Image</div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-white">{product.name}</p>
                        <p className="text-xs text-white/60">
                          {formatPrice(product.price)}
                          {product.originalPrice > product.price && (
                            <span className="ml-2 line-through">{formatPrice(product.originalPrice)}</span>
                          )}
                        </p>
                      </div>
                    </div>
                    {product.discount > 0 && (
                      <span className="shrink-0 rounded-full bg-white px-2.5 py-1 text-xs font-extrabold text-red-700">
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
