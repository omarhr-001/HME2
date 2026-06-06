'use client'

import Link from 'next/link'
import Image from 'next/image'
import useSWR from 'swr'
import { useAuth } from '@/lib/auth-context'
import { useCart, useRemoveFromCart } from '@/lib/hooks'
import { useToast } from '@/hooks/use-toast'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { Trash2, ShoppingCart } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { CartItemWithProduct } from '@/lib/types'
import { DEFAULT_SHIPPING_SETTINGS, type ShippingSettings } from '@/lib/shipping'
import { trackReactPixelEvent } from '@/lib/react-facebook-pixel-events'

const fetcher = async (url: string) => {
  const response = await fetch(url)
  if (!response.ok) throw new Error('Failed to load shipping settings')
  return response.json()
}

export default function CartPage() {
  const { user, loading: authLoading } = useAuth()
  const { cartItems, cartTotal, isLoading, mutate } = useCart()
  const { trigger: removeItem } = useRemoveFromCart()
  const { toast } = useToast()
  const [mounted, setMounted] = useState(false)
  const [removingItems, setRemovingItems] = useState<Set<string>>(new Set())
  const { data: shippingSettings = DEFAULT_SHIPPING_SETTINGS } = useSWR<ShippingSettings>(
    '/api/shipping-settings',
    fetcher,
    { revalidateOnFocus: false },
  )

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleRemove = async (itemId: string, productName: string) => {
    try {
      // Add to removing set for animation
      setRemovingItems((prev) => new Set(prev).add(itemId))

      // Optimistic update: remove from UI immediately
      const updatedItems = cartItems.filter((item: CartItemWithProduct) => item.id !== itemId)
      mutate(updatedItems, false)

      // Call API in background
      await removeItem({ cartItemId: itemId })
      toast({
        title: 'Succ\u00e8s',
        description: `${productName} a \u00e9t\u00e9 supprim\u00e9 du panier`,
      })
    } catch (error) {
      console.error('Error removing from cart:', error)
      // Revert on error by revalidating from server
      await mutate()
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer l\'article du panier',
      })
    } finally {
      // Remove from removing set
      setRemovingItems((prev) => {
        const newSet = new Set(prev)
        newSet.delete(itemId)
        return newSet
      })
    }
  }

  const shipping = cartTotal >= shippingSettings.freeThreshold ? 0 : shippingSettings.otherFee
  const total = cartTotal + shipping

  if (!mounted || authLoading || isLoading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-[5%] pt-28 pb-20 text-center">
          <p className="text-gray-600">Chargement de votre panier...</p>
        </div>
        <Footer />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-[5%] pt-28 pb-20">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Mon panier</h1>

        {cartItems.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-dashed border-gray-300">
              <ShoppingCart size={36} className="text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Votre panier est vide</h2>
            <p className="text-gray-500 mb-6">Commencez à acheter des produits pour les ajouter à votre panier.</p>
            <Link href="/" className="btn-primary inline-block">
              Continuer les achats
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item: CartItemWithProduct) => (
                <div
                  key={item.id}
                  className={`bg-white rounded-xl p-6 flex gap-6 border border-gray-200 transition-all duration-300 ease-out ${removingItems.has(item.id)
                    ? 'opacity-0 scale-95 h-0 overflow-hidden'
                    : 'opacity-100 scale-100'
                    }`}
                >
                  {/* Product Image */}
                  <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {item.products?.image_url ? (
                      <Image
                        src={item.products.image_url}
                        alt={item.products.name || 'Produit'}
                        width={96}
                        height={96}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ShoppingCart size={32} className="text-gray-400" />
                    )}
                  </div>

                  {/* Product Details */}
                  <div className="flex-1">
                    <p className="text-xs text-green-700 font-bold uppercase tracking-wider mb-1">
                      {item.products?.category || 'Produit'}
                    </p>
                    <h3 className="font-semibold text-gray-800 mb-3 line-clamp-2">
                      {item.products?.name || 'Produit'}
                    </h3>
                    <p className="text-2xl font-bold text-gray-800">
                      {(item.products?.price || 0).toLocaleString('fr-TN')} DT
                    </p>
                  </div>

                  {/* Quantity & Actions */}
                  <div className="flex flex-col items-end gap-4">
                    <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-semibold text-gray-800">
                      Quantite: {item.quantity}
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => handleRemove(item.id, item.products?.name || 'Produit')}
                      className="text-red-500 hover:text-red-700 transition-colors"
                    >
                      <Trash2 size={20} />
                    </button>

                    {/* Subtotal */}
                    <p className="text-lg font-bold text-gray-800">
                      {((item.products?.price || 0) * item.quantity).toLocaleString('fr-TN')} DT
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl p-6 border border-gray-200 sticky top-24">
                <h3 className="font-bold text-lg text-gray-800 mb-6">Récapitulatif</h3>

                <div className="space-y-4 mb-6 pb-6 border-b border-gray-200">
                  <div className="flex justify-between text-gray-600">
                    <span>Sous-total</span>
                    <span>{cartTotal.toLocaleString('fr-TN')} DT</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Livraison</span>
                    <span className={shipping === 0 ? 'text-green-600 font-semibold' : ''}>
                      {shipping === 0 ? 'Gratuite' : `${shipping.toLocaleString('fr-TN')} DT`}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center mb-6">
                  <span className="font-bold text-gray-800">Total</span>
                  <span className="text-2xl font-bold text-green-600">{total.toLocaleString('fr-TN')} DT</span>
                </div>

                {cartTotal < shippingSettings.freeThreshold && (
                  <p className="text-xs text-gray-500 mb-4 p-3 bg-blue-50 rounded-lg">
                    Ajoutez {(shippingSettings.freeThreshold - cartTotal).toLocaleString('fr-TN')} DT pour bénéficier de la livraison gratuite
                  </p>
                )}

                <Link
                  href="/checkout"
                  onClick={() => {
                    trackReactPixelEvent('InitiateCheckout', {
                      value: total,
                      currency: 'TND',
                      num_items: cartItems.reduce((sum, item) => sum + item.quantity, 0),
                    })
                  }}
                  className="btn-primary w-full justify-center block text-center mb-3"
                >
                  Procéder au paiement
                </Link>
                <Link href="/" className="btn-outline w-full text-center block">
                  Continuer les achats
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </main>
  )
}
