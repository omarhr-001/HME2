'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { Heart, ShoppingCart, Truck, Shield, RefreshCw, Check } from 'lucide-react'
import Link from 'next/link'
import { getProductById } from '@/lib/products'
import type { Product } from '@/lib/products'

interface ProductPageProps {
  params: {
    id: string
  }
}

export default function ProductPage({ params }: ProductPageProps) {
  const product = getProductById(params.id)
  const [quantity, setQuantity] = useState(1)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [addedToCart, setAddedToCart] = useState(false)

  if (!product) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Produit non trouvé</h1>
            <p className="text-gray-500 mb-6">Le produit que vous recherchez n&apos;existe pas.</p>
            <Link href="/products" className="text-green-600 hover:text-green-700 font-semibold">
              Retour aux produits
            </Link>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)

  const handleAddToCart = () => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]')
    const existingItem = cart.find((item: any) => item.id === product.id)

    if (existingItem) {
      existingItem.quantity += quantity
    } else {
      cart.push({ ...product, quantity })
    }

    localStorage.setItem('cart', JSON.stringify(cart))
    window.dispatchEvent(new Event('cartUpdated'))
    
    setAddedToCart(true)
    setTimeout(() => setAddedToCart(false), 2000)
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50">
        {/* Breadcrumb */}
        <div className="bg-white border-b border-gray-200 px-[5%] py-4">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Link href="/" className="hover:text-gray-700">Accueil</Link>
            <span>/</span>
            <Link href="/products" className="hover:text-gray-700">Produits</Link>
            <span>/</span>
            <Link href={`/products?category=${product.category}`} className="hover:text-gray-700">{product.category}</Link>
            <span>/</span>
            <span className="text-gray-800 font-medium">{product.name}</span>
          </div>
        </div>

        {/* Product Section */}
        <div className="px-[5%] py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Product Image */}
            <div className="flex items-center justify-center">
              <div className="relative w-full aspect-square bg-white rounded-3xl overflow-hidden border border-gray-200 shadow-sm">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="w-full h-full object-cover"
                  priority
                />
                {discount > 0 && (
                  <div className="absolute top-4 left-4 bg-red-500 text-white px-4 py-2 rounded-full font-bold">
                    -{discount}%
                  </div>
                )}
              </div>
            </div>

            {/* Product Info */}
            <div>
              <div className="mb-6">
                <p className="text-sm font-bold text-green-600 uppercase mb-2">{product.category}</p>
                <h1 className="text-3xl font-bold text-gray-800 mb-3">{product.name}</h1>
                <p className="text-gray-600">{product.description}</p>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-lg text-amber-400">
                      {i < Math.floor(product.rating) ? '★' : '☆'}
                    </span>
                  ))}
                </div>
                <span className="text-sm font-semibold text-gray-700">{product.rating}</span>
                <span className="text-sm text-gray-500">({product.reviews} avis)</span>
              </div>

              {/* Price */}
              <div className="mb-6">
                <div className="flex items-baseline gap-3 mb-2">
                  <span className="text-3xl font-bold text-green-600">{product.price.toFixed(2)} DT</span>
                  {product.originalPrice > product.price && (
                    <span className="text-lg text-gray-400 line-through">{product.originalPrice.toFixed(2)} DT</span>
                  )}
                </div>
                {product.inStock && (
                  <div className="flex items-center gap-2 text-green-600 font-semibold text-sm">
                    <Check size={16} />
                    En stock
                  </div>
                )}
              </div>

              {/* Quantity Selector */}
              <div className="flex items-center gap-4 mb-6">
                <span className="text-sm font-semibold text-gray-700">Quantité:</span>
                <div className="flex items-center gap-3 bg-gray-200 rounded-full px-4 py-2">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="text-lg font-bold text-gray-700 hover:text-gray-900"
                  >
                    −
                  </button>
                  <span className="w-8 text-center font-semibold">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="text-lg font-bold text-gray-700 hover:text-gray-900"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-4 mb-8">
                <button
                  onClick={handleAddToCart}
                  disabled={!product.inStock}
                  className={`flex-1 py-4 px-6 rounded-full font-bold text-lg transition-all duration-300 flex items-center justify-center gap-2 ${
                    product.inStock
                      ? 'bg-green-500 text-white hover:bg-green-600 hover:shadow-lg'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  } ${addedToCart ? 'bg-green-600' : ''}`}
                >
                  <ShoppingCart size={20} />
                  {addedToCart ? 'Ajouté au panier!' : 'Ajouter au panier'}
                </button>
                <button
                  onClick={() => setIsWishlisted(!isWishlisted)}
                  className={`py-4 px-6 rounded-full font-bold transition-all duration-300 border-2 ${
                    isWishlisted
                      ? 'bg-red-50 border-red-300 text-red-500'
                      : 'border-gray-300 text-gray-700 hover:border-red-300 hover:text-red-500'
                  }`}
                >
                  <Heart size={20} fill={isWishlisted ? 'currentColor' : 'none'} />
                </button>
              </div>

              {/* Benefits */}
              <div className="space-y-3">
                <div className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-200">
                  <Truck size={24} className="text-green-600 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-800">Livraison gratuite</p>
                    <p className="text-sm text-gray-500">Pour les commandes de 100+ DT</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-200">
                  <Shield size={24} className="text-green-600 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-800">Garantie couverte</p>
                    <p className="text-sm text-gray-500">{product.specs['Garantie'] || '2 ans'} de couverture complète</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-200">
                  <RefreshCw size={24} className="text-green-600 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-800">Retours faciles</p>
                    <p className="text-sm text-gray-500">30 jours pour retourner sans questions</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Specifications */}
          <div className="mt-16 bg-white rounded-3xl p-8 border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Spécifications</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(product.specs).map(([key, value]) => (
                <div key={key} className="pb-4 border-b border-gray-200">
                  <p className="text-sm text-gray-500 font-semibold mb-1">{key}</p>
                  <p className="text-gray-800 font-semibold">{value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Related Products */}
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-gray-800 mb-8">Produits similaires</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* You could add related products here */}
              <p className="text-gray-500">Aucun produit similaire trouvé</p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
