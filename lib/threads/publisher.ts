import { getSession } from '@/lib/auth/session'
import * as serverStorage from '@/lib/server-storage'
import type { Post } from '@/types/post'

export interface PublishResult {
  success: boolean
  postId: string
  threadsPostId?: string
  error?: string
}

async function publishToThreads(post: Post): Promise<{ threadsPostId: string }> {
  const session = await getSession()
  if (!session) {
    throw new Error('Not authenticated')
  }

  const hasMedia = post.media && post.media.length > 0
  const firstMedia = post.media?.[0]

  const containerBody: Record<string, string> = {
    text: post.content.slice(0, 500),
  }

  if (hasMedia && firstMedia) {
    if (firstMedia.type === 'image') {
      containerBody.media_type = 'IMAGE'
      containerBody.image_url = firstMedia.url
    } else if (firstMedia.type === 'video') {
      containerBody.media_type = 'VIDEO'
      containerBody.video_url = firstMedia.url
    }
  } else {
    containerBody.media_type = 'TEXT'
  }

  const containerRes = await fetch(`https://graph.threads.net/v1.0/${session.userId}/threads`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...containerBody,
      access_token: session.accessToken,
    }),
  })

  if (!containerRes.ok) {
    const err = await containerRes.json()
    throw new Error(err.error?.message || 'Failed to create container')
  }

  const container = await containerRes.json() as { id: string }

  await new Promise(r => setTimeout(r, 30000))

  const publishRes = await fetch(
    `https://graph.threads.net/v1.0/${session.userId}/threads_publish?creation_id=${container.id}&access_token=${session.accessToken}`,
    { method: 'POST' }
  )

  if (!publishRes.ok) {
    const err = await publishRes.json()
    throw new Error(err.error?.message || 'Failed to publish')
  }

  const published = await publishRes.json() as { id: string }
  return { threadsPostId: published.id }
}

export async function publishPost(post: Post): Promise<PublishResult> {
  try {
    if (post.threadsPostId) {
      return {
        success: true,
        postId: post.id,
        threadsPostId: post.threadsPostId,
      }
    }

    const result = await publishToThreads(post)
    await serverStorage.serverMarkPublished(post.id, result.threadsPostId)

    return {
      success: true,
      postId: post.id,
      threadsPostId: result.threadsPostId,
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    await serverStorage.serverMarkFailed(post.id, message)

    return {
      success: false,
      postId: post.id,
      error: message,
    }
  }
}

export async function processDuePosts(): Promise<PublishResult[]> {
  const duePosts = await serverStorage.serverGetDue()
  const results: PublishResult[] = []

  for (const post of duePosts) {
    await serverStorage.serverMarkPublishing(post.id)
    const result = await publishPost(post)
    results.push(result)
  }

  return results
}