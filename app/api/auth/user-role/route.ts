import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Get user from auth header
    const authHeader = request.headers.get('Authorization')
    const token = authHeader?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json({ role: 'client' }, { status: 200 })
    }

    // Create Supabase client with anon key (same as client-side)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('[v0] Missing Supabase env vars')
      return NextResponse.json({ role: 'client' }, { status: 200 })
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey)
    
    // Get user from token
    const { data: { user }, error: userError } = await supabase.auth.getUser(token)
    
    if (userError || !user) {
      console.error('[v0] Error getting user from token:', userError)
      return NextResponse.json({ role: 'client' }, { status: 200 })
    }

    // Get user profile
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (error) {
      console.error('[v0] Error fetching user role:', error)
      return NextResponse.json({ role: 'client' }, { status: 200 })
    }

    const userRole = (profile?.role as string) || 'client'
    console.log('[v0] User role API: user =', user.email, 'role =', userRole)
    
    return NextResponse.json({
      role: userRole
    })
  } catch (err) {
    console.error('[v0] Error in user-role API:', err)
    return NextResponse.json({ role: 'client' }, { status: 200 })
  }
}
