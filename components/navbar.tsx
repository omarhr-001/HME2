'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ShoppingCart, Menu, X, User, LogOut } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [cartCount, setCartCount] = useState(0)
  const { user, loading, signOut } = useAuth()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll)
    
    // Load cart count from localStorage
    const cart = JSON.parse(localStorage.getItem('cart') || '[]')
    setCartCount(cart.length)
    
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleSignOut = async () => {
    await signOut()
    setMobileOpen(false)
  }

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 h-17 flex items-center justify-between px-[5%] transition-all duration-300 ${
      scrolled 
        ? 'bg-white/100 shadow-lg' 
        : 'bg-white/97 shadow-sm'
    }`} style={{ backdropFilter: 'blur(16px)' }}>
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 no-underline cursor-pointer">
        <img src="/logo.png" alt="Hamroun Meuble & Electro" className="w-12 h-12" />
      </Link>

      {/* Desktop Links */}
      <div className="hidden md:flex items-center gap-1 list-none">
        <Link href="/" className="no-underline text-gray-600 text-sm font-medium px-4 py-1.5 rounded-lg transition-all duration-300 hover:text-green-700 hover:bg-green-50">Accueil</Link>
        <Link href="/products" className="no-underline text-gray-600 text-sm font-medium px-4 py-1.5 rounded-lg transition-all duration-300 hover:text-green-700 hover:bg-green-50">Produits</Link>
        <Link href="/about" className="no-underline text-gray-600 text-sm font-medium px-4 py-1.5 rounded-lg transition-all duration-300 hover:text-green-700 hover:bg-green-50">À propos</Link>
        <Link href="/contact" className="no-underline text-gray-600 text-sm font-medium px-4 py-1.5 rounded-lg transition-all duration-300 hover:text-green-700 hover:bg-green-50">Contact</Link>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2.5">
        <Link href="/cart" className="relative bg-none border-none cursor-pointer p-2 rounded-[10px] text-gray-600 transition-all duration-300 hover:bg-green-50 hover:text-green-700 flex items-center" style={{ fontSize: '20px' }}>
          <ShoppingCart size={20} />
          {cartCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 bg-green-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs font-bold">
              {cartCount}
            </span>
          )}
        </Link>
        
        {!loading && !user ? (
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
            {!loading && !user ? (
              <>
                <Link href="/auth/login" className="btn-outline w-full mt-2">Connexion</Link>
                <Link href="/auth/signup" className="btn-primary w-full mt-2">S'inscrire</Link>
              </>
            ) : (
              <>
                <Link href="/account" className="no-underline text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-100 flex items-center gap-2">
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
