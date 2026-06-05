'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'
import { Heart, ShoppingCart, X, Check } from 'lucide-react'
import type { Product } from '@/lib/types'

interface ProductDetailsModalProps {
  product: Product | null
  isOpen: boolean
  onClose: () => void
  onAddToCart: (product: Product, quantity: number) => void
}

export function ProductDetailsModal({
  product,
  isOpen,
  onClose,
  onAddToCart,
}: ProductDetailsModalProps) {
  const [mounted, setMounted] = useState(false)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [addedToCart, setAddedToCart] = useState(false)
  const [activeImageIndex, setActiveImageIndex] = useState(0)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    setActiveImageIndex(0)
  }, [product?.id])

  if (!mounted || !isOpen || !product) return null

  const originalPrice = product.originalPrice ?? product.price
  const productImages = [
    ...new Set(
      [
        ...[...(product.product_images || [])]
          .sort((a, b) => a.sort_order - b.sort_order)
          .map((item) => item.image_url),
        product.image,
        product.image_url,
      ].filter(Boolean) as string[],
    ),
  ]
  const productImage = productImages[activeImageIndex] || productImages[0] || '/placeholder.jpg'
  const productInStock = product.inStock ?? true
  const productCategory = product.category || 'Produit'
  const productBrandName = product.brand?.name || product.specs?.brand || product.specs?.marque || ''
  const productBrandLogoUrl = product.brand?.logo_url
  const discount = originalPrice > product.price
    ? Math.round(((originalPrice - product.price) / originalPrice) * 100)
    : 0

  const handleAddToCart = () => {
    onAddToCart(product, 1)
    setAddedToCart(true)
    setTimeout(() => {
      setAddedToCart(false)
    }, 2000)
  }

  return createPortal(
    <>
      <div
        className="fixed inset-0 bg-black/40 z-40 transition-opacity duration-300"
        onClick={onClose}
      />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="bg-white rounded-3xl shadow-2xl max-h-[90vh] max-w-2xl w-full overflow-y-auto pointer-events-auto animate-in fade-in zoom-in-95 duration-300"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="sticky top-0 bg-white flex items-center justify-between p-6 border-b border-gray-200 z-10">
            <h2 className="text-xl font-bold text-gray-800">Details du produit</h2>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
              aria-label="Fermer"
            >
              <X size={24} className="text-gray-600" />
            </button>
          </div>

          <div className="p-6">
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="relative w-full aspect-square bg-gray-100 rounded-2xl overflow-hidden border border-gray-200">
                  <Image
                    src={productImage}
                    alt={product.name}
                    fill
                    loading="eager"
                    className="w-full h-full object-cover"
                  />
                  {productImages.length > 1 && (
                    <div className="absolute bottom-3 right-3 rounded-full bg-black/55 px-3 py-1 text-xs font-semibold text-white">
                      {activeImageIndex + 1}/{productImages.length}
                    </div>
                  )}
                  {discount > 0 && (
                    <div className="absolute top-3 left-3 bg-red-500 text-white px-3 py-1 rounded-full font-bold text-sm">
                      -{discount}%
                    </div>
                  )}
                </div>
                {productImages.length > 1 && (
                  <div className="grid grid-cols-5 gap-2">
                    {productImages.slice(0, 10).map((imageUrl, index) => (
                      <button
                        key={imageUrl}
                        type="button"
                        onClick={() => setActiveImageIndex(index)}
                        className={`relative aspect-square overflow-hidden rounded-xl border transition-all ${activeImageIndex === index ? 'border-green-500 ring-2 ring-green-500/20' : 'border-gray-200 hover:border-green-300'
                          }`}
                        aria-label={`Afficher image ${index + 1}`}
                      >
                        <Image src={imageUrl} alt={`${product.name} ${index + 1}`} fill className="object-cover" sizes="80px" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-5">
                <div>
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <div className="inline-flex items-center gap-2 rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                      {product.category_image_url ? (
                        <div className="h-5 w-5 overflow-hidden rounded-full bg-white border border-green-200">
                          <Image
                            src={product.category_image_url}
                            alt={`${productCategory} icon`}
                            width={20}
                            height={20}
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <span>🏷️</span>
                      )}
                      {productCategory}
                    </div>
                    {productBrandName && (
                      <div className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
                        {productBrandLogoUrl ? (
                          <div className="h-5 w-5 overflow-hidden rounded-full bg-white border border-gray-200">
                            <Image
                              src={productBrandLogoUrl}
                              alt={`${productBrandName} logo`}
                              width={20}
                              height={20}
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <span>⭐</span>
                        )}
                        {productBrandName}
                      </div>
                    )}
                  </div>
                  <h1 className="text-2xl font-bold text-gray-800 mb-2">
                    {product.name}
                  </h1>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {product.description}
                  </p>
                </div>

                <div className="rounded-3xl border border-gray-200 bg-gray-50 p-5">
                  <div className="flex flex-col gap-4">
                    <div>
                      <span className="text-3xl font-bold text-green-600">
                        {product.price.toFixed(2)} DT
                      </span>
                      {originalPrice > product.price && (
                        <span className="ml-3 text-lg text-gray-400 line-through">
                          {originalPrice.toFixed(2)} DT
                        </span>
                      )}
                    </div>
                    {productInStock && (
                      <div className="flex items-center gap-2 text-green-600 font-semibold text-sm">
                        <Check size={16} />
                        En stock
                      </div>
                    )}
                    <div className="flex gap-3">
                      <button
                        onClick={handleAddToCart}
                        disabled={!productInStock}
                        className={`flex-1 py-3 px-4 rounded-full font-bold transition-all duration-300 flex items-center justify-center gap-2 ${productInStock
                          ? 'bg-green-500 text-white hover:bg-green-600'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          } ${addedToCart ? 'bg-green-600' : ''}`}
                      >
                        <ShoppingCart size={18} />
                        {addedToCart ? 'Ajoute!' : 'Ajouter au panier'}
                      </button>
                      <button
                        onClick={() => setIsWishlisted(!isWishlisted)}
                        className={`py-3 px-4 rounded-full font-bold transition-all duration-300 border-2 ${isWishlisted
                          ? 'bg-red-50 border-red-300 text-red-500'
                          : 'border-gray-300 text-gray-700 hover:border-red-300'
                          }`}
                        aria-label="Ajouter aux favoris"
                      >
                        <Heart size={18} fill={isWishlisted ? 'currentColor' : 'none'} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>,
    document.body
  )
}
