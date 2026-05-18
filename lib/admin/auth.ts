import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { ZodError } from 'zod'

export type AdminContext = {
  user: { id: string; email?: string }
  supabase: SupabaseClient
}

export async function requireAdminRequest(
  req: NextRequest,
): Promise<{ context: AdminContext } | { response: NextResponse }> {
  const token =
    req.headers.get('authorization')?.replace('Bearer ', '') ||
    req.cookies.get('sb-access-token')?.value

  if (!token) {
    return { response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !anonKey) {
    return { response: NextResponse.json({ error: 'Supabase is not configured' }, { status: 500 }) }
  }

  const authClient = createClient(supabaseUrl, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  const { data: userData, error: userError } = await authClient.auth.getUser(token)

  if (userError || !userData.user) {
    return { response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  }

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const serviceClient = serviceRoleKey
    ? createClient(supabaseUrl, serviceRoleKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      })
    : null

  const userScopedClient = createClient(supabaseUrl, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  })

  const roleClient = serviceClient || userScopedClient
  let { data: profile, error: profileError } = await roleClient
    .from('profiles')
    .select('id, email, first_name, last_name, role')
    .eq('id', userData.user.id)
    .single()

  if ((profileError || !profile) && userData.user.email) {
    const fallback = await roleClient
      .from('profiles')
      .select('id, email, first_name, last_name, role')
      .eq('email', userData.user.email)
      .single()

    profile = fallback.data
    profileError = fallback.error
  }

  if (profileError || profile?.role !== 'admin') {
    return {
      response: NextResponse.json(
        {
          error: 'Forbidden',
          reason: profileError?.message || `Profile role is "${profile?.role || 'missing'}"`,
          userId: userData.user.id,
          email: userData.user.email,
          serviceRoleConfigured: Boolean(serviceRoleKey),
        },
        { status: 403 },
      ),
    }
  }

  const supabase = serviceClient || userScopedClient

  return {
    context: {
      user: { id: userData.user.id, email: userData.user.email },
      supabase,
    },
  }
}

export function toNumber(value: unknown) {
  return typeof value === 'number' ? value : Number(value || 0)
}

export function jsonError(error: unknown, fallback = 'Request failed') {
  if (error instanceof ZodError) {
    return NextResponse.json(
      { error: error.issues[0]?.message || 'Invalid request body' },
      { status: 400 },
    )
  }

  const message = error instanceof Error ? error.message : fallback
  return NextResponse.json({ error: message }, { status: 500 })
}
