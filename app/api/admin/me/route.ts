import { NextRequest, NextResponse } from 'next/server'
import { requireAdminRequest } from '@/lib/admin/auth'

export async function GET(req: NextRequest) {
  const auth = await requireAdminRequest(req)
  if ('response' in auth) return auth.response

  return NextResponse.json({
    id: auth.context.user.id,
    email: auth.context.user.email,
    role: 'admin',
  })
}
