'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { Heart, ShoppingCart, Truck, Shield, RefreshCw, Check } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { useAddToCart } from '@/lib/hooks'
import type { Product } from '@/lib/types'

interface ProductPageProps {
  params: {
    id: string
  }
}

export default function ProductPage({ params }: ProductPageProps) {
  const router = useRouter()
  const { user } = useAuth()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [addedToCart, setAddedToCart] = useState(false)
  const { trigger: addToCart, isMutating } = useAddToCart()

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const { getProductByIdFromSupabase } = await import('@/lib/products')
        const data = await getProductByIdFromSupabase(params.id)
        if (data) {
          setProduct(data)
        }
      } catch (error) {
        console.error('Error loading product:', error)
      } finally {
        setLoading(false)
      }
    }

    loadProduct()
  }, [params.id])

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-500">Chargement du produit...</p>
          </div>
        </main>
        <Footer />
      </>
    )
  }

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

  const handleAddToCart = async () => {
    if (!user) {
      router.push('/auth/login')
      return
    }

    try {
      await addToCart({
        productId: product.id,
        quantity,
      })
      setAddedToCart(true)
      setTimeout(() => setAddedToCart(false), 2000)
    } catch (error) {
      console.error('[v0] Error adding to cart:', error)
    }
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
                  src={product.image_url || '/images/placeholder.jpg'}
                  alt={product.name}
                  fill
                  className="w-full h-full object-cover"
                  priority
                />
              </div>
            </div>

            {/* Product Info */}
            <div>
              <div className="mb-6">
                <p className="text-sm font-bold text-green-600 uppercase mb-2">{product.category || 'Produit'}</p>
                <h1 className="text-3xl font-bold text-gray-800 mb-3">{product.name}</h1>
                <p className="text-gray-600">{product.description || 'Pas de description disponible'}</p>
              </div>

              {/* Stock Status */}
              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-200">
                {(product.stock_quantity ?? 0) > 0 ? (
                  <div className="flex items-center gap-2 text-green-600">
                    <Check size={20} />
                    <span className="font-semibold">{product.stock_quantity} en stock</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-red-600">
                    <span className="font-semibold">Rupture de stock</span>
                  </div>
                )}
              </div>

              {/* Price */}
              <div className="mb-6">
                <div className="flex items-baseline gap-3 mb-2">
                  <span className="text-3xl font-bold text-green-600">{product.price.toFixed(2)} DT</span>
                </div>
                {(product.stock_quantity ?? 0) > 0 && (
                  <div className="flex items-center gap-2 text-green-600 font-semibold text-sm">
                    <Check size={16} />
                    Disponible
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
                  disabled={(product.stock_quantity ?? 0) === 0 || isMutating}
                  className={`flex-1 py-4 px-6 rounded-full font-bold text-lg transition-all duration-300 flex items-center justify-center gap-2 ${
                    (product.stock_quantity ?? 0) > 0
                      ? 'bg-green-500 text-white hover:bg-green-600 hover:shadow-lg'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  } ${addedToCart ? 'bg-green-600' : ''} ${isMutating ? 'opacity-50 cursor-wait' : ''}`}
                >
                  <ShoppingCart size={20} />
                  {isMutating ? 'Ajout...' : addedToCart ? 'Ajouté au panier!' : 'Ajouter au panier'}
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
                    <p className="text-sm text-gray-500">2 ans de couverture complète</p>
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
