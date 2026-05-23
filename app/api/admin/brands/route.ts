import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAdminRequest, jsonError } from '@/lib/admin/auth'
import { slugify } from '@/lib/admin/forms'

const createBrandSchema = z.object({
    name: z.string().trim().min(1, 'Brand name is required'),
    slug: z.string().trim().optional().nullable(),
    description: z.string().trim().optional().nullable(),
    logo_url: z.string().trim().optional().nullable(),
})

export async function GET(req: NextRequest) {
    const auth = await requireAdminRequest(req)
    if ('response' in auth) return auth.response

    try {
        const { data, error } = await auth.context.supabase
            .from('brands')
            .select('id, name, slug, logo_url')
            .order('name', { ascending: true })

        if (error) throw error

        return NextResponse.json(data || [])
    } catch (error) {
        return jsonError(error, 'Failed to load brands')
    }
}

export async function POST(req: NextRequest) {
    const auth = await requireAdminRequest(req)
    if ('response' in auth) return auth.response

    try {
        const body = await req.json()
        const payload = createBrandSchema.parse(body)

        const { data, error } = await auth.context.supabase
            .from('brands')
            .insert({
                name: payload.name,
                slug: payload.slug?.trim() || slugify(payload.name),
                description: payload.description || null,
                logo_url: payload.logo_url || null,
            })
            .select('id, name, slug, logo_url')
            .single()

        if (error) throw error

        return NextResponse.json(data)
    } catch (error) {
        return jsonError(error, 'Failed to create brand')
    }
}
