'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import useSWR from 'swr'
import { ArrowLeft, Printer } from 'lucide-react'
import { Button } from '@/components/ui/button'
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

export default function InvoicePage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { user, loading } = useAuth()
  const { data: order, isLoading } = useSWR<Order>(
    user ? `/api/orders/${params.id}` : null,
    authenticatedFetcher,
    { revalidateOnFocus: false },
  )

  useEffect(() => {
    if (!loading && !user) router.push('/auth/login')
  }, [loading, router, user])

  if (loading || isLoading || !order) {
    return <main className="min-h-screen bg-white p-10 text-gray-600">Chargement de la facture...</main>
  }

  const address = order.shipping_address as Record<string, string> | undefined
  const subtotal = (order.order_items || []).reduce((sum, item) => sum + Number(item.price) * item.quantity, 0)
  const shipping = Number(order.total_amount) - subtotal

  return (
    <main className="min-h-screen bg-gray-100 px-4 py-8 text-gray-900 print:bg-white print:p-0">
      <div className="mx-auto mb-4 flex max-w-4xl justify-between print:hidden">
        <Button asChild variant="outline">
          <Link href={`/orders/${order.id}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Link>
        </Button>
        <Button onClick={() => window.print()} className="bg-green-600 hover:bg-green-700">
          <Printer className="mr-2 h-4 w-4" />
          Imprimer
        </Button>
      </div>

      <section className="mx-auto max-w-4xl bg-white p-8 shadow-sm print:shadow-none">
        <header className="flex flex-col gap-6 border-b pb-8 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Hamroun Meuble & Electro</h1>
            <p className="mt-2 text-sm text-gray-600">Facture client</p>
          </div>
          <div className="text-left sm:text-right">
            <p className="text-sm text-gray-500">Facture</p>
            <p className="text-xl font-bold">{order.order_number || order.id.slice(0, 8).toUpperCase()}</p>
            <p className="text-sm text-gray-600">{new Date(order.created_at).toLocaleDateString('fr-FR')}</p>
          </div>
        </header>

        <div className="grid gap-8 border-b py-8 sm:grid-cols-2">
          <div>
            <h2 className="mb-3 font-bold">Adresse de livraison</h2>
            {address ? (
              <div className="space-y-1 text-sm text-gray-600">
                <p className="font-semibold text-gray-900">{address.firstName} {address.lastName}</p>
                <p>{address.phone}</p>
                <p>{address.email}</p>
                <p>{address.address}</p>
                <p>{address.postalCode} {address.city}</p>
                <p>{address.country}</p>
              </div>
            ) : (
              <p className="text-sm text-gray-500">Adresse non disponible.</p>
            )}
          </div>
          <div>
            <h2 className="mb-3 font-bold">Statut</h2>
            <p className="text-sm capitalize text-gray-600">{order.status}</p>
          </div>
        </div>

        <table className="w-full border-b py-8 text-sm">
          <thead>
            <tr className="border-b text-left text-gray-500">
              <th className="py-3">Produit</th>
              <th className="py-3 text-center">Qté</th>
              <th className="py-3 text-right">Prix</th>
              <th className="py-3 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {(order.order_items || []).map((item) => (
              <tr key={item.id} className="border-b last:border-0">
                <td className="py-4 font-medium">{item.products?.name || 'Produit'}</td>
                <td className="py-4 text-center">{item.quantity}</td>
                <td className="py-4 text-right">{Number(item.price).toFixed(2)} DT</td>
                <td className="py-4 text-right">{(Number(item.price) * item.quantity).toFixed(2)} DT</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="ml-auto mt-8 max-w-sm space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Sous-total</span>
            <span>{subtotal.toFixed(2)} DT</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Livraison</span>
            <span>{shipping > 0 ? `${shipping.toFixed(2)} DT` : 'Gratuite'}</span>
          </div>
          <div className="flex justify-between border-t pt-3 text-lg font-bold">
            <span>Total</span>
            <span>{Number(order.total_amount).toFixed(2)} DT</span>
          </div>
        </div>

        <footer className="mt-12 border-t pt-6 text-center text-xs text-gray-500">
          Merci pour votre commande.
        </footer>
      </section>
    </main>
  )
}
