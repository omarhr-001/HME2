'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Heart, ShoppingCart } from 'lucide-react'
import { ProductDetailsModal } from './product-details-modal'
import { getCurrentUser } from '@/lib/auth'
import type { Product } from '@/lib/types'

interface ProductCardProps extends Product {
  onAddToCart: (product: Product, quantity: number) => void
}

export function ProductCard({
  id,
  name,
  category,
  price,
  originalPrice,
  image,
  rating,
  reviews,
  description,
  specs,
  inStock,
  onAddToCart
}: ProductCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const router = useRouter()

  const product: Product = {
    id,
    name,
    category,
    price,
    originalPrice,
    image,
    rating,
    reviews,
    description,
    specs,
    inStock
  }
  
  const discount = Math.round(((originalPrice - price) / originalPrice) * 100)

  const handleAddToCartFromCard = async () => {
    const user = await getCurrentUser()
    if (!user) {
      router.push('/auth/login')
      return
    }
    onAddToCart(product, 1)
  }

  const handleAddToCartFromModal = async (product: Product, quantity: number) => {
    const user = await getCurrentUser()
    if (!user) {
      router.push('/auth/login')
      return
    }
    
    const cart = JSON.parse(localStorage.getItem('cart') || '[]')
    const existingItem = cart.find((item: any) => item.id === product.id)

    if (existingItem) {
      existingItem.quantity += quantity
    } else {
      cart.push({ ...product, quantity })
    }

    localStorage.setItem('cart', JSON.stringify(cart))
    window.dispatchEvent(new Event('cartUpdated'))
  }

  return (
    <>
      <ProductDetailsModal
        product={product}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddToCart={handleAddToCartFromModal}
      />

      <div 
        onClick={() => setIsModalOpen(true)}
        className="bg-white rounded-3xl overflow-hidden border border-gray-200 transition-all duration-300 cursor-pointer hover:-translate-y-1 hover:shadow-xl hover:border-green-300"
      >
        {/* Image Container */}
        <div className="relative w-full h-48 bg-gray-100 flex items-center justify-center overflow-hidden">
          <Image
            src={image}
            alt={name}
            width={280}
            height={200}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/4" />

          {/* Discount Badge */}
          {discount > 0 && (
            <span className="absolute top-3 left-3 bg-red-500 text-white px-2.5 py-0.5 rounded-full text-xs font-bold">
              -{discount}%
            </span>
          )}
          
          {/* Stock Status */}
          {!inStock && (
            <span className="absolute inset-0 bg-black/40 flex items-center justify-center text-white font-bold">
              Rupture de stock
            </span>
          )}

          {/* Wishlist Button */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              setIsWishlisted(!isWishlisted)
            }}
            className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm ${
              isWishlisted 
                ? 'bg-red-50 border-red-300 text-red-500' 
                : 'bg-white border border-gray-200 text-gray-400 hover:bg-red-50 hover:border-red-300'
            }`}
          >
            <Heart size={14} fill={isWishlisted ? 'currentColor' : 'none'} />
          </button>
        </div>

        {/* Info */}
        <div className="p-4">
          <p className="text-xs text-green-700 font-bold uppercase tracking-wider mb-1">{category}</p>
          <p className="font-semibold text-sm text-gray-800 mb-1.5 line-clamp-2">{name}</p>

          {/* Rating */}
          <div className="flex items-center gap-1.5 mb-3">
            <div className="flex items-center gap-0.5">
              {[...Array(5)].map((_, i) => (
                <span key={i} className="text-amber-400 text-xs">
                  {i < Math.floor(rating) ? '★' : '☆'}
                </span>
              ))}
            </div>
            <span className="text-xs text-gray-500">({reviews})</span>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="font-bold text-lg text-gray-800">{price.toFixed(2)} DT</span>
              {originalPrice > price && (
                <span className="text-xs text-gray-400 line-through">{originalPrice.toFixed(2)} DT</span>
              )}
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation()
                if (inStock) handleAddToCartFromCard()
              }}
              disabled={!inStock}
              className={`w-9 h-9 border-none rounded-2xl flex items-center justify-center cursor-pointer text-white text-base transition-all duration-300 shadow-md ${
                inStock 
                  ? 'bg-green-500 hover:bg-green-600 hover:scale-110' 
                  : 'bg-gray-300 cursor-not-allowed'
              }`}
            >
              <ShoppingCart size={16} />
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
