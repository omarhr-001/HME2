import { NextRequest, NextResponse } from 'next/server'
import { STATIC_AUTH_DISABLED_MESSAGE } from './static-mode'

export type AuthenticatedHandler = (
  request: NextRequest,
  user: { id: string; email?: string },
) => Promise<NextResponse> | NextResponse

export async function withAuth(
  _request: NextRequest,
  _handler: AuthenticatedHandler,
): Promise<NextResponse> {
  return NextResponse.json({ error: STATIC_AUTH_DISABLED_MESSAGE }, { status: 503 })
}

export function validateUserOwnership(resourceUserId: string | null | undefined, userId: string) {
  return Boolean(resourceUserId && resourceUserId === userId)
}
