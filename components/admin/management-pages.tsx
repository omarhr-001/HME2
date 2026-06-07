'use client'

import Image from 'next/image'
import Link from 'next/link'
import useSWR from 'swr'
import { useEffect, useMemo, useState } from 'react'
import { Bell, Download, Eye, FileSpreadsheet, Pencil, Plus, Receipt, Save, Search, Trash2, Upload } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Progress } from '@/components/ui/progress'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { ImageManagementCard } from '@/components/admin/image-management'
import { RichDescriptionEditor } from '@/components/admin/rich-description-editor'
import { adminFetch, downloadAdminFile, adminUpload } from '@/lib/admin/client'
import { EmptyState } from '@/components/admin/admin-shell'
import type { AdminCategory, AdminOrder, AdminProduct, AdminProfile, OrderStatus, PaymentStatus } from '@/lib/admin/types'
import { makeSkuBase } from '@/lib/utils'
import type { Brand } from '@/lib/types'
import { cn } from '@/lib/utils'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import { DEFAULT_SHIPPING_SETTINGS, type ShippingSettings } from '@/lib/shipping'

const money = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'TND' })
const statuses: OrderStatus[] = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']
const paymentStatuses: PaymentStatus[] = ['pending', 'paid', 'failed', 'refunded']

const orderStatusLabels: Record<OrderStatus, string> = {
  pending: 'En attente',
  processing: 'En traitement',
  shipped: 'Expédiée',
  delivered: 'Livrée',
  cancelled: 'Annulée',
}

const statusClass: Record<OrderStatus, string> = {
  pending: 'bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-200',
  processing: 'bg-blue-100 text-blue-800 dark:bg-blue-500/15 dark:text-blue-200',
  shipped: 'bg-violet-100 text-violet-800 dark:bg-violet-500/15 dark:text-violet-200',
  delivered: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-200',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-500/15 dark:text-red-200',
}

const paymentMethodLabels = {
  cash_on_delivery: 'Paiement à la livraison',
  bank_transfer: 'Virement bancaire',
}

const paymentStatusLabels: Record<PaymentStatus, string> = {
  pending: 'En attente',
  paid: 'Payé',
  failed: 'Échoué',
  refunded: 'Remboursé',
}

const paymentStatusClass: Record<PaymentStatus, string> = {
  pending: 'bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-200',
  paid: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-200',
  failed: 'bg-red-100 text-red-800 dark:bg-red-500/15 dark:text-red-200',
  refunded: 'bg-slate-100 text-slate-800 dark:bg-slate-500/15 dark:text-slate-200',
}

const defaultProductForm = {
  is_active: true,
  in_stock: true,
  stock_quantity: 0,
  brand_id: null,
}

const notificationOptions = [
  { key: 'newOrders', label: 'Nouvelles commandes' },
  { key: 'lowStockAlerts', label: 'Alertes de stock faible' },
  { key: 'customerSignups', label: 'Nouveaux clients' },
  { key: 'weeklyReports', label: 'Rapports hebdomadaires' },
] as const

type NotificationKey = (typeof notificationOptions)[number]['key']

const defaultNotificationSettings: Record<NotificationKey, boolean> = {
  newOrders: true,
  lowStockAlerts: true,
  customerSignups: true,
  weeklyReports: true,
}

function productFormInitialValue(product?: AdminProduct) {
  if (!product) return { ...defaultProductForm, image_url: '', image_urls: [] }

  const imageUrls = [
    ...new Set(
      [
        ...[...(product.product_images || [])]
          .sort((a, b) => a.sort_order - b.sort_order)
          .map((image) => image.image_url),
        product.image_url,
      ].filter(Boolean) as string[],
    ),
  ]

  return {
    ...product,
    image_url: imageUrls[0] || '',
    image_urls: imageUrls,
  }
}

function productImages(product: Pick<AdminProduct, 'image_url' | 'product_images'>) {
  return [
    ...new Set(
      [
        ...[...(product.product_images || [])]
          .sort((a, b) => a.sort_order - b.sort_order)
          .map((image) => image.image_url),
        product.image_url,
      ].filter(Boolean) as string[],
    ),
  ]
}

function productBrandName(product: AdminProduct, brands: Brand[]) {
  return product.brands?.name || brands.find((brand) => brand.id === product.brand_id)?.name || null
}

