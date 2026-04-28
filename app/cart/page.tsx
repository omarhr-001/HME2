'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { Trash2, Plus, Minus, ShoppingCart } from 'lucide-react'
import type { Product } from '@/lib/types'

interface CartItem extends Product {
  quantity: number
}

export default function CartPage() {
  const [cart, setCart] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Load cart from localStorage
    const savedCart = JSON.parse(localStorage.getItem('cart') || '[]')
    setCart(savedCart)
    setLoading(false)

    // Listen for cart updates
    const handleCartUpdate = () => {
      const updatedCart = JSON.parse(localStorage.getItem('cart') || '[]')
      setCart(updatedCart)
    }

    window.addEventListener('cartUpdated', handleCartUpdate)
    return () => window.removeEventListener('cartUpdated', handleCartUpdate)
  }, [])

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id)
      return
    }

    const updatedCart = cart.map(item =>
      item.id === id ? { ...item, quantity } : item
    )
    setCart(updatedCart)
    localStorage.setItem('cart', JSON.stringify(updatedCart))
    window.dispatchEvent(new Event('cartUpdated'))
  }

  const removeFromCart = (id: string) => {
    const updatedCart = cart.filter(item => item.id !== id)
    setCart(updatedCart)
    localStorage.setItem('cart', JSON.stringify(updatedCart))
    window.dispatchEvent(new Event('cartUpdated'))
  }

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shipping = subtotal > 100 ? 0 : 15
  const total = subtotal + shipping

  if (loading) {
    return <div className="pt-20">Chargement...</div>
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-[5%] pt-28 pb-20">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Mon panier</h1>

        {cart.length === 0 ? (
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
              {cart.map((item) => (
                <div key={item.id} className="bg-white rounded-xl p-6 flex gap-6 border border-gray-200">
                  {/* Product Image */}
                  <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {item.image_url ? (
                      <Image
                        src={item.image_url}
                        alt={item.name}
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
                    <p className="text-xs text-green-700 font-bold uppercase tracking-wider mb-1">{item.category || 'Produit'}</p>
                    <h3 className="font-semibold text-gray-800 mb-3 line-clamp-2">{item.name}</h3>
                    <p className="text-2xl font-bold text-gray-800">{item.price.toLocaleString('fr-TN')} DT</p>
                  </div>

                  {/* Quantity & Actions */}
                  <div className="flex flex-col items-end gap-4">
                    {/* Quantity Control */}
                    <div className="flex items-center gap-2 border border-gray-200 rounded-lg overflow-hidden">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-9 h-9 bg-gray-50 border-none cursor-pointer flex items-center justify-center hover:bg-gray-100 transition-colors"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="w-12 text-center font-bold text-gray-800">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-9 h-9 bg-gray-50 border-none cursor-pointer flex items-center justify-center hover:bg-gray-100 transition-colors"
                      >
                        <Plus size={16} />
                      </button>
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                    >
                      <Trash2 size={20} />
                    </button>

                    {/* Subtotal */}
                    <p className="text-lg font-bold text-gray-800">
                      {(item.price * item.quantity).toLocaleString('fr-TN')} DT
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
                    <span>{subtotal.toLocaleString('fr-TN')} DT</span>
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

                {subtotal < 500 && (
                  <p className="text-xs text-gray-500 mb-4 p-3 bg-blue-50 rounded-lg">
                    Ajoutez {(500 - subtotal).toLocaleString('fr-TN')} DT pour bénéficier de la livraison gratuite
                  </p>
                )}

                <button className="btn-primary w-full justify-center mb-3">
                  Procéder au paiement
                </button>
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
