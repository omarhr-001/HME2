export interface Offer {
    id: string
    title: string
    description: string
    discount: number
    image?: string
    expiresAt: string
    products?: Array<{
        id: number
        name: string
        price: number
        originalPrice: number
        discount: number
        image_url?: string | null
    }>
}

let cachedOffers: Offer[] | null = null
let cacheTime = 0
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

// Fallback mock data if API fails
const fallbackOffers: Offer[] = [
    {
        id: '1',
        title: 'Réfrigérateurs',
        description: 'Samsung, LG, Bosch',
        discount: 30,
        expiresAt: '31 Mai 2026'
    },
    {
        id: '2',
        title: 'Machines à laver',
        description: 'Toutes marques',
        discount: 25,
        expiresAt: '31 Mai 2026'
    },
    {
        id: '3',
        title: 'Climatiseurs',
        description: 'Offre été 2026',
        discount: 40,
        expiresAt: '31 Mai 2026'
    },
]

async function fetchOffersFromAPI(): Promise<Offer[]> {
    try {
        const res = await fetch('/api/promotions', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        })

        if (!res.ok) {
            console.warn('Failed to fetch promotions from API, using fallback')
            return fallbackOffers
        }

        const data = await res.json()
        if (!Array.isArray(data)) {
            console.warn('Invalid promotions data format, using fallback')
            return fallbackOffers
        }

        // Transform API response to Offer format
        return data.map((promo: any) => ({
            id: promo.id,
            title: promo.title,
            description: promo.description,
            discount: promo.discount || 0,
            image: promo.image_url,
            expiresAt: promo.expiresAt ? new Date(promo.expiresAt).toLocaleDateString('fr-FR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            }) : '31 Mai 2026',
            products: promo.products || []
        }))
    } catch (error) {
        console.error('Error fetching offers:', error)
        return fallbackOffers
    }
}

export async function getTopOffers(limit: number = 3): Promise<Offer[]> {
    const now = Date.now()

    // Use cache if available and fresh
    if (cachedOffers && (now - cacheTime) < CACHE_DURATION) {
        return cachedOffers
            .sort((a, b) => b.discount - a.discount)
            .slice(0, limit)
    }

    // Fetch fresh offers from API
    const offers = await fetchOffersFromAPI()
    cachedOffers = offers
    cacheTime = now

    return offers
        .sort((a, b) => b.discount - a.discount)
        .slice(0, limit)
}

export async function getAllOffers(): Promise<Offer[]> {
    const now = Date.now()

    if (cachedOffers && (now - cacheTime) < CACHE_DURATION) {
        return cachedOffers
    }

    const offers = await fetchOffersFromAPI()
    cachedOffers = offers
    cacheTime = now

    return offers
}

// Server-side helper for direct Supabase access (if needed)
export async function getOffersFromSupabase() {
    try {
        const { supabase } = await import('./supabase')

        const { data: promotions, error } = await supabase
            .from('promotions')
            .select(`
                id,
                title,
                description,
                image_url,
                end_date,
                promotion_products (
                    product_id
                )
            `)
            .eq('status', 'active')
            .gt('end_date', new Date().toISOString())
            .order('created_at', { ascending: false })

        if (error) throw error

        if (!promotions || promotions.length === 0) {
            return fallbackOffers
        }

        // Fetch product details
        const productIds = promotions
            .flatMap((p: any) => p.promotion_products.map((pp: any) => pp.product_id))
            .filter((id: any, index: number, arr: any[]) => arr.indexOf(id) === index)

        if (productIds.length === 0) {
            return fallbackOffers
        }

        const { data: products } = await supabase
            .from('products')
            .select('id, name, price, original_price, image_url, product_images(*)')
            .in('id', productIds)

        // Transform to Offer format
        return promotions.map((promo: any) => {
            const promoProducts = promo.promotion_products
                .map((pp: any) => {
                    const product = products?.find((p: any) => p.id === pp.product_id)
                    if (!product) return null

                    const originalPrice = product.original_price || product.price
                    const discount =
                        originalPrice > product.price
                            ? Math.round(((originalPrice - product.price) / originalPrice) * 100)
                            : 0

                    return {
                        id: product.id,
                        name: product.name,
                        price: product.price,
                        originalPrice,
                        discount,
                        image_url:
                            product.product_images?.find((image: any) => image.is_main)?.image_url ||
                            product.product_images?.sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0))[0]?.image_url ||
                            product.image_url ||
                            null,
                    }
                })
                .filter(Boolean)

            const maxDiscount = Math.max(
                ...promoProducts.map((p: any) => p.discount || 0),
                0
            )

            return {
                id: promo.id,
                title: promo.title,
                description: promo.description,
                discount: maxDiscount,
                image: promo.image_url,
                expiresAt: new Date(promo.end_date).toLocaleDateString('fr-FR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                }),
                products: promoProducts,
            }
        })
    } catch (error) {
        console.error('Error fetching offers from Supabase:', error)
        return fallbackOffers
    }
}
