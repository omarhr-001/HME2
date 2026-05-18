import { NextRequest, NextResponse } from 'next/server'
import { requireAdminRequest, jsonError } from '@/lib/admin/auth'

export async function GET(req: NextRequest) {
  const auth = await requireAdminRequest(req)
  if ('response' in auth) return auth.response

  try {
    const searchParams = req.nextUrl.searchParams
    const status = searchParams.get('status')
    const search = searchParams.get('search')?.trim().toLowerCase()
    const format = searchParams.get('format')

    let query = auth.context.supabase
      .from('orders')
      .select('*, order_items(*, products(id, name, image_url))')
      .order('created_at', { ascending: false })

    if (status && status !== 'all') query = query.eq('status', status)

    const [{ data, error }, profilesResult] = await Promise.all([
      query,
      auth.context.supabase.from('profiles').select('*'),
    ])
    if (error) throw error
    if (profilesResult.error) throw profilesResult.error

    const profileMap = new Map((profilesResult.data || []).map((profile: any) => [profile.id, profile]))

    const orders = (data || []).map((order: any) => ({
      ...order,
      profiles: profileMap.get(order.user_id) || null,
    })).filter((order: any) => {
      if (!search) return true
      const customer = [order.profiles?.first_name, order.profiles?.last_name, order.profiles?.email]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      return order.id.toLowerCase().includes(search) || (order.order_number || '').toLowerCase().includes(search) || customer.includes(search)
    })

    if (format === 'csv') {
      const csv = [
        'Order ID,Customer,Products Count,Total Amount,Status,Payment Method,Payment Status,Date',
        ...orders.map((order: any) => {
          const customer = [order.profiles?.first_name, order.profiles?.last_name].filter(Boolean).join(' ') || order.profiles?.email || 'Customer'
          return [
            order.order_number || order.id,
            customer,
            order.order_items?.length || 0,
            order.total_amount,
            order.status,
            order.payment_method || 'cash_on_delivery',
            order.payment_status || 'pending',
            order.created_at,
          ]
            .map((value) => `"${String(value).replace(/"/g, '""')}"`)
            .join(',')
        }),
      ].join('\n')
      return new NextResponse(csv, {
        headers: {
          'content-type': 'text/csv; charset=utf-8',
          'content-disposition': 'attachment; filename="orders.csv"',
        },
      })
    }

    return NextResponse.json(orders)
  } catch (error) {
    return jsonError(error, 'Failed to load orders')
  }
}
