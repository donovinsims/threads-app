import { NextResponse } from 'next/server'
import { clearSession } from '@/lib/auth/session'

export async function POST(): Promise<NextResponse> {
  try {
    await clearSession()
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to disconnect' }, { status: 500 })
  }
}