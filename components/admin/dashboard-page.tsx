'use client'

import useSWR from 'swr'
import { useEffect, useState } from 'react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from 'recharts'
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  CircleDollarSign,
  CreditCard,
  Package,
  ShoppingCart,
  Sparkles,
  TrendingUp,
  Users,
  Settings2,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import type { AdminDashboardData } from '@/lib/admin/types'
import { adminFetch } from '@/lib/admin/client'

const money = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'TND', maximumFractionDigits: 0 })

const chartConfig = {
  revenue: { label: "Chiffre d'affaires", color: 'hsl(var(--primary))' },
  orders: { label: 'Commandes', color: '#3b82f6' },
  customers: { label: 'Clients', color: '#8b5cf6' },
  quantity: { label: 'Quantité', color: '#22c55e' },
}

function formatTrend(value: number) {
  const rounded = Math.round(value)
  if (rounded > 0) return `+${rounded}%`
  return `${rounded}%`
}

const defaultDashboardSettings = {
  showKPIs: true,
  showInsights: true,
  showRevenue: true,
  showStatus: true,
  showPayment: true,
  showCustomers: true,
  showOrders: true,
  showInventory: true,
  showBestSellers: true,
  showStock: true,
  showActivity: true,
}

export function DashboardPage({ analyticsOnly = false }: { analyticsOnly?: boolean }) {
  const { data, isLoading, error } = useSWR<AdminDashboardData>('/api/admin/dashboard', adminFetch)
  const [settings, setSettings] = useState(defaultDashboardSettings)

  useEffect(() => {
    try {
      const stored = localStorage.getItem('hme-dashboard-settings')
      if (stored) {
        setSettings(prev => ({ ...prev, ...JSON.parse(stored) }))
      }
    } catch (e) {
      // Ignore parse errors
    }
  }, [])

  const saveDashboardSettings = (newSettings: typeof defaultDashboardSettings) => {
    setSettings(newSettings)
    localStorage.setItem('hme-dashboard-settings', JSON.stringify(newSettings))
  }

  const resetDashboardSettings = () => {
    setSettings(defaultDashboardSettings)
    localStorage.removeItem('hme-dashboard-settings')
  }

  if (isLoading) return <DashboardSkeleton />
  if (error || !data) {
    return (
      <Card>
        <CardContent className="p-8 text-sm text-destructive">{error?.message || 'Impossible de charger le tableau de bord.'}</CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {!analyticsOnly && (
        <>
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Tableau de bord</h2>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Settings2 className="mr-2 h-4 w-4" />
                  Personnaliser
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Personnaliser le tableau de bord</DialogTitle>
                  <DialogDescription>Sélectionnez les sections à afficher sur votre tableau de bord</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Cartes KPI</span>
                    <Switch checked={settings.showKPIs} onCheckedChange={(v) => saveDashboardSettings({ ...settings, showKPIs: v })} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Insights</span>
                    <Switch checked={settings.showInsights} onCheckedChange={(v) => saveDashboardSettings({ ...settings, showInsights: v })} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Graphique de chiffre d'affaires</span>
                    <Switch checked={settings.showRevenue} onCheckedChange={(v) => saveDashboardSettings({ ...settings, showRevenue: v })} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Statut des commandes</span>
                    <Switch checked={settings.showStatus} onCheckedChange={(v) => saveDashboardSettings({ ...settings, showStatus: v })} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Statut des paiements</span>
                    <Switch checked={settings.showPayment} onCheckedChange={(v) => saveDashboardSettings({ ...settings, showPayment: v })} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Meilleurs clients</span>
                    <Switch checked={settings.showCustomers} onCheckedChange={(v) => saveDashboardSettings({ ...settings, showCustomers: v })} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Analyse des commandes</span>
                    <Switch checked={settings.showOrders} onCheckedChange={(v) => saveDashboardSettings({ ...settings, showOrders: v })} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Évolution des clients</span>
                    <Switch checked={settings.showInventory} onCheckedChange={(v) => saveDashboardSettings({ ...settings, showInventory: v })} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Produits les plus vendus</span>
                    <Switch checked={settings.showBestSellers} onCheckedChange={(v) => saveDashboardSettings({ ...settings, showBestSellers: v })} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Suivi du stock</span>
                    <Switch checked={settings.showStock} onCheckedChange={(v) => saveDashboardSettings({ ...settings, showStock: v })} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Activité récente</span>
                    <Switch checked={settings.showActivity} onCheckedChange={(v) => saveDashboardSettings({ ...settings, showActivity: v })} />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={resetDashboardSettings}>Réinitialiser</Button>
                  <Button>Terminé</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {settings.showKPIs && (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <StatCard title="Chiffre d'affaires total" value={money.format(data.stats.totalRevenue)} icon={CircleDollarSign} trend={`${formatTrend(data.stats.revenueGrowth)} ce mois-ci`} />
              <StatCard title="Commandes totales" value={data.stats.totalOrders.toLocaleString()} icon={ShoppingCart} trend={`${formatTrend(data.stats.orderGrowth)} ce mois-ci`} />
              <StatCard title="Produits totaux" value={data.stats.totalProducts.toLocaleString()} icon={Package} trend={`${formatTrend(data.stats.productGrowth)} ce mois-ci`} />
              <StatCard title="Clients totaux" value={data.stats.totalCustomers.toLocaleString()} icon={Users} trend={`${formatTrend(data.stats.customerGrowthRate)} ce mois-ci`} />
              <StatCard title="Commandes en attente" value={data.stats.pendingOrders.toLocaleString()} icon={Activity} trend={`${data.stats.pendingOrders.toLocaleString()} en attente`} />
              <StatCard title="En traitement" value={data.stats.processingOrders.toLocaleString()} icon={ShoppingCart} trend={`${data.stats.processingOrders.toLocaleString()} actives`} />
              <StatCard title="Commandes livrées" value={data.stats.deliveredOrders.toLocaleString()} icon={CheckCircle2} trend={`${Math.round(data.stats.deliveryRate)}% de livraison`} />
              <StatCard title="Commandes payées" value={data.stats.paidOrders.toLocaleString()} icon={CreditCard} trend={`${Math.round(data.stats.paidRate)}% payées`} />
              <StatCard title="Panier moyen" value={money.format(data.stats.avgOrderValue)} icon={TrendingUp} trend={`${formatTrend(data.stats.avgOrderGrowth)} ce mois-ci`} />
              <StatCard title="Alertes stock" value={(data.lowStockProducts.length + data.outOfStockProducts.length).toString()} icon={AlertTriangle} trend={`${Math.round(data.stats.stockAlertRate)}% du catalogue`} />
            </div>
          )}

          {settings.showInsights && (
            <div className="grid gap-4 lg:grid-cols-4">
              {data.insights.map((insight) => (
                <Card key={insight.title} className="overflow-hidden border bg-card/80 shadow-sm backdrop-blur">
                  <CardContent className="flex items-start gap-3 p-5">
                    <div className="rounded-lg bg-primary/10 p-2 text-primary">
                      <Sparkles className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{insight.title}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{insight.value}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {(settings.showRevenue || settings.showStatus) && (
        <div className="grid gap-6 xl:grid-cols-[1.8fr_1fr]">
          {settings.showRevenue && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Vue du chiffre d'affaires</CardTitle>
                <Tabs defaultValue="daily" className="w-auto">
                  <TabsList>
                    <TabsTrigger value="daily">Jour</TabsTrigger>
                    <TabsTrigger value="weekly">Semaine</TabsTrigger>
                    <TabsTrigger value="monthly">Mois</TabsTrigger>
                  </TabsList>
                  <TabsContent value="daily" className="mt-4">
                    <div className="h-[300px] w-full">
                      <RevenueChart data={data.revenueSeries} />
                    </div>
                  </TabsContent>
                  <TabsContent value="weekly" className="mt-4">
                    <div className="h-[300px] w-full">
                      <RevenueChart data={data.weeklyRevenue} />
                    </div>
                  </TabsContent>
                  <TabsContent value="monthly" className="mt-4">
                    <div className="h-[300px] w-full">
                      <RevenueChart data={data.monthlyRevenue} />
                    </div>
                  </TabsContent>
                </Tabs>
              </CardHeader>
            </Card>
          )}

          {settings.showStatus && (
            <Card>
              <CardHeader>
                <CardTitle>Statut des commandes</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[285px] w-full">
                  <PieChart>
                    <Pie data={data.statusDistribution} dataKey="value" nameKey="name" innerRadius={62} outerRadius={92}>
                      {data.statusDistribution.map((entry) => (
                        <Cell key={entry.name} fill={entry.fill} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </PieChart>
                </ChartContainer>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {data.statusDistribution.map((item) => (
                    <div key={item.name} className="flex items-center gap-2 rounded-md border px-2 py-1">
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.fill }} />
                      <span className="capitalize">{item.name}</span>
                      <span className="ml-auto text-muted-foreground">{item.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Statut des paiements</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[250px] w-full">
              <PieChart>
                <Pie data={data.paymentDistribution} dataKey="value" nameKey="name" innerRadius={54} outerRadius={84}>
                  {data.paymentDistribution.map((entry) => (
                    <Cell key={entry.name} fill={entry.fill} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ChartContainer>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {data.paymentDistribution.map((item) => (
                <div key={item.name} className="flex items-center gap-2 rounded-md border px-2 py-1">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.fill }} />
                  <span className="capitalize">{item.name}</span>
                  <span className="ml-auto text-muted-foreground">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Meilleurs clients</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.topCustomers.map((customer) => (
              <div key={customer.id} className="flex items-center justify-between gap-3 rounded-lg border p-3 text-sm">
                <div className="min-w-0">
                  <p className="truncate font-medium">{customer.name}</p>
                  <p className="truncate text-muted-foreground">{customer.email || `${customer.orders} commandes`}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{money.format(customer.total)}</p>
                  <Badge variant="secondary">{customer.orders} commandes</Badge>
                </div>
              </div>
            ))}
            {data.topCustomers.length === 0 && (
              <p className="text-sm text-muted-foreground">Aucune commande client pour le moment.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Analyse des commandes</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[280px] w-full">
              <BarChart data={data.ordersSeries}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="label" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="orders" fill="var(--color-orders)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Évolution des clients</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[280px] w-full">
              <AreaChart data={data.customerGrowth}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="label" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area dataKey="customers" type="monotone" fill="var(--color-customers)" fillOpacity={0.18} stroke="var(--color-customers)" />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Produits les plus vendus</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <BarChart data={data.bestSellers} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid horizontal={false} />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} width={110} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="quantity" fill="var(--color-quantity)" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Suivi du stock</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[...data.outOfStockProducts, ...data.lowStockProducts].slice(0, 6).map((product) => (
              <div key={product.id} className="space-y-2">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="truncate font-medium">{product.name}</span>
                  <Badge variant={product.stock_quantity === 0 ? 'destructive' : 'secondary'}>{product.stock_quantity} restant(s)</Badge>
                </div>
                <Progress value={Math.min(product.stock_quantity * 10, 100)} />
              </div>
            ))}
            {data.lowStockProducts.length + data.outOfStockProducts.length === 0 && (
              <p className="text-sm text-muted-foreground">Le stock est en bon état.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Activité récente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.latestOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between gap-3 rounded-lg border p-3 text-sm">
                <div>
                  <p className="font-medium">{order.order_number || order.id.slice(0, 8)}</p>
                  <p className="text-muted-foreground">{order.profiles?.email || 'Client'}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">{money.format(Number(order.total_amount))}</p>
                  <Badge className="capitalize" variant="outline">{order.status}</Badge>
                </div>
              </div>
            ))}
            <Button asChild variant="outline" className="w-full">
              <a href="/admin/orders">Voir les commandes <ArrowUpRight className="ml-2 h-4 w-4" /></a>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function RevenueChart({ data }: { data: Array<{ label: string; revenue: number }> }) {
  return (
    <ChartContainer config={chartConfig} className="h-[320px] w-full">
      <LineChart data={data}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="label" tickLine={false} axisLine={false} />
        <YAxis tickLine={false} axisLine={false} tickFormatter={(value) => `${value} DT`} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Line dataKey="revenue" type="monotone" stroke="var(--color-revenue)" strokeWidth={3} dot={false} />
      </LineChart>
    </ChartContainer>
  )
}

function StatCard({ title, value, icon: Icon, trend }: { title: string; value: string; icon: any; trend: string }) {
  return (
    <Card className="group overflow-hidden bg-card/82 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="mt-2 text-2xl font-semibold tracking-normal">{value}</p>
          </div>
          <div className="rounded-lg bg-primary/10 p-2 text-primary transition-transform group-hover:scale-105">
            <Icon className="h-5 w-5" />
          </div>
        </div>
        <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
          <Badge variant="secondary" className="gap-1">
            <ArrowUpRight className="h-3 w-3" />
            {trend}
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <Skeleton key={index} className="h-32 rounded-lg" />
        ))}
      </div>
      <Skeleton className="h-96 rounded-lg" />
    </div>
  )
}
