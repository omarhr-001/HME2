'use client'

import { useProtectedRoute } from '@/hooks/use-protected-route'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Package, ArrowLeft, Eye, Download, Filter } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

interface Order {
  id: string
  orderNumber: string
  date: string
  total: number
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  items: number
}

export default function OrdersPage() {
  const { user, loading: authLoading } = useProtectedRoute()
  const [filterStatus, setFilterStatus] = useState('all')

  const orders: Order[] = [
    {
      id: '1',
      orderNumber: '#ORD-2024-001',
      date: '2024-05-01',
      total: 2499.99,
      status: 'delivered',
      items: 3
    },
    {
      id: '2',
      orderNumber: '#ORD-2024-002',
      date: '2024-04-15',
      total: 1899.50,
      status: 'shipped',
      items: 2
    },
    {
      id: '3',
      orderNumber: '#ORD-2024-003',
      date: '2024-04-01',
      total: 3599.99,
      status: 'processing',
      items: 4
    },
  ]

  const statusColors = {
    pending: { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-800', label: 'En attente' },
    processing: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-800', label: 'En cours' },
    shipped: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-800', label: 'Expédié' },
    delivered: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-800', label: 'Livré' },
    cancelled: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-800', label: 'Annulé' },
  }

  const filteredOrders = filterStatus === 'all' 
    ? orders 
    : orders.filter(order => order.status === filterStatus)

  if (authLoading || !user) {
    return (
      <>
        <Navbar />
        <div className="pt-17 min-h-screen bg-gray-50" />
        <Footer />
      </>
    )
  }

  return (
    <>
      <Navbar />
      <div className="pt-17 min-h-screen bg-gradient-to-br from-gray-50 via-gray-50 to-gray-100">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-5xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <Link href="/account" className="flex items-center gap-2 text-green-600 hover:text-green-700 font-semibold mb-6">
                <ArrowLeft className="w-5 h-5" />
                Retour au compte
              </Link>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Mes Commandes</h1>
              <p className="text-gray-600">Consultez l&apos;historique de vos commandes</p>
            </div>

            {/* Filter */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
              <div className="flex items-center gap-3">
                <Filter className="w-5 h-5 text-gray-600" />
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => setFilterStatus('all')}
                    className={`px-4 py-2 rounded-lg font-semibold transition ${
                      filterStatus === 'all'
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Tous
                  </button>
                  <button
                    onClick={() => setFilterStatus('pending')}
                    className={`px-4 py-2 rounded-lg font-semibold transition ${
                      filterStatus === 'pending'
                        ? 'bg-yellow-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    En attente
                  </button>
                  <button
                    onClick={() => setFilterStatus('processing')}
                    className={`px-4 py-2 rounded-lg font-semibold transition ${
                      filterStatus === 'processing'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    En cours
                  </button>
                  <button
                    onClick={() => setFilterStatus('shipped')}
                    className={`px-4 py-2 rounded-lg font-semibold transition ${
                      filterStatus === 'shipped'
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Expédié
                  </button>
                  <button
                    onClick={() => setFilterStatus('delivered')}
                    className={`px-4 py-2 rounded-lg font-semibold transition ${
                      filterStatus === 'delivered'
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Livré
                  </button>
                </div>
              </div>
            </div>

            {/* Orders List */}
            {filteredOrders.length === 0 ? (
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-12 text-center">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucune commande</h3>
                <p className="text-gray-600 mb-6">Vous n&apos;avez pas de commande avec ce statut</p>
                <Link href="/products">
                  <Button className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl">
                    Continuer vos achats
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredOrders.map(order => {
                  const colors = statusColors[order.status]
                  return (
                    <div
                      key={order.id}
                      className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all"
                    >
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900 mb-1">{order.orderNumber}</h3>
                          <p className="text-sm text-gray-600">
                            {new Date(order.date).toLocaleDateString('fr-FR', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                        <div className={`px-4 py-2 rounded-lg border-2 font-semibold text-sm ${colors.bg} ${colors.border} ${colors.text}`}>
                          {colors.label}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-4 border-y border-gray-200">
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Articles</p>
                          <p className="text-lg font-bold text-gray-900">{order.items}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Montant total</p>
                          <p className="text-lg font-bold text-green-600">{order.total.toFixed(2)} DT</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Numéro de suivi</p>
                          <p className="text-lg font-bold text-gray-900">Voir détails</p>
                        </div>
                      </div>

                      <div className="flex gap-3 pt-4">
                        <Button
                          variant="outline"
                          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg border border-gray-300 hover:bg-gray-50"
                        >
                          <Eye className="w-4 h-4" />
                          Voir les détails
                        </Button>
                        <Button
                          variant="outline"
                          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg border border-gray-300 hover:bg-gray-50"
                        >
                          <Download className="w-4 h-4" />
                          Facture
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}
