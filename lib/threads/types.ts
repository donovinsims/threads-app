// Threads API Types

export interface ThreadsToken {
  accessToken: string
  tokenType: string
  expiresIn: number // seconds until expiration
}

export interface LongLivedToken extends ThreadsToken {
  // Long-lived tokens are valid for 60 days (5184000 seconds)
  refreshable: boolean
}

export interface ThreadsUser {
  id: string
  name?: string
  username?: string
}

export interface ThreadsMediaContainer {
  id: string
}

export interface ThreadsPost {
  id: string
  text: string
  mediaType: 'TEXT' | 'IMAGE' | 'VIDEO'
  creationId?: string
  permalink?: string
  timestamp?: string
}

export interface CreatePostInput {
  text: string
  mediaType?: 'TEXT' | 'IMAGE' | 'VIDEO'
  imageUrl?: string
  videoUrl?: string
}

export interface CreateThreadInput {
  posts: CreatePostInput[]
}

export interface TextAttachment {
  plaintext: string
  linkAttachmentUrl?: string
  textWithStylingInfo?: TextStylingInfo[]
}

export interface TextStylingInfo {
  offset: number
  length: number
  stylingInfo: ('bold' | 'italic' | 'highlight' | 'underline' | 'strikethrough')[]
}

export interface PublishResponse {
  id: string
}

// API Error types
export interface ThreadsApiError {
  error: {
    message: string
    type: string
    code: number
    fbtrace_id?: string
  }
}

// Session data stored in cookie
export interface ThreadsSession {
  accessToken: string
  expiresAt: number // Unix timestamp in milliseconds
  userId: string
  userName?: string
}

// OAuth configuration
export interface OAuthConfig {
  clientId: string
  clientSecret: string
  redirectUri: string
  scopes: string[]
}

export const DEFAULT_SCOPES = ['threads_basic', 'threads_content_publish'] as const

// API endpoints
export const API_BASE_URL = 'https://graph.threads.net/v1.0'
export const AUTH_BASE_URL = 'https://graph.threads.net'
export const DIALOG_OAUTH_URL = 'https://www.threads.net/dialog/oauth'