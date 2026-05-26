'use client'

import { useLikedProducts } from '@/lib/hooks/use-liked-products'
import { ProductCard } from './product-card'
import { Heart } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

export function LikedProductsCard() {
  const { likedProducts, isLoading } = useLikedProducts()

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:col-span-2">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-96 rounded-3xl" />
          ))}
        </div>
      </div>
    )
  }

  const products = likedProducts.map((liked: any) => liked.products || liked).filter(Boolean)

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 hover:shadow-md hover:border-green-200 transition-all duration-300 h-full md:col-span-2">
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Heart className="w-6 h-6 text-red-500 fill-red-500" />
            <h3 className="text-lg font-bold text-gray-900">Mes Favoris</h3>
          </div>
          <p className="text-gray-600 text-sm">Vous avez {products.length} produit{products.length !== 1 ? 's' : ''} en favoris</p>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-12">
          <Heart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Aucun produit en favoris pour le moment</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product: any) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>
      )}
    </div>
  )
}
