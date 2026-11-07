'use client'

import { useState } from 'react'
import { Footer } from '@/components/footer'
import { Hero } from '@/components/hero'
import { Navbar } from '@/components/navbar'
import { ProductsSection } from '@/components/products-section'
import { PromoBanner } from '@/components/promo-banner'
import { SearchSection } from '@/components/search-section'
import { TrustBar } from '@/components/trust-bar'

export function HomeExperience() {
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-brand-ivory">
        <Hero />
        <TrustBar />
        <SearchSection onSearchChange={setSearchQuery} />
        <ProductsSection searchQuery={searchQuery} />
        <PromoBanner />
      </main>
      <Footer />
    </>
  )
}
