import { NextRequest, NextResponse } from 'next/server'
import { requireAdminRequest, jsonError } from '@/lib/admin/auth'

export async function GET(req: NextRequest) {
  const auth = await requireAdminRequest(req)
  if ('response' in auth) return auth.response

  try {
    const role = req.nextUrl.searchParams.get('role')
    const search = req.nextUrl.searchParams.get('search')?.trim().toLowerCase()
    let query = auth.context.supabase.from('profiles').select('*').order('created_at', { ascending: false })
    if (role && role !== 'all') query = query.eq('role', role)
    const { data, error } = await query
    if (error) throw error
    const profiles = search
      ? (data || []).filter((profile: any) =>
          [profile.first_name, profile.last_name, profile.email, profile.phone].filter(Boolean).join(' ').toLowerCase().includes(search),
        )
      : data || []
    return NextResponse.json(profiles)
  } catch (error) {
    return jsonError(error, 'Failed to load customers')
  }
}
