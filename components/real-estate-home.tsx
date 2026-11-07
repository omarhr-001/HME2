'use client'

import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowDownRight,
  ArrowUpRight,
  Compass,
  Handshake,
  House,
  KeyRound,
  MapPin,
} from 'lucide-react'

const expertiseItems = [
  {
    number: '01',
    title: 'Acheter avec confiance',
    description:
      'Un accompagnement clair pour trouver un bien qui correspond vraiment à votre projet et à votre façon de vivre.',
    icon: KeyRound,
  },
  {
    number: '02',
    title: 'Vendre au juste prix',
    description:
      'Une mise en valeur soignée, des conseils transparents et un suivi attentif à chaque étape de la vente.',
    icon: House,
  },
  {
    number: '03',
    title: 'Investir avec vision',
    description:
      'Des repères utiles pour avancer sereinement et faire des choix immobiliers qui ont du sens.',
    icon: Compass,
  },
]

const propertyStyles = [
  {
    title: 'Villas & maisons',
    description: 'Des espaces pour se retrouver et grandir.',
    image: '/real-estate/property-villa.png',
    alt: 'Villa méditerranéenne entourée de verdure',
    size: 'md:col-span-7',
  },
  {
    title: 'Appartements',
    description: 'La lumière et le confort au quotidien.',
    image: '/real-estate/property-apartment.png',
    alt: 'Salon lumineux ouvert sur un balcon',
    size: 'md:col-span-5',
  },
  {
    title: 'Maisons de bord de mer',
    description: 'Un autre rythme, à quelques pas de l’horizon.',
    image: '/real-estate/property-coastal.png',
    alt: 'Maison côtière blanche avec une cour fleurie',
    size: 'md:col-span-12',
  },
]

function ExpertiseCard({
  number,
  title,
  description,
  icon: Icon,
}: (typeof expertiseItems)[number]) {
  return (
    <article className="group flex h-full flex-col border-t border-brand-gold/50 py-6 transition-colors duration-300 hover:border-brand-gold md:py-8">
      <div className="mb-10 flex items-center justify-between">
        <span className="font-sans text-xs tracking-[0.2em] text-brand-gold-deep">{number}</span>
        <Icon aria-hidden="true" className="size-5 text-brand-gold-deep transition-transform duration-300 group-hover:-translate-y-1" />
      </div>
      <h3 className="font-display text-2xl font-medium leading-tight text-brand-ink md:text-3xl">{title}</h3>
      <p className="mt-4 max-w-sm text-sm leading-7 text-brand-muted">{description}</p>
      <Link
        href="/#projet"
        className="mt-7 inline-flex items-center gap-2 self-start text-sm font-semibold text-brand-ink transition-colors hover:text-brand-gold-deep"
      >
        En savoir plus <ArrowUpRight aria-hidden="true" className="size-4" />
      </Link>
    </article>
  )
}

function PropertyStyleCard({
  title,
  description,
  image,
  alt,
  size,
}: (typeof propertyStyles)[number]) {
  return (
    <article className={`group relative min-h-[300px] overflow-hidden bg-brand-ink md:min-h-[360px] ${size}`}>
      <Image
        src={image}
        alt={alt}
        fill
        sizes="(max-width: 768px) 100vw, 60vw"
        className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5 text-white md:p-8">
        <div>
          <h3 className="font-display text-2xl font-medium md:text-3xl">{title}</h3>
          <p className="mt-2 text-sm text-white/75">{description}</p>
        </div>
        <span aria-hidden="true" className="grid size-11 shrink-0 place-items-center rounded-full border border-white/50 transition-colors group-hover:border-brand-gold group-hover:bg-brand-gold group-hover:text-brand-ink">
          <ArrowUpRight className="size-5" />
        </span>
      </div>
    </article>
  )
}

