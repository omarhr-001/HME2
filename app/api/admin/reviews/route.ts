import { NextRequest, NextResponse } from 'next/server'
import { requireAdminRequest, jsonError } from '@/lib/admin/auth'

export async function GET(req: NextRequest) {
  const auth = await requireAdminRequest(req)
  if ('response' in auth) return auth.response

  try {
    const { data, error } = await auth.context.supabase
      .from('products')
      .select('id, name, image_url, rating, reviews_count')
      .gt('reviews_count', 0)
      .order('reviews_count', { ascending: false })
    if (error) throw error
    return NextResponse.json(data || [])
  } catch (error) {
    return jsonError(error, 'Failed to load reviews')
  }
}
