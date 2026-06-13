import { SupabaseClient } from '@supabase/supabase-js'
import { subDays, format } from 'date-fns'
import type { AdminOrder, AdminProduct } from './types'
import { toNumber } from './auth'

export interface WeeklyReport {
  period: {
    startDate: string
    endDate: string
  }
  metrics: {
    totalOrders: number
    totalRevenue: number
    averageOrderValue: number
    newCustomers: number
    completedOrders: number
    paidOrders: number
  }
  trends: {
    revenueChange: number
    orderChange: number
    avgOrderChange: number
  }
  topProducts: Array<{
    name: string
    quantity: number
    revenue: number
  }>
  lowStockProducts: Array<{
    name: string
    stockQuantity: number
  }>
  insights: string[]
}

export async function generateWeeklyReport(supabase: SupabaseClient): Promise<WeeklyReport> {
  const now = new Date()
  const endDate = new Date(now)
  endDate.setHours(23, 59, 59, 999)
  const startDate = subDays(endDate, 7)
  startDate.setHours(0, 0, 0, 0)

  const previousStartDate = subDays(startDate, 7)
  previousStartDate.setHours(0, 0, 0, 0)
  const previousEndDate = new Date(startDate)
  previousEndDate.setHours(23, 59, 59, 999)

  const [ordersResult, productsResult, profilesResult] = await Promise.all([
    supabase
      .from('orders')
      .select('*, order_items(*, products(id, name, image_url, category, category_id))')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString()),
    supabase
      .from('products')
      .select('*')
      .lte('stock_quantity', 5)
      .eq('in_stock', true),
    supabase
      .from('profiles')
      .select('*')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString()),
  ])

  if (ordersResult.error) throw ordersResult.error
  if (productsResult.error) throw productsResult.error
  if (profilesResult.error) throw profilesResult.error

  const thisWeekOrders = (ordersResult.data || []) as AdminOrder[]
  const lowStockProducts = (productsResult.data || []) as AdminProduct[]
  const newCustomers = profilesResult.data || []

  // Get previous week data for comparison
  const previousOrdersResult = await supabase
    .from('orders')
    .select('*, order_items(*, products(id, name))')
    .gte('created_at', previousStartDate.toISOString())
    .lte('created_at', previousEndDate.toISOString())

  if (previousOrdersResult.error) throw previousOrdersResult.error
  const previousWeekOrders = (previousOrdersResult.data || []) as AdminOrder[]

  // Calculate metrics
  const revenueOrders = thisWeekOrders.filter((order) => order.status !== 'cancelled')
  const previousRevenueOrders = previousWeekOrders.filter((order) => order.status !== 'cancelled')

  const totalRevenue = revenueOrders.reduce((sum, order) => sum + toNumber(order.total_amount), 0)
  const previousTotalRevenue = previousRevenueOrders.reduce((sum, order) => sum + toNumber(order.total_amount), 0)

  const totalOrders = thisWeekOrders.length
  const previousTotalOrders = previousWeekOrders.length

  const avgOrderValue = revenueOrders.length ? totalRevenue / revenueOrders.length : 0
  const previousAvgOrderValue = previousRevenueOrders.length ? previousTotalRevenue / previousRevenueOrders.length : 0

  const completedOrders = thisWeekOrders.filter((order) => order.status === 'delivered').length
  const paidOrders = thisWeekOrders.filter((order) => order.payment_status === 'paid').length

  // Calculate trends
  const revenueChange = previousTotalRevenue !== 0 ? ((totalRevenue - previousTotalRevenue) / previousTotalRevenue) * 100 : totalRevenue > 0 ? 100 : 0
  const orderChange = previousTotalOrders !== 0 ? ((totalOrders - previousTotalOrders) / previousTotalOrders) * 100 : totalOrders > 0 ? 100 : 0
  const avgOrderChange = previousAvgOrderValue !== 0 ? ((avgOrderValue - previousAvgOrderValue) / previousAvgOrderValue) * 100 : avgOrderValue > 0 ? 100 : 0

  // Get top products
  const productSales = new Map<string, { name: string; quantity: number; revenue: number }>()
  for (const order of thisWeekOrders) {
    for (const item of order.order_items || []) {
      const name = item.products?.name || 'Unknown product'
      const current = productSales.get(name) || { name, quantity: 0, revenue: 0 }
      current.quantity += item.quantity
      current.revenue += item.quantity * toNumber(item.price)
      productSales.set(name, current)
    }
  }

  const topProducts = Array.from(productSales.values())
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5)

  // Generate insights
  const insights: string[] = []

  if (revenueChange > 20) {
    insights.push(`🎉 Revenue increased by ${Math.round(revenueChange)}% compared to last week!`)
  } else if (revenueChange < -20) {
    insights.push(`⚠️ Revenue decreased by ${Math.round(Math.abs(revenueChange))}% compared to last week.`)
  }

  if (completedOrders > 0 && completedOrders >= totalOrders * 0.8) {
    insights.push(`✅ Great delivery rate: ${Math.round((completedOrders / totalOrders) * 100)}% of orders delivered.`)
  }

  if (lowStockProducts.length > 0) {
    insights.push(`📦 Warning: ${lowStockProducts.length} product(s) are low on stock and need attention.`)
  }

  if (newCustomers.length > 0) {
    insights.push(`👥 ${newCustomers.length} new customer(s) signed up this week.`)
  }

  if (topProducts.length > 0) {
    insights.push(`⭐ Best seller: ${topProducts[0].name} with ${topProducts[0].quantity} unit(s) sold.`)
  }

  if (insights.length === 0) {
    insights.push('📊 Keep monitoring your business metrics for actionable insights.')
  }

  return {
    period: {
      startDate: format(startDate, 'yyyy-MM-dd'),
      endDate: format(endDate, 'yyyy-MM-dd'),
    },
    metrics: {
      totalOrders,
      totalRevenue,
      averageOrderValue: Math.round(avgOrderValue * 100) / 100,
      newCustomers: newCustomers.length,
      completedOrders,
      paidOrders,
    },
    trends: {
      revenueChange: Math.round(revenueChange * 100) / 100,
      orderChange: Math.round(orderChange * 100) / 100,
      avgOrderChange: Math.round(avgOrderChange * 100) / 100,
    },
    topProducts,
    lowStockProducts: lowStockProducts
      .map((product) => ({
        name: product.name,
        stockQuantity: product.stock_quantity || 0,
      }))
      .slice(0, 3),
    insights,
  }
}
