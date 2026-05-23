'use client'

import useSWR from 'swr'
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
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import type { AdminDashboardData } from '@/lib/admin/types'
import { adminFetch } from '@/lib/admin/client'

const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })

const chartConfig = {
  revenue: { label: 'Revenue', color: 'hsl(var(--primary))' },
  orders: { label: 'Orders', color: '#3b82f6' },
  customers: { label: 'Customers', color: '#8b5cf6' },
  quantity: { label: 'Quantity', color: '#22c55e' },
}

export function DashboardPage({ analyticsOnly = false }: { analyticsOnly?: boolean }) {
  const { data, isLoading, error } = useSWR<AdminDashboardData>('/api/admin/dashboard', adminFetch)

  if (isLoading) return <DashboardSkeleton />
  if (error || !data) {
    return (
      <Card>
        <CardContent className="p-8 text-sm text-destructive">{error?.message || 'Unable to load dashboard.'}</CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {!analyticsOnly && (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard title="Total Revenue" value={money.format(data.stats.totalRevenue)} icon={CircleDollarSign} trend={`${data.stats.revenueGrowth.toFixed(0)}%`} />
            <StatCard title="Total Orders" value={data.stats.totalOrders.toLocaleString()} icon={ShoppingCart} trend="+orders" />
            <StatCard title="Total Products" value={data.stats.totalProducts.toLocaleString()} icon={Package} trend="catalog" />
            <StatCard title="Total Customers" value={data.stats.totalCustomers.toLocaleString()} icon={Users} trend="profiles" />
            <StatCard title="Pending Orders" value={data.stats.pendingOrders.toLocaleString()} icon={Activity} trend="needs attention" />
            <StatCard title="Processing" value={data.stats.processingOrders.toLocaleString()} icon={ShoppingCart} trend="active orders" />
            <StatCard title="Delivered Orders" value={data.stats.deliveredOrders.toLocaleString()} icon={CheckCircle2} trend="fulfilled" />
            <StatCard title="Paid Orders" value={data.stats.paidOrders.toLocaleString()} icon={CreditCard} trend="payment status" />
            <StatCard title="Avg. Order" value={money.format(data.stats.avgOrderValue)} icon={TrendingUp} trend="basket value" />
            <StatCard title="Stock Alerts" value={(data.lowStockProducts.length + data.outOfStockProducts.length).toString()} icon={AlertTriangle} trend="inventory" />
          </div>

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
        </>
      )}

      <div className="grid gap-6 xl:grid-cols-[1.55fr_1fr]">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Revenue Overview</CardTitle>
            <Tabs defaultValue="daily" className="w-auto">
              <TabsList>
                <TabsTrigger value="daily">Daily</TabsTrigger>
                <TabsTrigger value="weekly">Weekly</TabsTrigger>
                <TabsTrigger value="monthly">Monthly</TabsTrigger>
              </TabsList>
              <TabsContent value="daily" className="mt-4">
                <RevenueChart data={data.revenueSeries} />
              </TabsContent>
              <TabsContent value="weekly" className="mt-4">
                <RevenueChart data={data.weeklyRevenue} />
              </TabsContent>
              <TabsContent value="monthly" className="mt-4">
                <RevenueChart data={data.monthlyRevenue} />
              </TabsContent>
            </Tabs>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Orders Status</CardTitle>
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
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Payment Status</CardTitle>
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
            <CardTitle>Top Customers</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.topCustomers.map((customer) => (
              <div key={customer.id} className="flex items-center justify-between gap-3 rounded-lg border p-3 text-sm">
                <div className="min-w-0">
                  <p className="truncate font-medium">{customer.name}</p>
                  <p className="truncate text-muted-foreground">{customer.email || `${customer.orders} orders`}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{money.format(customer.total)}</p>
                  <Badge variant="secondary">{customer.orders} orders</Badge>
                </div>
              </div>
            ))}
            {data.topCustomers.length === 0 && (
              <p className="text-sm text-muted-foreground">No customer orders yet.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Orders Analytics</CardTitle>
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
            <CardTitle>Customer Growth</CardTitle>
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
            <CardTitle>Best Selling Products</CardTitle>
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
            <CardTitle>Inventory Insights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[...data.outOfStockProducts, ...data.lowStockProducts].slice(0, 6).map((product) => (
              <div key={product.id} className="space-y-2">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="truncate font-medium">{product.name}</span>
                  <Badge variant={product.stock_quantity === 0 ? 'destructive' : 'secondary'}>{product.stock_quantity} left</Badge>
                </div>
                <Progress value={Math.min(product.stock_quantity * 10, 100)} />
              </div>
            ))}
            {data.lowStockProducts.length + data.outOfStockProducts.length === 0 && (
              <p className="text-sm text-muted-foreground">Inventory looks healthy.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.latestOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between gap-3 rounded-lg border p-3 text-sm">
                <div>
                  <p className="font-medium">{order.order_number || order.id.slice(0, 8)}</p>
                  <p className="text-muted-foreground">{order.profiles?.email || 'Customer'}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">{money.format(Number(order.total_amount))}</p>
                  <Badge className="capitalize" variant="outline">{order.status}</Badge>
                </div>
              </div>
            ))}
            <Button asChild variant="outline" className="w-full">
              <a href="/admin/orders">Open orders <ArrowUpRight className="ml-2 h-4 w-4" /></a>
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
        <YAxis tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
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
