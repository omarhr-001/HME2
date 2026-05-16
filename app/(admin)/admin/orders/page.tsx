'use client'

import { useEffect, useState } from 'react'
import { Search, Filter, ChevronDown } from 'lucide-react'
import { DashboardCard, StatusBadge } from '@/components/admin-components'
import { supabase } from '@/lib/supabase'

interface Order {
  id: string
  total: number
  status: string
  created_at: string
  user_id: string
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  useEffect(() => {
    fetchOrders()
  }, [filterStatus])

  async function fetchOrders() {
    try {
      let query = supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })

      if (filterStatus !== 'all') {
        query = query.eq('status', filterStatus)
      }

      const { data } = await query

      setOrders(data || [])
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  async function updateOrderStatus(orderId: string, newStatus: string) {
    try {
      await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId)

      setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o))
    } catch (error) {
      console.error('Error updating order:', error)
    }
  }

  const filteredOrders = orders.filter(order =>
    order.id.includes(searchTerm.toLowerCase()) ||
    order.user_id.includes(searchTerm.toLowerCase())
  )

  const statuses = ['pending', 'processing', 'shipped', 'delivered']

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Commandes</h1>
        <p className="text-gray-600 mt-2">Gérez toutes les commandes clients</p>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4 flex-col md:flex-row">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher par ID ou utilisateur..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent outline-none"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent outline-none appearance-none bg-white"
          >
            <option value="all">Tous les statuts</option>
            {statuses.map(status => (
              <option key={status} value={status}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Orders Table */}
      <DashboardCard>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">ID Commande</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Utilisateur</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Montant</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Statut</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                  <td className="py-3 px-4 font-medium text-gray-900">{order.id.slice(0, 8)}...</td>
                  <td className="py-3 px-4 text-gray-700">{order.user_id.slice(0, 8)}...</td>
                  <td className="py-3 px-4 font-medium text-gray-900">{order.total.toFixed(2)} DT</td>
                  <td className="py-3 px-4">
                    <select
                      value={order.status}
                      onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                      className="px-3 py-1 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-green-600 focus:border-transparent outline-none appearance-none bg-white"
                    >
                      {statuses.map(status => (
                        <option key={status} value={status}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="py-3 px-4 text-gray-700">
                    {new Date(order.created_at).toLocaleDateString('fr-FR')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DashboardCard>
    </div>
  )
}
