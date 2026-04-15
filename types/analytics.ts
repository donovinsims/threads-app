// Shared analytics types for threads-app

export type AnalyticsPeriod = '7d' | '14d' | '30d'

export interface RealMetrics {
  views: number | null
  likes: number | null
  replies: number | null
  reposts: number | null
  quotes: number | null
  followersCount: number | null
  dataAvailable: boolean
  permissionAvailable: boolean
}

export interface DerivedMetrics {
  postingStreak: number
  postsPublished: number
}

export interface AnalyticsData {
  period: AnalyticsPeriod
  generatedAt: string
  real: RealMetrics
  derived: DerivedMetrics
  warnings: string[]
  unavailable: string[]
}

export type MetricSource = 'real' | 'derived' | 'unavailable'

export interface MetricDisplay {
  key: keyof RealMetrics | keyof DerivedMetrics
  label: string
  source: MetricSource
  value: number | null
  description: string
}
