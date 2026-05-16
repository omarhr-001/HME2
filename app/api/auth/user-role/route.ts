import { supabase } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Get user from auth header
    const token = request.headers.get('Authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json({ role: 'client' }, { status: 200 })
    }

    // Use service role key to bypass RLS
    const { data: { user }, error: userError } = await supabase.auth.getUser(token)
    
    if (userError || !user) {
      return NextResponse.json({ role: 'client' }, { status: 200 })
    }

    // Get user profile with service role (bypasses RLS)
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (error) {
      console.error('[v0] Error fetching user role:', error)
      return NextResponse.json({ role: 'client' }, { status: 200 })
    }

    return NextResponse.json({
      role: (profile?.role as string) || 'client'
    })
  } catch (err) {
    console.error('[v0] Error in user-role API:', err)
    return NextResponse.json({ role: 'client' }, { status: 200 })
  }
}
