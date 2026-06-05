'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ShoppingCart, Menu, X, User, LogOut } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { useCart } from '@/lib/hooks'
import { getCategoriesWithProductsFromSupabase } from '@/lib/products'
import type { Category } from '@/lib/products'

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [isHovering, setIsHovering] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [loadingCategories, setLoadingCategories] = useState(true)
  const { user, loading, signOut } = useAuth()
  const { cartItems } = useCart()

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await getCategoriesWithProductsFromSupabase()
        setCategories(data)
      } catch (error) {
        console.error('Error loading categories:', error)
      } finally {
        setLoadingCategories(false)
      }
    }
    loadCategories()
  }, [])

  const handleScroll = () => setScrolled(window.scrollY > 10)

  const handleSignOut = async () => {
    await signOut()
    setMobileOpen(false)
  }

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 h-17 flex items-center justify-between px-4 md:px-[5%] transition-all duration-300 ${scrolled
        ? 'bg-white/100 shadow-lg'
        : 'bg-white/97 shadow-sm'
      }`} style={{ backdropFilter: 'blur(16px)' }}>
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 md:gap-2.5 no-underline cursor-pointer group flex-shrink-0">
        <img src="/logo.png" alt="Hamroun Meuble & Electro" className="w-10 h-10 md:w-12 md:h-12 flex-shrink-0" />
        <div className="flex flex-col leading-tight hidden sm:flex">
          <span className="text-gray-900 font-bold text-sm md:text-base tracking-tight group-hover:text-green-700 transition-colors duration-300">Hamroun</span>
          <span className="text-green-700 font-semibold text-xs tracking-wide uppercase">Meuble & Electro</span>
        </div>
      </Link>

      {/* Desktop Links */}
      <div className="hidden md:flex items-center gap-1 list-none relative">
        <Link href="/" className="no-underline text-gray-600 text-sm font-medium px-4 py-1.5 rounded-lg transition-all duration-300 hover:text-green-700 hover:bg-green-50">Accueil</Link>
        
        {/* Produits with Dropdown */}
        <div
          className="relative group"
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          <Link href="/products" className="no-underline text-gray-600 text-sm font-medium px-4 py-1.5 rounded-lg transition-all duration-300 hover:text-green-700 hover:bg-green-50 block">Produits</Link>
          
          {/* Dropdown Menu */}
          {isHovering && !loadingCategories && categories.length > 0 && (
            <div className="absolute top-full left-0 mt-0 bg-white border border-gray-200 rounded-lg shadow-lg py-2 min-w-[200px] z-40 max-h-96 overflow-y-auto">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/products?category=${encodeURIComponent(category.slug)}`}
                  className="no-underline text-gray-600 text-sm px-4 py-2 block hover:text-green-700 hover:bg-green-50 transition-all duration-200"
                >
                  {category.emoji && <span className="mr-2">{category.emoji}</span>}
                  {category.name}
                </Link>
              ))}
            </div>
          )}
        </div>

        <Link href="/about" className="no-underline text-gray-600 text-sm font-medium px-4 py-1.5 rounded-lg transition-all duration-300 hover:text-green-700 hover:bg-green-50">À propos</Link>
        <Link href="/contact" className="no-underline text-gray-600 text-sm font-medium px-4 py-1.5 rounded-lg transition-all duration-300 hover:text-green-700 hover:bg-green-50">Contact</Link>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2.5">
        {user && (
          <Link href="/cart" className="relative bg-none border-none cursor-pointer p-2 rounded-[10px] text-gray-600 transition-all duration-300 hover:bg-green-50 hover:text-green-700 flex items-center" style={{ fontSize: '20px' }}>
            <ShoppingCart size={20} />
            {cartItems.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-green-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs font-bold">
                {cartItems.length}
              </span>
            )}
          </Link>
        )}

        {loading ? (
          <div className="hidden md:flex items-center gap-2">
            <div className="w-6 h-6 bg-gray-200 rounded animate-pulse"></div>
          </div>
        ) : !user ? (
          <>
            <Link href="/auth/login" className="btn-outline hidden md:inline-block">Connexion</Link>
            <Link href="/auth/signup" className="btn-primary hidden md:inline-block">S'inscrire</Link>
          </>
        ) : (
          <>
            <Link href="/account" className="hidden md:flex items-center gap-2 bg-none border-none cursor-pointer p-2 rounded-[10px] text-gray-600 transition-all duration-300 hover:bg-green-50 hover:text-green-700">
              <User size={20} />
            </Link>
            <button
              onClick={handleSignOut}
              className="hidden md:flex items-center gap-2 bg-none border-none cursor-pointer p-2 rounded-[10px] text-gray-600 transition-all duration-300 hover:bg-red-50 hover:text-red-700"
            >
              <LogOut size={20} />
            </button>
          </>
        )}

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden bg-none border-none cursor-pointer p-2 text-gray-600"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="absolute top-17 left-0 right-0 bg-white border-t border-gray-200 p-4 md:hidden">
          <div className="flex flex-col gap-2">
            <Link href="/" className="no-underline text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-100">Accueil</Link>
            <Link href="/products" className="no-underline text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-100">Produits</Link>
            <Link href="/about" className="no-underline text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-100">À propos</Link>
            <Link href="/contact" className="no-underline text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-100">Contact</Link>
            {loading ? (
              <div className="px-4 py-2 text-gray-500 text-sm">Chargement...</div>
            ) : !user ? (
              <>
                <Link href="/auth/login" className="btn-outline w-full mt-2">Connexion</Link>
                <Link href="/auth/signup" className="btn-primary w-full mt-2">S'inscrire</Link>
              </>
            ) : (
              <>
                <Link href="/app/account/page.tsx" className="no-underline text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-100 flex items-center gap-2">
                  <User size={16} /> Mon compte
                </Link>
                <button
                  onClick={handleSignOut}
                  className="no-underline text-red-600 px-4 py-2 rounded-lg hover:bg-red-50 w-full text-left flex items-center gap-2"
                >
                  <LogOut size={16} /> Se déconnecter
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
