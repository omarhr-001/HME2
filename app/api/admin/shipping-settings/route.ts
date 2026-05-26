import { NextRequest, NextResponse } from 'next/server'
import { requireAdminRequest, jsonError } from '@/lib/admin/auth'
import { getShippingSettings, normalizeShippingSettings, saveShippingSettings } from '@/lib/server-shipping-settings'

export async function GET(req: NextRequest) {
  const auth = await requireAdminRequest(req)
  if ('response' in auth) return auth.response

  const settings = await getShippingSettings()
  return NextResponse.json(settings)
}

export async function PATCH(req: NextRequest) {
  const auth = await requireAdminRequest(req)
  if ('response' in auth) return auth.response

  try {
    const body = await req.json()
    const settings = await saveShippingSettings(normalizeShippingSettings(body))
    return NextResponse.json(settings)
  } catch (error) {
    return jsonError(error, 'Failed to update shipping settings')
  }
}
