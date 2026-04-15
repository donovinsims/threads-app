// Post and Draft types for Threads Scheduler

export type PostStatus = 'draft' | 'scheduled' | 'publishing' | 'published' | 'failed'

export type MediaType = 'image' | 'video'

export interface Media {
  id: string
  type: MediaType
  url: string
  width?: number
  height?: number
  duration?: number // video only, in seconds
  blobPath?: string
}

export interface Post {
  id: string
  content: string
  media?: Media[]
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
  media?: Media[]
  threadOrder: number
}

export interface CreatePostInput {
  content: string
  media?: Media[]
  scheduledAt?: Date
}

export interface UpdatePostInput {
  content?: string
  media?: Media[]
  scheduledAt?: Date
  status?: PostStatus
  threadsPostId?: string
  retryCount?: number
  error?: string
  publishedAt?: Date
}
