import { NextRequest, NextResponse } from 'next/server'
import { requireAdminRequest, jsonError } from '@/lib/admin/auth'
import { customerRoleSchema } from '@/lib/admin/forms'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminRequest(req)
  if ('response' in auth) return auth.response

  try {
    const { id } = await params
    const body = customerRoleSchema.parse(await req.json())
    const { data, error } = await auth.context.supabase
      .from('profiles')
      .update({ role: body.role, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return NextResponse.json(data)
  } catch (error) {
    return jsonError(error, 'Failed to update customer')
  }
}
