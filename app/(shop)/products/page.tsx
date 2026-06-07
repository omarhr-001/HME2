// ✅ PAS de 'use client' — Server Component pour le SEO
import type { Metadata } from 'next'
import { ProductsClient } from './products-client'

// ✅ SEO pour la page liste des produits
export const metadata: Metadata = {
  title: 'Tous les produits',
  description: 'Découvrez toute notre gamme de meubles et électroménagers en Tunisie. Climatiseurs, réfrigérateurs, canapés, livraison depuis Hammamet.',
  keywords: [
    'meuble Tunisie',
    'électroménager Tunisie',
    'climatiseur',
    'réfrigérateur',
    'canapé',
    'Hammamet',
    'livraison Tunisie',
  ],
  openGraph: {
    title: 'Tous les produits | Hamroun Meuble & Electro',
    description: 'Découvrez toute notre gamme de meubles et électroménagers en Tunisie.',
    images: [{ url: '/public/logo.png', alt: 'Hamroun Meuble & Electro' }],
  },
  alternates: {
    canonical: 'https://hamroun-meuble-electro.vercel.app/products',
  },
}

// ✅ Page principale — délègue au Client Component
export default function ProductsPage() {
  return <ProductsClient />
}