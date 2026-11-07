'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRight, Compass, Handshake, House } from 'lucide-react'

const projectSteps = [
  { icon: House, label: 'Achat' },
  { icon: Handshake, label: 'Vente' },
  { icon: Compass, label: 'Investissement' },
]

export function Hero() {
  return (
    <section id="accueil" className="relative isolate flex min-h-[680px] items-center overflow-hidden bg-brand-ink px-4 pb-16 pt-28 text-white md:min-h-[740px] md:px-[5%]">
      <Image
        src="/real-estate/hero-villa.png"
        alt=""
        fill
        priority
        sizes="100vw"
        className="-z-20 object-cover"
      />
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-r from-brand-ink/95 via-brand-ink/75 to-brand-ink/35" />
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-t from-brand-ink/55 via-transparent to-brand-ink/20" />

      <div className="mx-auto grid w-full max-w-7xl items-center gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-12">
        <div className="relative z-10 max-w-2xl">
          <p className="mb-5 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.22em] text-brand-gold">
            <span aria-hidden="true" className="h-px w-8 bg-brand-gold" />
            Agence immobilière
          </p>
          <h1 className="font-display text-5xl font-semibold leading-[1.02] tracking-tight text-white sm:text-6xl md:text-7xl">
            L’immobilier,
            <br />
            <span className="text-brand-gold">en confiance.</span>
          </h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-white/78 sm:text-lg sm:leading-8">
            Acheter, vendre ou investir mérite un accompagnement attentif. Romdhani Immobilier vous aide à avancer avec clarté, écoute et exigence.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/#biens" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-brand-gold px-6 py-3 text-sm font-bold text-brand-ink transition hover:bg-brand-paper">
              Découvrir nos univers <ArrowUpRight aria-hidden="true" className="size-4" />
            </Link>
            <Link href="/#expertises" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-white/35 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:border-brand-gold hover:bg-white/10">
              Notre accompagnement <ArrowUpRight aria-hidden="true" className="size-4" />
            </Link>
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3 text-[10px] font-semibold uppercase tracking-[0.17em] text-white/75 sm:text-xs">
            {projectSteps.map(({ icon: Icon, label }) => (
              <span key={label} className="inline-flex items-center gap-2">
                <Icon aria-hidden="true" className="size-4 text-brand-gold" /> {label}
              </span>
            ))}
          </div>
        </div>

        <aside className="relative z-10 mx-auto w-full max-w-lg lg:ml-auto">
          <div aria-hidden="true" className="absolute -inset-1 rounded-2xl bg-brand-gold/20 blur-xl" />
          <div className="relative overflow-hidden rounded-2xl border border-white/20 bg-brand-ink/45 p-3 shadow-2xl backdrop-blur-xl sm:p-4">
            <div className="relative h-52 overflow-hidden rounded-xl sm:h-60">
              <Image
                src="/real-estate/property-apartment.png"
                alt="Salon lumineux ouvert sur un balcon"
                fill
                sizes="(max-width: 1024px) 90vw, 440px"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-ink/80 via-transparent to-transparent" />
              <span className="absolute left-4 top-4 rounded-full border border-white/30 bg-brand-ink/45 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-white backdrop-blur">
                Romdhani Immobilier
              </span>
              <p className="absolute bottom-4 left-4 font-display text-2xl font-semibold text-white sm:text-3xl">
                Un lieu, une histoire.
              </p>
            </div>
            <div className="flex items-center justify-between gap-4 px-1 pb-1 pt-4 sm:px-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-gold">Votre projet, notre écoute</p>
                <p className="mt-1 text-sm text-white/75">Un suivi attentif à chaque étape.</p>
              </div>
              <Link href="/#projet" aria-label="Parler de votre projet immobilier" className="grid size-11 shrink-0 place-items-center rounded-full border border-brand-gold/60 text-brand-gold transition hover:bg-brand-gold hover:text-brand-ink">
                <ArrowUpRight aria-hidden="true" className="size-5" />
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </section>
  )
}
