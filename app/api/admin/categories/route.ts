import { NextRequest, NextResponse } from 'next/server'
import { requireAdminRequest, jsonError } from '@/lib/admin/auth'
import { slugify } from '@/lib/admin/forms'

export async function GET(req: NextRequest) {
  const auth = await requireAdminRequest(req)
  if ('response' in auth) return auth.response

  try {
    const { data, error } = await auth.context.supabase.from('categories').select('*').order('name')
    if (error) throw error
    return NextResponse.json(data || [])
  } catch (error) {
    return jsonError(error, 'Failed to load categories')
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireAdminRequest(req)
  if ('response' in auth) return auth.response

  try {
    const body = await req.json()
    const { data, error } = await auth.context.supabase
      .from('categories')
      .insert({ name: body.name, slug: body.slug || slugify(body.name), emoji: body.emoji || null })
      .select()
      .single()
    if (error) throw error
    return NextResponse.json(data)
  } catch (error) {
    return jsonError(error, 'Failed to create category')
  }
}
