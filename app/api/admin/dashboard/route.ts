import { NextRequest, NextResponse } from 'next/server'
import { requireAdminRequest, jsonError } from '@/lib/admin/auth'
import { getDashboardData } from '@/lib/admin/dashboard'

export async function GET(req: NextRequest) {
  const auth = await requireAdminRequest(req)
  if ('response' in auth) return auth.response

  try {
    const data = await getDashboardData(auth.context.supabase)
    return NextResponse.json(data)
  } catch (error) {
    return jsonError(error, 'Failed to load dashboard')
  }
}
