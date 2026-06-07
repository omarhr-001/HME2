import type { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = 'https://hamroun-meuble-electro.vercel.app'

    const staticPages: MetadataRoute.Sitemap = [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'daily' as const,
            priority: 1,
        },
        {
            url: `${baseUrl}/products`,
            lastModified: new Date(),
            changeFrequency: 'daily' as const,
            priority: 0.9,
        },
    ]

    try {
        // ✅ URL dynamique — marche en localhost ET en production
        const apiUrl = process.env.NEXT_PUBLIC_SITE_URL
            ? `${process.env.NEXT_PUBLIC_SITE_URL}/api/products`
            : `${baseUrl}/api/products`

        const res = await fetch(apiUrl, {
            next: { revalidate: 3600 }
        })

        if (!res.ok) throw new Error('API failed')

        const products = await res.json()

        const productUrls: MetadataRoute.Sitemap = products.map((p: any) => ({
            url: `${baseUrl}/product/${p.id}`,
            lastModified: new Date(),
            changeFrequency: 'weekly' as const,
            priority: 0.8,
        }))

        return [...staticPages, ...productUrls]
    } catch {
        return staticPages
    }
}