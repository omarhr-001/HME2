import Link from 'next/link'
import { Database } from 'lucide-react'
import { Footer } from '@/components/footer'
import { Navbar } from '@/components/navbar'
import { STATIC_DATA_READ_ONLY_MESSAGE } from '@/lib/static-mode'

export function StaticFeatureNotice({ title, description }: { title: string; description?: string }) {
  return (
    <>
      <Navbar />
      <main className="mx-auto flex min-h-[65vh] max-w-3xl items-center px-4 py-16 sm:px-6">
        <section className="w-full rounded-2xl border bg-card p-8 shadow-sm sm:p-12" aria-labelledby="static-feature-title">
          <div className="mb-6 grid size-12 place-items-center rounded-xl bg-primary/10 text-primary">
            <Database aria-hidden="true" className="size-6" />
          </div>
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-primary">Mode catalogue statique</p>
          <h1 id="static-feature-title" className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h1>
          <p className="mt-4 max-w-2xl leading-7 text-muted-foreground">
            {description ?? STATIC_DATA_READ_ONLY_MESSAGE}
          </p>
          <Link
            href="/products"
            className="mt-8 inline-flex min-h-11 items-center justify-center rounded-md bg-primary px-5 font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            Parcourir le catalogue
          </Link>
        </section>
      </main>
      <Footer />
    </>
  )
}
