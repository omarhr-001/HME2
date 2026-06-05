import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAdminRequest, jsonError } from '@/lib/admin/auth'
import { slugify } from '@/lib/admin/forms'

const updateBrandSchema = z.object({
    name: z.string().trim().min(1, 'Brand name is required'),
    slug: z.string().trim().optional().nullable(),
    description: z.string().trim().optional().nullable(),
    logo_url: z.string().trim().optional().nullable(),
})

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const auth = await requireAdminRequest(req)
    if ('response' in auth) return auth.response

    try {
        const { id } = await params
        const body = await req.json()
        const payload = updateBrandSchema.parse(body)

        const { data, error } = await auth.context.supabase
            .from('brands')
            .update({
                name: payload.name,
                slug: payload.slug?.trim() || slugify(payload.name),
                description: payload.description || null,
                logo_url: payload.logo_url || null,
            })
            .eq('id', id)
            .select('id, name, slug, description, logo_url')
            .single()

        if (error) throw error
        return NextResponse.json(data)
    } catch (error) {
        return jsonError(error, 'Failed to update brand')
    }
}
