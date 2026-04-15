import { NextRequest, NextResponse } from 'next/server'
import { processDuePosts } from '@/lib/threads/publisher'
import * as serverStorage from '@/lib/server-storage'

const CRON_SECRET = process.env.CRON_SECRET

export async function GET(request: NextRequest): Promise<NextResponse> {
  const authHeader = request.headers.get('authorization')
  const secret = authHeader?.replace('Bearer ', '')

  if (CRON_SECRET && secret !== CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const duePosts = await serverStorage.serverGetDue()
    const results = await processDuePosts()

    const succeeded = results.filter(r => r.success).length
    const failed = results.filter(r => !r.success).length

    return NextResponse.json({
      processed: results.length,
      due: duePosts.length,
      succeeded,
      failed,
      results,
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Cron failed' },
      { status: 500 }
    )
  }
}