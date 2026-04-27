'use client'

import Link from 'next/link'
import { Phone, Mail, MapPin } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      {/* Main Footer */}
      <div className="px-[5%] py-16">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <img src="/logo.png" alt="Hamroun Meuble & Electro" className="w-16 h-16 mb-4" />
            <p className="text-sm text-gray-400 mb-4">Votre destination pour les meilleurs équipements électroménagers de qualité.</p>
          </div>

          {/* Products */}
          <div>
            <h4 className="font-bold text-white mb-4 text-base">Produits</h4>
            <ul className="text-sm text-gray-400 space-y-3">
              <li><Link href="/products?category=refrigerateurs" className="hover:text-green-500 transition">Réfrigérateurs</Link></li>
              <li><Link href="/products?category=lave-linge" className="hover:text-green-500 transition">Lave-linge</Link></li>
              <li><Link href="/products?category=cuisinieres" className="hover:text-green-500 transition">Cuisinières</Link></li>
              <li><Link href="/products?category=climatisation" className="hover:text-green-500 transition">Climatisation</Link></li>
              <li><Link href="/products" className="hover:text-green-500 transition">Tous les produits</Link></li>
            </ul>
          </div>

          {/* Support */}
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

          {/* Company */}
          <div>
            <h4 className="font-bold text-white mb-4 text-base">Entreprise</h4>
            <ul className="text-sm text-gray-400 space-y-3">
              <li><Link href="/about" className="hover:text-green-500 transition">À propos</Link></li>
              <li><Link href="/blog" className="hover:text-green-500 transition">Blog</Link></li>
              <li><Link href="/careers" className="hover:text-green-500 transition">Carrières</Link></li>
              <li><Link href="/press" className="hover:text-green-500 transition">Presse</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-bold text-white mb-4 text-base">Nous Contacter</h4>
            <ul className="text-sm text-gray-400 space-y-4">
              <li className="flex gap-3 items-start">
                <Phone size={16} className="mt-0.5 flex-shrink-0 text-green-500" />
                <span>+216 XX XXX XXX</span>
              </li>
              <li className="flex gap-3 items-start">
                <Mail size={16} className="mt-0.5 flex-shrink-0 text-green-500" />
                <span>contact@hamroun.tn</span>
              </li>
              <li className="flex gap-3 items-start">
                <MapPin size={16} className="mt-0.5 flex-shrink-0 text-green-500" />
                <span>Tunis, Tunisie</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-800 pt-8 mt-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            <div className="text-sm text-gray-400">
              © 2024 Hamroun Meuble & Electro. Tous droits réservés.
            </div>
            <div className="flex gap-6 md:justify-center text-sm text-gray-400">
              <Link href="/privacy" className="hover:text-green-500 transition">Confidentialité</Link>
              <Link href="/terms" className="hover:text-green-500 transition">Conditions</Link>
              <Link href="/cookies" className="hover:text-green-500 transition">Cookies</Link>
            </div>
            <div className="flex gap-4 md:justify-end">
              <a href="#" className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center hover:bg-green-500 transition">f</a>
              <a href="#" className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center hover:bg-green-500 transition">𝕏</a>
              <a href="#" className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center hover:bg-green-500 transition">in</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
