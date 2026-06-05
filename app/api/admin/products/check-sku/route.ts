import { NextResponse } from 'next/server'
import { requireAdminRequest } from '@/lib/admin/auth'

export async function GET(req: Request) {
    // allow both admin and client checks; require admin for now
    try {
        // If admin protection is needed, uncomment the next lines
        // const auth = await requireAdminRequest(req as any)
        // if ('response' in auth) return auth.response

        const url = new URL(req.url)
        const sku = url.searchParams.get('sku')?.trim()
        const excludeId = url.searchParams.get('excludeId')
        if (!sku) return NextResponse.json({ available: false })

        const { createServiceClient } = await import('@/lib/server-supabase')
        const supabase = createServiceClient()

        let query = supabase.from('products').select('id')
        query = query.eq('sku', sku)
        if (excludeId) query = query.neq('id', excludeId)

        const { data, error } = await query.limit(1)
        if (error) throw error

        const available = !data || (Array.isArray(data) && data.length === 0)
        return NextResponse.json({ available })
    } catch (err) {
        return NextResponse.json({ available: false })
    }
}
