'use client'

import { TrendingDown, TrendingUp } from 'lucide-react'
import type { WeeklyReport } from '@/lib/admin/weekly-report'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export function WeeklyReportCard({ report }: { report: WeeklyReport }) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    }).format(value)
  }

  const TrendIcon = ({ value }: { value: number }) => {
    if (value === 0) return null
    const isPositive = value > 0
    const Icon = isPositive ? TrendingUp : TrendingDown
    const color = isPositive ? 'text-green-600' : 'text-red-600'
    return <Icon className={`h-4 w-4 ${color}`} />
  }

  return (
    <div className="space-y-4">
      {/* Period Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Rapport hebdomadaire
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {report.period.startDate} au {report.period.endDate}
          </p>
        </CardHeader>
      </Card>

      {/* Key Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Total Revenue */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Chiffre d&apos;affaires</p>
              <div className="flex items-end gap-2">
                <p className="text-2xl font-bold">{formatCurrency(report.metrics.totalRevenue)}</p>
                {report.trends.revenueChange !== 0 && (
                  <div className="flex items-center gap-1 text-sm font-medium">
                    <TrendIcon value={report.trends.revenueChange} />
                    <span className={report.trends.revenueChange > 0 ? 'text-green-600' : 'text-red-600'}>
                      {Math.abs(report.trends.revenueChange)}%
                    </span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Orders */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Commandes</p>
              <div className="flex items-end gap-2">
                <p className="text-2xl font-bold">{report.metrics.totalOrders}</p>
                {report.trends.orderChange !== 0 && (
                  <div className="flex items-center gap-1 text-sm font-medium">
                    <TrendIcon value={report.trends.orderChange} />
                    <span className={report.trends.orderChange > 0 ? 'text-green-600' : 'text-red-600'}>
                      {Math.abs(report.trends.orderChange)}%
                    </span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Average Order Value */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Panier moyen</p>
              <div className="flex items-end gap-2">
                <p className="text-2xl font-bold">{formatCurrency(report.metrics.averageOrderValue)}</p>
                {report.trends.avgOrderChange !== 0 && (
                  <div className="flex items-center gap-1 text-sm font-medium">
                    <TrendIcon value={report.trends.avgOrderChange} />
                    <span className={report.trends.avgOrderChange > 0 ? 'text-green-600' : 'text-red-600'}>
                      {Math.abs(report.trends.avgOrderChange)}%
                    </span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Completed Orders */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Commandes livrées</p>
              <p className="text-2xl font-bold">{report.metrics.completedOrders}</p>
            </div>
          </CardContent>
        </Card>

        {/* Paid Orders */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Paiements reçus</p>
              <p className="text-2xl font-bold">{report.metrics.paidOrders}</p>
            </div>
          </CardContent>
        </Card>

        {/* New Customers */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Nouveaux clients</p>
              <p className="text-2xl font-bold">{report.metrics.newCustomers}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Products */}
      {report.topProducts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Meilleurs vendeurs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {report.topProducts.map((product, index) => (
                <div key={index} className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-muted-foreground">{product.quantity} unité(s) vendue(s)</p>
                  </div>
                  <p className="font-semibold">{formatCurrency(product.revenue)}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Low Stock Products */}
      {report.lowStockProducts.length > 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader>
            <CardTitle className="text-base text-amber-900">⚠️ Produits en rupture de stock</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {report.lowStockProducts.map((product, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <span className="text-amber-900">{product.name}</span>
                  <Badge variant="destructive">{product.stockQuantity} en stock</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Insights */}
      {report.insights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {report.insights.map((insight, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <span className="mt-1 flex-shrink-0">•</span>
                  <span className="text-muted-foreground">{insight}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
