import { cookies } from 'next/headers'
import { type ThreadsSession } from '@/lib/threads/types'

const SESSION_COOKIE_NAME = 'threads_session'

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 60 * 60 * 24 * 60, // 60 days
}

export async function getSession(): Promise<ThreadsSession | null> {
  const cookieStore = await cookies()
  const cookie = cookieStore.get(SESSION_COOKIE_NAME)

  if (!cookie?.value) {
    return null
  }

  try {
    const session = JSON.parse(cookie.value) as ThreadsSession
    if (session.expiresAt < Date.now()) {
      await clearSession()
      return null
    }
    return session
  } catch {
    return null
  }
}

export async function setSession(session: ThreadsSession): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE_NAME, JSON.stringify(session), COOKIE_OPTIONS)
}

export async function clearSession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE_NAME)
}

export async function isSessionValid(): Promise<boolean> {
  const session = await getSession()
  return session !== null
}

export async function getAccessToken(): Promise<string | null> {
  const session = await getSession()
  return session?.accessToken ?? null
}

export async function getUserId(): Promise<string | null> {
  const session = await getSession()
  return session?.userId ?? null
}

export async function needsRefresh(): Promise<boolean> {
  const session = await getSession()
  if (!session) return false

  const fiveDaysMs = 5 * 24 * 60 * 60 * 1000
  return session.expiresAt - Date.now() < fiveDaysMs
}

export function getOAuthConfig() {
  const clientId = process.env.THREADS_CLIENT_ID
  const clientSecret = process.env.THREADS_CLIENT_SECRET
  const redirectUri = process.env.THREADS_REDIRECT_URI

  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error('Missing Threads OAuth configuration')
  }

  return {
    clientId,
    clientSecret,
    redirectUri,
    scopes: ['threads_basic', 'threads_content_publish'] as const,
  }
}

export function buildAuthUrl(): string {
  const config = getOAuthConfig()
  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    scope: config.scopes.join(','),
    response_type: 'code',
  })

  return `https://www.threads.net/dialog/oauth?${params.toString()}`
}