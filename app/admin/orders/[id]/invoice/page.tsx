'use client'

import Link from 'next/link'
import { use, useEffect } from 'react'
import useSWR from 'swr'
import { ArrowLeft, Printer } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { adminFetch } from '@/lib/admin/client'
import type { AdminOrder } from '@/lib/admin/types'

const paymentMethodLabels = {
    cash_on_delivery: 'Paiement à la livraison',
    bank_transfer: 'Virement bancaire',
}

const paymentStatusLabels = {
    pending: 'En attente',
    paid: 'Payé',
    failed: 'Échoué',
    refunded: 'Remboursé',
}

const statusLabels = {
    pending: 'En attente',
    processing: 'En traitement',
    shipped: 'Expédiée',
    delivered: 'Livrée',
    cancelled: 'Annulée',
}

export default function AdminInvoicePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const { data: order, error, isLoading } = useSWR<AdminOrder>(
        `/api/admin/orders/${id}`,
        adminFetch,
        { revalidateOnFocus: true },
    )

    useEffect(() => {
        if (error) {
            console.error('Failed to load admin invoice:', error)
        }
    }, [error])

    if (isLoading || !order) {
        return <main className="min-h-screen bg-white p-10 text-gray-600">Chargement de la facture administrateur...</main>
    }

    const customerName = order.profiles ? `${order.profiles.first_name || ''} ${order.profiles.last_name || ''}`.trim() : 'Client inconnu'
    const subtotal = (order.order_items || []).reduce((sum, item) => sum + Number(item.price) * item.quantity, 0)
    const shipping = order.shipping_fee ?? Number(order.total_amount) - subtotal

    return (
        <main className="min-h-screen bg-gray-100 px-4 py-8 text-gray-900 print:bg-white print:p-0">
            <div className="mx-auto mb-4 flex max-w-4xl justify-between print:hidden">
                <Button asChild variant="outline">
                    <Link href="/admin/orders">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Retour aux commandes
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
                        <p className="mt-2 text-sm text-gray-600">Facture administrateur</p>
                    </div>
                    <div className="text-left sm:text-right">
                        <p className="text-sm text-gray-500">Facture</p>
                        <p className="text-xl font-bold">{order.order_number || order.id.slice(0, 8).toUpperCase()}</p>
                        <p className="text-sm text-gray-600">{new Date(order.created_at).toLocaleDateString('fr-FR')}</p>
                    </div>
                </header>

                <div className="grid gap-8 border-b py-8 sm:grid-cols-2">
                    <div>
                        <h2 className="mb-3 font-bold">Client</h2>
                        <div className="space-y-1 text-sm text-gray-600">
                            <p className="font-semibold text-gray-900">{customerName}</p>
                            {order.profiles?.email && <p>{order.profiles.email}</p>}
                            {order.profiles?.phone && <p>{order.profiles.phone}</p>}
                            <p className="text-xs text-gray-400">Utilisateur {order.user_id}</p>
                        </div>
                    </div>
                    <div>
                        <h2 className="mb-3 font-bold">Statut de la commande</h2>
                        <p className="text-sm text-gray-600">{statusLabels[order.status] || statusLabels.pending}</p>
                        <h2 className="mb-3 mt-5 font-bold">Paiement</h2>
                        <div className="space-y-1 text-sm text-gray-600">
                            <p>{paymentMethodLabels[order.payment_method || 'cash_on_delivery']}</p>
                            <p>{paymentStatusLabels[order.payment_status || 'pending']}</p>
                        </div>
                    </div>
                </div>

                <table className="w-full border-b py-8 text-sm">
                    <thead>
                        <tr className="border-b text-left text-gray-500">
                            <th className="py-3">Produit</th>
                            <th className="py-3 text-center">Qté</th>
                            <th className="py-3 text-right">Prix unitaire</th>
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

                {order.notes && (
                    <div className="mt-8 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
                        <h2 className="font-semibold">Notes de commande</h2>
                        <p>{order.notes}</p>
                    </div>
                )}

                <div className="mt-12 grid gap-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-xs text-gray-500 sm:grid-cols-2">
                    <div>
                        <p className="font-semibold text-gray-900">ID interne</p>
                        <p>{order.id}</p>
                    </div>
                    <div>
                        <p className="font-semibold text-gray-900">Dernière mise à jour</p>
                        <p>{new Date(order.updated_at).toLocaleString('fr-FR')}</p>
                    </div>
                </div>
            </section>
        </main>
    )
}
