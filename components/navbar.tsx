'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowUpRight, Menu, X } from 'lucide-react'

const logoUrl = 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/re-elJiNAmVqNLyOBZiaOHVtQeFLf2AJm.jpg'

const navigation = [
  { label: 'Accueil', href: '/#accueil' },
  { label: 'Expertises', href: '/#expertises' },
  { label: 'Nos univers', href: '/#biens' },
  { label: 'L’agence', href: '/#agence' },
]

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-brand-ink/10 bg-brand-paper/95 shadow-sm backdrop-blur-xl">
      <div className="mx-auto flex h-[68px] max-w-[1440px] items-center justify-between px-4 md:px-[5%]">
        <Link href="/#accueil" aria-label="Romdhani Immobilier, accueil" onClick={() => setMobileOpen(false)} className="group flex shrink-0 items-center gap-2.5 no-underline">
          <img src={logoUrl} alt="Logo Romdhani Immobilier" className="size-10 rounded-full object-cover md:size-12" />
          <span className="flex flex-col leading-tight">
            <span className="text-sm font-bold tracking-tight text-brand-ink transition-colors group-hover:text-brand-gold-deep md:text-base">Romdhani</span>
            <span className="text-xs font-semibold uppercase tracking-wide text-brand-gold-deep">Immobilier</span>
          </span>
        </Link>

        <nav aria-label="Navigation principale" className="hidden items-center gap-1 md:flex">
          {navigation.map((item) => (
            <Link key={item.href} href={item.href} className="rounded-lg px-3 py-2 text-sm font-medium text-brand-ink/70 transition-colors hover:bg-brand-gold/10 hover:text-brand-gold-deep lg:px-4">
              {item.label}
            </Link>
          ))}
          <Link href="/#projet" className="ml-2 inline-flex items-center gap-2 rounded-lg bg-brand-ink px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-gold hover:text-brand-ink">
            Votre projet <ArrowUpRight aria-hidden="true" className="size-4" />
          </Link>
        </nav>

        <button
          type="button"
          aria-label={mobileOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
          aria-expanded={mobileOpen}
          aria-controls="mobile-navigation"
          onClick={() => setMobileOpen((open) => !open)}
          className="grid size-11 place-items-center rounded-lg text-brand-ink transition-colors hover:bg-brand-gold/10 md:hidden"
        >
          {mobileOpen ? <X aria-hidden="true" className="size-5" /> : <Menu aria-hidden="true" className="size-5" />}
        </button>
      </div>

      {mobileOpen && (
        <nav id="mobile-navigation" aria-label="Navigation mobile" className="border-t border-brand-ink/10 bg-brand-paper px-4 py-3 md:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-1">
            {navigation.map((item) => (
              <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)} className="rounded-lg px-3 py-3 text-sm font-medium text-brand-ink transition-colors hover:bg-brand-gold/10">
                {item.label}
              </Link>
            ))}
            <Link href="/#projet" onClick={() => setMobileOpen(false)} className="mt-2 inline-flex items-center justify-center gap-2 rounded-lg bg-brand-ink px-4 py-3 text-sm font-semibold text-white">
              Votre projet <ArrowUpRight aria-hidden="true" className="size-4" />
            </Link>
          </div>
        </nav>
      )}
    </header>
  )
}
