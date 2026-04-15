import { NextRequest, NextResponse } from 'next/server'
import { exchangeCodeForToken } from '@/lib/threads/client'

export async function GET(request: NextRequest): Promise<NextResponse> {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  const error = searchParams.get('error')
  const errorReason = searchParams.get('error_reason')

  if (error || errorReason) {
    return NextResponse.redirect(new URL('/settings?error=auth_denied', request.url))
  }

  if (!code) {
    return NextResponse.redirect(new URL('/settings?error=missing_code', request.url))
  }

  try {
    await exchangeCodeForToken(code)
    return NextResponse.redirect(new URL('/settings?connected=true', request.url))
  } catch (err) {
    console.error('Token exchange failed:', err)
    return NextResponse.redirect(new URL('/settings?error=token_exchange_failed', request.url))
  }
}