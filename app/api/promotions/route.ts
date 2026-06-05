import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(req: NextRequest) {
    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

        if (!supabaseUrl || !supabaseAnonKey) {
            return NextResponse.json(
                { error: 'Supabase is not configured' },
                { status: 500 }
            )
        }

        const supabase = createClient(supabaseUrl, supabaseAnonKey)

        // Fetch active promotions with their products
        const { data: promotions, error: promotionError } = await supabase
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

        if (promotionError) throw promotionError

        if (!promotions || promotions.length === 0) {
            return NextResponse.json([])
        }

        // Fetch product details for all promotion products
        const productIds = promotions
            .flatMap((p: any) => p.promotion_products.map((pp: any) => pp.product_id))
            .filter((id: any, index: number, arr: any[]) => arr.indexOf(id) === index)

        if (productIds.length === 0) {
            return NextResponse.json([])
        }

        const { data: products, error: productsError } = await supabase
            .from('products')
            .select('id, name, price, original_price, image_url, product_images(*)')
            .in('id', productIds)

        if (productsError) throw productsError

        // Calculate discount percentages and aggregate by promotion
        const enrichedPromotions = promotions.map((promo: any) => {
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
                image_url: promo.image_url,
                expiresAt: promo.end_date,
                discount: maxDiscount,
                products: promoProducts,
            }
        })

        return NextResponse.json(enrichedPromotions)
    } catch (error) {
        console.error('Error fetching promotions:', error)
        return NextResponse.json(
            { error: 'Failed to fetch promotions' },
            { status: 500 }
        )
    }
}
