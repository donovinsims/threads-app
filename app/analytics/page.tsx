'use client'

import { useState, useEffect } from 'react'
import { PageShell, PageHeader } from '@/components/PageShell'
import { Card, CardContent } from '@/components/ui/Card'
import type { AnalyticsPeriod, RealMetrics, DerivedMetrics } from '@/types/analytics'

type Range = '7d' | '14d' | '30d'

function formatNum(n: number | null): string {
  if (n === null) return '—'
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k'
  return n.toString()
}

function Delta({ current, previous }: { current: number | null; previous: number | null }) {
  if (previous === null || previous === 0 || current === null) {
    return <span className="text-text-1 text-[13px]">—</span>
  }
  const pct = Math.round(((current - previous) / previous) * 100)
  const isPositive = pct >= 0
  return (
    <span className={`text-[13px] font-medium ${isPositive ? 'text-link' : 'text-red-500'}`}>
      {isPositive ? '+' : ''}{pct}%
    </span>
  )
}

function KPICard({ label, value, previous, source }: { label: string; value: number | null; previous?: number | null; source: 'real' | 'derived' | 'unavailable' }) {
  const displayValue = source === 'unavailable' ? null : value
  return (
    <Card className="flex-1 min-w-0">
      <CardContent className="p-4">
        <p className="text-[13px] text-text-1 mb-1">{label}</p>
        <p className="text-[28px] font-bold text-text-0 leading-none">{formatNum(displayValue)}</p>
        <div className="mt-2">
          <Delta current={value} previous={previous ?? null} />
        </div>
        {source === 'unavailable' && (
          <p className="text-[10px] text-text-2 mt-1">Unavailable</p>
        )}
      </CardContent>
    </Card>
  )
}

function StreakCard({ streak, posts }: { streak: number; posts: number }) {
  const goal = 7
  const pct = Math.min((streak / goal) * 100, 100)
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-[13px] text-text-1 mb-0.5">Current Streak</p>
            <p className="text-[32px] font-bold text-text-0 leading-none">{streak}</p>
            <p className="text-[13px] text-text-1 mt-0.5">days</p>
          </div>
          <div className="text-right">
            <p className="text-[13px] text-text-1">Period Posts</p>
            <p className="text-[20px] font-semibold text-text-0">{posts}</p>
          </div>
        </div>
        <div className="h-2 bg-surface-2 rounded-full overflow-hidden">
          <div
            className="h-full bg-link rounded-full transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="text-[12px] text-text-1 mt-2">{pct.toFixed(0)}% to goal</p>
      </CardContent>
    </Card>
  )
}

function RangeSelector({ value, onChange }: { value: Range; onChange: (r: Range) => void }) {
  const options: Range[] = ['7d', '14d', '30d']
  return (
    <div className="flex bg-surface-2 rounded-full p-0.5">
      {options.map(opt => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          className={`
            px-3 py-1.5 text-[12px] font-semibold rounded-full transition-spring pressable
            ${value === opt ? 'bg-surface-0 text-text-0 shadow-sm' : 'text-text-1'}
          `}
        >
          {opt}
        </button>
      ))}
    </div>
  )
}

function SkeletonCard() {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="skeleton h-3 w-16 rounded mb-2" />
        <div className="skeleton h-8 w-20 rounded mb-2" />
        <div className="skeleton h-3 w-10 rounded" />
      </CardContent>
    </Card>
  )
}

interface AnalyticsResponse {
  period: AnalyticsPeriod
  generatedAt: string
  real: RealMetrics
  derived: DerivedMetrics
  warnings: string[]
  unavailable: string[]
  error?: string
}

export default function AnalyticsPage() {
  const [range, setRange] = useState<Range>('7d')
  const [data, setData] = useState<AnalyticsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchAnalytics() {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`/api/analytics?period=${range}`)
        const json = await res.json()
        if (json.error) {
          setError(json.error)
        } else {
          setData(json)
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to fetch analytics')
      } finally {
        setLoading(false)
      }
    }
    fetchAnalytics()
  }, [range])

  const available = data && !error

  return (
    <PageShell>
      <PageHeader
        title="Analytics"
        action={<RangeSelector value={range} onChange={setRange} />}
      />

      <div className="px-4 pb-6 space-y-4 animate-fade-in">
        {error && (
          <Card>
            <CardContent className="p-4">
              <p className="text-[14px] text-red-500">{error}</p>
              <p className="text-[12px] text-text-1 mt-1">Using available local data only.</p>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-2 gap-3">
          {loading ? (
            <>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </>
          ) : available ? (
            <>
              <KPICard label="Views" value={data.real.views} source="real" />
              <KPICard label="Likes" value={null} source="unavailable" />
              <KPICard label="Replies" value={data.real.replies} source="real" />
              <KPICard label="Reposts" value={data.real.reposts} source="real" />
            </>
          ) : (
            <>
              <KPICard label="Views" value={null} source="unavailable" />
              <KPICard label="Likes" value={null} source="unavailable" />
              <KPICard label="Replies" value={null} source="unavailable" />
              <KPICard label="Reposts" value={null} source="unavailable" />
            </>
          )}
        </div>

        {loading ? (
          <Card><CardContent className="p-5"><div className="skeleton h-16 w-full rounded" /></CardContent></Card>
        ) : available ? (
          <StreakCard streak={data.derived.postingStreak} posts={data.derived.postsPublished} />
        ) : (
          <StreakCard streak={0} posts={0} />
        )}

        {data?.warnings && data.warnings.length > 0 && (
          <Card>
            <CardContent className="p-4">
              <p className="text-[11px] font-semibold text-text-2 uppercase tracking-wider mb-2">Notices</p>
              {data.warnings.map((w, i) => (
                <p key={i} className="text-[12px] text-text-1">{w}</p>
              ))}
            </CardContent>
          </Card>
        )}

        {(!available || data?.real.dataAvailable === false) && (
          <Card>
            <CardContent className="p-8 flex flex-col items-center justify-center text-center">
              <svg className="w-10 h-10 text-text-2 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3v18h18" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 14l4-4 4 4 5-5" />
              </svg>
              <p className="text-[15px] font-semibold text-text-0 mb-1">Limited Metrics Available</p>
              <p className="text-[13px] text-text-1 max-w-[220px]">
                Connect your Threads account and ensure analytics permissions are granted for full engagement data.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </PageShell>
  )
}