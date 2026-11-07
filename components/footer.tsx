import Link from 'next/link'
import { ArrowRight, ArrowUpRight } from 'lucide-react'

const logoUrl = 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/re-elJiNAmVqNLyOBZiaOHVtQeFLf2AJm.jpg'

const universeLinks = [
  { label: 'Villas & maisons', href: '/#biens' },
  { label: 'Appartements', href: '/#biens' },
  { label: 'Maisons de bord de mer', href: '/#biens' },
]

const expertiseLinks = [
  { label: 'Acheter avec confiance', href: '/#expertises' },
  { label: 'Vendre au juste prix', href: '/#expertises' },
  { label: 'Investir avec vision', href: '/#expertises' },
]

export function Footer() {
  return (
    <footer className="bg-brand-ink text-white">
      <div className="px-4 py-12 md:px-[5%] md:py-16">
        <div className="mb-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-10">
          <div>
            <Link href="/#accueil" aria-label="Romdhani Immobilier, accueil" className="inline-flex items-center gap-2.5">
              <img src={logoUrl} alt="Logo Romdhani Immobilier" className="size-12 rounded-full object-cover" />
              <span className="flex flex-col leading-tight">
                <span className="text-sm font-bold tracking-wide">Romdhani</span>
                <span className="text-xs font-semibold uppercase tracking-wider text-brand-gold">Immobilier</span>
              </span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-6 text-white/60">
              Achat, vente et conseil immobilier, avec une attention sincère à chaque projet.
            </p>
          </div>

          <nav aria-label="Nos univers">
            <h2 className="mb-4 text-sm font-bold text-white">Nos univers</h2>
            <ul className="space-y-3 text-sm text-white/60">
              {universeLinks.map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="transition-colors hover:text-brand-gold">{item.label}</Link>
                </li>
              ))}
              <li className="pt-1">
                <Link href="/#biens" className="inline-flex items-center gap-2 font-semibold text-white transition-colors hover:text-brand-gold">
                  Tous les univers <ArrowRight aria-hidden="true" size={14} />
                </Link>
              </li>
            </ul>
          </nav>

          <nav aria-label="Nos expertises">
            <h2 className="mb-4 text-sm font-bold text-white">Nos expertises</h2>
            <ul className="space-y-3 text-sm text-white/60">
              {expertiseLinks.map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="transition-colors hover:text-brand-gold">{item.label}</Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="mb-4 text-sm font-bold text-white">Votre projet</h2>
            <p className="mb-4 text-sm leading-6 text-white/60">
              Parlons de vos envies et avançons ensemble vers la bonne adresse.
            </p>
            <Link href="/#projet" className="inline-flex items-center gap-2 text-sm font-semibold text-brand-gold transition-colors hover:text-brand-paper">
              Échanger avec l’agence <ArrowUpRight aria-hidden="true" size={15} />
            </Link>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-white/10 pt-6 text-xs text-white/40 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Romdhani Immobilier. Tous droits réservés.</p>
          <p>Agence immobilière · Un lieu, une histoire.</p>
        </div>
      </div>
    </footer>
  )
}
