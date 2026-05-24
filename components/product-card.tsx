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
import type { Product } from '@/lib/types'

interface ProductCardProps extends Product {
  onAddToCart?: (product: Product, quantity: number) => void
}

export function ProductCard({
  id,
  name,
  category,
  brand,
  price,
  originalPrice,
  image,
  image_url,
  description,
  specs,
  inStock,
  onAddToCart,
}: ProductCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
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
  const displayImage = image || image_url || '/placeholder.jpg'
  const displaySpecs = specs ?? {}
  const isAvailable = inStock ?? true
  const displayCategory = category || 'Produit'

  const product: Product = {
    id,
    name,
    category: displayCategory,
    price,
    originalPrice: displayOriginalPrice,
    image: displayImage,
    image_url,
    brand,
    description,
    specs: displaySpecs,
    inStock: isAvailable,
  }

  const discount = displayOriginalPrice > price
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
      return
    }

    setIsAdding(true)
    try {
      await addToCart(id, quantity)
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
        onClick={() => setIsModalOpen(true)}
        className="bg-white rounded-xl overflow-hidden border border-gray-200 transition-all duration-300 cursor-pointer hover:shadow-lg hover:border-indigo-300 hover:-translate-y-1"
      >
        <div className="relative w-full h-48 bg-gray-100 flex items-center justify-center overflow-hidden">
          <Image
            src={displayImage}
            alt={name}
            width={280}
            height={200}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/4" />

          {discount > 0 && (
            <span className="absolute top-3 left-3 bg-indigo-600 text-white px-3 py-1 rounded-lg text-xs font-bold shadow-md">
              -{discount}%
            </span>
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
              ? 'bg-red-50 border border-red-300 text-red-500'
              : 'bg-white border border-gray-200 text-gray-400 hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-600'
              }`}
            aria-label="Ajouter aux favoris"
          >
            <Heart size={14} fill={isWishlisted ? 'currentColor' : 'none'} />
          </button>
        </div>

        <div className="p-4">
          <p className="text-xs text-indigo-700 font-bold uppercase tracking-wider mb-2">{displayCategory}</p>
          {brand && (
            <p className="text-xs text-gray-500 font-medium mb-2">Marque: {brand.name}</p>
          )}
          <p className="font-semibold text-sm text-gray-800 mb-3 line-clamp-2">{name}</p>

          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="font-bold text-lg text-gray-900">{price.toFixed(2)} DT</span>
              {displayOriginalPrice > price && (
                <span className="text-xs text-gray-400 line-through">{displayOriginalPrice.toFixed(2)} DT</span>
              )}
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation()
                if (isAvailable && !isAdding) handleAddToCart()
              }}
              disabled={!isAvailable || isAdding}
              className={`w-10 h-10 border-none rounded-lg flex items-center justify-center cursor-pointer text-white text-base transition-all duration-300 shadow-md ${isAvailable && !isAdding
                ? 'bg-indigo-600 hover:bg-indigo-700 hover:scale-110'
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
