'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Phone, Mail, MapPin, ArrowRight } from 'lucide-react'
import { getCategoriesWithProductsFromSupabase, type Category } from '@/lib/products'

export function Footer() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const cats = await getCategoriesWithProductsFromSupabase()
        setCategories(cats.slice(0, 4))
      } catch (error) {
        console.error('Error fetching categories:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

  return (
    <footer className="bg-gray-900 text-white">
      <div className="px-4 md:px-[5%] py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-8 mb-12">
          <div className="md:col-span-1">
            <img src="/logo.png" alt="Hamroun Meuble & Electro" className="w-16 h-16 mb-4" />
            <p className="text-sm text-gray-400 mb-4">
              Votre destination pour les meilleurs meubles et electromenagers de qualite.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-white mb-4 text-base">Categories</h4>
            <ul className="text-sm text-gray-400 space-y-3">
              {!loading && categories.length > 0 ? (
                <>
                  {categories.map((category) => (
                    <li key={category.id}>
                      <Link
                        href={`/products?category=${encodeURIComponent(category.slug || category.name)}`}
                        className="hover:text-green-500 transition flex items-center gap-2 group"
                      >
                        <span className="inline-flex h-6 w-6 items-center justify-center overflow-hidden rounded-full border border-gray-700 bg-white">
                          {category.image_url ? (
                            <img src={category.image_url} alt={category.name} className="h-full w-full object-cover" />
                          ) : category.emoji ? (
                            <span className="text-sm">{category.emoji}</span>
                          ) : (
                            <span className="text-sm">*</span>
                          )}
                        </span>
                        <span className="group-hover:translate-x-1 transition-transform">{category.name}</span>
                      </Link>
                    </li>
                  ))}
                  <li className="pt-2 border-t border-gray-800">
                    <Link href="/products" className="hover:text-green-500 transition font-semibold flex items-center gap-2 group">
                      <span>Tous les produits</span>
                      <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </li>
                </>
              ) : (
                <li><span className="text-gray-500">Chargement des categories...</span></li>
              )}
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-4 text-base">Support</h4>
            <ul className="text-sm text-gray-400 space-y-3">
              <li><Link href="/contact" className="hover:text-green-500 transition">Contact</Link></li>
              <li><Link href="/faq" className="hover:text-green-500 transition">FAQ</Link></li>
              <li><Link href="/shipping" className="hover:text-green-500 transition">Livraison</Link></li>
              <li><Link href="/returns" className="hover:text-green-500 transition">Retours</Link></li>
              <li><Link href="/warranty" className="hover:text-green-500 transition">Garantie</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-4 text-base">Nous Contacter</h4>
            <ul className="text-sm text-gray-400 space-y-4">
              <li className="flex gap-3 items-start">
                <Phone size={16} className="mt-0.5 flex-shrink-0 text-green-500" />
                <span>+216 97 100 700</span>
              </li>
              <li className="flex gap-3 items-start">
                <Mail size={16} className="mt-0.5 flex-shrink-0 text-green-500" />
                <span>contact@hamroun.tn</span>
              </li>
              <li className="flex gap-3 items-start">
                <MapPin size={16} className="mt-0.5 flex-shrink-0 text-green-500" />
                <span>Rue du Koweit Hammamet - Tunisia, Hammamet, Tunisia, 8050</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 mt-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            <div className="text-sm text-gray-400">
              (c) 2024 Hamroun Meuble & Electro. Tous droits reserves.
            </div>
            <div className="flex gap-6 md:justify-center text-sm text-gray-400">
              <Link href="/privacy" className="hover:text-green-500 transition">Confidentialite</Link>
              <Link href="/terms" className="hover:text-green-500 transition">Conditions</Link>
              <Link href="/cookies" className="hover:text-green-500 transition">Cookies</Link>
            </div>
            <div className="flex gap-4 md:justify-end">
              <a href="https://www.facebook.com/hamrounmeubleetelectro" className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center hover:bg-green-500 transition">f</a>
              <a href="https://www.instagram.com/hamrounmeuble" className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center hover:bg-green-500 transition">IG</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
