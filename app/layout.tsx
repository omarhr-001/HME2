import type { Metadata, Viewport } from 'next'
import { Cormorant_Garamond, DM_Sans } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { AuthProvider } from '@/lib/auth-context'
import { MetaPixel } from '@/components/meta-pixel'
import './globals.css'

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-cormorant',
})
const dmSans = DM_Sans({ subsets: ['latin'], variable: '--font-dm-sans' })
const logoUrl = 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/re-elJiNAmVqNLyOBZiaOHVtQeFLf2AJm.jpg'

export const metadata: Metadata = {
  title: {
    default: 'Romdhani Immobilier | Agence immobilière',
    template: '%s | Romdhani Immobilier',
  },
  description:
    'Romdhani Immobilier vous accompagne dans vos projets d’achat, de vente et d’investissement avec écoute, transparence et exigence.',
  keywords: ['Romdhani Immobilier', 'agence immobilière', 'achat immobilier', 'vente immobilière', 'conseil immobilier'],
  icons: {
    icon: logoUrl,
    shortcut: logoUrl,
    apple: logoUrl,
  },
  openGraph: {
    type: 'website',
    locale: 'fr_TN',
    siteName: 'Romdhani Immobilier',
    title: 'Romdhani Immobilier | Agence immobilière',
    description:
      'Un accompagnement attentif pour vos projets d’achat, de vente et d’investissement immobilier.',
    images: [{ url: logoUrl, alt: 'Logo Romdhani Immobilier' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Romdhani Immobilier | Agence immobilière',
    description: 'Un accompagnement attentif pour vos projets immobiliers.',
    images: [logoUrl],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  userScalable: true,
  themeColor: '#f7f5ef',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr" className={`${cormorant.variable} ${dmSans.variable}`}>
      <body className="bg-background font-sans text-foreground antialiased">
        <MetaPixel />
        <AuthProvider>
          {children}
          {process.env.NODE_ENV === 'production' && <Analytics />}
        </AuthProvider>
      </body>
    </html>
  )
}
