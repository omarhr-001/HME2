import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/server-supabase'
import { mapProduct } from '@/lib/products'

export async function GET() {
  try {
    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('products')
      .select('*, categories(*), brands(*), product_images(*)')
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json((data || []).map(mapProduct))
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load products'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
