import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/server-supabase'
import { mapProduct } from '@/lib/products'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('products')
      .select('*, categories(*), brands(*), product_images(*)')
      .eq('id', Number(id))
      .eq('is_active', true)
      .single()

    if (error) throw error

    return NextResponse.json(mapProduct(data))
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load product'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
