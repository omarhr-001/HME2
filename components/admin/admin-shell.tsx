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
  Star,
  Users,
  X,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useAuth } from '@/lib/auth-context'
import { adminFetch } from '@/lib/admin/client'
import { cn } from '@/lib/utils'

const nav = [
  { href: '/admin', label: 'Dashboard', icon: Gauge },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/promotions', label: 'Promotions', icon: Gift },
  { href: '/admin/customers', label: 'Customers', icon: Users },
  { href: '/admin/categories', label: 'Categories', icon: Grid3X3 },
  { href: '/admin/reviews', label: 'Reviews', icon: Star },
  { href: '/admin/inventory', label: 'Inventory', icon: Boxes },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
]

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, loading, signOut } = useAuth()
  const [open, setOpen] = useState(false)
  const [checkingAdmin, setCheckingAdmin] = useState(true)
  const [accessError, setAccessError] = useState('')

  const activeLabel = nav.find((item) => item.href === pathname)?.label || 'Dashboard'

  async function logout() {
    await signOut()
    router.push('/')
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
    <TooltipProvider delayDuration={150}>
      <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(34,197,94,0.10),transparent_34rem),linear-gradient(180deg,hsl(var(--background)),hsl(var(--background)))] text-foreground">
        <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 border-r bg-background/80 backdrop-blur-xl lg:block">
          <Sidebar pathname={pathname} onLogout={logout} />
        </aside>

        <div className="lg:pl-72">
          <header className="sticky top-0 z-30 border-b bg-background/78 backdrop-blur-xl">
            <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
              <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-72 p-0">
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
                  placeholder="Search orders, products, customers..."
                />
              </div>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" aria-label="Notifications">
                    <Bell className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Dashboard notifications</TooltipContent>
              </Tooltip>

              <Avatar className="h-9 w-9 border">
                <AvatarFallback>{user?.email?.slice(0, 2).toUpperCase() || 'AD'}</AvatarFallback>
              </Avatar>
            </div>
          </header>

          <main className="mx-auto w-full max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8">{children}</main>
        </div>
      </div>
    </TooltipProvider>
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
          <div className="text-xs text-muted-foreground">Commerce control room</div>
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
          Logout
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
