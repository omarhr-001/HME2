'use client'

import { useEffect, useState } from 'react'
import { Users, ShoppingCart, Package, TrendingUp } from 'lucide-react'
import { StatCard, DashboardCard, StatusBadge } from '@/components/admin-components'
import { supabase } from '@/lib/supabase'

interface Order {
  id: string
  total: number
  status: string
  created_at: string
  user?: {
    email: string
  }
}

interface Stats {
  totalUsers: number
  totalOrders: number
  totalRevenue: number
  totalProducts: number
  recentOrders: Order[]
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    recentOrders: [],
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  async function fetchStats() {
    try {
      // Fetch total users
      const { count: usersCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })

      // Fetch total products
      const { count: productsCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })

      // Fetch orders
      const { data: orders } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100)

      // Calculate stats
      const totalOrders = orders?.length || 0
      const totalRevenue = orders?.reduce((sum, order) => sum + (order.total || 0), 0) || 0
      const recentOrders = orders?.slice(0, 5) || []

      setStats({
        totalUsers: usersCount || 0,
        totalOrders,
        totalRevenue,
        totalProducts: productsCount || 0,
        recentOrders,
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Tableau de Bord</h1>
        <p className="text-gray-600 mt-2">Bienvenue sur votre tableau de bord administrateur</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={Users} title="Utilisateurs" value={stats.totalUsers} />
        <StatCard icon={ShoppingCart} title="Commandes" value={stats.totalOrders} />
        <StatCard icon={TrendingUp} title="Revenu Total" value={`${stats.totalRevenue.toFixed(2)} DT`} />
        <StatCard icon={Package} title="Produits" value={stats.totalProducts} />
      </div>

      {/* Recent Orders */}
      <DashboardCard>
        <h2 className="text-xl font-bold text-gray-900 mb-6">Commandes Récentes</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">ID Commande</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Montant</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Statut</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Date</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentOrders.map((order) => (
                <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                  <td className="py-3 px-4 font-medium text-gray-900">{order.id.slice(0, 8)}...</td>
                  <td className="py-3 px-4 text-gray-700">{order.total.toFixed(2)} DT</td>
                  <td className="py-3 px-4">
                    <StatusBadge status={order.status} />
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
