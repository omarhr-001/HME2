import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, ArrowUpRight, Compass, House, KeyRound } from 'lucide-react'

const expertiseItems = [
  {
    icon: KeyRound,
    title: 'Acheter avec confiance',
    description: 'Un accompagnement clair pour trouver un bien qui correspond à votre projet.',
  },
  {
    icon: House,
    title: 'Vendre au juste prix',
    description: 'Une mise en valeur soignée et un suivi attentif à chaque étape.',
  },
  {
    icon: Compass,
    title: 'Investir avec vision',
    description: 'Des repères utiles pour avancer sereinement dans vos choix immobiliers.',
  },
]

export function PromoBanner() {
  return (
    <section id="expertises" className="scroll-mt-24 px-4 py-10 md:px-[5%] md:py-14">
      <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-brand-gold-deep">Nos expertises</p>
          <h2 className="font-display text-3xl font-semibold text-brand-ink md:text-4xl">Le bon projet commence par le bon conseil.</h2>
        </div>
        <Link href="/#projet" className="inline-flex items-center gap-2 text-sm font-semibold text-brand-ink transition hover:gap-3 hover:text-brand-gold-deep">
          Parlons de votre projet <ArrowRight aria-hidden="true" size={16} />
        </Link>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.4fr_0.9fr]">
        <article id="agence" className="relative min-h-[340px] overflow-hidden rounded-2xl border border-brand-ink/10 bg-brand-ink text-white shadow-sm">
          <Image
            src="/real-estate/property-coastal.png"
            alt=""
            fill
            sizes="(min-width: 1024px) 58vw, 100vw"
            className="object-cover opacity-45"
          />
          <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-brand-ink via-brand-ink/85 to-brand-ink/35" />
          <div className="relative z-10 flex min-h-[340px] max-w-2xl flex-col justify-between gap-8 p-6 sm:p-8 md:p-10">
            <div>
              <p className="mb-4 text-xs font-bold uppercase tracking-[0.18em] text-brand-gold">L’esprit Romdhani</p>
              <h3 className="font-display text-3xl font-semibold leading-tight sm:text-4xl md:text-5xl">Plus qu’une adresse, un nouveau chapitre.</h3>
              <p className="mt-4 max-w-lg text-sm leading-7 text-white/75 sm:text-base">
                Nous prenons le temps de comprendre vos priorités, de répondre à vos questions et de vous guider avec justesse. L’humain avant tout.
              </p>
            </div>
            <Link href="/#projet" className="inline-flex w-fit items-center gap-2 rounded-lg bg-brand-gold px-5 py-3 text-sm font-bold text-brand-ink transition hover:bg-brand-paper">
              Découvrir notre approche <ArrowUpRight aria-hidden="true" className="size-4" />
            </Link>
          </div>
        </article>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
          {expertiseItems.map(({ icon: Icon, title, description }) => (
            <article key={title} className="flex min-h-28 items-start gap-4 rounded-2xl border border-brand-gold/20 bg-brand-paper p-5 transition hover:border-brand-gold/60 hover:shadow-md">
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand-gold/15 text-brand-gold-deep">
                <Icon aria-hidden="true" className="size-5" />
              </span>
              <div>
                <h3 className="font-display text-xl font-semibold text-brand-ink">{title}</h3>
                <p className="mt-1 text-sm leading-6 text-brand-muted">{description}</p>
              </div>
            </article>
          ))}
        </div>
      </div>

      <div id="projet" className="scroll-mt-28 mt-8 flex flex-col justify-between gap-6 rounded-2xl bg-brand-gold px-6 py-8 sm:px-9 md:flex-row md:items-center md:py-10">
        <div className="max-w-2xl">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-brand-ink/65">Romdhani Immobilier</p>
          <h2 className="font-display text-3xl font-semibold leading-tight text-brand-ink sm:text-4xl">Votre prochain chapitre commence ici.</h2>
          <p className="mt-3 text-sm leading-6 text-brand-ink/75">Parcourez nos univers et découvrez une façon plus attentive d’aborder l’immobilier.</p>
        </div>
        <Link href="/#biens" className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-lg bg-brand-ink px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-paper hover:text-brand-ink">
          Explorer les univers <ArrowUpRight aria-hidden="true" className="size-4" />
        </Link>
      </div>
    </section>
  )
}
