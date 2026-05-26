'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import useSWR from 'swr'
import { useAuth } from '@/lib/auth-context'
import { useCart, useCreateOrder } from '@/lib/hooks'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { Banknote, ChevronRight, Landmark } from 'lucide-react'
import type { CartItemWithProduct, Order } from '@/lib/types'
import { DEFAULT_SHIPPING_SETTINGS, calculateShippingFee, getShippingZoneLabel, type ShippingSettings } from '@/lib/shipping'

const WHATSAPP_NUMBER = '21695776655'
const fetcher = async (url: string) => {
  const response = await fetch(url)
  if (!response.ok) throw new Error('Failed to load shipping settings')
  return response.json()
}

export default function CheckoutPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { cartItems, cartTotal, isLoading: cartLoading } = useCart()
  const { trigger: createOrder, isMutating: isCreating, error: createOrderError } = useCreateOrder()
  const { data: shippingSettings = DEFAULT_SHIPPING_SETTINGS } = useSWR<ShippingSettings>(
    '/api/shipping-settings',
    fetcher,
    { revalidateOnFocus: false },
  )

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    notes: '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [paymentMethod, setPaymentMethod] = useState<Order['payment_method']>('cash_on_delivery')

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login')
    }
    if (user && user.email) {
      setFormData(prev => ({ ...prev, email: user.email || '' }))
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (!cartLoading && cartItems.length === 0) {
      router.push('/cart')
    }
  }, [cartItems, cartLoading, router])

  useEffect(() => {
    if (createOrderError) {
      setErrors({ form: createOrderError })
    }
  }, [createOrderError])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.firstName.trim()) newErrors.firstName = 'Le prénom est requis'
    if (!formData.lastName.trim()) newErrors.lastName = 'Le nom est requis'
    if (!formData.phone.trim()) newErrors.phone = 'Le téléphone est requis'
    if (!formData.address.trim()) newErrors.address = 'L\'adresse est requise'
    if (!formData.city.trim()) newErrors.city = 'La ville est requise'
    if (!formData.postalCode.trim()) newErrors.postalCode = 'Le code postal est requis'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    try {
      const shippingAddress = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        postalCode: formData.postalCode,
        country: 'Tunisia',
      }

      const order = await createOrder({
        items: cartItems,
        totalAmount: total,
        paymentMethod,
        shippingAddress,
        billingAddress: shippingAddress,
        notes: formData.notes,
      })

      if (order) {
        window.location.href = createWhatsAppOrderUrl(order)
        return
      }

      setErrors({
        form: createOrderError || 'Erreur lors de la création de la commande',
      })
    } catch (error) {
      console.error('[v0] Error creating order:', error)
      setErrors({
        form: error instanceof Error
          ? error.message
          : 'Erreur lors de la création de la commande',
      })
    }
  }

  const shipping = calculateShippingFee(cartTotal, formData.city, shippingSettings)
  const total = cartTotal + shipping
  const shippingZone = getShippingZoneLabel(formData.city)

  const createWhatsAppOrderUrl = (order: Order) => {
    const orderRef = order.order_number || order.id
    const lines = [
      `Bonjour, je veux confirmer ma commande ${orderRef}.`,
      `Nom: ${formData.firstName} ${formData.lastName}`,
      `Telephone: ${formData.phone}`,
      `Adresse: ${formData.address}, ${formData.city}, ${formData.postalCode}`,
      `Zone livraison: ${shippingZone}`,
      `Livraison: ${shipping === 0 ? 'Gratuite' : `${shipping.toFixed(2)} DT`}`,
      `Total: ${total.toFixed(2)} DT`,
      `Paiement: ${paymentMethod === 'cash_on_delivery' ? 'Paiement a la livraison' : 'Virement bancaire'}`,
      '',
      'Produits:',
      ...cartItems.map((item) => `- ${item.products?.name || 'Produit'} x ${item.quantity}`),
      formData.notes.trim() ? `Note: ${formData.notes.trim()}` : '',
    ].filter(Boolean)

    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(lines.join('\n'))}`
  }

  if (authLoading || cartLoading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-[5%] pt-28 pb-20 text-center">
          <p className="text-gray-600">Chargement...</p>
        </div>
        <Footer />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-[5%] pt-28 pb-20">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-8">
          <Link href="/cart" className="hover:text-gray-800">Panier</Link>
          <ChevronRight size={16} />
          <span className="text-gray-800 font-semibold">Livraison</span>
          <ChevronRight size={16} />
          <span className="text-gray-400">Paiement</span>
        </div>

        <h1 className="text-3xl font-bold text-gray-800 mb-8">Finalisez votre commande</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmitOrder} className="bg-white rounded-xl p-6 border border-gray-200">
              {errors.form && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
                  {errors.form}
                </div>
              )}

              {/* Personal Info */}
              <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Informations personnelles</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Prénom</label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      placeholder="Votre prénom"
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.firstName ? 'border-red-500' : 'border-gray-300'
                        }`}
                    />
                    {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Nom</label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      placeholder="Votre nom"
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.lastName ? 'border-red-500' : 'border-gray-300'
                        }`}
                    />
                    {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  />
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Téléphone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+216 XX XXX XXX  
"
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.phone ? 'border-red-500' : 'border-gray-300'
                      }`}
                  />
                  {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                </div>
              </div>

              {/* Shipping Address */}
              <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Adresse de livraison</h2>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Adresse</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Rue, numéro..."
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.address ? 'border-red-500' : 'border-gray-300'
                      }`}
                  />
                  {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Ville</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      placeholder="Hammamet"
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.city ? 'border-red-500' : 'border-gray-300'
                        }`}
                    />
                    {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Code Postal</label>
                    <input
                      type="text"
                      name="postalCode"
                      value={formData.postalCode}
                      onChange={handleInputChange}
                      placeholder="1000"
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.postalCode ? 'border-red-500' : 'border-gray-300'
                        }`}
                    />
                    {errors.postalCode && <p className="text-red-500 text-xs mt-1">{errors.postalCode}</p>}
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Methode de paiement</h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cash_on_delivery')}
                    className={`flex min-h-24 items-start gap-3 rounded-lg border p-4 text-left transition ${paymentMethod === 'cash_on_delivery'
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                  >
                    <Banknote className="mt-1 h-5 w-5 text-green-600" />
                    <span>
                      <span className="block font-semibold text-gray-900">Paiement a la livraison</span>
                      <span className="mt-1 block text-sm text-gray-600">La commande passe en traitement puis vous confirmez sur WhatsApp.</span>
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('bank_transfer')}
                    className={`flex min-h-24 items-start gap-3 rounded-lg border p-4 text-left transition ${paymentMethod === 'bank_transfer'
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                  >
                    <Landmark className="mt-1 h-5 w-5 text-green-600" />
                    <span>
                      <span className="block font-semibold text-gray-900">Virement bancaire</span>
                      <span className="mt-1 block text-sm text-gray-600">Envoyez la preuve ou les details dans la conversation WhatsApp.</span>
                    </span>
                  </button>
                </div>
              </div>

              {/* Notes */}
              <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Notes de commande (optionnel)</h2>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Ajoutez une note à votre commande..."
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <button
                type="submit"
                disabled={isCreating}
                className="w-full bg-green-500 text-white font-bold py-3 rounded-lg hover:bg-green-600 transition disabled:opacity-50"
              >
                {isCreating ? 'Creation en cours...' : 'Confirmer sur WhatsApp'}
              </button>
            </form>
          </div>

          {/* Order Summary */}
          <div>
            <div className="bg-white rounded-xl p-6 border border-gray-200 sticky top-24">
              <h2 className="text-xl font-bold text-gray-800 mb-6">Résumé de la commande</h2>

              {/* Items */}
              <div className="space-y-3 mb-6 pb-6 border-b border-gray-200 max-h-64 overflow-y-auto">
                {cartItems.map((item: CartItemWithProduct) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-gray-700">
                      {item.products?.name || 'Produit'} x {item.quantity}
                    </span>
                    <span className="font-semibold text-gray-800">
                      {((item.products?.price || 0) * item.quantity).toFixed(2)} DT
                    </span>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="space-y-3 mb-6 pb-6 border-b border-gray-200">
                <div className="flex justify-between text-gray-700">
                  <span>Sous-total</span>
                  <span>{cartTotal.toFixed(2)} DT</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Livraison</span>
                  <span className={`text-right ${shipping === 0 ? 'text-green-600 font-semibold' : ''}`}>
                    {shipping === 0 ? 'Gratuite' : `${shipping.toFixed(2)} DT`}
                    <span className="block text-xs font-normal text-gray-500">
                      {shippingZone} - gratuit des {shippingSettings.freeThreshold} DT
                    </span>
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center text-xl font-bold text-gray-800">
                <span>Total</span>
                <span className="text-green-600">{total.toFixed(2)} DT</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}
