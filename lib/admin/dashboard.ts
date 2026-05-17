import { SupabaseClient } from '@supabase/supabase-js'
import { subDays, format, isAfter, startOfMonth, subMonths } from 'date-fns'
import type { AdminDashboardData, AdminOrder, AdminProduct, OrderStatus } from './types'
import { toNumber } from './auth'

const statusColors: Record<OrderStatus, string> = {
  pending: '#f59e0b',
  processing: '#3b82f6',
  shipped: '#8b5cf6',
  delivered: '#22c55e',
  cancelled: '#ef4444',
}

export async function getDashboardData(supabase: SupabaseClient): Promise<AdminDashboardData> {
  const [ordersResult, productsResult, profilesResult, categoriesResult] = await Promise.all([
    supabase
      .from('orders')
      .select('*, order_items(*, products(id, name, image_url, category, category_id))')
      .order('created_at', { ascending: false }),
    supabase.from('products').select('*, categories(*)').order('created_at', { ascending: false }),
    supabase.from('profiles').select('*').order('created_at', { ascending: false }),
    supabase.from('categories').select('*'),
  ])

  if (ordersResult.error) throw ordersResult.error
  if (productsResult.error) throw productsResult.error
  if (profilesResult.error) throw profilesResult.error
  if (categoriesResult.error) throw categoriesResult.error

  const profileMap = new Map((profilesResult.data || []).map((profile: any) => [profile.id, profile]))
  const orders = ((ordersResult.data || []) as AdminOrder[]).map((order) => ({
    ...order,
    profiles: profileMap.get(order.user_id) || null,
  }))
  const products = (productsResult.data || []) as AdminProduct[]
  const profiles = profilesResult.data || []
  const categories = categoriesResult.data || []
  const now = new Date()
  const monthStart = startOfMonth(now)
  const previousMonthStart = startOfMonth(subMonths(now, 1))

  const deliveredOrders = orders.filter((order) => order.status === 'delivered')
  const revenueOrders = orders.filter((order) => order.status !== 'cancelled')
  const totalRevenue = revenueOrders.reduce((sum, order) => sum + toNumber(order.total_amount), 0)
  const thisMonthRevenue = revenueOrders
    .filter((order) => isAfter(new Date(order.created_at), monthStart))
    .reduce((sum, order) => sum + toNumber(order.total_amount), 0)
  const previousMonthRevenue = revenueOrders
    .filter((order) => {
      const date = new Date(order.created_at)
      return isAfter(date, previousMonthStart) && !isAfter(date, monthStart)
    })
    .reduce((sum, order) => sum + toNumber(order.total_amount), 0)
  const revenueGrowth = previousMonthRevenue
    ? ((thisMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100
    : thisMonthRevenue > 0
      ? 100
      : 0

  const revenueSeries = makeRevenueDaySeries(orders, 14)
  const ordersSeries = makeOrdersDaySeries(orders, 14)
  const weeklyRevenue = groupByWindow(orders, 7, 6)
  const monthlyRevenue = groupByMonth(orders, 6)
  const statusDistribution = (Object.keys(statusColors) as OrderStatus[]).map((status) => ({
    name: status,
    value: orders.filter((order) => order.status === status).length,
    fill: statusColors[status],
  }))

  const productSales = new Map<string, { name: string; quantity: number; revenue: number }>()
  for (const order of orders) {
    for (const item of order.order_items || []) {
      const name = item.products?.name || 'Unknown product'
      const current = productSales.get(name) || { name, quantity: 0, revenue: 0 }
      current.quantity += item.quantity
      current.revenue += item.quantity * toNumber(item.price)
      productSales.set(name, current)
    }
  }

  const customers = profiles.filter((profile: any) => profile.role === 'client')
  const topCustomers = Object.values(
    orders.reduce<Record<string, { id: string; name: string; email: string | null; total: number; orders: number }>>(
      (acc, order) => {
        const profile = order.profiles
        const id = order.user_id
        const name = [profile?.first_name, profile?.last_name].filter(Boolean).join(' ') || profile?.email || 'Customer'
        acc[id] ||= { id, name, email: profile?.email || null, total: 0, orders: 0 }
        acc[id].total += toNumber(order.total_amount)
        acc[id].orders += 1
        return acc
      },
      {},
    ),
  )
    .sort((a, b) => b.total - a.total)
    .slice(0, 5)

  const lowStockProducts = products.filter((product) => product.stock_quantity > 0 && product.stock_quantity <= 5)
  const outOfStockProducts = products.filter((product) => product.stock_quantity === 0 || !product.in_stock)
  const bestCategory = topCategory(orders, categories)

  return {
    stats: {
      totalRevenue,
      totalOrders: orders.length,
      totalProducts: products.length,
      totalCustomers: customers.length,
      pendingOrders: orders.filter((order) => order.status === 'pending').length,
      deliveredOrders: deliveredOrders.length,
      revenueGrowth,
    },
    revenueSeries,
    weeklyRevenue,
    monthlyRevenue,
    ordersSeries,
    statusDistribution,
    bestSellers: Array.from(productSales.values()).sort((a, b) => b.quantity - a.quantity).slice(0, 8),
    customerGrowth: makeCustomerGrowth(customers),
    lowStockProducts,
    outOfStockProducts,
    latestOrders: orders.slice(0, 6),
    topCustomers,
    insights: [
      { title: 'Revenue growth', value: `${Math.round(revenueGrowth)}% this month`, tone: revenueGrowth >= 0 ? 'green' : 'rose' },
      { title: 'Low stock', value: `${lowStockProducts.length} products need restock`, tone: 'amber' },
      { title: 'Most sold category', value: bestCategory || 'Not enough data yet', tone: 'blue' },
      { title: 'Peak sales day', value: peakSalesDay(orders), tone: 'green' },
    ],
  }
}

function makeRevenueDaySeries(orders: AdminOrder[], days: number) {
  return Array.from({ length: days }).map((_, index) => {
    const date = subDays(new Date(), days - index - 1)
    const key = format(date, 'yyyy-MM-dd')
    const dayOrders = orders.filter((order) => format(new Date(order.created_at), 'yyyy-MM-dd') === key)
    return {
      label: format(date, 'MMM d'),
      revenue: dayOrders.filter((order) => order.status !== 'cancelled').reduce((sum, order) => sum + toNumber(order.total_amount), 0),
    }
  })
}

function makeOrdersDaySeries(orders: AdminOrder[], days: number) {
  return Array.from({ length: days }).map((_, index) => {
    const date = subDays(new Date(), days - index - 1)
    const key = format(date, 'yyyy-MM-dd')
    return {
      label: format(date, 'MMM d'),
      orders: orders.filter((order) => format(new Date(order.created_at), 'yyyy-MM-dd') === key).length,
    }
  })
}

function groupByWindow(orders: AdminOrder[], windowDays: number, windows: number) {
  return Array.from({ length: windows }).map((_, index) => {
    const end = subDays(new Date(), (windows - index - 1) * windowDays)
    const start = subDays(end, windowDays - 1)
    const revenue = orders
      .filter((order) => {
        const date = new Date(order.created_at)
        return date >= start && date <= end && order.status !== 'cancelled'
      })
      .reduce((sum, order) => sum + toNumber(order.total_amount), 0)
    return { label: `${format(start, 'MMM d')}`, revenue }
  })
}

function groupByMonth(orders: AdminOrder[], months: number) {
  return Array.from({ length: months }).map((_, index) => {
    const date = subMonths(new Date(), months - index - 1)
    const key = format(date, 'yyyy-MM')
    return {
      label: format(date, 'MMM'),
      revenue: orders
        .filter((order) => format(new Date(order.created_at), 'yyyy-MM') === key && order.status !== 'cancelled')
        .reduce((sum, order) => sum + toNumber(order.total_amount), 0),
    }
  })
}

function makeCustomerGrowth(customers: any[]) {
  return Array.from({ length: 6 }).map((_, index) => {
    const date = subMonths(new Date(), 5 - index)
    const key = format(date, 'yyyy-MM')
    return {
      label: format(date, 'MMM'),
      customers: customers.filter((customer) => format(new Date(customer.created_at), 'yyyy-MM') <= key).length,
    }
  })
}

function topCategory(orders: AdminOrder[], categories: any[]) {
  const counts = new Map<string, number>()
  for (const order of orders) {
    for (const item of order.order_items || []) {
      const product: any = item.products
      const key = product?.category_id || product?.category || product?.name
      if (key) counts.set(key, (counts.get(key) || 0) + item.quantity)
    }
  }
  const winner = Array.from(counts.entries()).sort((a, b) => b[1] - a[1])[0]?.[0]
  return categories.find((category) => category.id === winner)?.name || winner || null
}

function peakSalesDay(orders: AdminOrder[]) {
  const days = new Map<string, number>()
  for (const order of orders) {
    const day = format(new Date(order.created_at), 'EEEE')
    days.set(day, (days.get(day) || 0) + toNumber(order.total_amount))
  }
  return Array.from(days.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] || 'No orders yet'
}
