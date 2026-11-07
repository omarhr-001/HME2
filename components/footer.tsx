import Link from 'next/link'

const logoUrl = 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/re-elJiNAmVqNLyOBZiaOHVtQeFLf2AJm.jpg'

const footerLinks = [
  { label: 'L’agence', href: '/#agence' },
  { label: 'Expertises', href: '/#expertises' },
  { label: 'Nos univers', href: '/#biens' },
]

export function Footer() {
  return (
    <footer className="bg-brand-ink px-5 py-12 text-white sm:px-8 md:py-16 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-10 border-b border-white/15 pb-10 md:flex-row md:items-end">
          <div className="max-w-md">
            <Link href="/" aria-label="Romdhani Immobilier, accueil" className="inline-flex items-center gap-3">
              <img
                src={logoUrl}
                alt="Logo Romdhani Immobilier"
                className="size-14 rounded-full object-cover"
              />
              <span className="flex flex-col leading-none">
                <span className="font-display text-xl font-semibold tracking-[0.04em]">ROMDHANI</span>
                <span className="mt-1 text-[10px] font-semibold tracking-[0.27em] text-brand-gold">IMMOBILIER</span>
              </span>
            </Link>
            <p className="mt-5 max-w-sm text-sm leading-7 text-white/60">
              Achat, vente et conseil immobilier, avec une attention sincère à chaque projet.
            </p>
          </div>

          <nav aria-label="Liens de pied de page" className="flex flex-wrap gap-x-7 gap-y-3 text-sm text-white/70">
            {footerLinks.map((item) => (
              <Link key={item.href} href={item.href} className="transition-colors hover:text-brand-gold">
                {item.label}
              </Link>
            ))}
            <Link href="/#projet" className="transition-colors hover:text-brand-gold">
              Votre projet
            </Link>
          </nav>
        </div>

        <div className="flex flex-col gap-3 pt-6 text-xs text-white/45 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Romdhani Immobilier. Tous droits réservés.</p>
          <p>Agence immobilière · Un lieu, une histoire.</p>
        </div>
      </div>
    </footer>
  )
}
