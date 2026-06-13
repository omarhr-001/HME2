'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  BarChart3,
  Bell,
  Boxes,
  ChevronRight,
  Gauge,
  Gift,
  Grid3X3,
  LogOut,
  Menu,
  Package,
  Search,
  Settings,
  ShoppingCart,
  Users,
  X,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { useAuth } from '@/lib/auth-context'
import { adminFetch } from '@/lib/admin/client'
import { cn } from '@/lib/utils'

const nav = [
  { href: '/admin', label: 'Tableau de bord', icon: Gauge },
  { href: '/admin/analytics', label: 'Analyses', icon: BarChart3 },
  { href: '/admin/orders', label: 'Commandes', icon: ShoppingCart },
  { href: '/admin/products', label: 'Produits', icon: Package },
  { href: '/admin/promotions', label: 'Promotions', icon: Gift },
  { href: '/admin/customers', label: 'Clients', icon: Users },
  { href: '/admin/categories', label: 'Catégories', icon: Grid3X3 },
  { href: '/admin/inventory', label: 'Stock', icon: Boxes },
  { href: '/admin/settings', label: 'Paramètres', icon: Settings },
]

type AdminNotificationKey = 'newOrders' | 'lowStockAlerts' | 'customerSignups' | 'weeklyReports'
type TopbarNotification = {
  id: string
  title: string
  description: string
  href: string
  time?: string
}

const defaultNotificationSettings: Record<AdminNotificationKey, boolean> = {
  newOrders: true,
  lowStockAlerts: true,
  customerSignups: true,
  weeklyReports: true,
}

function getNotificationSettings() {
  try {
    const stored = window.localStorage.getItem('hme-admin-notification-settings')
    return stored ? { ...defaultNotificationSettings, ...JSON.parse(stored) } : defaultNotificationSettings
  } catch {
    return defaultNotificationSettings
  }
}

function sendAdminNotification(key: AdminNotificationKey, title: string, body: string) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return
  if (!getNotificationSettings()[key]) return

  new Notification(title, { body })
}

