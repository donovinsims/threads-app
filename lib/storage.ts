import type { Post, PostStatus, CreatePostInput, UpdatePostInput } from '@/types/post'

const POSTS_KEY = 'threads-app-posts'
const MAX_RETRIES = 3

function serializePost(post: Post): Post {
  return {
    ...post,
    scheduledAt: post.scheduledAt ? new Date(post.scheduledAt) : undefined,
    publishedAt: post.publishedAt ? new Date(post.publishedAt) : undefined,
    createdAt: new Date(post.createdAt),
    updatedAt: new Date(post.updatedAt),
  }
}

export async function getAll(): Promise<Post[]> {
  if (typeof window === 'undefined') return []
  try {
    const stored = localStorage.getItem(POSTS_KEY)
    if (!stored) return []
    const parsed = JSON.parse(stored) as Post[]
    return parsed.map(serializePost)
  } catch {
    return []
  }
}

async function saveAll(posts: Post[]): Promise<void> {
  if (typeof window === 'undefined') return
  localStorage.setItem(POSTS_KEY, JSON.stringify(posts))
}

export async function getById(id: string): Promise<Post | null> {
  const posts = await getAll()
  return posts.find(p => p.id === id) || null
}

export async function create(input: CreatePostInput): Promise<Post> {
  const posts = await getAll()
  const now = new Date()
  const post: Post = {
    id: crypto.randomUUID(),
    content: input.content,
    media: input.media,
    status: input.scheduledAt ? 'scheduled' : 'draft',
    scheduledAt: input.scheduledAt ? new Date(input.scheduledAt) : undefined,
    createdAt: now,
    updatedAt: now,
    retryCount: 0,
  }
  posts.push(post)
  await saveAll(posts)
  return post
}

export async function update(id: string, input: UpdatePostInput): Promise<Post> {
  const posts = await getAll()
  const existing = posts.find(p => p.id === id)
  if (!existing) {
    throw new Error('Post not found')
  }
  const updated: Post = {
    id: existing.id,
    content: input.content ?? existing.content,
    media: input.media ?? existing.media,
    status: input.status ?? existing.status,
    scheduledAt: input.scheduledAt ? new Date(input.scheduledAt) : existing.scheduledAt,
    publishedAt: input.publishedAt ?? existing.publishedAt,
    createdAt: existing.createdAt,
    updatedAt: new Date(),
    retryCount: input.retryCount ?? existing.retryCount,
    error: input.error,
    threadsPostId: input.threadsPostId,
    threadOrder: existing.threadOrder,
  }
  const newPosts = posts.map(p => p.id === id ? updated : p)
  await saveAll(newPosts)
  return updated
}

export async function deletePost(id: string): Promise<void> {
  const posts = await getAll()
  const filtered = posts.filter(p => p.id !== id)
  await saveAll(filtered)
}

export async function getDue(): Promise<Post[]> {
  const posts = await getAll()
  const now = new Date()
  return posts.filter(p => {
    if (p.status !== 'scheduled') return false
    if (!p.scheduledAt) return false
    return new Date(p.scheduledAt) <= now
  })
}

export async function getByStatus(status: PostStatus): Promise<Post[]> {
  const posts = await getAll()
  return posts.filter(p => p.status === status)
}

export async function markPublishing(id: string): Promise<Post> {
  return update(id, { status: 'publishing' })
}

export async function markPublished(id: string, threadsPostId: string): Promise<Post> {
  return update(id, {
    status: 'published',
    threadsPostId,
    publishedAt: new Date(),
  })
}

export async function markFailed(id: string, error: string): Promise<Post> {
  const post = await getById(id)
  const retryCount = (post?.retryCount || 0) + 1
  if (retryCount >= MAX_RETRIES) {
    return update(id, {
      status: 'failed',
      error,
      retryCount,
    })
  }
  return update(id, {
    status: 'scheduled',
    error,
    retryCount,
  })
}