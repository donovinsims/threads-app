import { getSession, setSession, clearSession, getAccessToken, getOAuthConfig } from '@/lib/auth/session'
import {
  API_BASE_URL,
  type ThreadsSession,
  type ThreadsUser,
  type ThreadsPost,
  type ThreadsMediaContainer,
  type CreatePostInput,
  type PublishResponse,
  type ThreadsApiError,
} from './types'

async function fetchThreadsApi<T>(
  endpoint: string,
  options: RequestInit & { params?: Record<string, string> }
): Promise<T> {
  const accessToken = await getAccessToken()
  if (!accessToken) {
    throw new Error('Not authenticated')
  }

  const { params, ...fetchOptions } = options
  const url = new URL(endpoint, API_BASE_URL)

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value)
    })
  }

  const response = await fetch(url.toString(), {
    ...fetchOptions,
    headers: {
      'Content-Type': 'application/json',
      ...fetchOptions.headers,
    },
  })

  if (!response.ok) {
    const error = (await response.json()) as ThreadsApiError
    throw new Error(error.error?.message || `API error: ${response.status}`)
  }

  return response.json() as Promise<T>
}

async function getUserProfile(): Promise<ThreadsUser> {
  return fetchThreadsApi<ThreadsUser>('/me', {
    params: { fields: 'id,name,username' },
  })
}

async function createMediaContainer(
  userId: string,
  input: CreatePostInput
): Promise<ThreadsMediaContainer> {
  const body: Record<string, string | undefined> = {
    media_type: input.mediaType || 'TEXT',
  }

  if (input.text) {
    body.text = input.text.slice(0, 500)
  }
  if (input.imageUrl) {
    body.image_url = input.imageUrl
  }
  if (input.videoUrl) {
    body.video_url = input.videoUrl
  }

  const cleanBody = Object.fromEntries(
    Object.entries(body).filter(([, v]) => v !== undefined)
  )

  return fetchThreadsApi<ThreadsMediaContainer>(`/${userId}/threads`, {
    method: 'POST',
    body: JSON.stringify(cleanBody),
  })
}

async function publishContainer(
  userId: string,
  creationId: string
): Promise<PublishResponse> {
  return fetchThreadsApi<PublishResponse>(`/${userId}/threads_publish`, {
    method: 'POST',
    params: { creation_id: creationId },
  })
}

async function exchangeForLongLivedToken(
  shortLivedToken: string
): Promise<{ access_token: string; token_type: string; expires_in: number }> {
  const config = getOAuthConfig()

  const url = new URL('https://graph.threads.net/access_token')
  url.searchParams.set('grant_type', 'th_exchange_token')
  url.searchParams.set('client_secret', config.clientSecret)
  url.searchParams.set('access_token', shortLivedToken)

  const response = await fetch(url.toString())

  if (!response.ok) {
    const error = (await response.json()) as ThreadsApiError
    throw new Error(error.error?.message || 'Token exchange failed')
  }

  return response.json() as Promise<{ access_token: string; token_type: string; expires_in: number }>
}

async function refreshToken(
  currentToken: string
): Promise<{ access_token: string; token_type: string; expires_in: number }> {
  const url = new URL('https://graph.threads.net/refresh_access_token')
  url.searchParams.set('grant_type', 'th_refresh_token')
  url.searchParams.set('access_token', currentToken)

  const response = await fetch(url.toString())

  if (!response.ok) {
    const error = (await response.json()) as ThreadsApiError
    throw new Error(error.error?.message || 'Token refresh failed')
  }

  return response.json() as Promise<{ access_token: string; token_type: string; expires_in: number }>
}

export async function connect(): Promise<void> {
  const authUrl = new URL('https://www.threads.net/dialog/oauth')
  const config = getOAuthConfig()

  authUrl.searchParams.set('client_id', config.clientId)
  authUrl.searchParams.set('redirect_uri', config.redirectUri)
  authUrl.searchParams.set('scope', config.scopes.join(','))
  authUrl.searchParams.set('response_type', 'code')

  throw new Error(`OAuth flow required. Redirect user to: ${authUrl.toString()}`)
}

export async function disconnect(): Promise<void> {
  await clearSession()
}

