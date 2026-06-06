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
import { trackReactPixelEvent } from '@/lib/react-facebook-pixel-events'
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
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [addedToCart, setAddedToCart] = useState(false)
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const { trigger: addToCart, isMutating } = useAddToCart()

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const { getProductByIdFromSupabase } = await import('@/lib/products')
        const data = await getProductByIdFromSupabase(params.id)
        if (data) {
          setProduct(data)
          setActiveImageIndex(0)
        }
      } catch (error) {
        console.error('Error loading product:', error)
      } finally {
        setLoading(false)
      }
    }

    loadProduct()
  }, [params.id])

  useEffect(() => {
    if (product) {
      trackReactPixelEvent('ViewContent', {
        content_name: product.name,
        content_ids: [product.id],
        content_type: 'product',
        value: product.price,
        currency: 'TND',
      })
    }
  }, [product])

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
        quantity: 1,
      })
      trackReactPixelEvent('AddToCart', {
        content_name: product.name,
        content_ids: [product.id],
        content_type: 'product',
        value: product.price,
        currency: 'TND',
      })
      setAddedToCart(true)
      setTimeout(() => setAddedToCart(false), 2000)
    } catch (error) {
      console.error('[v0] Error adding to cart:', error)
    }
  }

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
  const activeImage = productImages[activeImageIndex] || productImages[0] || '/placeholder.jpg'
  const brandName = product.brand?.name

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
            {/* Product Gallery */}
            <div className="space-y-4">
              <div className="relative w-full aspect-square bg-white rounded-3xl overflow-hidden border border-gray-200 shadow-sm">
                <Image
                  src={activeImage}
                  alt={product.name}
                  fill
                  className="w-full h-full object-cover"
                  priority
                />
                {brandName && (
                  <div className="absolute left-4 top-4 max-w-[70%] truncate rounded-full bg-white/92 px-3 py-1.5 text-sm font-bold text-gray-800 shadow-sm">
                    {brandName}
                  </div>
                )}
                {productImages.length > 1 && (
                  <div className="absolute bottom-4 right-4 rounded-full bg-black/55 px-3 py-1.5 text-sm font-semibold text-white">
                    {activeImageIndex + 1}/{productImages.length}
                  </div>
                )}
              </div>
              {productImages.length > 1 && (
                <div className="grid grid-cols-5 gap-3 sm:grid-cols-6">
                  {productImages.slice(0, 12).map((imageUrl, index) => (
                    <button
                      key={imageUrl}
                      type="button"
                      onClick={() => setActiveImageIndex(index)}
                      className={`relative aspect-square overflow-hidden rounded-2xl border bg-white transition-all ${
                        activeImageIndex === index ? 'border-green-500 ring-2 ring-green-500/20' : 'border-gray-200 hover:border-green-300'
                      }`}
                      aria-label={`Afficher image ${index + 1}`}
                    >
                      <Image src={imageUrl} alt={`${product.name} image ${index + 1}`} fill className="object-cover" sizes="96px" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div>
              <div className="mb-6">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <p className="text-sm font-bold uppercase text-green-600">{product.category || 'Produit'}</p>
                  {brandName && (
                    <span className="rounded-full bg-white px-3 py-1 text-sm font-semibold text-gray-700 shadow-sm ring-1 ring-gray-200">
                      {brandName}
                    </span>
                  )}
                </div>
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

              {/* Buttons */}
              <div className="flex gap-4 mb-8">
                <button
                  onClick={handleAddToCart}
                  disabled={(product.stock_quantity ?? 0) === 0 || isMutating}
                  className={`flex-1 py-4 px-6 rounded-full font-bold text-lg transition-all duration-300 flex items-center justify-center gap-2 ${(product.stock_quantity ?? 0) > 0
                      ? 'bg-green-500 text-white hover:bg-green-600 hover:shadow-lg'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    } ${addedToCart ? 'bg-green-600' : ''} ${isMutating ? 'opacity-50 cursor-wait' : ''}`}
                >
                  <ShoppingCart size={20} />
                  {isMutating ? 'Ajout...' : addedToCart ? 'Ajouté au panier!' : 'Ajouter au panier'}
                </button>
                <button
                  onClick={() => setIsWishlisted(!isWishlisted)}
                  className={`py-4 px-6 rounded-full font-bold transition-all duration-300 border-2 ${isWishlisted
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
                    <p className="font-semibold text-gray-800">Livraison depuis Hammamet</p>
                    <p className="text-sm text-gray-500">Gratuite a Hammamet ou des 500 DT</p>
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
