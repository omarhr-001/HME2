'use client'

import Image from 'next/image'
import useSWR from 'swr'
import { useMemo, useState } from 'react'
import { Download, Eye, FileSpreadsheet, Pencil, Plus, Save, Search, Trash2, Upload } from 'lucide-react'
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
import { EmptyState } from '@/components/admin/admin-shell'
import { adminFetch, downloadAdminFile, adminUpload } from '@/lib/admin/client'
import type { AdminCategory, AdminOrder, AdminProduct, AdminProfile, OrderStatus, PaymentStatus } from '@/lib/admin/types'
import { cn } from '@/lib/utils'
import { useAuth } from '@/lib/auth-context'

const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })
const statuses: OrderStatus[] = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']
const paymentStatuses: PaymentStatus[] = ['pending', 'paid', 'failed', 'refunded']

const statusClass: Record<OrderStatus, string> = {
  pending: 'bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-200',
  processing: 'bg-blue-100 text-blue-800 dark:bg-blue-500/15 dark:text-blue-200',
  shipped: 'bg-violet-100 text-violet-800 dark:bg-violet-500/15 dark:text-violet-200',
  delivered: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-200',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-500/15 dark:text-red-200',
}

const paymentMethodLabels = {
  cash_on_delivery: 'Cash on delivery',
  bank_transfer: 'Bank transfer',
}

const paymentStatusClass: Record<PaymentStatus, string> = {
  pending: 'bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-200',
  paid: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-200',
  failed: 'bg-red-100 text-red-800 dark:bg-red-500/15 dark:text-red-200',
  refunded: 'bg-slate-100 text-slate-800 dark:bg-slate-500/15 dark:text-slate-200',
}

export function OrdersPage() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [page, setPage] = useState(1)
  const { data = [], mutate, isLoading } = useSWR<AdminOrder[]>(
    `/api/admin/orders?status=${status}&search=${encodeURIComponent(search)}`,
    adminFetch,
  )
  const pageSize = 8
  const paged = data.slice((page - 1) * pageSize, page * pageSize)
  const pageCount = Math.max(1, Math.ceil(data.length / pageSize))

  async function updateStatus(id: string, nextStatus: OrderStatus) {
    await adminFetch(`/api/admin/orders/${id}`, { method: 'PATCH', body: JSON.stringify({ status: nextStatus }) })
    toast.success('Order status updated')
    mutate()
  }

  async function updatePaymentStatus(id: string, nextStatus: PaymentStatus) {
    await adminFetch(`/api/admin/orders/${id}`, { method: 'PATCH', body: JSON.stringify({ payment_status: nextStatus }) })
    toast.success('Payment status updated')
    mutate()
  }

  async function deleteOrder(id: string) {
    await adminFetch(`/api/admin/orders/${id}`, { method: 'DELETE' })
    toast.success('Order deleted')
    mutate()
  }

  return (
    <div className="space-y-5">
      <Toolbar
        search={search}
        setSearch={setSearch}
        right={
          <>
            <Select value={status} onValueChange={(value) => { setStatus(value); setPage(1) }}>
              <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {statuses.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={() => downloadAdminFile(`/api/admin/orders?status=${status}&search=${search}&format=csv`, 'orders.csv')}>
              <Download className="mr-2 h-4 w-4" /> Export CSV
            </Button>
          </>
        }
      />

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Products</TableHead>
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
                <TableCell className="font-medium">{order.order_number || order.id.slice(0, 8)}</TableCell>
                <TableCell>{customerName(order.profiles)}</TableCell>
                <TableCell>{order.order_items?.length || 0}</TableCell>
                <TableCell>{money.format(Number(order.total_amount))}</TableCell>
                <TableCell><StatusBadge status={order.status} /></TableCell>
                <TableCell><PaymentStatusBadge status={order.payment_status || 'pending'} /></TableCell>
                <TableCell>{new Date(order.created_at).toLocaleDateString()}</TableCell>
                <TableCell className="text-right">
                  <OrderDetails order={order} onUpdate={updateStatus} onPaymentUpdate={updatePaymentStatus} />
                  <Button variant="ghost" size="icon" onClick={() => updateStatus(order.id, 'delivered')} aria-label="Mark delivered">
                    <Save className="h-4 w-4" />
                  </Button>
                  <ConfirmDelete onConfirm={() => deleteOrder(order.id)} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {!isLoading && data.length === 0 && <div className="p-6"><EmptyState title="No orders found" description="Orders will appear here once customers checkout." /></div>}
      </Card>

      <div className="flex items-center justify-end gap-2">
        <Button variant="outline" disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</Button>
        <span className="text-sm text-muted-foreground">Page {page} of {pageCount}</span>
        <Button variant="outline" disabled={page === pageCount} onClick={() => setPage(page + 1)}>Next</Button>
      </div>
    </div>
  )
}

