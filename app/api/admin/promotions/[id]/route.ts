import { NextRequest, NextResponse } from 'next/server'
import { requireAdminRequest, jsonError } from '@/lib/admin/auth'

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const auth = await requireAdminRequest(req)
    if ('response' in auth) return auth.response

    try {
        const { id } = await params
        const { data, error } = await auth.context.supabase
            .from('promotions')
            .select('*, promotion_products(*)')
            .eq('id', id)
            .single()

        if (error || !data) {
            return NextResponse.json(
                { error: 'Promotion not found' },
                { status: 404 }
            )
        }

        return NextResponse.json(data)
    } catch (error) {
        return jsonError(error, 'Failed to fetch promotion')
    }
}

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const auth = await requireAdminRequest(req)
    if ('response' in auth) return auth.response

    try {
        const { id } = await params
        const body = await req.json()
        const { title, description, status, start_date, end_date, image_url, product_ids } = body

        const { error } = await auth.context.supabase
            .from('promotions')
            .update({
                title,
                description,
                status,
                start_date,
                end_date,
                image_url,
                updated_at: new Date().toISOString(),
            })
            .eq('id', id)

        if (error) throw error

        // Update product associations
        if (Array.isArray(product_ids)) {
            // Delete existing
            const { error: deleteError } = await auth.context.supabase
                .from('promotion_products')
                .delete()
                .eq('promotion_id', id)

            if (deleteError) throw deleteError

            // Insert new
            if (product_ids.length > 0) {
                const { error: insertError } = await auth.context.supabase
                    .from('promotion_products')
                    .insert(
                        product_ids.map((product_id: string | number) => ({
                            promotion_id: id,
                            product_id,
                        }))
                    )

                if (insertError) throw insertError
            }
        }

        const { data, error: fetchError } = await auth.context.supabase
            .from('promotions')
            .select('*, promotion_products(*)')
            .eq('id', id)
            .single()

        if (fetchError) throw fetchError

        return NextResponse.json(data)
    } catch (error) {
        return jsonError(error, 'Failed to update promotion')
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const auth = await requireAdminRequest(req)
    if ('response' in auth) return auth.response

    try {
        const { id } = await params

        // Delete promotion (cascade will delete promotion_products)
        const { error } = await auth.context.supabase
            .from('promotions')
            .delete()
            .eq('id', id)

        if (error) throw error

        return NextResponse.json({ success: true })
    } catch (error) {
        return jsonError(error, 'Failed to delete promotion')
    }
}
