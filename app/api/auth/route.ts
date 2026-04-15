import { NextResponse } from 'next/server'
import { buildAuthUrl } from '@/lib/auth/session'

export async function GET(): Promise<NextResponse> {
  try {
    const authUrl = buildAuthUrl()
    return NextResponse.redirect(authUrl)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'OAuth configuration error' },
      { status: 500 }
    )
  }
}