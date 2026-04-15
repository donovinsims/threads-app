import { promises as fs } from 'fs'
import { join } from 'path'
import type { Post, PostStatus, CreatePostInput, UpdatePostInput } from '@/types/post'

const DATA_FILE = join(process.cwd(), '.posts-data.json')
const MAX_RETRIES = 3

interface PostsData {
  posts: Post[]
}

async function readData(): Promise<PostsData> {
  try {
    const content = await fs.readFile(DATA_FILE, 'utf-8')
    return JSON.parse(content)
  } catch {
    return { posts: [] }
  }
}

async function writeData(data: PostsData): Promise<void> {
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2))
}

function serializePost(post: Post): Post {
  return {
    ...post,
    scheduledAt: post.scheduledAt ? new Date(post.scheduledAt) : undefined,
    publishedAt: post.publishedAt ? new Date(post.publishedAt) : undefined,
    createdAt: new Date(post.createdAt),
    updatedAt: new Date(post.updatedAt),
  }
}

export async function serverGetAll(): Promise<Post[]> {
  const data = await readData()
  return data.posts.map(serializePost)
}

export async function serverGetById(id: string): Promise<Post | null> {
  const posts = await serverGetAll()
  return posts.find(p => p.id === id) || null
}

export async function serverCreate(input: CreatePostInput): Promise<Post> {
  const data = await readData()
  const now = new Date()
  const post: Post = {
    id: crypto.randomUUID(),
    content: input.content,
    status: input.scheduledAt ? 'scheduled' : 'draft',
    scheduledAt: input.scheduledAt ? new Date(input.scheduledAt) : undefined,
    createdAt: now,
    updatedAt: now,
    retryCount: 0,
  }
  data.posts.push(post)
  await writeData(data)
  return post
}

export async function serverUpdate(id: string, input: UpdatePostInput): Promise<Post> {
  const data = await readData()
  const existing = data.posts.find(p => p.id === id)
  if (!existing) {
    throw new Error('Post not found')
  }
  const updated: Post = {
    id: existing.id,
    content: input.content ?? existing.content,
    status: input.status ?? existing.status,
    scheduledAt: input.scheduledAt ? new Date(input.scheduledAt) : existing.scheduledAt,
    publishedAt: existing.publishedAt,
    createdAt: existing.createdAt,
    updatedAt: new Date(),
    retryCount: input.retryCount ?? existing.retryCount,
    error: input.error,
    threadsPostId: input.threadsPostId,
    threadOrder: existing.threadOrder,
  }
  data.posts = data.posts.map(p => p.id === id ? updated : p)
  await writeData(data)
  return updated
}

export async function serverDelete(id: string): Promise<void> {
  const data = await readData()
  data.posts = data.posts.filter(p => p.id !== id)
  await writeData(data)
}

export async function serverGetDue(): Promise<Post[]> {
  const posts = await serverGetAll()
  const now = new Date()
  return posts.filter(p => {
    if (p.status !== 'scheduled') return false
    if (!p.scheduledAt) return false
    return new Date(p.scheduledAt) <= now
  })
}

export async function serverGetByStatus(status: PostStatus): Promise<Post[]> {
  const posts = await serverGetAll()
  return posts.filter(p => p.status === status)
}

export async function serverMarkPublishing(id: string): Promise<Post> {
  return serverUpdate(id, { status: 'publishing' })
}

export async function serverMarkPublished(id: string, threadsPostId: string): Promise<Post> {
  return serverUpdate(id, {
    status: 'published',
    threadsPostId,
    publishedAt: new Date(),
  })
}

export async function serverMarkFailed(id: string, error: string): Promise<Post> {
  const post = await serverGetById(id)
  const retryCount = (post?.retryCount || 0) + 1
  if (retryCount >= MAX_RETRIES) {
    return serverUpdate(id, {
      status: 'failed',
      error,
      retryCount,
    })
  }
  return serverUpdate(id, {
    status: 'scheduled',
    error,
    retryCount,
  })
}