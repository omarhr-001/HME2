'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, LayoutDashboard, ShoppingCart, Package, Users, Settings, LogOut } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'

export function AdminSidebar() {
  const [isOpen, setIsOpen] = useState(true)
  const pathname = usePathname()
  const { signOut } = useAuth()

  const menuItems = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/orders', label: 'Commandes', icon: ShoppingCart },
    { href: '/admin/products', label: 'Produits', icon: Package },
    { href: '/admin/users', label: 'Utilisateurs', icon: Users },
    { href: '/admin/settings', label: 'Paramètres', icon: Settings },
  ]

  const isActive = (href: string) => pathname === href

  const handleLogout = async () => {
    await signOut()
    window.location.href = '/login'
  }

  return (
    <>
      {/* Mobile Toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 md:hidden bg-white rounded-lg p-2 shadow-md"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen w-64 bg-gray-900 text-white transition-all duration-300 z-40 ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Logo */}
        <div className="flex items-center justify-center h-20 border-b border-gray-800">
          <h1 className="text-2xl font-bold text-green-400">Admin</h1>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-8 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive(item.href)
                    ? 'bg-green-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Logout Button */}
        <div className="border-t border-gray-800 p-4">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-gray-300 hover:bg-red-900/20 hover:text-red-400 transition-all duration-200"
          >
            <LogOut size={20} />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  )
}
