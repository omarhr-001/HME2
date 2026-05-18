'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import useSWR from 'swr'
import { ArrowLeft, CreditCard, Download, MapPin, Package, Receipt, Truck } from 'lucide-react'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import type { Order } from '@/lib/types'

const authenticatedFetcher = async (url: string) => {
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  })
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  return res.json()
}

const statusLabels = {
  pending: 'En attente',
  processing: 'En cours',
  shipped: 'Expédiée',
  delivered: 'Livrée',
  cancelled: 'Annulée',
}

const statusClasses = {
  pending: 'bg-yellow-50 text-yellow-800 border-yellow-200',
  processing: 'bg-blue-50 text-blue-800 border-blue-200',
  shipped: 'bg-purple-50 text-purple-800 border-purple-200',
  delivered: 'bg-green-50 text-green-800 border-green-200',
  cancelled: 'bg-red-50 text-red-800 border-red-200',
}

const paymentMethodLabels = {
  cash_on_delivery: 'Paiement à la livraison',
  bank_transfer: 'Virement bancaire',
}

const paymentStatusLabels = {
  pending: 'Paiement en attente',
  paid: 'Payée',
  failed: 'Paiement échoué',
  refunded: 'Remboursée',
}

export default function OrderDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { data: order, isLoading, error } = useSWR<Order>(
    user ? `/api/orders/${params.id}` : null,
    authenticatedFetcher,
    { revalidateOnFocus: false },
  )

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login')
    }
  }, [authLoading, router, user])

  if (authLoading || isLoading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-gray-50 pt-28 text-center text-gray-600">Chargement de la commande...</main>
        <Footer />
      </>
    )
  }

  if (error || !order) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-gray-50 px-4 pt-28">
          <div className="mx-auto max-w-xl rounded-2xl bg-white p-8 text-center shadow-sm">
            <Package className="mx-auto mb-4 h-12 w-12 text-gray-300" />
            <h1 className="text-2xl font-bold text-gray-900">Commande introuvable</h1>
            <p className="mt-2 text-gray-600">Cette commande n’existe pas ou ne vous appartient pas.</p>
            <Button asChild className="mt-6 bg-green-600 hover:bg-green-700">
              <Link href="/orders">Retour aux commandes</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  const shippingAddress = order.shipping_address as Record<string, string> | undefined
  const itemSubtotal = (order.order_items || []).reduce((sum, item) => sum + Number(item.price) * item.quantity, 0)
  const shippingFee = Number(order.total_amount) - itemSubtotal

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50 pt-24">
        <div className="mx-auto max-w-5xl px-4 py-10">
          <Link href="/orders" className="mb-6 inline-flex items-center gap-2 font-semibold text-green-700">
            <ArrowLeft className="h-4 w-4" />
            Retour aux commandes
          </Link>

          <div className="mb-6 rounded-3xl border bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="text-sm text-gray-500">Commande</p>
                <h1 className="text-3xl font-bold text-gray-900">{order.order_number || order.id.slice(0, 8).toUpperCase()}</h1>
                <p className="mt-2 text-gray-600">
                  Passée le {new Date(order.created_at).toLocaleDateString('fr-FR')}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge className={`border px-3 py-1 capitalize ${statusClasses[order.status]}`}>
                  {statusLabels[order.status]}
                </Badge>
                <Button asChild variant="outline">
                  <Link href={`/orders/${order.id}/invoice`}>
                    <Download className="mr-2 h-4 w-4" />
                    Facture
                  </Link>
                </Button>
              </div>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
            <div className="rounded-3xl border bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center gap-2">
                <Receipt className="h-5 w-5 text-green-600" />
                <h2 className="text-xl font-bold text-gray-900">Articles commandés</h2>
              </div>
              <div className="space-y-4">
                {(order.order_items || []).map((item) => (
                  <div key={item.id} className="flex gap-4 rounded-2xl border border-gray-100 p-4">
                    <div className="relative h-20 w-20 overflow-hidden rounded-xl bg-gray-100">
                      {item.products?.image_url ? (
                        <Image src={item.products.image_url} alt={item.products.name || 'Produit'} fill className="object-cover" sizes="80px" />
                      ) : null}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-gray-900">{item.products?.name || 'Produit'}</p>
                      <p className="text-sm text-gray-500">Quantité: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{Number(item.price).toFixed(2)} DT</p>
                      <p className="text-sm text-gray-500">{(Number(item.price) * item.quantity).toFixed(2)} DT</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-3xl border bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center gap-2">
                  <Truck className="h-5 w-5 text-green-600" />
                  <h2 className="text-xl font-bold text-gray-900">Résumé</h2>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Sous-total</span>
                    <span>{itemSubtotal.toFixed(2)} DT</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Livraison</span>
                    <span>{shippingFee > 0 ? `${shippingFee.toFixed(2)} DT` : 'Gratuite'}</span>
                  </div>
                  <div className="border-t pt-3 flex justify-between text-lg font-bold text-gray-900">
                    <span>Total</span>
                    <span className="text-green-600">{Number(order.total_amount).toFixed(2)} DT</span>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-green-600" />
                  <h2 className="text-xl font-bold text-gray-900">Paiement</h2>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between gap-4 text-gray-600">
                    <span>Méthode</span>
                    <span className="font-semibold text-gray-900">
                      {paymentMethodLabels[order.payment_method || 'cash_on_delivery']}
                    </span>
                  </div>
                  <div className="flex justify-between gap-4 text-gray-600">
                    <span>Statut</span>
                    <span className="font-semibold text-gray-900">
                      {paymentStatusLabels[order.payment_status || 'pending']}
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-green-600" />
                  <h2 className="text-xl font-bold text-gray-900">Livraison</h2>
                </div>
                {shippingAddress ? (
                  <div className="space-y-1 text-sm text-gray-600">
                    <p className="font-semibold text-gray-900">{shippingAddress.firstName} {shippingAddress.lastName}</p>
                    <p>{shippingAddress.phone}</p>
                    <p>{shippingAddress.address}</p>
                    <p>{shippingAddress.postalCode} {shippingAddress.city}</p>
                    <p>{shippingAddress.country}</p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Adresse non disponible.</p>
                )}
              </div>

              {order.notes && (
                <div className="rounded-3xl border bg-white p-6 shadow-sm">
                  <h2 className="mb-2 text-xl font-bold text-gray-900">Notes</h2>
                  <p className="text-sm text-gray-600">{order.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
