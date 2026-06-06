'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Heart, ShoppingCart } from 'lucide-react'
import { ProductDetailsModal } from './product-details-modal'
import { useCart } from '@/lib/hooks'
import { useAuth } from '@/lib/auth-context'
import { useToast } from '@/hooks/use-toast'
import { useLikedProducts } from '@/lib/hooks/use-liked-products'
import { trackAddToCart, trackViewContent } from '@/lib/meta-pixel'
import type { Product } from '@/lib/types'

interface ProductCardProps extends Product {
  onAddToCart?: (product: Product, quantity: number) => void
}

export function ProductCard({
  id,
  name,
  category,
  category_image_url,
  brand,
  price,
  originalPrice,
  image,
  image_url,
  product_images,
  description,
  specs,
  inStock,
  onAddToCart,
}: ProductCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const router = useRouter()
  const { user } = useAuth()
  const { addToCart } = useCart()
  const { toast } = useToast()
  const { likedProductIds, toggleLike, isInitialized } = useLikedProducts()

  // Check if product is liked
  useEffect(() => {
    if (isInitialized) {
      setIsWishlisted(likedProductIds.has(id))
    }
  }, [id, likedProductIds, isInitialized])

  const displayOriginalPrice = originalPrice ?? price
  const galleryImages = [
    ...new Set(
      [
        ...[...(product_images || [])]
          .sort((a, b) => a.sort_order - b.sort_order)
          .map((item) => item.image_url),
        image,
        image_url,
      ].filter(Boolean) as string[],
    ),
  ]
  const displayImage = galleryImages[activeImageIndex] || galleryImages[0] || '/placeholder.jpg'
  const displaySpecs = specs ?? {}
  const isAvailable = inStock ?? true
  const displayCategory = category || 'Produit'
  const categoryImageUrl = category_image_url
  const displayBrandName = brand?.name || displaySpecs.brand || displaySpecs.marque || ''
  const brandLogoUrl = brand?.logo_url
  const hasRealDiscount = Number.isFinite(displayOriginalPrice) && displayOriginalPrice > price

  const product: Product = {
    id,
    name,
    category: displayCategory,
    category_image_url,
    price,
    originalPrice: displayOriginalPrice,
    image: displayImage,
    image_url,
    product_images,
    brand: brand || (displayBrandName ? { id: 'spec-brand', name: displayBrandName, slug: displayBrandName.toLowerCase().replace(/[^a-z0-9]+/g, '-') } : undefined),
    description,
    specs: displaySpecs,
    inStock: isAvailable,
  }

  const discount = hasRealDiscount
    ? Math.round(((displayOriginalPrice - price) / displayOriginalPrice) * 100)
    : 0

  const handleAddToCart = async (quantity = 1) => {
    if (!user) {
      toast({
        title: 'Connexion requise',
        description: 'Veuillez vous connecter pour ajouter des articles au panier',
      })
      router.push('/auth/login')
      return
    }

    if (onAddToCart) {
      onAddToCart(product, quantity)
      trackAddToCart(product, quantity)
      return
    }

    setIsAdding(true)
    try {
      await addToCart(id, quantity)
      trackAddToCart(product, quantity)
      toast({
        title: 'Succès',
        description: `${name} a été ajouté au panier`,
      })
    } catch (error) {
      console.error('Error adding to cart:', error)
      toast({
        title: 'Erreur',
        description: 'Impossible d\'ajouter l\'article au panier',
      })
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <>
      <ProductDetailsModal
        product={product}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddToCart={(_, quantity) => handleAddToCart(quantity)}
      />

      <div
        role="button"
        tabIndex={0}
        onClick={() => {
          setIsModalOpen(true)
          trackViewContent(product)
        }}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            setIsModalOpen(true)
            trackViewContent(product)
          }
        }}
        onMouseLeave={() => setActiveImageIndex(0)}
        className="group bg-white rounded-3xl overflow-hidden border border-gray-200 transition-all duration-300 cursor-pointer hover:-translate-y-1 hover:shadow-xl hover:border-green-300 focus:outline-none focus:ring-2 focus:ring-green-300"
        aria-label={`Voir les détails de ${name}`}
      >
        <div className="relative w-full h-56 bg-gray-100 flex items-center justify-center overflow-hidden">
          <Image
            src={displayImage}
            alt={name}
            width={280}
            height={200}
            className="w-full h-full object-cover transition duration-500 group-hover:scale-[1.04]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/8 via-transparent to-black/46" />

          {discount > 0 && (
            <span className="absolute top-3 left-3 rounded-full bg-red-500 px-2.5 py-1 text-xs font-bold text-white shadow-sm">
              -{discount}%
            </span>
          )}

          {displayBrandName && (
            <span className={`absolute left-3 max-w-[70%] truncate rounded-full bg-white/92 px-2.5 py-1 text-xs font-semibold text-gray-800 shadow-sm ${discount > 0 ? 'top-12' : 'top-3'}`}>
              {displayBrandName}
            </span>
          )}

          {galleryImages.length > 1 && (
            <>
              <span className="absolute right-3 top-3 rounded-full bg-black/55 px-2.5 py-1 text-xs font-semibold text-white shadow-sm backdrop-blur">
                {activeImageIndex + 1}/{galleryImages.length}
              </span>
              <div className="absolute inset-x-3 bottom-3 flex gap-2 overflow-x-auto rounded-2xl bg-white/20 p-2 shadow-lg backdrop-blur-md">
                {galleryImages.map((imageUrl, index) => (
                  <button
                    key={imageUrl}
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation()
                      setActiveImageIndex(index)
                    }}
                    onMouseEnter={() => setActiveImageIndex(index)}
                    className={`relative h-10 w-10 shrink-0 overflow-hidden rounded-xl border bg-white/30 shadow-sm transition ${activeImageIndex === index ? 'border-white ring-2 ring-white/60' : 'border-white/50 opacity-85 hover:opacity-100'
                      }`}
                    aria-label={`Voir image ${index + 1}`}
                  >
                    <Image src={imageUrl} alt={`${name} image ${index + 1}`} fill className="object-cover" sizes="36px" />
                  </button>
                ))}
              </div>
            </>
          )}

          {!isAvailable && (
            <span className="absolute inset-0 bg-black/40 flex items-center justify-center text-white font-bold">
              Rupture de stock
            </span>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation()
              if (!user) {
                toast({
                  title: 'Connexion requise',
                  description: 'Veuillez vous connecter pour ajouter aux favoris',
                })
                router.push('/auth/login')
                return
              }
              const newState = !isWishlisted
              setIsWishlisted(newState)
              toggleLike(id)
            }}
            className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm ${isWishlisted
              ? 'bg-red-50 border-red-300 text-red-500'
              : 'bg-white border border-gray-200 text-gray-400 hover:bg-red-50 hover:border-red-300'
              }`}
            aria-label="Ajouter aux favoris"
          >
            <Heart size={14} fill={isWishlisted ? 'currentColor' : 'none'} />
          </button>
        </div>

        <div className="p-4">
          <div className="mb-2 flex flex-wrap gap-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-green-200 bg-white/90 px-2.5 py-1">
              {categoryImageUrl && (
                <div className="h-6 w-6 overflow-hidden rounded-full border border-gray-200 bg-white">
                  <Image
                    src={categoryImageUrl}
                    alt={`${displayCategory} icon`}
                    width={24}
                    height={24}
                    className="object-cover"
                  />
                </div>
              )}
              <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-green-700">{displayCategory}</span>
            </div>

            {displayBrandName && (
              <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-100/95 px-2.5 py-1">
                {brandLogoUrl && (
                  <div className="h-6 w-6 overflow-hidden rounded-full border border-gray-200 bg-white">
                    <Image
                      src={brandLogoUrl}
                      alt={`${displayBrandName} logo`}
                      width={24}
                      height={24}
                      className="object-cover"
                    />
                  </div>
                )}
                <span className="max-w-[120px] truncate text-[10px] font-semibold text-gray-600">{displayBrandName}</span>
              </div>
            )}
          </div>
          <p className="font-semibold text-sm text-gray-800 mb-1.5 line-clamp-2">{name}</p>
          {description && (
            <p className="mb-3 line-clamp-2 text-xs leading-relaxed text-gray-500">{description}</p>
          )}

          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="font-bold text-lg text-gray-800">{price.toFixed(2)} DT</span>
              {hasRealDiscount && (
                <span className="text-xs text-gray-400 line-through">{displayOriginalPrice.toFixed(2)} DT</span>
              )}
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation()
                if (isAvailable && !isAdding) handleAddToCart()
              }}
              disabled={!isAvailable || isAdding}
              className={`w-9 h-9 border-none rounded-2xl flex items-center justify-center cursor-pointer text-white text-base transition-all duration-300 shadow-md ${isAvailable && !isAdding
                ? 'bg-green-500 hover:bg-green-600 hover:scale-110'
                : 'bg-gray-300 cursor-not-allowed'
                }`}
              aria-label="Ajouter au panier"
            >
              {isAdding ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <ShoppingCart size={16} />
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