export async function isConnected(): Promise<boolean> {
  try {
    const session = await getSession()
    return session !== null && session.expiresAt > Date.now()
  } catch {
    return false
  }
}

export async function getProfile(): Promise<ThreadsUser> {
  return getUserProfile()
}

export async function createPost(content: string): Promise<ThreadsPost> {
  const session = await getSession()
  if (!session) {
    throw new Error('Not authenticated')
  }

  const container = await createMediaContainer(session.userId, {
    text: content.slice(0, 500),
    mediaType: 'TEXT',
  })

  await new Promise((resolve) => setTimeout(resolve, 30000))

  const published = await publishContainer(session.userId, container.id)

  return {
    id: published.id,
    text: content,
    mediaType: 'TEXT',
    creationId: container.id,
  }
}

export async function schedulePost(
  content: string,
  scheduledAt: Date
): Promise<ThreadsPost> {
  const session = await getSession()
  if (!session) {
    throw new Error('Not authenticated')
  }

  const container = await createMediaContainer(session.userId, {
    text: content.slice(0, 500),
    mediaType: 'TEXT',
  })

  return {
    id: container.id,
    text: content,
    mediaType: 'TEXT',
    creationId: container.id,
    timestamp: scheduledAt.toISOString(),
  }
}

export async function createThread(posts: string[]): Promise<ThreadsPost[]> {
  const session = await getSession()
  if (!session) {
    throw new Error('Not authenticated')
  }

  const publishedPosts: ThreadsPost[] = []

  for (const text of posts) {
    const container = await createMediaContainer(session.userId, {
      text: text.slice(0, 500),
      mediaType: 'TEXT',
    })

    await new Promise((resolve) => setTimeout(resolve, 30000))

    const published = await publishContainer(session.userId, container.id)

    publishedPosts.push({
      id: published.id,
      text,
      mediaType: 'TEXT',
      creationId: container.id,
    })
  }

  return publishedPosts
}

export async function scheduleThread(
  posts: string[],
  scheduledAt: Date
): Promise<ThreadsPost[]> {
  const session = await getSession()
  if (!session) {
    throw new Error('Not authenticated')
  }

  return posts.map((text, index) => ({
    id: `scheduled_${index}`,
    text: text.slice(0, 500),
    mediaType: 'TEXT',
    timestamp: scheduledAt.toISOString(),
  }))
}

export async function refreshSession(): Promise<void> {
  const session = await getSession()
  if (!session) return

  try {
    const refreshed = await refreshToken(session.accessToken)
    await setSession({
      ...session,
      accessToken: refreshed.access_token,
      expiresAt: Date.now() + refreshed.expires_in * 1000,
    })
  } catch {
    await clearSession()
  }
}

export async function exchangeCodeForToken(
  code: string
): Promise<ThreadsSession> {
  const config = getOAuthConfig()

  const tokenUrl = new URL('https://graph.threads.net/v1.0/oauth/access_token')
  tokenUrl.searchParams.set('client_id', config.clientId)
  tokenUrl.searchParams.set('client_secret', config.clientSecret)
  tokenUrl.searchParams.set('redirect_uri', config.redirectUri)
  tokenUrl.searchParams.set('code', code)
  tokenUrl.searchParams.set('grant_type', 'authorization_code')

  const response = await fetch(tokenUrl.toString())

  if (!response.ok) {
    const error = (await response.json()) as ThreadsApiError
    throw new Error(error.error?.message || 'Token exchange failed')
  }

  const shortLived = (await response.json()) as {
    access_token: string
    token_type: string
    expires_in: number
  }

  const longLived = await exchangeForLongLivedToken(shortLived.access_token)

  const profile = await fetchThreadsApi<ThreadsUser>('/me', {
    params: { access_token: longLived.access_token, fields: 'id,name,username' },
  })

  const session: ThreadsSession = {
    accessToken: longLived.access_token,
    expiresAt: Date.now() + longLived.expires_in * 1000,
    userId: profile.id,
    userName: profile.name,
  }

  await setSession(session)
  return session
}

export type { CreatePostInput }
export type { ThreadsUser as UserProfile }
export type { ThreadsPost as Post }