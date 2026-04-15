// User types for Threads Scheduler

export interface UserProfile {
  id: string
  username: string
  displayName: string
  avatarUrl?: string
  isConnected: boolean
  connectedAt?: Date
}

export interface AccountConnection {
  isConnected: boolean
  user?: UserProfile
  accessToken?: string
  expiresAt?: Date
}
