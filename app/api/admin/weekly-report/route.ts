import { NextRequest, NextResponse } from 'next/server'
import { requireAdminRequest, jsonError } from '@/lib/admin/auth'
import { generateWeeklyReport } from '@/lib/admin/weekly-report'

export async function GET(req: NextRequest) {
  const auth = await requireAdminRequest(req)
  if ('response' in auth) return auth.response

  try {
    const report = await generateWeeklyReport(auth.context.supabase)
    return NextResponse.json(report)
  } catch (error) {
    return jsonError(error, 'Failed to generate weekly report')
  }
}