function formatNotificationTime(value?: string) {
  if (!value) return ''

  return new Date(value).toLocaleString('fr-FR', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function getDismissedNotificationIds() {
  try {
    return new Set(JSON.parse(window.localStorage.getItem('hme-admin-dismissed-notifications') || '[]') as string[])
  } catch {
    return new Set<string>()
  }
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, loading, signOut } = useAuth()
  const [open, setOpen] = useState(false)
  const [checkingAdmin, setCheckingAdmin] = useState(true)
  const [accessError, setAccessError] = useState('')
  const [topbarNotifications, setTopbarNotifications] = useState<TopbarNotification[]>([])
  const [dismissedNotificationIds, setDismissedNotificationIds] = useState<Set<string>>(new Set())
  const notificationSnapshot = useRef({
    initialized: false,
    latestOrderDate: '',
    latestCustomerDate: '',
    lowStockIds: new Set<number>(),
    lastWeeklyReportDate: '',
  })

  const activeLabel = nav.find((item) => item.href === pathname)?.label || 'Tableau de bord'

  async function logout() {
    await signOut()
    router.push('/')
  }

  function openNotification(notification: TopbarNotification) {
    const nextDismissedIds = new Set(dismissedNotificationIds)
    nextDismissedIds.add(notification.id)

    setDismissedNotificationIds(nextDismissedIds)
    setTopbarNotifications((current) => current.filter((item) => item.id !== notification.id))
    window.localStorage.setItem('hme-admin-dismissed-notifications', JSON.stringify([...nextDismissedIds]))
    router.push(notification.href)
  }

  useEffect(() => {
    async function checkAdminRole() {
      if (loading) return

      if (!user) {
        setAccessError('Aucune session Supabase active. Reconnecte-toi puis réessaie /admin.')
        setCheckingAdmin(false)
        return
      }

      try {
        await adminFetch('/api/admin/me')
      } catch (error) {
        setAccessError(error instanceof Error ? error.message : 'Accès admin refusé.')
        setCheckingAdmin(false)
        return
      }

      setCheckingAdmin(false)
    }

    checkAdminRole()
  }, [loading, router, user])

  useEffect(() => {
    setDismissedNotificationIds(getDismissedNotificationIds())
  }, [])

  useEffect(() => {
    if (loading || checkingAdmin || accessError) return

    let cancelled = false

    async function pollAdminNotifications() {
      const settings = getNotificationSettings()
      if (!settings.newOrders && !settings.lowStockAlerts && !settings.customerSignups && !settings.weeklyReports) return

      try {
        const [orders, products, customers, weeklyReportData] = await Promise.all([
          settings.newOrders ? adminFetch<any[]>('/api/admin/orders?status=all') : Promise.resolve([]),
          settings.lowStockAlerts ? adminFetch<any[]>('/api/admin/products') : Promise.resolve([]),
          settings.customerSignups ? adminFetch<any[]>('/api/admin/customers') : Promise.resolve([]),
          settings.weeklyReports ? adminFetch<any>('/api/admin/weekly-report').catch(() => null) : Promise.resolve(null),
        ])

        if (cancelled) return

        const snapshot = notificationSnapshot.current
        const latestOrderDate = orders[0]?.created_at || snapshot.latestOrderDate
        const latestCustomerDate = customers[0]?.created_at || snapshot.latestCustomerDate
        const lowStockIds = new Set(
          products
            .filter((product) => product.stock_quantity > 0 && product.stock_quantity <= 5)
            .map((product) => product.id as number),
        )
        const notifications: TopbarNotification[] = []

        if (orders[0]) {
          notifications.push({
            id: `order-${orders[0].id}`,
            title: 'Nouvelle commande',
            description: `Commande ${orders[0].order_number || String(orders[0].id).slice(0, 8)} reçue.`,
            href: '/admin/orders',
            time: orders[0].created_at,
          })
        }

        if (customers[0]) {
          const customerName = [customers[0].first_name, customers[0].last_name].filter(Boolean).join(' ')
          notifications.push({
            id: `customer-${customers[0].id}`,
            title: 'Nouveau client',
            description: customerName || customers[0].email || 'Un compte client a été créé.',
            href: '/admin/customers',
            time: customers[0].created_at,
          })
        }

        if (lowStockIds.size > 0) {
          notifications.push({
            id: 'low-stock',
            title: 'Alerte de stock',
            description: `${lowStockIds.size} produit(s) à vérifier.`,
            href: '/admin/inventory',
          })
        }

        setTopbarNotifications(notifications.filter((notification) => !dismissedNotificationIds.has(notification.id)))

        if (snapshot.initialized) {
          if (latestOrderDate && latestOrderDate > snapshot.latestOrderDate) {
            sendAdminNotification('newOrders', 'Nouvelle commande reçue', 'Un client vient de passer commande.')
          }

          if (latestCustomerDate && latestCustomerDate > snapshot.latestCustomerDate) {
            sendAdminNotification('customerSignups', 'Nouveau client inscrit', "Un compte client vient d'être créé.")
          }

          const newLowStockCount = [...lowStockIds].filter((id) => !snapshot.lowStockIds.has(id)).length
          if (newLowStockCount > 0) {
            sendAdminNotification('lowStockAlerts', 'Alerte de stock', `${newLowStockCount} produit(s) sont presque en rupture.`)
          }

          if (weeklyReportData && !snapshot.lastWeeklyReportDate) {
            sendAdminNotification('weeklyReports', 'Rapport hebdomadaire disponible', 'Consultez les performances de votre entreprise cette semaine.')
          }
        }

        notificationSnapshot.current = {
          initialized: true,
          latestOrderDate,
          latestCustomerDate,
          lowStockIds,
          lastWeeklyReportDate: weeklyReportData ? new Date().toISOString() : snapshot.lastWeeklyReportDate,
        }

      } catch {
        // Notification polling is best-effort and should not interrupt admin work.
      }
    }

    pollAdminNotifications()
    const interval = window.setInterval(pollAdminNotifications, 60000)

    return () => {
      cancelled = true
      window.clearInterval(interval)
    }
  }, [accessError, checkingAdmin, dismissedNotificationIds, loading])

  if (loading || checkingAdmin) {
    return (
      <div className="grid min-h-screen place-items-center bg-gray-50 text-gray-900">
        <div className="rounded-lg border bg-white px-5 py-4 text-sm shadow-sm">Chargement du dashboard...</div>
      </div>
    )
  }

  if (accessError) {
    return (
      <div className="grid min-h-screen place-items-center bg-gray-50 px-4 text-gray-900">
        <div className="w-full max-w-lg rounded-lg border bg-white p-6 shadow-sm">
          <h1 className="text-xl font-semibold">Accès admin refusé</h1>
          <p className="mt-2 text-sm text-gray-600">{accessError}</p>
          <div className="mt-5 flex gap-2">
            <Button onClick={() => router.push('/auth/login')}>Se reconnecter</Button>
            <Button variant="outline" onClick={() => window.location.reload()}>Réessayer</Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(34,197,94,0.10),transparent_34rem),linear-gradient(180deg,hsl(var(--background)),hsl(var(--background)))] text-foreground">
        <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 border-r bg-background/80 backdrop-blur-xl lg:block">
          <Sidebar pathname={pathname} onLogout={logout} />
        </aside>

        <div className="lg:pl-72">
          <header className="sticky top-0 z-30 border-b bg-background/78 backdrop-blur-xl">
            <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
              <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Ouvrir le menu">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-72 p-0">
                  <SheetHeader className="sr-only">
                    <SheetTitle>Navigation admin</SheetTitle>
                    <SheetDescription>Menu mobile du tableau de bord administrateur.</SheetDescription>
                  </SheetHeader>
                  <Sidebar pathname={pathname} onNavigate={() => setOpen(false)} onLogout={logout} />
                </SheetContent>
              </Sheet>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  Admin <ChevronRight className="h-3 w-3" /> {activeLabel}
                </div>
                <h1 className="truncate text-lg font-semibold tracking-normal">{activeLabel}</h1>
              </div>

              <div className="hidden w-full max-w-md items-center gap-2 rounded-lg border bg-card px-3 py-2 shadow-sm md:flex">
                <Search className="h-4 w-4 text-muted-foreground" />
                <input
                  className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                  placeholder="Rechercher commandes, produits, clients..."
                />
              </div>

              <HoverCard openDelay={100} closeDelay={150}>
                <HoverCardTrigger asChild>
                  <Button variant="outline" size="icon" aria-label="Notifications" className="relative">
                    <Bell className="h-4 w-4" />
                    {topbarNotifications.length > 0 && (
                      <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
                        {topbarNotifications.length}
                      </span>
                    )}
                  </Button>
                </HoverCardTrigger>
                <HoverCardContent align="end" className="w-80 p-0">
                  <div className="border-b px-4 py-3">
                    <p className="text-sm font-semibold">Notifications</p>
                    <p className="text-xs text-muted-foreground">Activité récente de l’administration</p>
                  </div>
                  <div className="max-h-80 overflow-y-auto p-2">
                    {topbarNotifications.length === 0 ? (
                      <div className="px-2 py-6 text-center text-sm text-muted-foreground">
                        Aucune notification pour le moment.
                      </div>
                    ) : (
                      topbarNotifications.map((notification) => (
                        <button
                          key={notification.id}
                          type="button"
                          className="w-full rounded-md px-3 py-2 text-left transition-colors hover:bg-accent"
                          onClick={() => openNotification(notification)}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <p className="text-sm font-medium">{notification.title}</p>
                            {notification.time && (
                              <span className="shrink-0 text-[11px] text-muted-foreground">
                                {formatNotificationTime(notification.time)}
                              </span>
                            )}
                          </div>
                          <p className="mt-1 text-xs text-muted-foreground">{notification.description}</p>
                        </button>
                      ))
                    )}
                  </div>
                  <div className="border-t px-4 py-2 text-xs text-muted-foreground">
                    Gérez les types de notifications dans les paramètres.
                  </div>
                </HoverCardContent>
              </HoverCard>

              <Avatar className="h-9 w-9 border">
                <AvatarFallback>{user?.email?.slice(0, 2).toUpperCase() || 'AD'}</AvatarFallback>
              </Avatar>
            </div>
          </header>

          <main className="mx-auto w-full max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8">{children}</main>
        </div>
      </div>
    </>
  )
}

function Sidebar({
  pathname,
  onNavigate,
  onLogout,
}: {
  pathname: string
  onNavigate?: () => void
  onLogout: () => void
}) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center gap-3 border-b px-5">
        <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary text-primary-foreground shadow-lg shadow-primary/20">
          H
        </div>
        <div>
          <div className="text-sm font-semibold">HME Admin</div>
          <div className="text-xs text-muted-foreground">Espace de gestion</div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {nav.map((item) => {
          const Icon = item.icon
          const active = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all hover:bg-accent hover:text-accent-foreground',
                active && 'bg-primary text-primary-foreground shadow-md shadow-primary/20 hover:bg-primary hover:text-primary-foreground',
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="border-t p-3">
        <Button variant="ghost" className="w-full justify-start gap-3" onClick={onLogout}>
          <LogOut className="h-4 w-4" />
          Déconnexion
        </Button>
      </div>
    </div>
  )
}

export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="grid min-h-48 place-items-center rounded-lg border border-dashed bg-card/50 p-8 text-center">
      <div>
        <X className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
        <h3 className="text-base font-semibold">{title}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  )
}
