import { NextRequest, NextResponse } from 'next/server'
import { requireAdminRequest, jsonError } from '@/lib/admin/auth'

export async function GET(req: NextRequest) {
    const auth = await requireAdminRequest(req)
    if ('response' in auth) return auth.response

    try {
        const { data, error } = await auth.context.supabase
            .from('promotions')
            .select('*, promotion_products(*)')
            .order('created_at', { ascending: false })

        if (error) throw error

        return NextResponse.json(data || [])
    } catch (error) {
        return jsonError(error, 'Failed to load promotions')
    }
}

export async function POST(req: NextRequest) {
    const auth = await requireAdminRequest(req)
    if ('response' in auth) return auth.response

    try {
        const body = await req.json()
        const { title, description, status, start_date, end_date, image_url, product_ids } = body

        if (!title || !end_date) {
            return NextResponse.json(
                { error: 'Title and end_date are required' },
                { status: 400 }
            )
        }

        const { data: promotion, error: promotionError } = await auth.context.supabase
            .from('promotions')
            .insert({
                title,
                description,
                status: status || 'active',
                start_date: start_date || new Date().toISOString(),
                end_date,
                image_url,
            })
            .select()
            .single()

        if (promotionError) throw promotionError

        // Add product associations
        if (Array.isArray(product_ids) && product_ids.length > 0) {
            const { error: productsError } = await auth.context.supabase
                .from('promotion_products')
                .insert(
                    product_ids.map((product_id: string | number) => ({
                        promotion_id: promotion.id,
                        product_id,
                    }))
                )

            if (productsError) throw productsError
        }

        const { data, error: fetchError } = await auth.context.supabase
            .from('promotions')
            .select('*, promotion_products(*)')
            .eq('id', promotion.id)
            .single()

        if (fetchError) throw fetchError

        return NextResponse.json(data)
    } catch (error) {
        return jsonError(error, 'Failed to create promotion')
    }
}
