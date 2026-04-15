// Post and Draft types for Threads Scheduler

export type PostStatus = 'draft' | 'scheduled' | 'publishing' | 'published' | 'failed'

export interface Post {
  id: string
  content: string
  threadOrder?: number
  status: PostStatus
  scheduledAt?: Date
  publishedAt?: Date
  createdAt: Date
  updatedAt: Date
  retryCount?: number
  error?: string
  threadsPostId?: string
}

export interface Draft {
  id: string
  posts: DraftPost[]
  savedAt: Date
}

export interface DraftPost {
  content: string
  threadOrder: number
}

export interface CreatePostInput {
  content: string
  scheduledAt?: Date
}

export interface UpdatePostInput {
  content?: string
  scheduledAt?: Date
  status?: PostStatus
  threadsPostId?: string
  retryCount?: number
  error?: string
  publishedAt?: Date
}
