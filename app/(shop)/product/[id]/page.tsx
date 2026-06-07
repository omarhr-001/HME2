// ✅ PAS de 'use client' — Server Component pour le SEO
import type { Metadata } from 'next'
import { getProductByIdFromSupabase } from '@/lib/products'
import { ProductClient } from './product-client'

interface Props {
  params: { id: string }
}

// ✅ Génère le SEO unique pour chaque produit
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await getProductByIdFromSupabase(params.id)

  if (!product) {
    return {
      title: 'Produit non trouvé',
      description: 'Ce produit n\'existe pas.',
    }
  }

  const description = product.description?.slice(0, 160)
    || `Achetez ${product.name} en Tunisie. Prix: ${product.price} DT. Livraison depuis Hammamet.`

  return {
    title: product.name,
    description,
    keywords: [
      product.name,
      product.category || '',
      product.brand?.name || '',
      'Tunisie',
      'Hamroun Meuble',
      'électroménager',
    ].filter(Boolean),
    openGraph: {
      title: `${product.name} | Hamroun Meuble & Electro`,
      description,
      images: product.image_url
        ? [{ url: product.image_url, alt: product.name }]
        : [],
    },
    alternates: {
      canonical: `https://hamroun-meuble-electro.vercel.app/product/${params.id}`,
    },
  }
}

// ✅ Page principale — délègue le rendu au Client Component
export default function ProductPage({ params }: Props) {
  return <ProductClient id={params.id} />
}