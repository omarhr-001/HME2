import { Navbar } from '@/components/navbar'
import { Hero } from '@/components/hero'
import { TrustBar } from '@/components/trust-bar'
import { SearchSection } from '@/components/search-section'
import { ProductsSection } from '@/components/products-section'
import { PromoBanner } from '@/components/promo-banner'
import { Footer } from '@/components/footer'

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <Hero />
      <TrustBar />
      <SearchSection />
      <ProductsSection />
      <PromoBanner />
      <Footer />
    </main>
  )
}
