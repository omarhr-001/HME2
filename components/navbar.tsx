'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X, ArrowUpRight } from 'lucide-react'

const logoUrl = 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/re-elJiNAmVqNLyOBZiaOHVtQeFLf2AJm.jpg'

const navigation = [
  { label: 'L’agence', href: '/#agence' },
  { label: 'Expertises', href: '/#expertises' },
  { label: 'Nos univers', href: '/#biens' },
]

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-brand-ink/10 bg-brand-ivory/95 backdrop-blur-xl">
      <div className="mx-auto flex h-[76px] max-w-[1440px] items-center justify-between px-4 sm:px-8 lg:px-12">
        <Link href="/" aria-label="Romdhani Immobilier, accueil" className="group flex items-center gap-3">
          <img
            src={logoUrl}
            alt="Logo Romdhani Immobilier : initiale R et maison dorée"
            className="size-12 rounded-full object-cover sm:size-14"
          />
          <span className="flex flex-col leading-none">
            <span className="font-display text-lg font-semibold tracking-[0.04em] text-brand-ink transition-colors group-hover:text-brand-gold-deep sm:text-xl">
              ROMDHANI
            </span>
            <span className="mt-1 text-[9px] font-semibold tracking-[0.27em] text-brand-gold-deep sm:text-[10px]">
              IMMOBILIER
            </span>
          </span>
        </Link>

        <nav aria-label="Navigation principale" className="hidden items-center gap-8 md:flex">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-brand-ink/75 transition-colors hover:text-brand-gold-deep"
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/#projet"
            className="inline-flex items-center gap-2 border border-brand-ink/20 px-4 py-2.5 text-sm font-semibold text-brand-ink transition-all hover:border-brand-gold hover:bg-brand-gold"
          >
            Votre projet <ArrowUpRight aria-hidden="true" className="size-4" />
          </Link>
        </nav>

        <button
          type="button"
          aria-label={mobileOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
          aria-expanded={mobileOpen}
          aria-controls="mobile-navigation"
          onClick={() => setMobileOpen((open) => !open)}
          className="grid size-11 place-items-center text-brand-ink transition-colors hover:text-brand-gold-deep md:hidden"
        >
          {mobileOpen ? <X aria-hidden="true" className="size-5" /> : <Menu aria-hidden="true" className="size-5" />}
        </button>
      </div>

      {mobileOpen && (
        <nav id="mobile-navigation" aria-label="Navigation mobile" className="border-t border-brand-ink/10 bg-brand-ivory px-5 py-4 md:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-1">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="px-3 py-3 text-sm font-medium text-brand-ink transition-colors hover:bg-brand-gold/10"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/#projet"
              onClick={() => setMobileOpen(false)}
              className="mt-2 inline-flex items-center justify-center gap-2 bg-brand-ink px-4 py-3 text-sm font-semibold text-white"
            >
              Votre projet <ArrowUpRight aria-hidden="true" className="size-4" />
            </Link>
          </div>
        </nav>
      )}
    </header>
  )
}
