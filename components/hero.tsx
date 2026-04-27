'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export function Hero() {
  return (
    <section className="relative bg-gradient-to-br from-gray-800 via-gray-900 to-blue-gray-900 pt-32 pb-20 px-[5%] min-h-screen flex items-center overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute -top-30 -right-20 w-96 h-96 rounded-full opacity-10 pointer-events-none" style={{
        background: 'radial-gradient(circle, rgba(34,197,94,0.12) 0%, transparent 70%)'
      }} />
      <div className="absolute -bottom-15 left-1/3 w-64 h-64 rounded-full opacity-5 pointer-events-none" style={{
        background: 'radial-gradient(circle, rgba(34,197,94,0.07) 0%, transparent 70%)'
      }} />

      <div className="max-w-2xl relative z-10">
        {/* Badge */}
        <div className="inline-flex items-center gap-1.5 bg-green-500/15 border border-green-500/30 text-green-500 px-3.5 py-1 rounded-full text-xs font-bold tracking-wider uppercase mb-6 animate-fade-in-up" style={{ animationDelay: '0s' }}>
          ✨ Nouvelle Collection
        </div>

        {/* Heading */}
        <h1 className="text-5xl md:text-6xl font-bold text-white mb-5 leading-tight animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          Équipez votre maison avec les meilleurs <span className="text-green-500">appareils électroménagers</span>
        </h1>

        {/* Description */}
        <p className="text-lg text-white/65 leading-relaxed mb-9 max-w-md animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          Découvrez notre large sélection d'équipements de qualité supérieure pour votre cuisine, votre buanderie et plus encore.
        </p>

        {/* Buttons */}
        <div className="flex gap-3.5 flex-wrap animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <button className="btn-primary flex items-center gap-2">
            Explorez les produits
            <ArrowRight size={18} />
          </button>
          <button className="btn-secondary">
            En savoir plus
          </button>
        </div>
      </div>
    </section>
  )
}
