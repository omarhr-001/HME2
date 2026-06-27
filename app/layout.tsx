import type { Metadata, Viewport } from 'next'
import { Syne, DM_Sans } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { AuthProvider } from '@/lib/auth-context'
import { MetaPixel } from '@/components/meta-pixel'
import './globals.css'

const syne = Syne({ subsets: ["latin"], variable: '--font-syne' });
const dmSans = DM_Sans({ subsets: ["latin"], variable: '--font-dm-sans' });

export const metadata: Metadata = {
  // ✅ Titre avec template pour les sous-pages
  title: {
    default: 'Hamroun Meuble & Electro',
    template: '%s | Hamroun Meuble & Electro',
  },
  verification: {
    google: 'c5fbef808ba04820', // 👈 le code que Google te donne
  },
  icons: {
    icon: "/public/logo.png",
    shortcut: "/public/logo.png",
    apple: "/public/logo.png",
  },

  // ✅ Description optimisée pour Google (max 160 caractères)
  description: 'Vente de meubles et électroménagers de qualité en Tunisie. Climatiseurs, réfrigérateurs, canapés. Livraison à domicile sur Hammamet et toute la Tunisie.',

  // ✅ Mots-clés pour le référencement
  keywords: [
    'meuble Tunisie',
    'électroménager Tunisie',
    'climatiseur Hammamet',
    'canapé Tunisie',
    'réfrigérateur Tunisie',
    'Hamroun Meuble',
    'livraison Tunisie',
  ],

  // ✅ URL de base du site (obligatoire pour OpenGraph)
  metadataBase: new URL('https://hamroun-meuble-electro.vercel.app'),

  // ✅ OpenGraph — apparence sur Facebook / WhatsApp / LinkedIn
  openGraph: {
    type: 'website',
    locale: 'fr_TN',
    url: 'https://hamroun-meuble-electro.vercel.app',
    siteName: 'Hamroun Meuble & Electro',
    title: 'Hamroun Meuble & Electro',
    description: 'Vente de meubles et électroménagers de qualité en Tunisie. Livraison à domicile.',
    images: [
      {
        url: '/public/logo.png', // 👈 ajoute une image 1200x630px dans /public
        width: 1200,
        height: 630,
        alt: 'Hamroun Meuble & Electro',
      },
    ],
  },

  // ✅ Twitter/X card
  twitter: {
    card: 'summary_large_image',
    title: 'Hamroun Meuble & Electro',
    description: 'Vente de meubles et électroménagers de qualité en Tunisie.',
    images: ['/public/logo.png'],
  },

  // ✅ Instructions pour les robots Google
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },

  // ✅ URL canonique (évite le duplicate content)
  alternates: {
    canonical: 'https://hamroun-meuble-electro.vercel.app',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr" className={`${syne.variable} ${dmSans.variable}`}>
      <body className="font-sans antialiased bg-gray-50">
        <MetaPixel />
        <AuthProvider>
          {children}
          {process.env.NODE_ENV === 'production' && <Analytics />}
        </AuthProvider>
      </body>
    </html>
  )
}