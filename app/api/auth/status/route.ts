import { NextResponse } from 'next/server'
import { getSession, isSessionValid, needsRefresh } from '@/lib/auth/session'

export async function GET(): Promise<NextResponse> {
  try {
    const session = await getSession()
    const valid = await isSessionValid()
    const refreshNeeded = await needsRefresh()

    if (!valid || !session) {
      return NextResponse.json({ 
        connected: false,
        error: valid === false && session ? 'expired' : undefined,
      })
    }

    return NextResponse.json({
      connected: true,
      userId: session.userId,
      userName: session.userName,
      expiresAt: session.expiresAt,
      needsRefresh: refreshNeeded,
      expiresIn: session.expiresAt - Date.now(),
    })
  } catch (error) {
    return NextResponse.json({ 
      connected: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}