export function OrdersPage() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [page, setPage] = useState(1)
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set())

  const orderQuery = useMemo(() => {
    const params = new URLSearchParams()
    params.set('status', status)
    if (search) params.set('search', search)
    if (dateFrom) params.set('dateFrom', dateFrom)
    if (dateTo) params.set('dateTo', dateTo)
    return params.toString()
  }, [dateFrom, dateTo, search, status])

  const { data = [], mutate, isLoading } = useSWR<AdminOrder[]>(
    `/api/admin/orders?${orderQuery}`,
    adminFetch,
  )
  const pageSize = 8
  const paged = data.slice((page - 1) * pageSize, page * pageSize)
  const pageCount = Math.max(1, Math.ceil(data.length / pageSize))

  async function updateStatus(id: string, nextStatus: OrderStatus) {
    await adminFetch(`/api/admin/orders/${id}`, { method: 'PATCH', body: JSON.stringify({ status: nextStatus }) })
    toast.success('Statut de la commande mis à jour')
    mutate()
  }

  async function updatePaymentStatus(id: string, nextStatus: PaymentStatus) {
    await adminFetch(`/api/admin/orders/${id}`, { method: 'PATCH', body: JSON.stringify({ payment_status: nextStatus }) })
    toast.success('Statut de paiement mis à jour')
    mutate()
  }

  async function deleteOrder(id: string) {
    await adminFetch(`/api/admin/orders/${id}`, { method: 'DELETE' })
    toast.success('Commande supprimée')
    mutate()
  }

  async function bulkUpdateStatus(nextStatus: OrderStatus) {
    if (selectedOrders.size === 0) {
      toast.error('Veuillez sélectionner au moins une commande')
      return
    }
    await Promise.all(Array.from(selectedOrders).map(id => updateStatus(id, nextStatus)))
    setSelectedOrders(new Set())
  }

  const exportQuery = new URLSearchParams(orderQuery)
  exportQuery.set('format', 'csv')

  const toggleOrder = (id: string) => {
    const newSelected = new Set(selectedOrders)
    if (newSelected.has(id)) newSelected.delete(id)
    else newSelected.add(id)
    setSelectedOrders(newSelected)
  }

  const selectAll = () => {
    if (selectedOrders.size === paged.length) {
      setSelectedOrders(new Set())
    } else {
      setSelectedOrders(new Set(paged.map(o => o.id)))
    }
  }

  return (
    <div className="space-y-5">
      <Toolbar
        search={search}
        setSearch={(value) => { setSearch(value); setPage(1) }}
        right={
          <>
            <Select value={status} onValueChange={(value) => { setStatus(value); setPage(1) }}>
              <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {statuses.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}
              </SelectContent>
            </Select>
            <div className="flex flex-wrap gap-2">
              <div>
                <Label htmlFor="orders-date-from" className="sr-only">Date de début</Label>
                <Input
                  id="orders-date-from"
                  type="date"
                  value={dateFrom}
                  onChange={(event) => { setDateFrom(event.target.value); setPage(1) }}
                  className="h-10 w-40"
                />
              </div>
              <div>
                <Label htmlFor="orders-date-to" className="sr-only">Date de fin</Label>
                <Input
                  id="orders-date-to"
                  type="date"
                  value={dateTo}
                  onChange={(event) => { setDateTo(event.target.value); setPage(1) }}
                  className="h-10 w-40"
                />
              </div>
              {(dateFrom || dateTo) && (
                <Button
                  variant="ghost"
                  onClick={() => {
                    setDateFrom('')
                    setDateTo('')
                    setPage(1)
                  }}
                >
                  Clear dates
                </Button>
              )}
            </div>
            <Button variant="outline" onClick={() => downloadAdminFile(`/api/admin/orders?${exportQuery.toString()}`, 'orders.csv')}>
              <Download className="mr-2 h-4 w-4" /> Export CSV
            </Button>
          </>
        }
      />

      {selectedOrders.size > 0 && (
        <Card className="border-primary bg-primary/5">
          <CardContent className="flex items-center justify-between p-4">
            <span className="text-sm font-medium">{selectedOrders.size} commande(s) sélectionnée(s)</span>
            <div className="flex gap-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline">Mettre à jour le statut</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Mettre à jour le statut en masse</DialogTitle>
                    <DialogDescription>Sélectionnez le nouveau statut pour les {selectedOrders.size} commande(s)</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-3">
                    {statuses.map((s) => (
                      <Button key={s} variant="outline" className="w-full justify-start" onClick={() => { bulkUpdateStatus(s); }}>
                        {orderStatusLabels[s]}
                      </Button>
                    ))}
                  </div>
                </DialogContent>
              </Dialog>
              <Button size="sm" variant="outline" onClick={() => setSelectedOrders(new Set())}>Annuler</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <OrderStatusFlow orders={data} />

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <input type="checkbox" checked={selectedOrders.size === paged.length && paged.length > 0} onChange={selectAll} className="rounded" />
              </TableHead>
              <TableHead>Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Produits</TableHead>
              <TableHead>Shipping</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paged.map((order) => (
              <TableRow key={order.id}>
                <TableCell>
                  <input type="checkbox" checked={selectedOrders.has(order.id)} onChange={() => toggleOrder(order.id)} className="rounded" />
                </TableCell>
                <TableCell className="font-medium">{order.order_number || order.id.slice(0, 8)}</TableCell>
                <TableCell>{customerName(order.profiles)}</TableCell>
                <TableCell>{order.order_items?.length || 0}</TableCell>
                <TableCell>{money.format(Number(order.shipping_fee || 0))}</TableCell>
                <TableCell>{money.format(Number(order.total_amount))}</TableCell>
                <TableCell>
                  <Select value={order.status} onValueChange={(value) => updateStatus(order.id, value as OrderStatus)}>
                    <SelectTrigger className="h-9 w-36"><SelectValue /></SelectTrigger>
                    <SelectContent>{statuses.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Select value={order.payment_status || 'pending'} onValueChange={(value) => updatePaymentStatus(order.id, value as PaymentStatus)}>
                    <SelectTrigger className="h-9 w-32"><SelectValue /></SelectTrigger>
                    <SelectContent>{paymentStatuses.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent>
                  </Select>
                </TableCell>
                <TableCell>{new Date(order.created_at).toLocaleDateString()}</TableCell>
                <TableCell className="text-right">
                  <OrderDetails order={order} onUpdate={updateStatus} onPaymentUpdate={updatePaymentStatus} />
                  <Button variant="ghost" size="icon" asChild>
                    <Link href={`/admin/orders/${order.id}/invoice`} aria-label="Voir la facture">
                      <Receipt className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => updateStatus(order.id, 'delivered')} aria-label="Mark delivered">
                    <Save className="h-4 w-4" />
                  </Button>
                  <ConfirmDelete onConfirm={() => deleteOrder(order.id)} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {!isLoading && data.length === 0 && <div className="p-6"><EmptyState title="Aucune commande trouvée" description="Les commandes apparaîtront ici après le paiement des clients." /></div>}
      </Card>

      <div className="flex items-center justify-end gap-2">
        <Button variant="outline" disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</Button>
        <span className="text-sm text-muted-foreground">Page {page} sur {pageCount}</span>
        <Button variant="outline" disabled={page === pageCount} onClick={() => setPage(page + 1)}>Next</Button>
      </div>
    </div>
  )
}

export function ProductsPage() {
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [brandFilter, setBrandFilter] = useState('all')
  const [stockFilter, setStockFilter] = useState('all')
  const { data: products = [], mutate } = useSWR<AdminProduct[]>(`/api/admin/products?search=${encodeURIComponent(search)}`, adminFetch)
  const { data: categories = [] } = useSWR<AdminCategory[]>('/api/admin/categories', adminFetch)
  const { data: brands = [], mutate: mutateBrands } = useSWR<Brand[]>('/api/admin/brands', adminFetch)

  async function saveProduct(payload: Partial<AdminProduct>, id?: number) {
    await adminFetch(id ? `/api/admin/products/${id}` : '/api/admin/products', {
      method: id ? 'PATCH' : 'POST',
      body: JSON.stringify(payload),
    })
    toast.success(id ? 'Produit mis à jour' : 'Produit créé')
    mutate()
  }

  async function deleteProduct(id: number) {
    await adminFetch(`/api/admin/products/${id}`, { method: 'DELETE' })
    toast.success('Produit supprimé')
    mutate()
  }

  const filtered = useMemo(() => {
    return products.filter(product => {
      if (categoryFilter !== 'all' && product.category_id !== categoryFilter) return false
      if (brandFilter !== 'all' && product.brand_id !== brandFilter) return false
      if (stockFilter === 'low' && product.stock_quantity >= 5) return false
      if (stockFilter === 'out' && product.stock_quantity !== 0) return false
      if (stockFilter === 'in' && product.stock_quantity === 0) return false
      return true
    })
  }, [products, categoryFilter, brandFilter, stockFilter])

  return (
    <div className="space-y-5">
      <Toolbar
        search={search}
        setSearch={setSearch}
        right={
          <>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes catégories</SelectItem>
                {categories.map((cat) => <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={brandFilter} onValueChange={setBrandFilter}>
              <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes marques</SelectItem>
                {brands.map((brand) => <SelectItem key={brand.id} value={brand.id}>{brand.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={stockFilter} onValueChange={setStockFilter}>
              <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les stocks</SelectItem>
                <SelectItem value="in">En stock</SelectItem>
                <SelectItem value="low">Stock faible</SelectItem>
                <SelectItem value="out">Rupture</SelectItem>
              </SelectContent>
            </Select>
            <ProductImportDialog onImported={() => mutate()} />
            <BrandManagerDialog brands={brands} onUpdated={mutateBrands} />
            <ProductDialog brands={brands} categories={categories} onSave={saveProduct} onBrandCreated={mutateBrands} />
          </>
        }
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((product) => {
          const images = productImages(product)
          const brandName = productBrandName(product, brands)

          return (
            <Card key={product.id} className="overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-lg">
              <div className="relative aspect-[16/10] bg-muted">
                {images[0] ? (
                  <Image src={images[0]} alt={product.name} fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" />
                ) : (
                  <div className="grid h-full place-items-center text-muted-foreground"><PackageIcon /></div>
                )}
                <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/65 to-transparent" />
                <div className="absolute left-3 top-3 flex flex-wrap gap-2">
                  {brandName && <Badge className="bg-white/92 text-gray-900 hover:bg-white">{brandName}</Badge>}
                  {images.length > 1 && <Badge variant="secondary">{images.length} images</Badge>}
                </div>
                <div className="absolute right-3 top-3 flex gap-2">
                  <Badge variant={product.is_active ? 'default' : 'secondary'}>{product.is_active ? 'Active' : 'Inactive'}</Badge>
                  <Badge variant={product.stock_quantity > 0 ? 'secondary' : 'destructive'}>{product.stock_quantity > 0 ? `${product.stock_quantity} stock` : 'Out'}</Badge>
                </div>
                {images.length > 1 && (
                  <div className="absolute bottom-3 left-3 flex max-w-[calc(100%-1.5rem)] gap-2 overflow-hidden">
                    {images.slice(0, 5).map((imageUrl, index) => (
                      <div key={imageUrl} className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md border border-white/70 bg-white/20 shadow-sm">
                        <Image src={imageUrl} alt={`${product.name} image ${index + 1}`} fill className="object-cover" sizes="48px" />
                      </div>
                    ))}
                    {images.length > 5 && (
                      <div className="grid h-12 w-12 shrink-0 place-items-center rounded-md border border-white/70 bg-black/45 text-xs font-semibold text-white shadow-sm">
                        +{images.length - 5}
                      </div>
                    )}
                  </div>
                )}
              </div>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate text-base font-semibold">{product.name}</h3>
                    <p className="text-sm text-muted-foreground">{product.categories?.name || product.category || 'Sans catégorie'}</p>
                    {brandName && <p className="mt-1 text-xs font-medium text-primary">{brandName}</p>}
                    {product.sku && <p className="mt-1 text-xs text-muted-foreground">SKU: {product.sku}</p>}
                  </div>
                  <p className="font-semibold">{money.format(Number(product.price))}</p>
                </div>
                <div className="mt-4 flex items-center justify-end gap-1">
                  <ProductDialog product={product} brands={brands} categories={categories} onSave={saveProduct} onBrandCreated={mutateBrands} />
                  <ConfirmDelete onConfirm={() => deleteProduct(product.id)} />
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

export function CustomersPage() {
  const [search, setSearch] = useState('')
  const [role, setRole] = useState('all')
  const [segment, setSegment] = useState('all')
  const { data = [], mutate } = useSWR<AdminProfile[]>(`/api/admin/customers?role=${role}&search=${encodeURIComponent(search)}`, adminFetch)
  const { data: orders = [] } = useSWR<AdminOrder[]>('/api/admin/orders', adminFetch)

  async function setRoleForUser(id: string, nextRole: 'admin' | 'client') {
    await adminFetch(`/api/admin/customers/${id}`, { method: 'PATCH', body: JSON.stringify({ role: nextRole }) })
    toast.success('Rôle client mis à jour')
    mutate()
  }

  const money = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'TND', maximumFractionDigits: 0 })

  // Calculate customer segments
  const customerStats = useMemo(() => {
    return data.map(customer => {
      const customerOrders = orders.filter(o => o.user_id === customer.id)
      const totalSpent = customerOrders.reduce((sum, o) => sum + Number(o.total_amount), 0)
      const orderCount = customerOrders.length
      let segment: 'vip' | 'regular' | 'new' = 'new'
      if (orderCount >= 5) segment = 'vip'
      else if (orderCount >= 2) segment = 'regular'
      return {
        ...customer,
        orderCount,
        totalSpent,
        avgOrderValue: orderCount > 0 ? totalSpent / orderCount : 0,
        segment,
      }
    })
  }, [data, orders])

  const filtered = useMemo(() => {
    return customerStats.filter(c => {
      if (segment !== 'all' && c.segment !== segment) return false
      return true
    })
  }, [customerStats, segment])

  const vipCount = customerStats.filter(c => c.segment === 'vip').length
  const regularCount = customerStats.filter(c => c.segment === 'regular').length
  const newCount = customerStats.filter(c => c.segment === 'new').length

  return (
    <div className="space-y-5">
      <Toolbar
        search={search}
        setSearch={setSearch}
        right={
          <>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All roles</SelectItem>
                <SelectItem value="client">Clients</SelectItem>
                <SelectItem value="admin">Admins</SelectItem>
              </SelectContent>
            </Select>
            <Select value={segment} onValueChange={setSegment}>
              <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les segments</SelectItem>
                <SelectItem value="vip">Clients VIP</SelectItem>
                <SelectItem value="regular">Réguliers</SelectItem>
                <SelectItem value="new">Nouveaux</SelectItem>
              </SelectContent>
            </Select>
          </>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Clients VIP (5+ commandes)</p>
            <p className="mt-2 text-3xl font-semibold">{vipCount}</p>
            <Badge variant="default" className="mt-3">{((vipCount / (data.length || 1)) * 100).toFixed(0)}% des clients</Badge>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Clients réguliers (2-4 commandes)</p>
            <p className="mt-2 text-3xl font-semibold">{regularCount}</p>
            <Badge variant="secondary" className="mt-3">{((regularCount / (data.length || 1)) * 100).toFixed(0)}% des clients</Badge>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Nouveaux clients (1 commande)</p>
            <p className="mt-2 text-3xl font-semibold">{newCount}</p>
            <Badge variant="outline" className="mt-3">{((newCount / (data.length || 1)) * 100).toFixed(0)}% des clients</Badge>
          </CardContent>
        </Card>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Full name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Segment</TableHead>
              <TableHead>Commandes</TableHead>
              <TableHead>Dépenses</TableHead>
              <TableHead>Panier moyen</TableHead>
              <TableHead>Registration</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((customer) => (
              <TableRow key={customer.id}>
                <TableCell className="font-medium">{customerName(customer)}</TableCell>
                <TableCell>{customer.email || '-'}</TableCell>
                <TableCell>{customer.phone || '-'}</TableCell>
                <TableCell>
                  <Badge variant={customer.segment === 'vip' ? 'default' : customer.segment === 'regular' ? 'secondary' : 'outline'}>
                    {customer.segment === 'vip' ? 'VIP' : customer.segment === 'regular' ? 'Régulier' : 'Nouveau'}
                  </Badge>
                </TableCell>
                <TableCell>{customer.orderCount}</TableCell>
                <TableCell>{money.format(customer.totalSpent)}</TableCell>
                <TableCell>{money.format(customer.avgOrderValue)}</TableCell>
                <TableCell>{new Date(customer.created_at).toLocaleDateString()}</TableCell>
                <TableCell className="text-right">
                  <Button variant="outline" size="sm" onClick={() => setRoleForUser(customer.id, customer.role === 'admin' ? 'client' : 'admin')}>
                    {customer.role === 'admin' ? 'Set client' : 'Promote'}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}

export function CategoriesPage() {
  const { data = [], mutate } = useSWR<AdminCategory[]>('/api/admin/categories', adminFetch)

  async function saveCategory(payload: Partial<AdminCategory>, id?: string) {
    await adminFetch(id ? `/api/admin/categories/${id}` : '/api/admin/categories', {
      method: id ? 'PATCH' : 'POST',
      body: JSON.stringify(payload),
    })
    toast.success(id ? 'Catégorie mise à jour' : 'Catégorie créée')
    mutate()
  }

  async function deleteCategory(id: string) {
    await adminFetch(`/api/admin/categories/${id}`, { method: 'DELETE' })
    toast.success('Catégorie supprimée')
    mutate()
  }

  return (
    <div className="space-y-5">
      <div className="flex justify-end"><CategoryDialog onSave={saveCategory} /></div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {data.map((category, index) => (
          <Card key={category.id} className="overflow-hidden">
            <CardContent className="p-5">
              <div className={cn('mb-5 grid h-14 w-14 place-items-center overflow-hidden rounded-lg bg-white', index % 2 ? 'bg-blue-500/10' : 'bg-primary/10')}>
                {category.image_url ? (
                  <img src={category.image_url} alt={category.name} className="h-full w-full object-cover" />
                ) : (
                  <span className="text-2xl">{category.emoji || '•'}</span>
                )}
              </div>
              <h3 className="text-lg font-semibold">{category.name}</h3>
              <p className="text-sm text-muted-foreground">/{category.slug}</p>
              <div className="mt-5 flex justify-end gap-1">
                <CategoryDialog category={category} onSave={saveCategory} />
                <ConfirmDelete onConfirm={() => deleteCategory(category.id)} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export function InventoryPage() {
  const [sortMode, setSortMode] = useState('stock-asc')
  const { data = [] } = useSWR<AdminProduct[]>('/api/admin/products', adminFetch)
  const available = data.filter((product) => product.in_stock && product.stock_quantity > 5)
  const low = data.filter((product) => product.in_stock && product.stock_quantity > 0 && product.stock_quantity <= 5)
  const out = data.filter((product) => product.stock_quantity === 0 || !product.in_stock)
  const sortedProducts = useMemo(() => {
    return [...data].sort((a, b) => {
      if (sortMode === 'stock-desc') return b.stock_quantity - a.stock_quantity
      if (sortMode === 'name') return a.name.localeCompare(b.name)

      const aRank = !a.in_stock || a.stock_quantity === 0 ? 0 : a.stock_quantity <= 5 ? 1 : 2
      const bRank = !b.in_stock || b.stock_quantity === 0 ? 0 : b.stock_quantity <= 5 ? 1 : 2

      if (aRank !== bRank) return aRank - bRank
      return a.stock_quantity - b.stock_quantity
    })
  }, [data, sortMode])

  return (
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-3">
        <MiniMetric title="En stock" value={available.length} />
        <MiniMetric title="Stock faible" value={low.length} tone="amber" />
        <MiniMetric title="Out of stock" value={out.length} tone="red" />
      </div>
      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Suivi du stock</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              {low.length} low stock product{low.length === 1 ? '' : 's'}.
            </p>
          </div>
          <Select value={sortMode} onValueChange={setSortMode}>
            <SelectTrigger className="w-full sm:w-52"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="stock-asc">Critical first</SelectItem>
              <SelectItem value="stock-desc">Highest stock first</SelectItem>
              <SelectItem value="name">Nom A-Z</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent className="space-y-4">
          {sortedProducts.map((product, index) => (
            <div key={product.id} className="rounded-lg border p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border bg-muted text-sm font-semibold">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-muted-foreground">{product.sku || product.categories?.name || 'Sans SKU'}</p>
                  </div>
                </div>
                <Badge variant={!product.in_stock || product.stock_quantity === 0 ? 'destructive' : product.stock_quantity <= 5 ? 'secondary' : 'outline'}>
                  {!product.in_stock || product.stock_quantity === 0
                    ? 'Out of stock'
                    : product.stock_quantity <= 5
                      ? `Stock faible : ${product.stock_quantity} unité${product.stock_quantity === 1 ? '' : 's'}`
                      : `${product.stock_quantity} units`}
                </Badge>
              </div>
              <Progress className="mt-3" value={Math.min(product.stock_quantity * 5, 100)} />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

export function SettingsPage() {
  const { user, signOut } = useAuth()
  const [displayName, setDisplayName] = useState(user?.user_metadata?.display_name || '')
  const [passwordForm, setPasswordForm] = useState({ password: '', confirmPassword: '' })
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [savingShipping, setSavingShipping] = useState(false)
  const [notificationSettings, setNotificationSettings] = useState(defaultNotificationSettings)
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default')
  const [shippingForm, setShippingForm] = useState<ShippingSettings>(DEFAULT_SHIPPING_SETTINGS)
  const { data: shippingSettings, mutate: mutateShippingSettings } = useSWR<ShippingSettings>(
    '/api/admin/shipping-settings',
    adminFetch,
  )

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem('hme-admin-notification-settings')

      if (stored) {
        setNotificationSettings({ ...defaultNotificationSettings, ...JSON.parse(stored) })
      }
    } catch {
      window.localStorage.removeItem('hme-admin-notification-settings')
    }

    if ('Notification' in window) {
      setNotificationPermission(Notification.permission)
    }
  }, [])

  useEffect(() => {
    if (shippingSettings) setShippingForm(shippingSettings)
  }, [shippingSettings])

  async function saveProfile() {
    setSavingProfile(true)
    try {
      const { error } = await supabase.auth.updateUser({
        data: { display_name: displayName.trim() || null },
      })
      if (error) throw error
      toast.success('Profil mis à jour')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to update profile')
    } finally {
      setSavingProfile(false)
    }
  }

  async function updatePassword() {
    if (passwordForm.password.length < 6) {
      toast.error('Password must contain at least 6 characters')
      return
    }

    if (passwordForm.password !== passwordForm.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    setSavingPassword(true)
    try {
      const { error } = await supabase.auth.updateUser({ password: passwordForm.password })
      if (error) throw error
      setPasswordForm({ password: '', confirmPassword: '' })
      toast.success('Password updated')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to update password')
    } finally {
      setSavingPassword(false)
    }
  }

  async function setNotificationEnabled(key: NotificationKey, checked: boolean) {
    if (checked && !('Notification' in window)) {
      toast.error('Browser notifications are not supported here')
      return
    }

    if (checked && Notification.permission !== 'granted') {
      const permission = await Notification.requestPermission()
      setNotificationPermission(permission)

      if (permission !== 'granted') {
        toast.error('Allow notifications in your browser first')
        return
      }
    }

    const nextSettings = { ...notificationSettings, [key]: checked }
    setNotificationSettings(nextSettings)
    window.localStorage.setItem('hme-admin-notification-settings', JSON.stringify(nextSettings))
    toast.success(checked ? 'Notification enabled' : 'Notification disabled')
  }

  async function testNotification(label: string) {
    if (!('Notification' in window)) {
      toast.error('Browser notifications are not supported here')
      return
    }

    if (Notification.permission !== 'granted') {
      const permission = await Notification.requestPermission()
      setNotificationPermission(permission)

      if (permission !== 'granted') {
        toast.error('Allow notifications in your browser first')
        return
      }
    }

    new Notification('HME Admin', {
      body: `${label} notifications are working.`,
    })
    toast.success('Test notification sent')
  }

  async function saveShipping() {
    setSavingShipping(true)
    try {
      const saved = await adminFetch<ShippingSettings>('/api/admin/shipping-settings', {
        method: 'PATCH',
        body: JSON.stringify(shippingForm),
      })
      setShippingForm(saved)
      mutateShippingSettings(saved, false)
      toast.success('Shipping fees updated')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to update shipping fees')
    } finally {
      setSavingShipping(false)
    }
  }

  function updateShippingField(key: keyof ShippingSettings, value: string) {
    setShippingForm((current) => ({
      ...current,
      [key]: Math.max(0, Number(value) || 0),
    }))
  }

  return (
    <Tabs defaultValue="profile" className="space-y-5">
      <TabsList>
        <TabsTrigger value="profile">Profil</TabsTrigger>
        <TabsTrigger value="security">Sécurité</TabsTrigger>
        <TabsTrigger value="shipping">Livraison</TabsTrigger>
        <TabsTrigger value="notifications">Notifications</TabsTrigger>
      </TabsList>
      <TabsContent value="profile">
        <Card>
          <CardHeader><CardTitle>Profil administrateur</CardTitle></CardHeader>
          <CardContent className="grid max-w-2xl gap-4">
            <Label>Email</Label>
            <Input value={user?.email || ''} readOnly />
            <Label>Nom affiché</Label>
            <Input placeholder="Nom de l’administrateur" value={displayName} onChange={(event) => setDisplayName(event.target.value)} />
            <Button className="w-fit" onClick={saveProfile} disabled={savingProfile}>
              <Save className="mr-2 h-4 w-4" /> {savingProfile ? 'Enregistrement...' : 'Enregistrer le profil'}
            </Button>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="security">
        <Card>
          <CardHeader><CardTitle>Changer le mot de passe</CardTitle></CardHeader>
          <CardContent className="grid max-w-2xl gap-4">
            <Input
              type="password"
              placeholder="Nouveau mot de passe"
              value={passwordForm.password}
              onChange={(event) => setPasswordForm({ ...passwordForm, password: event.target.value })}
            />
            <Input
              type="password"
              placeholder="Confirmer le mot de passe"
              value={passwordForm.confirmPassword}
              onChange={(event) => setPasswordForm({ ...passwordForm, confirmPassword: event.target.value })}
            />
            <Button className="w-fit" onClick={updatePassword} disabled={savingPassword}>
              {savingPassword ? 'Mise à jour...' : 'Mettre à jour le mot de passe'}
            </Button>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="shipping">
        <Card>
          <CardHeader>
            <CardTitle>Frais de livraison</CardTitle>
          </CardHeader>
          <CardContent className="grid max-w-3xl gap-5">
            <div className="rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground">
              Ces montants sont utilises dans le checkout et sauvegardes dans la commande. La facture affiche le frais reel de la commande.
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="shipping-free-threshold">Livraison gratuite des</Label>
                <Input
                  id="shipping-free-threshold"
                  type="number"
                  min="0"
                  value={shippingForm.freeThreshold}
                  onChange={(event) => updateShippingField('freeThreshold', event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="shipping-hammamet">Hammamet</Label>
                <Input
                  id="shipping-hammamet"
                  type="number"
                  min="0"
                  value={shippingForm.hammametFee}
                  onChange={(event) => updateShippingField('hammametFee', event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="shipping-nabeul">Zone Nabeul</Label>
                <Input
                  id="shipping-nabeul"
                  type="number"
                  min="0"
                  value={shippingForm.nabeulFee}
                  onChange={(event) => updateShippingField('nabeulFee', event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="shipping-coastal">Grand Tunis / villes cotieres</Label>
                <Input
                  id="shipping-coastal"
                  type="number"
                  min="0"
                  value={shippingForm.coastalFee}
                  onChange={(event) => updateShippingField('coastalFee', event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="shipping-other">Autres regions</Label>
                <Input
                  id="shipping-other"
                  type="number"
                  min="0"
                  value={shippingForm.otherFee}
                  onChange={(event) => updateShippingField('otherFee', event.target.value)}
                />
              </div>
            </div>
            <Button className="w-fit" onClick={saveShipping} disabled={savingShipping}>
              <Save className="mr-2 h-4 w-4" /> {savingShipping ? 'Enregistrement...' : 'Enregistrer les frais de livraison'}
            </Button>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="notifications">
        <Card>
          <CardHeader><CardTitle>Paramètres de notification</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground">
              Autorisation du navigateur : <span className="font-medium text-foreground">{notificationPermission}</span>
            </div>
            {notificationOptions.map((item) => (
              <div key={item.key} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-4">
                <span className="font-medium">{item.label}</span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => testNotification(item.label)}
                    disabled={!notificationSettings[item.key]}
                  >
                    <Bell className="mr-2 h-4 w-4" /> Test
                  </Button>
                  <Switch
                    checked={notificationSettings[item.key]}
                    onCheckedChange={(checked) => setNotificationEnabled(item.key, checked)}
                  />
                </div>
              </div>
            ))}
            <Button variant="destructive" onClick={signOut}>Déconnexion</Button>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}

function Toolbar({ search, setSearch, right }: { search: string; setSearch: (value: string) => void; right?: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border bg-card p-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div className="flex w-full max-w-md items-center gap-2 rounded-lg border px-3 py-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input className="w-full bg-transparent text-sm outline-none" placeholder="Rechercher..." value={search} onChange={(event) => setSearch(event.target.value)} />
      </div>
      <div className="flex flex-wrap gap-2">{right}</div>
    </div>
  )
}

function ProductDialog({
  product,
  categories,
  brands,
  onSave,
  onBrandCreated,
}: {
  product?: AdminProduct
  categories: AdminCategory[]
  brands: Brand[]
  onSave: (payload: any, id?: number) => Promise<void>
  onBrandCreated?: () => Promise<Brand[] | void | undefined>
}) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<any>(productFormInitialValue(product))
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<Array<{ name: string; url: string }>>([])
  const [imagesToRemove, setImagesToRemove] = useState<Set<string>>(new Set())
  const [newBrandName, setNewBrandName] = useState('')
  const [showBrandCreator, setShowBrandCreator] = useState(false)
  const [creatingBrand, setCreatingBrand] = useState(false)
  const [saving, setSaving] = useState(false)
  const [generateSku, setGenerateSku] = useState(true)
  const [skuAvailable, setSkuAvailable] = useState<boolean | null>(null)
  const [checkingSku, setCheckingSku] = useState(false)

  useEffect(() => {
    if (!open) return

    setForm(productFormInitialValue(product))
    setImageFiles([])
    setImagesToRemove(new Set())
    setNewBrandName('')
    setShowBrandCreator(false)
  }, [open, product])

  // Pre-fill SKU client-side when name or category changes and generateSku is enabled
  useEffect(() => {
    if (!generateSku) return
    const shouldGenerate = !form.sku || String(form.sku).trim() === ''
    if (!shouldGenerate) return

    const categoryObj = categories.find((c) => c.id === form.category_id)
    const categoryLabel = categoryObj ? (categoryObj.slug || categoryObj.name) : form.category || ''

    // Use -01 as initial suggestion; server will enforce uniqueness
    setForm((current: any) => ({ ...current, sku: `` }))
  }, [form.name, form.category_id, form.sku, form.category, categories, generateSku])

  // Check SKU uniqueness when manual SKU is entered
  useEffect(() => {
    let mounted = true
    let timer: any
    const sku = String(form.sku || '').trim()
    if (!sku || generateSku) {
      setSkuAvailable(null)
      setCheckingSku(false)
      return
    }

    setCheckingSku(true)
    timer = setTimeout(async () => {
      try {
        const params = new URLSearchParams()
        params.append('sku', sku)
        if (product?.id) params.append('excludeId', String(product.id))
        const res = await fetch(`/api/admin/products/check-sku?${params.toString()}`)
        const json = await res.json()
        if (!mounted) return
        setSkuAvailable(!!json.available)
      } catch (err) {
        if (!mounted) return
        setSkuAvailable(null)
      } finally {
        if (mounted) setCheckingSku(false)
      }
    }, 500)

    return () => {
      mounted = false
      clearTimeout(timer)
    }
  }, [form.sku, generateSku, product?.id])

  useEffect(() => {
    const previews = imageFiles.map((file) => ({ name: file.name, url: URL.createObjectURL(file) }))
    setImagePreviews(previews)

    return () => {
      previews.forEach((preview) => URL.revokeObjectURL(preview.url))
    }
  }, [imageFiles])

  async function submit() {
    setSaving(true)
    try {
      let uploadedUrls: string[] = []

      if (imageFiles.length > 0) {
        const body = new FormData()
        imageFiles.forEach((file) => body.append('files', file))
        const response = await adminUpload<{ urls: string[] }>('/api/admin/products/images', body)
        uploadedUrls = response.urls
      }

      // Filter out images marked for removal from existing images
      const remainingUrls = (form.image_urls || []).filter((url: string) => !imagesToRemove.has(url))

      const imageUrls = [
        ...new Set([...remainingUrls, ...uploadedUrls].map((url: string) => url.trim()).filter(Boolean)),
      ]

      // Send imagesToRemove list to server for database cleanup
      await onSave(
        {
          ...form,
          image_url: imageUrls[0] || '',
          image_urls: imageUrls,
          images_to_remove: Array.from(imagesToRemove),
          generate_sku: generateSku,
        },
        product?.id,
      )
      setOpen(false)
      setImageFiles([])
      setImagesToRemove(new Set())
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Impossible d'enregistrer le produit")
    } finally {
      setSaving(false)
    }
  }

  function updatePrimaryImageUrl(value: string) {
    const currentUrls = (form.image_urls || []).filter((url: string) => url !== form.image_url)
    const imageUrls = value ? [value, ...currentUrls] : currentUrls
    setForm({ ...form, image_url: value, image_urls: imageUrls })
  }

  function removeImageUrl(url: string) {
    const imageUrls = (form.image_urls || []).filter((item: string) => item !== url)
    setForm({ ...form, image_url: imageUrls[0] || '', image_urls: imageUrls })
  }

  const [newBrandLogoUrl, setNewBrandLogoUrl] = useState('')
  const [newBrandLogoFile, setNewBrandLogoFile] = useState<File | null>(null)
  const [uploadingBrandLogo, setUploadingBrandLogo] = useState(false)

  async function uploadBrandLogo() {
    if (!newBrandLogoFile) {
      toast.error('Sélectionnez d’abord un logo')
      return
    }

    try {
      setUploadingBrandLogo(true)
      const body = new FormData()
      body.append('files', newBrandLogoFile)
      body.append('folder', 'brands')

      const response = await adminUpload<{ urls: string[] }>('/api/admin/images', body)
      if (!response.urls?.[0]) {
        throw new Error('Aucune URL de retour')
      }

      setNewBrandLogoUrl(response.urls[0])
      setNewBrandLogoFile(null)
      toast.success('Logo de marque téléversé')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Impossible de téléverser le logo')
    } finally {
      setUploadingBrandLogo(false)
    }
  }

  async function createBrand() {
    const name = newBrandName.trim()

    if (!name) {
      toast.error('Enter a brand name first')
      return
    }

    try {
      setCreatingBrand(true)
      const createdBrand = await adminFetch<Brand>('/api/admin/brands', {
        method: 'POST',
        body: JSON.stringify({ name, logo_url: newBrandLogoUrl || null }),
      })

      if (onBrandCreated) {
        await onBrandCreated()
      }

      setForm((current: any) => ({ ...current, brand_id: createdBrand.id }))
      setShowBrandCreator(false)
      setNewBrandName('')
      setNewBrandLogoUrl('')
      setNewBrandLogoFile(null)
      toast.success(`Marque ${createdBrand.name} créée`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Impossible de créer la marque')
    } finally {
      setCreatingBrand(false)
    }
  }

  const selectValue = showBrandCreator ? '__create_new_brand__' : form.brand_id || ''

  // dynamic placeholder for SKU: show generated base when auto-generate enabled
  const categoryObjForPlaceholder = categories.find((c) => c.id === form.category_id)
  const categoryLabelForPlaceholder = categoryObjForPlaceholder ? (categoryObjForPlaceholder.slug || categoryObjForPlaceholder.name) : form.category || ''
  const skuPlaceholder = generateSku ? `` : 'Ex : SEJ-PYR-01'

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={product ? 'ghost' : 'default'} size={product ? 'icon' : 'default'}>
          {product ? <Pencil className="h-4 w-4" /> : <><Plus className="mr-2 h-4 w-4" /> Ajouter un produit</>}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{product ? 'Modifier le produit' : 'Ajouter un produit'}</DialogTitle>
          <DialogDescription>Gérez le prix, le stock, les images et la catégorie.</DialogDescription>
        </DialogHeader>

        {/* Single scrollable section for all content */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Nom" value={form.name || ''} onChange={(value) => setForm({ ...form, name: value })} />
            <div className="space-y-2">
              <ToggleRow label="Générer automatiquement le SKU" checked={generateSku} onCheckedChange={(v) => setGenerateSku(v)} />
              <div>
                <Field label="SKU" placeholder={skuPlaceholder} value={form.sku || ''} onChange={(value) => setForm({ ...form, sku: value })} />
                {!generateSku && (
                  <p className="mt-1 text-sm">
                    {checkingSku ? <span className="text-muted-foreground">Vérification...</span> : skuAvailable === false ? <span className="text-destructive">Ce SKU est déjà utilisé</span> : skuAvailable === true ? <span className="text-emerald-600">SKU disponible</span> : <span className="text-muted-foreground">Saisissez un SKU unique</span>}
                  </p>
                )}
              </div>
            </div>
            <Field label="Prix" type="number" value={form.price || ''} onChange={(value) => setForm({ ...form, price: value })} />
            <Field label="Prix original" type="number" value={form.original_price || ''} onChange={(value) => setForm({ ...form, original_price: value })} />
            <Field label="Stock" type="number" value={form.stock_quantity || 0} onChange={(value) => setForm({ ...form, stock_quantity: value })} />
            <div className="grid gap-2">
              <Label>Catégorie</Label>
              <Select value={form.category_id || ''} onValueChange={(value) => setForm({ ...form, category_id: value })}>
                <SelectTrigger><SelectValue placeholder="Sélectionner une catégorie" /></SelectTrigger>
                <SelectContent>{categories.map((category) => <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Marque</Label>
              <Select
                value={selectValue}
                onValueChange={(value) => {
                  if (value === '__create_new_brand__') {
                    setShowBrandCreator(true)
                    setForm((current: any) => ({ ...current, brand_id: null }))
                    return
                  }

                  setShowBrandCreator(false)
                  setForm((current: any) => ({ ...current, brand_id: value }))
                }}
              >
                <SelectTrigger><SelectValue placeholder="Sélectionner une marque" /></SelectTrigger>
                <SelectContent>
                  {brands.map((brand) => <SelectItem key={brand.id} value={brand.id}>{brand.name}</SelectItem>)}
                  <SelectItem value="__create_new_brand__">+ Ajouter une nouvelle marque</SelectItem>
                </SelectContent>
              </Select>
              {showBrandCreator && (
                <div className="rounded-lg border border-dashed p-3 space-y-3">
                  <p className="text-sm font-medium text-muted-foreground">Créer une nouvelle marque dans Supabase</p>
                  <div className="grid gap-2">
                    <Input
                      value={newBrandName}
                      onChange={(event) => setNewBrandName(event.target.value)}
                      placeholder="Nom de la marque"
                    />
                    <Field
                      label="URL du logo"
                      value={newBrandLogoUrl}
                      onChange={(value) => setNewBrandLogoUrl(value)}
                      placeholder="https://..."
                    />
                    <div className="grid gap-2">
                      <Label>Uploader un logo</Label>
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={(event) => setNewBrandLogoFile(event.target.files?.[0] || null)}
                        />
                        <Button type="button" onClick={uploadBrandLogo} disabled={!newBrandLogoFile || uploadingBrandLogo}>
                          {uploadingBrandLogo ? 'Téléversement...' : 'Téléverser le logo'}
                        </Button>
                      </div>
                      {newBrandLogoUrl && (
                        <div className="flex items-center gap-3">
                          <img src={newBrandLogoUrl} alt={newBrandName || 'Logo de marque'} className="h-14 w-14 rounded-md object-cover border" />
                          <span className="truncate text-sm text-muted-foreground">{newBrandLogoUrl}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <Button type="button" onClick={createBrand} disabled={creatingBrand}>
                    {creatingBrand ? 'Enregistrement...' : 'Enregistrer la marque'}
                  </Button>
                </div>
              )}
            </div>
            <div className="sm:col-span-2">
              <Field label="URL de l'image principale" value={form.image_url || ''} onChange={updatePrimaryImageUrl} icon={<Upload className="h-4 w-4" />} />
            </div>
          </div>

          {/* Image Management Card */}
          <div className="border-t pt-2">
            <ImageManagementCard
              existingImages={form.image_urls || []}
              newImages={imagePreviews}
              imagesToRemove={imagesToRemove}
              onMarkForRemoval={(url) => setImagesToRemove(new Set([...imagesToRemove, url]))}
              onUnmarkForRemoval={(url) => {
                const newSet = new Set(imagesToRemove)
                newSet.delete(url)
                setImagesToRemove(newSet)
              }}
              onAddNewImages={async (files) => setImageFiles([...imageFiles, ...files])}
              onRemoveNewImage={(url) => {
                setImageFiles(imageFiles.filter((_, i) => imagePreviews[i]?.url !== url))
                setImagePreviews(imagePreviews.filter((preview) => preview.url !== url))
              }}
              onReorderImages={(urls) => setForm({ ...form, image_urls: urls, image_url: urls[0] || '' })}
            />
          </div>

          {/* Rich Description Editor */}
          <div className="border-t pt-2">
            <RichDescriptionEditor
              value={form.description || ''}
              onChange={(value) => setForm({ ...form, description: value })}
              maxLength={5000}
            />
          </div>

          <div className="border-t pt-2 grid gap-3 sm:grid-cols-2">
            <ToggleRow label="Actif" checked={!!form.is_active} onCheckedChange={(value) => setForm({ ...form, is_active: value })} />
            <ToggleRow label="En stock" checked={!!form.in_stock} onCheckedChange={(value) => setForm({ ...form, in_stock: value })} />
          </div>
        </div>

        <DialogFooter>
          <Button onClick={submit} disabled={saving || (checkingSku || (generateSku === false && skuAvailable === false))}>
            {saving ? 'Enregistrement...' : 'Enregistrer le produit'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function ProductImportDialog({ onImported }: { onImported: () => void }) {
  const [open, setOpen] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ inserted: number; skipped: number; errors?: Array<{ row: number; error: string }> } | null>(null)

  async function submit() {
    if (!file) {
      toast.error('Sélectionnez d’abord un fichier Excel ou CSV')
      return
    }

    setLoading(true)
    setResult(null)

    try {
      const formData = new FormData()
      formData.append('file', file)
      const response = await adminUpload<{ inserted: number; skipped: number; errors?: Array<{ row: number; error: string }> }>(
        '/api/admin/products/import',
        formData,
      )
      setResult(response)
      toast.success(`${response.inserted} produit(s) importé(s)`)
      onImported()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Import impossible')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          Import Excel
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Importer des produits depuis Excel</DialogTitle>
          <DialogDescription>
            Importez un fichier .xlsx ou .csv avec des colonnes comme name, description, price, stock_quantity, category, image_url, sku, is_active.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-lg border border-dashed p-5">
            <Label htmlFor="product-import" className="mb-2 block font-medium">Fichier produit</Label>
            <Input
              id="product-import"
              type="file"
              accept=".xlsx,.csv"
              onChange={(event) => setFile(event.target.files?.[0] || null)}
            />
            <p className="mt-2 text-xs text-muted-foreground">
              Les en-têtes français sont aussi acceptés : nom, prix, quantite, categorie, photo, reference.
            </p>
          </div>

          {result && (
            <div className="rounded-lg border bg-muted/30 p-4 text-sm">
              <p className="font-medium">{result.inserted} produit(s) ajouté(s), {result.skipped} ligne(s) ignorée(s).</p>
              {!!result.errors?.length && (
                <div className="mt-3 max-h-36 space-y-1 overflow-auto text-destructive">
                  {result.errors.slice(0, 8).map((item) => (
                    <p key={`${item.row}-${item.error}`}>Ligne {item.row} : {item.error}</p>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Fermer</Button>
          <Button onClick={submit} disabled={loading}>
            {loading ? 'Importation...' : 'Importer les produits'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function BrandManagerDialog({ brands, onUpdated }: { brands: Brand[]; onUpdated: () => Promise<Brand[] | void> }) {
  const [open, setOpen] = useState(false)
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null)
  const [form, setForm] = useState<any>(null)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open) return
    setSelectedBrand(null)
    setForm(null)
    setLogoFile(null)
  }, [open])

  function startEditBrand(brand: Brand) {
    setSelectedBrand(brand)
    setForm({ ...brand })
  }

  async function uploadBrandLogo() {
    if (!logoFile) {
      toast.error('Sélectionnez d’abord un logo')
      return
    }

    try {
      setUploadingLogo(true)
      const body = new FormData()
      body.append('files', logoFile)
      body.append('folder', 'brands')

      const response = await adminUpload<{ urls: string[] }>('/api/admin/images', body)
      if (!response.urls?.[0]) {
        throw new Error('Aucune URL de retour')
      }

      setForm((current: any) => ({ ...current, logo_url: response.urls[0] }))
      setLogoFile(null)
      toast.success('Logo téléversé')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Impossible de téléverser le logo')
    } finally {
      setUploadingLogo(false)
    }
  }

  async function saveBrand() {
    if (!selectedBrand) return
    try {
      setSaving(true)
      await adminFetch(`/api/admin/brands/${selectedBrand.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          name: form.name,
          slug: form.slug || null,
          description: form.description || null,
          logo_url: form.logo_url || null,
        }),
      })
      toast.success('Marque mise à jour')
      await onUpdated()
      setSelectedBrand(null)
      setForm(null)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Impossible de mettre à jour la marque')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Gérer les marques</Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Gestion des marques</DialogTitle>
          <DialogDescription>Modifier le logo des marques existantes ou mettre à jour leurs informations.</DialogDescription>
        </DialogHeader>

        {selectedBrand ? (
          <div className="grid gap-4">
            <Field label="Nom" value={form.name || ''} onChange={(value) => setForm({ ...form, name: value })} />
            <Field label="Slug" value={form.slug || ''} onChange={(value) => setForm({ ...form, slug: value })} />
            <Field label="URL du logo" value={form.logo_url || ''} onChange={(value) => setForm({ ...form, logo_url: value })} placeholder="https://..." />
            <div className="grid gap-2">
              <Label>Uploader un nouveau logo</Label>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(event) => setLogoFile(event.target.files?.[0] || null)}
                />
                <Button type="button" onClick={uploadBrandLogo} disabled={!logoFile || uploadingLogo}>
                  {uploadingLogo ? 'Téléversement...' : 'Téléverser le logo'}
                </Button>
              </div>
              {form.logo_url && (
                <div className="flex min-w-0 items-center gap-3">
                  <img src={form.logo_url} alt={form.name || 'Brand logo'} className="h-14 w-14 rounded-md object-cover border" />
                  <div className="min-w-0 overflow-hidden">
                    <span className="truncate block text-sm text-muted-foreground">{form.logo_url}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              {brands.map((brand) => (
                <button
                  type="button"
                  key={brand.id}
                  onClick={() => startEditBrand(brand)}
                  className="group flex items-center gap-3 rounded-xl border p-3 text-left transition-all hover:border-green-500 hover:bg-green-50"
                >
                  <span className="inline-flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg bg-muted">
                    {brand.logo_url ? (
                      <img src={brand.logo_url} alt={brand.name} className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-lg">🏷️</span>
                    )}
                  </span>
                  <span className="min-w-0 flex-1 overflow-hidden text-sm font-medium text-gray-900 truncate">{brand.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <DialogFooter className="gap-2">
          {selectedBrand ? (
            <>
              <Button variant="outline" onClick={() => setSelectedBrand(null)}>Retour à la liste</Button>
              <Button onClick={saveBrand} disabled={saving || !form?.name}>Enregistrer la marque</Button>
            </>
          ) : (
            <Button onClick={() => setOpen(false)}>Fermer</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function CategoryDialog({ category, onSave }: { category?: AdminCategory; onSave: (payload: any, id?: string) => Promise<void> }) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<any>(category || {})
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)

  async function uploadCategoryImage() {
    if (!imageFile) {
      toast.error('Sélectionnez d’abord une image')
      return
    }

    try {
      setUploadingImage(true)
      const body = new FormData()
      body.append('files', imageFile)
      body.append('folder', 'categories')

      const response = await adminUpload<{ urls: string[] }>('/api/admin/images', body)
      if (!response.urls?.[0]) {
        throw new Error('Aucune URL de retour')
      }

      setForm({ ...form, image_url: response.urls[0] })
      setImageFile(null)
      toast.success('Image de catégorie téléversée')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Impossible de téléverser l’image')
    } finally {
      setUploadingImage(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={category ? 'ghost' : 'default'} size={category ? 'icon' : 'default'}>
          {category ? <Pencil className="h-4 w-4" /> : <><Plus className="mr-2 h-4 w-4" /> Ajouter une catégorie</>}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>{category ? 'Modifier la catégorie' : 'Ajouter une catégorie'}</DialogTitle></DialogHeader>
        <div className="grid gap-4">
          <Field label="Nom" value={form.name || ''} onChange={(value) => setForm({ ...form, name: value })} />
          <Field label="Slug" value={form.slug || ''} onChange={(value) => setForm({ ...form, slug: value })} />
          <Field label="URL de l’image" value={form.image_url || ''} onChange={(value) => setForm({ ...form, image_url: value })} placeholder="https://..." />
          <div className="grid gap-2">
            <Label>Uploader une image</Label>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <Input type="file" accept="image/*" onChange={(event) => setImageFile(event.target.files?.[0] || null)} />
              <Button type="button" onClick={uploadCategoryImage} disabled={!imageFile || uploadingImage}>
                {uploadingImage ? 'Téléversement...' : 'Téléverser'}
              </Button>
            </div>
            {form.image_url && (
              <div className="flex min-w-0 items-center gap-3">
                <img src={form.image_url} alt={form.name || 'Category'} className="h-14 w-14 rounded-md object-cover border" />
                <div className="min-w-0 overflow-hidden">
                  <span className="truncate block text-sm text-muted-foreground">{form.image_url}</span>
                </div>
              </div>
            )}
          </div>
          <Field label="Emoji" value={form.emoji || ''} onChange={(value) => setForm({ ...form, emoji: value })} placeholder="Ex. 🎯" />
        </div>
        <DialogFooter><Button onClick={async () => { await onSave(form, category?.id); setOpen(false) }}>Enregistrer la catégorie</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function OrderDetails({
  order,
  onUpdate,
  onPaymentUpdate,
}: {
  order: AdminOrder
  onUpdate: (id: string, status: OrderStatus) => Promise<void>
  onPaymentUpdate: (id: string, status: PaymentStatus) => Promise<void>
}) {
  return (
    <Dialog>
      <DialogTrigger asChild><Button variant="ghost" size="icon" aria-label="Voir la commande"><Eye className="h-4 w-4" /></Button></DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Commande {order.order_number || order.id.slice(0, 8)}</DialogTitle>
          <DialogDescription>{customerName(order.profiles)} • {money.format(Number(order.total_amount))}</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="grid gap-3 rounded-lg border p-3 text-sm sm:grid-cols-2">
            <div>
              <p className="text-muted-foreground">Mode de paiement</p>
              <p className="font-medium">{paymentMethodLabels[order.payment_method || 'cash_on_delivery']}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Statut du paiement</p>
              <PaymentStatusBadge status={order.payment_status || 'pending'} />
            </div>
            <div>
              <p className="text-muted-foreground">Frais de livraison</p>
              <p className="font-medium">{money.format(Number(order.shipping_fee || 0))}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Total commande</p>
              <p className="font-medium">{money.format(Number(order.total_amount))}</p>
            </div>
          </div>
          {(order.order_items || []).map((item) => (
            <div key={item.id} className="flex items-center justify-between rounded-lg border p-3">
              <span>{item.products?.name || 'Produit'}</span>
              <span className="text-sm text-muted-foreground">x{item.quantity} • {money.format(Number(item.price))}</span>
            </div>
          ))}
          <Select value={order.status} onValueChange={(value) => onUpdate(order.id, value as OrderStatus)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{statuses.map((item) => <SelectItem key={item} value={item}>{orderStatusLabels[item]}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={order.payment_status || 'pending'} onValueChange={(value) => onPaymentUpdate(order.id, value as PaymentStatus)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{paymentStatuses.map((item) => <SelectItem key={item} value={item}>{paymentStatusLabels[item]}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function ConfirmDelete({ onConfirm }: { onConfirm: () => void }) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild><Button variant="ghost" size="icon" aria-label="Supprimer"><Trash2 className="h-4 w-4 text-destructive" /></Button></AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Supprimer cet élément ?</AlertDialogTitle>
          <AlertDialogDescription>Cette action est définitive.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>Supprimer</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

function StatusBadge({ status }: { status: OrderStatus }) {
  return <span className={cn('inline-flex rounded-md px-2 py-1 text-xs font-medium', statusClass[status])}>{orderStatusLabels[status]}</span>
}

function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  return <span className={cn('inline-flex rounded-md px-2 py-1 text-xs font-medium', paymentStatusClass[status])}>{paymentStatusLabels[status]}</span>
}

function Field({ label, value, onChange, type = 'text', icon, placeholder }: { label: string; value: any; onChange: (value: string) => void; type?: string; icon?: React.ReactNode; placeholder?: string }) {
  return (
    <div className="grid gap-2">
      <Label>{label}</Label>
      <div className="relative">
        <Input placeholder={placeholder} type={type} value={value} onChange={(event) => onChange(event.target.value)} className={icon ? 'pl-9' : undefined} />
        {icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">{icon}</div>}
      </div>
    </div>
  )
}

function ToggleRow({ label, checked, onCheckedChange }: { label: string; checked: boolean; onCheckedChange: (value: boolean) => void }) {
  return (
    <div className="flex items-center justify-between rounded-lg border p-3">
      <Label>{label}</Label>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  )
}

function MiniMetric({ title, value, tone = 'green' }: { title: string; value: number; tone?: 'green' | 'amber' | 'red' }) {
  return (
    <Card>
      <CardContent className="p-5">
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className={cn('mt-2 text-3xl font-semibold', tone === 'amber' && 'text-amber-600', tone === 'red' && 'text-destructive')}>{value}</p>
      </CardContent>
    </Card>
  )
}

function PackageIcon() {
  return <div className="rounded-lg border px-3 py-2 text-sm">Aucune image</div>
}

function OrderStatusFlow({ orders }: { orders: AdminOrder[] }) {
  const statusCounts = {
    pending: orders.filter(o => o.status === 'pending').length,
    processing: orders.filter(o => o.status === 'processing').length,
    shipped: orders.filter(o => o.status === 'shipped').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
  }

  const total = orders.length || 1

  return (
    <Card>
      <CardHeader>
        <CardTitle>Flux de statut des commandes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            {(Object.entries(statusCounts) as [OrderStatus, number][]).map(([status, count]) => (
              <div key={status} className="flex-1">
                <div className="rounded-lg bg-muted p-3 text-center">
                  <p className="text-sm font-medium capitalize">{orderStatusLabels[status]}</p>
                  <p className="mt-1 text-2xl font-semibold">{count}</p>
                  <p className="text-xs text-muted-foreground">{((count / total) * 100).toFixed(0)}%</p>
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between pt-2 text-sm text-muted-foreground">
            <span>En attente</span>
            <span>→</span>
            <span>En traitement</span>
            <span>→</span>
            <span>Expédiée</span>
            <span>→</span>
            <span>Livrée</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function AdvancedAnalytics() {
  const { data, isLoading, error } = useSWR<any>('/api/admin/dashboard', adminFetch)

  if (isLoading) return <div className="space-y-6"><Skeleton className="h-96 rounded-lg" /></div>
  if (error || !data) {
    return (
      <Card>
        <CardContent className="p-8 text-sm text-destructive">{error?.message || 'Impossible de charger les analyses avancées.'}</CardContent>
      </Card>
    )
  }

  const money = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'TND', maximumFractionDigits: 0 })

  // Calculate advanced metrics
  const totalCustomers = data.stats.totalCustomers || 1
  const totalRevenue = data.stats.totalRevenue || 0
  const paidOrders = data.stats.paidOrders || 0
  const totalOrders = data.stats.totalOrders || 1

  const cac = totalCustomers > 0 ? totalRevenue / totalCustomers : 0
  const clv = totalCustomers > 0 ? totalRevenue / totalCustomers : 0
  const conversionRate = totalOrders > 0 ? ((data.stats.deliveredOrders || 0) / totalOrders) * 100 : 0
  const repeatRate = totalCustomers > 0 && data.topCustomers ? (data.topCustomers.filter((c: any) => c.orders > 1).length / totalCustomers) * 100 : 0

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Coût d&apos;acquisition client</p>
            <p className="mt-2 text-3xl font-semibold">{money.format(cac)}</p>
            <Badge variant="secondary" className="mt-3">Par client</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Valeur de vie client</p>
            <p className="mt-2 text-3xl font-semibold">{money.format(clv)}</p>
            <Badge variant="secondary" className="mt-3">Total</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Taux de conversion</p>
            <p className="mt-2 text-3xl font-semibold">{conversionRate.toFixed(1)}%</p>
            <Badge variant="secondary" className="mt-3">Taux de livraison</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Taux de client récurrent</p>
            <p className="mt-2 text-3xl font-semibold">{repeatRate.toFixed(1)}%</p>
            <Badge variant="secondary" className="mt-3">Clients récurrents</Badge>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Analyse de performance des produits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.bestSellers && data.bestSellers.slice(0, 5).map((product: any, idx: number) => (
                <div key={idx} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="truncate font-medium">{product.name}</span>
                    <span className="text-muted-foreground">{money.format(product.revenue)}</span>
                  </div>
                  <Progress value={Math.min((product.revenue / (data.bestSellers[0]?.revenue || 1)) * 100, 100)} />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{product.quantity} vendus</span>
                    <span>Revenu: {((product.revenue / totalRevenue) * 100).toFixed(1)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Segmentation des clients</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-primary/5 p-4">
              <p className="text-sm text-muted-foreground">Clients VIP (5+ commandes)</p>
              <p className="mt-1 text-2xl font-semibold">{data.topCustomers?.filter((c: any) => c.orders >= 5).length || 0}</p>
            </div>
            <div className="rounded-lg bg-blue-500/5 p-4">
              <p className="text-sm text-muted-foreground">Clients réguliers (2-4 commandes)</p>
              <p className="mt-1 text-2xl font-semibold">{data.topCustomers?.filter((c: any) => c.orders >= 2 && c.orders < 5).length || 0}</p>
            </div>
            <div className="rounded-lg bg-muted p-4">
              <p className="text-sm text-muted-foreground">Nouveaux clients (1 commande)</p>
              <p className="mt-1 text-2xl font-semibold">{data.topCustomers?.filter((c: any) => c.orders === 1).length || 0}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Statistiques de paiement</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Taux de paiement</p>
              <p className="text-3xl font-semibold">{Math.round(data.stats.paidRate || 0)}%</p>
              <p className="text-xs text-muted-foreground">{paidOrders} commandes payées</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Commandes en attente de paiement</p>
              <p className="text-3xl font-semibold">{data.stats.totalOrders - paidOrders}</p>
              <p className="text-xs text-muted-foreground">{money.format((data.stats.totalRevenue * (1 - (data.stats.paidRate || 0) / 100)))}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Revenu total payé</p>
              <p className="text-3xl font-semibold">{money.format(totalRevenue * ((data.stats.paidRate || 0) / 100))}</p>
              <p className="text-xs text-muted-foreground">De {totalRevenue} DT total</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function customerName(profile?: AdminProfile | null) {
  return [profile?.first_name, profile?.last_name].filter(Boolean).join(' ') || profile?.email || 'Customer'
}