export function ProductsPage() {
  const [search, setSearch] = useState('')
  const { data: products = [], mutate } = useSWR<AdminProduct[]>(`/api/admin/products?search=${encodeURIComponent(search)}`, adminFetch)
  const { data: categories = [] } = useSWR<AdminCategory[]>('/api/admin/categories', adminFetch)

  async function saveProduct(payload: Partial<AdminProduct>, id?: number) {
    await adminFetch(id ? `/api/admin/products/${id}` : '/api/admin/products', {
      method: id ? 'PATCH' : 'POST',
      body: JSON.stringify(payload),
    })
    toast.success(id ? 'Product updated' : 'Product created')
    mutate()
  }

  async function deleteProduct(id: number) {
    await adminFetch(`/api/admin/products/${id}`, { method: 'DELETE' })
    toast.success('Product deleted')
    mutate()
  }

  return (
    <div className="space-y-5">
      <Toolbar
        search={search}
        setSearch={setSearch}
        right={
          <>
            <ProductImportDialog onImported={() => mutate()} />
            <ProductDialog categories={categories} onSave={saveProduct} />
          </>
        }
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {products.map((product) => (
          <Card key={product.id} className="overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-lg">
            <div className="relative aspect-[16/10] bg-muted">
              {product.image_url ? (
                <Image src={product.image_url} alt={product.name} fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" />
              ) : (
                <div className="grid h-full place-items-center text-muted-foreground"><PackageIcon /></div>
              )}
              <div className="absolute right-3 top-3 flex gap-2">
                <Badge variant={product.is_active ? 'default' : 'secondary'}>{product.is_active ? 'Active' : 'Inactive'}</Badge>
                <Badge variant={product.stock_quantity > 0 ? 'secondary' : 'destructive'}>{product.stock_quantity > 0 ? `${product.stock_quantity} stock` : 'Out'}</Badge>
              </div>
            </div>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="truncate text-base font-semibold">{product.name}</h3>
                  <p className="text-sm text-muted-foreground">{product.categories?.name || product.category || 'Uncategorized'}</p>
                </div>
                <p className="font-semibold">{money.format(Number(product.price))}</p>
              </div>
              <div className="mt-4 flex items-center justify-end gap-1">
                <ProductDialog product={product} categories={categories} onSave={saveProduct} />
                <ConfirmDelete onConfirm={() => deleteProduct(product.id)} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export function CustomersPage() {
  const [search, setSearch] = useState('')
  const [role, setRole] = useState('all')
  const { data = [], mutate } = useSWR<AdminProfile[]>(`/api/admin/customers?role=${role}&search=${encodeURIComponent(search)}`, adminFetch)

  async function setRoleForUser(id: string, nextRole: 'admin' | 'client') {
    await adminFetch(`/api/admin/customers/${id}`, { method: 'PATCH', body: JSON.stringify({ role: nextRole }) })
    toast.success('Customer role updated')
    mutate()
  }

  return (
    <div className="space-y-5">
      <Toolbar
        search={search}
        setSearch={setSearch}
        right={
          <Select value={role} onValueChange={setRole}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All roles</SelectItem>
              <SelectItem value="client">Clients</SelectItem>
              <SelectItem value="admin">Admins</SelectItem>
            </SelectContent>
          </Select>
        }
      />
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Full name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Registration</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((profile) => (
              <TableRow key={profile.id}>
                <TableCell className="font-medium">{customerName(profile)}</TableCell>
                <TableCell>{profile.email || '-'}</TableCell>
                <TableCell>{profile.phone || '-'}</TableCell>
                <TableCell><Badge variant={profile.role === 'admin' ? 'default' : 'secondary'}>{profile.role}</Badge></TableCell>
                <TableCell>{new Date(profile.created_at).toLocaleDateString()}</TableCell>
                <TableCell className="text-right">
                  <Button variant="outline" size="sm" onClick={() => setRoleForUser(profile.id, profile.role === 'admin' ? 'client' : 'admin')}>
                    {profile.role === 'admin' ? 'Set client' : 'Promote'}
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
    toast.success(id ? 'Category updated' : 'Category created')
    mutate()
  }

  async function deleteCategory(id: string) {
    await adminFetch(`/api/admin/categories/${id}`, { method: 'DELETE' })
    toast.success('Category deleted')
    mutate()
  }

  return (
    <div className="space-y-5">
      <div className="flex justify-end"><CategoryDialog onSave={saveCategory} /></div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {data.map((category, index) => (
          <Card key={category.id} className="overflow-hidden">
            <CardContent className="p-5">
              <div className={cn('mb-5 grid h-14 w-14 place-items-center rounded-lg text-2xl', index % 2 ? 'bg-blue-500/10' : 'bg-primary/10')}>
                {category.emoji || '•'}
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
  const { data = [] } = useSWR<AdminProduct[]>('/api/admin/products', adminFetch)
  const low = data.filter((product) => product.stock_quantity > 0 && product.stock_quantity <= 5)
  const out = data.filter((product) => product.stock_quantity === 0 || !product.in_stock)

  return (
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-3">
        <MiniMetric title="In stock" value={data.filter((product) => product.stock_quantity > 5).length} />
        <MiniMetric title="Low stock" value={low.length} tone="amber" />
        <MiniMetric title="Out of stock" value={out.length} tone="red" />
      </div>
      <Card>
        <CardHeader><CardTitle>Stock Monitoring</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {data.map((product) => (
            <div key={product.id} className="rounded-lg border p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-medium">{product.name}</p>
                  <p className="text-sm text-muted-foreground">{product.sku || product.categories?.name || 'No SKU'}</p>
                </div>
                <Badge variant={product.stock_quantity === 0 ? 'destructive' : product.stock_quantity <= 5 ? 'secondary' : 'outline'}>
                  {product.stock_quantity === 0 ? 'Out of stock' : product.stock_quantity <= 5 ? 'Low stock' : `${product.stock_quantity} units`}
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

export function ReviewsPage() {
  const { data = [] } = useSWR<Array<Pick<AdminProduct, 'id' | 'name' | 'image_url' | 'rating' | 'reviews_count'>>>('/api/admin/reviews', adminFetch)

  return (
    <Card>
      <CardHeader><CardTitle>Average Ratings</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        {data.map((product) => (
          <div key={product.id} className="flex items-center justify-between gap-4 rounded-lg border p-4">
            <div>
              <p className="font-medium">{product.name}</p>
              <p className="text-sm text-muted-foreground">{product.reviews_count} reviews</p>
            </div>
            <Badge variant="secondary">{Number(product.rating).toFixed(1)} / 5</Badge>
          </div>
        ))}
        {data.length === 0 && <EmptyState title="No reviews yet" description="The current schema stores rating aggregates on products. Detailed review moderation will appear when a reviews table is added." />}
      </CardContent>
    </Card>
  )
}

export function SettingsPage() {
  const { user, signOut } = useAuth()

  return (
    <Tabs defaultValue="profile" className="space-y-5">
      <TabsList>
        <TabsTrigger value="profile">Profile</TabsTrigger>
        <TabsTrigger value="security">Security</TabsTrigger>
        <TabsTrigger value="notifications">Notifications</TabsTrigger>
      </TabsList>
      <TabsContent value="profile">
        <Card>
          <CardHeader><CardTitle>Admin Profile</CardTitle></CardHeader>
          <CardContent className="grid max-w-2xl gap-4">
            <Label>Email</Label>
            <Input value={user?.email || ''} readOnly />
            <Label>Display name</Label>
            <Input placeholder="Admin name" />
            <Button className="w-fit"><Save className="mr-2 h-4 w-4" /> Save profile</Button>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="security">
        <Card>
          <CardHeader><CardTitle>Change Password</CardTitle></CardHeader>
          <CardContent className="grid max-w-2xl gap-4">
            <Input type="password" placeholder="New password" />
            <Input type="password" placeholder="Confirm password" />
            <Button className="w-fit">Update password</Button>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="notifications">
        <Card>
          <CardHeader><CardTitle>Notification Settings</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {['New orders', 'Low stock alerts', 'Customer signups', 'Weekly reports'].map((item) => (
              <div key={item} className="flex items-center justify-between rounded-lg border p-4">
                <span className="font-medium">{item}</span>
                <Switch defaultChecked />
              </div>
            ))}
            <Button variant="destructive" onClick={signOut}>Logout</Button>
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
        <input className="w-full bg-transparent text-sm outline-none" placeholder="Search..." value={search} onChange={(event) => setSearch(event.target.value)} />
      </div>
      <div className="flex flex-wrap gap-2">{right}</div>
    </div>
  )
}

function ProductDialog({ product, categories, onSave }: { product?: AdminProduct; categories: AdminCategory[]; onSave: (payload: any, id?: number) => Promise<void> }) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<any>(product || { is_active: true, in_stock: true, stock_quantity: 0 })

  async function submit() {
    await onSave(form, product?.id)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={product ? 'ghost' : 'default'} size={product ? 'icon' : 'default'}>
          {product ? <Pencil className="h-4 w-4" /> : <><Plus className="mr-2 h-4 w-4" /> Add product</>}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{product ? 'Edit product' : 'Add product'}</DialogTitle>
          <DialogDescription>Manage pricing, inventory, imagery, and category placement.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Name" value={form.name || ''} onChange={(value) => setForm({ ...form, name: value })} />
          <Field label="SKU" value={form.sku || ''} onChange={(value) => setForm({ ...form, sku: value })} />
          <Field label="Price" type="number" value={form.price || ''} onChange={(value) => setForm({ ...form, price: value })} />
          <Field label="Original price" type="number" value={form.original_price || ''} onChange={(value) => setForm({ ...form, original_price: value })} />
          <Field label="Stock" type="number" value={form.stock_quantity || 0} onChange={(value) => setForm({ ...form, stock_quantity: value })} />
          <div className="grid gap-2">
            <Label>Category</Label>
            <Select value={form.category_id || ''} onValueChange={(value) => setForm({ ...form, category_id: value })}>
              <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
              <SelectContent>{categories.map((category) => <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="sm:col-span-2"><Field label="Image URL" value={form.image_url || ''} onChange={(value) => setForm({ ...form, image_url: value })} icon={<Upload className="h-4 w-4" />} /></div>
          <div className="grid gap-2 sm:col-span-2">
            <Label>Description</Label>
            <Textarea value={form.description || ''} onChange={(event) => setForm({ ...form, description: event.target.value })} />
          </div>
          <ToggleRow label="Active product" checked={!!form.is_active} onCheckedChange={(value) => setForm({ ...form, is_active: value })} />
          <ToggleRow label="In stock" checked={!!form.in_stock} onCheckedChange={(value) => setForm({ ...form, in_stock: value })} />
        </div>
        <DialogFooter><Button onClick={submit}>Save product</Button></DialogFooter>
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
      toast.error('Select an Excel or CSV file first')
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
      toast.success(`${response.inserted} products imported`)
      onImported()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Import failed')
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
          <DialogTitle>Import products from Excel</DialogTitle>
          <DialogDescription>
            Upload .xlsx, .xls, or .csv with columns like name, description, price, stock_quantity, category, image_url, sku, is_active.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-lg border border-dashed p-5">
            <Label htmlFor="product-import" className="mb-2 block font-medium">Product file</Label>
            <Input
              id="product-import"
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={(event) => setFile(event.target.files?.[0] || null)}
            />
            <p className="mt-2 text-xs text-muted-foreground">
              French headers are supported too: nom, prix, quantite, categorie, photo, reference.
            </p>
          </div>

          {result && (
            <div className="rounded-lg border bg-muted/30 p-4 text-sm">
              <p className="font-medium">{result.inserted} products inserted, {result.skipped} rows skipped.</p>
              {!!result.errors?.length && (
                <div className="mt-3 max-h-36 space-y-1 overflow-auto text-destructive">
                  {result.errors.slice(0, 8).map((item) => (
                    <p key={`${item.row}-${item.error}`}>Row {item.row}: {item.error}</p>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Close</Button>
          <Button onClick={submit} disabled={loading}>
            {loading ? 'Importing...' : 'Import products'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function CategoryDialog({ category, onSave }: { category?: AdminCategory; onSave: (payload: any, id?: string) => Promise<void> }) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<any>(category || {})
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={category ? 'ghost' : 'default'} size={category ? 'icon' : 'default'}>
          {category ? <Pencil className="h-4 w-4" /> : <><Plus className="mr-2 h-4 w-4" /> Add category</>}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>{category ? 'Edit category' : 'Add category'}</DialogTitle></DialogHeader>
        <div className="grid gap-4">
          <Field label="Name" value={form.name || ''} onChange={(value) => setForm({ ...form, name: value })} />
          <Field label="Slug" value={form.slug || ''} onChange={(value) => setForm({ ...form, slug: value })} />
          <Field label="Emoji" value={form.emoji || ''} onChange={(value) => setForm({ ...form, emoji: value })} />
        </div>
        <DialogFooter><Button onClick={async () => { await onSave(form, category?.id); setOpen(false) }}>Save category</Button></DialogFooter>
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
      <DialogTrigger asChild><Button variant="ghost" size="icon" aria-label="View order"><Eye className="h-4 w-4" /></Button></DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Order {order.order_number || order.id.slice(0, 8)}</DialogTitle>
          <DialogDescription>{customerName(order.profiles)} • {money.format(Number(order.total_amount))}</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="grid gap-3 rounded-lg border p-3 text-sm sm:grid-cols-2">
            <div>
              <p className="text-muted-foreground">Payment method</p>
              <p className="font-medium">{paymentMethodLabels[order.payment_method || 'cash_on_delivery']}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Payment status</p>
              <PaymentStatusBadge status={order.payment_status || 'pending'} />
            </div>
          </div>
          {(order.order_items || []).map((item) => (
            <div key={item.id} className="flex items-center justify-between rounded-lg border p-3">
              <span>{item.products?.name || 'Product'}</span>
              <span className="text-sm text-muted-foreground">x{item.quantity} • {money.format(Number(item.price))}</span>
            </div>
          ))}
          <Select value={order.status} onValueChange={(value) => onUpdate(order.id, value as OrderStatus)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{statuses.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={order.payment_status || 'pending'} onValueChange={(value) => onPaymentUpdate(order.id, value as PaymentStatus)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{paymentStatuses.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function ConfirmDelete({ onConfirm }: { onConfirm: () => void }) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild><Button variant="ghost" size="icon" aria-label="Delete"><Trash2 className="h-4 w-4 text-destructive" /></Button></AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this item?</AlertDialogTitle>
          <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>Delete</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

function StatusBadge({ status }: { status: OrderStatus }) {
  return <span className={cn('inline-flex rounded-md px-2 py-1 text-xs font-medium capitalize', statusClass[status])}>{status}</span>
}

function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  return <span className={cn('inline-flex rounded-md px-2 py-1 text-xs font-medium capitalize', paymentStatusClass[status])}>{status}</span>
}

function Field({ label, value, onChange, type = 'text', icon }: { label: string; value: any; onChange: (value: string) => void; type?: string; icon?: React.ReactNode }) {
  return (
    <div className="grid gap-2">
      <Label>{label}</Label>
      <div className="relative">
        <Input type={type} value={value} onChange={(event) => onChange(event.target.value)} className={icon ? 'pl-9' : undefined} />
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
  return <div className="rounded-lg border px-3 py-2 text-sm">No image</div>
}

function customerName(profile?: AdminProfile | null) {
  return [profile?.first_name, profile?.last_name].filter(Boolean).join(' ') || profile?.email || 'Customer'
}
