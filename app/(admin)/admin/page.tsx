'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { StatCard, StatusBadge } from '@/components/admin-components'
import { Users, ShoppingCart, DollarSign, Package } from 'lucide-react'

interface Order {
  id: string
  total_price: number
  status: string
  created_at: string
  user_id: string
}

export default function AdminPage() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
  })
  const [recentOrders, setRecentOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch users count
        const { count: usersCount } = await supabase
          .from('profiles')
          .select('id', { count: 'exact', head: true })

        // Fetch orders
        const { data: orders, count: ordersCount } = await supabase
          .from('orders')
          .select('*', { count: 'exact' })
          .order('created_at', { ascending: false })
          .limit(5)

        // Fetch products count
        const { count: productsCount } = await supabase
          .from('products')
          .select('id', { count: 'exact', head: true })

        // Calculate total revenue
        const totalRevenue = orders?.reduce((sum, order) => sum + (order.total_price || 0), 0) || 0

        setStats({
          totalUsers: usersCount || 0,
          totalOrders: ordersCount || 0,
          totalRevenue: totalRevenue,
          totalProducts: productsCount || 0,
        })

        setRecentOrders(orders || [])
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return <div className="text-center py-12">Chargement...</div>
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Tableau de bord</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Utilisateurs"
          value={stats.totalUsers}
          icon={<Users size={28} />}
        />
        <StatCard
          title="Commandes"
          value={stats.totalOrders}
          icon={<ShoppingCart size={28} />}
        />
        <StatCard
          title="Revenu Total"
          value={`${stats.totalRevenue.toFixed(2)} DT`}
          icon={<DollarSign size={28} />}
        />
        <StatCard
          title="Produits"
          value={stats.totalProducts}
          icon={<Package size={28} />}
        />
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">Commandes récentes</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">ID</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Prix</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Statut</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Date</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.length > 0 ? (
                recentOrders.map((order) => (
                  <tr key={order.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">{order.id.slice(0, 8)}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{order.total_price.toFixed(2)} DT</td>
                    <td className="px-6 py-4 text-sm">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(order.created_at).toLocaleDateString('fr-FR')}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                    Aucune commande
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