export function RealEstateHome() {
  return (
    <main className="overflow-hidden bg-brand-ivory text-brand-ink">
      <section className="relative isolate px-5 pb-16 pt-12 sm:px-8 md:pb-24 md:pt-20 lg:px-12">
        <div aria-hidden="true" className="absolute -right-40 top-10 -z-10 size-[32rem] rounded-full border border-brand-gold/20" />
        <div aria-hidden="true" className="absolute -right-20 top-28 -z-10 size-[23rem] rounded-full border border-brand-gold/20" />
        <div className="mx-auto grid max-w-7xl items-center gap-12 md:grid-cols-[1fr_0.95fr] md:gap-8 lg:gap-16">
          <div className="relative z-10 max-w-xl">
            <p className="mb-6 inline-flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-brand-gold-deep">
              <span className="h-px w-8 bg-brand-gold" /> Agence immobilière
            </p>
            <h1 className="font-display text-[3.6rem] font-medium leading-[0.96] tracking-[-0.035em] text-brand-ink sm:text-6xl md:text-[4rem] lg:text-[5.5rem]">
              L’immobilier,
              <br />
              <span className="italic text-brand-gold-deep">en confiance.</span>
            </h1>
            <p className="mt-7 max-w-lg text-base leading-8 text-brand-muted md:text-lg">
              Acheter, vendre ou investir mérite un accompagnement attentif. Romdhani Immobilier vous aide à avancer avec clarté, écoute et exigence.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/#biens"
                className="inline-flex min-h-13 items-center justify-center gap-3 bg-brand-ink px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-gold-deep"
              >
                Découvrir nos univers <ArrowUpRight aria-hidden="true" className="size-4" />
              </Link>
              <Link
                href="/#agence"
                className="inline-flex min-h-13 items-center justify-center gap-3 border border-brand-ink/20 px-6 py-3 text-sm font-semibold text-brand-ink transition-colors hover:border-brand-gold hover:bg-white/60"
              >
                Notre approche <ArrowDownRight aria-hidden="true" className="size-4" />
              </Link>
            </div>
            <div className="mt-10 flex flex-wrap items-center gap-x-5 gap-y-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-brand-muted">
              <span>Achat</span><span className="size-1 rounded-full bg-brand-gold" />
              <span>Vente</span><span className="size-1 rounded-full bg-brand-gold" />
              <span>Conseil immobilier</span>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-2xl md:ml-auto">
            <div className="relative aspect-[1.05/1] overflow-hidden rounded-t-[12rem] bg-brand-ink sm:aspect-[1.12/1]">
              <Image
                src="/real-estate/hero-villa.png"
                alt="Villa contemporaine méditerranéenne entourée d’un jardin et d’une piscine"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 56vw"
                className="object-cover"
              />
              <div className="absolute inset-4 rounded-t-[11rem] border border-white/40" aria-hidden="true" />
            </div>
            <div className="absolute -bottom-5 left-4 max-w-[18rem] border border-brand-gold/30 bg-brand-paper px-5 py-4 shadow-xl shadow-brand-ink/10 sm:bottom-8 sm:-left-9 sm:px-6 sm:py-5">
              <div className="flex items-center gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-brand-gold/15 text-brand-gold-deep">
                  <MapPin aria-hidden="true" className="size-4" />
                </span>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-brand-gold-deep">Romdhani Immobilier</p>
                  <p className="mt-1 font-display text-lg leading-tight text-brand-ink">Un lieu, une histoire.</p>
                </div>
              </div>
            </div>
            <div className="absolute right-3 top-5 hidden bg-brand-paper/95 px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-ink shadow-lg sm:block">
              Trouver votre chez-vous
            </div>
          </div>
        </div>
      </section>

      <section aria-label="Nos engagements" className="border-y border-brand-ink/10 bg-brand-paper px-5 py-6 sm:px-8 lg:px-12">
        <div className="mx-auto grid max-w-7xl gap-5 sm:grid-cols-3 sm:gap-8">
          {[
            ['Une écoute sincère', 'Vos envies guident chaque recherche.'],
            ['Un conseil transparent', 'Des échanges simples, sans détour.'],
            ['Un suivi attentif', 'Présents à chaque étape du projet.'],
          ].map(([title, description], index) => (
            <div key={title} className={`flex items-start gap-4 ${index > 0 ? 'sm:border-l sm:border-brand-ink/10 sm:pl-8' : ''}`}>
              <Handshake aria-hidden="true" className="mt-1 size-5 shrink-0 text-brand-gold-deep" />
              <div>
                <p className="font-display text-xl font-medium text-brand-ink">{title}</p>
                <p className="mt-1 text-sm leading-6 text-brand-muted">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="expertises" className="scroll-mt-24 px-5 py-20 sm:px-8 md:py-28 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 flex flex-col justify-between gap-5 md:mb-16 md:flex-row md:items-end">
            <div>
              <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.24em] text-brand-gold-deep">Nos expertises</p>
              <h2 className="max-w-2xl font-display text-4xl font-medium leading-tight tracking-tight text-brand-ink sm:text-5xl md:text-6xl">
                Le bon projet commence par le bon conseil.
              </h2>
            </div>
            <p className="max-w-sm text-sm leading-7 text-brand-muted md:pb-2">
              Une relation de proximité, des réponses concrètes et une attention particulière à ce qui compte pour vous.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3 md:gap-10">
            {expertiseItems.map((item) => <ExpertiseCard key={item.number} {...item} />)}
          </div>
        </div>
      </section>

      <section id="biens" className="scroll-mt-24 bg-brand-ink px-5 py-20 text-white sm:px-8 md:py-28 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 flex flex-col justify-between gap-5 md:mb-14 md:flex-row md:items-end">
            <div>
              <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.24em] text-brand-gold">Nos univers</p>
              <h2 className="font-display text-4xl font-medium leading-tight sm:text-5xl md:text-6xl">Des lieux à votre image.</h2>
            </div>
            <p className="max-w-sm text-sm leading-7 text-white/65">
              De la maison familiale à l’appartement lumineux, chaque projet mérite une attention unique.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-12">
            {propertyStyles.map((item) => <PropertyStyleCard key={item.title} {...item} />)}
          </div>
        </div>
      </section>

      <section id="agence" className="scroll-mt-24 px-5 py-20 sm:px-8 md:py-28 lg:px-12">
        <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <div className="relative order-2 min-h-[360px] overflow-hidden bg-brand-ink md:min-h-[520px] lg:order-1">
            <Image
              src="/real-estate/property-apartment.png"
              alt="Intérieur lumineux pensé pour une vie sereine"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
            <div className="absolute bottom-5 left-5 bg-brand-paper px-5 py-4 sm:bottom-8 sm:left-8">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-gold-deep">L’esprit Romdhani</p>
              <p className="mt-1 font-display text-xl text-brand-ink">L’humain avant tout.</p>
            </div>
          </div>
          <div className="order-1 lg:order-2">
            <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.24em] text-brand-gold-deep">Notre approche</p>
            <h2 className="font-display text-4xl font-medium leading-tight tracking-tight text-brand-ink sm:text-5xl md:text-6xl">
              Plus qu’une adresse, un nouveau chapitre.
            </h2>
            <p className="mt-6 text-base leading-8 text-brand-muted">
              Un projet immobilier est souvent une grande étape de vie. Nous prenons le temps de comprendre vos priorités, de répondre à vos questions et de vous guider avec justesse.
            </p>
            <p className="mt-4 text-base leading-8 text-brand-muted">
              Chez Romdhani Immobilier, chaque échange compte. Notre ambition : rendre votre parcours plus simple, plus serein et profondément personnel.
            </p>
            <Link
              href="/#expertises"
              className="mt-8 inline-flex items-center gap-3 border-b border-brand-gold pb-2 text-sm font-semibold text-brand-ink transition-colors hover:text-brand-gold-deep"
            >
              Découvrir notre accompagnement <ArrowUpRight aria-hidden="true" className="size-4" />
            </Link>
          </div>
        </div>
      </section>

      <section id="projet" className="scroll-mt-24 px-5 pb-20 sm:px-8 md:pb-28 lg:px-12">
        <div className="relative mx-auto max-w-7xl overflow-hidden bg-brand-gold px-6 py-12 sm:px-12 md:py-16 lg:px-16">
          <div aria-hidden="true" className="absolute -right-16 -top-32 size-96 rounded-full border border-brand-ink/15" />
          <div aria-hidden="true" className="absolute -right-4 -top-20 size-72 rounded-full border border-brand-ink/15" />
          <div className="relative flex flex-col justify-between gap-8 md:flex-row md:items-end">
            <div className="max-w-2xl">
              <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.24em] text-brand-ink/65">Romdhani Immobilier</p>
              <h2 className="font-display text-4xl font-medium leading-tight tracking-tight text-brand-ink sm:text-5xl md:text-6xl">
                Votre prochain chapitre commence ici.
              </h2>
              <p className="mt-5 max-w-xl text-sm leading-7 text-brand-ink/75 md:text-base">
                Parcourez nos univers et découvrez une façon plus attentive d’aborder l’immobilier.
              </p>
            </div>
            <Link
              href="/#biens"
              className="inline-flex min-h-13 shrink-0 items-center justify-center gap-3 bg-brand-ink px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-paper hover:text-brand-ink"
            >
              Explorer les univers <ArrowUpRight aria-hidden="true" className="size-4" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
