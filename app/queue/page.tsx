'use client'

import { useState, useEffect, useCallback } from 'react'
import { PageShell, PageHeader } from '@/components/PageShell'
import { Card, CardContent } from '@/components/ui/Card'
import { SegmentedControl } from '@/components/ui/SegmentedControl'
import { formatScheduledTime, formatFullDate } from '@/lib/mock-data'
import type { Post, PostStatus } from '@/types/post'

type FilterStatus = 'all' | PostStatus

const filterOptions = [
  { value: 'all', label: 'All' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'publishing', label: 'Publishing' },
  { value: 'draft', label: 'Drafts' },
  { value: 'published', label: 'Published' },
  { value: 'failed', label: 'Failed' },
]

const statusConfig: Record<PostStatus, { bg: string; text: string; label: string }> = {
  scheduled: { bg: 'bg-[#e0f0ff] dark:bg-[#1a2a3a]', text: 'text-[#0066cc] dark:text-[#4da3ff]', label: 'Scheduled' },
  draft: { bg: 'bg-surface-2', text: 'text-text-1', label: 'Draft' },
  publishing: { bg: 'bg-[#fff8e0] dark:bg-[#3a2a1a]', text: 'text-[#996600] dark:text-[#ffcc00]', label: 'Publishing' },
  published: { bg: 'bg-[#e0ffe0] dark:bg-[#1a3a1a]', text: 'text-[#009900] dark:text-[#4dff4d]', label: 'Published' },
  failed: { bg: 'bg-[#ffe0e0] dark:bg-[#3a1a1a]', text: 'text-[#cc0000] dark:text-[#ff4d4d]', label: 'Failed' },
}

function PostCard({ post, onRetry }: { post: Post; onRetry?: (id: string) => void }) {
  const status = statusConfig[post.status]
  
  return (
    <Card interactive className="mb-3">
      <CardContent className="p-4">
        <div className="flex flex-col gap-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              {post.threadOrder !== undefined && (
                <span className="text-xs text-text-2 font-medium mb-1 block">
                  Part {post.threadOrder + 1}
                </span>
              )}
              <p className="text-text-0 text-[17px] leading-relaxed whitespace-pre-wrap break-words">
                {post.content}
              </p>
              {post.status === 'failed' && post.error && (
                <p className="text-xs text-red-600 dark:text-red-400 mt-2">
                  {post.error}
                </p>
              )}
            </div>
            <span className={`shrink-0 px-2.5 py-1 text-xs font-semibold rounded-full ${status.bg} ${status.text}`}>
              {status.label}
            </span>
          </div>
          
          <div className="flex items-center gap-4 text-[13px] text-text-1">
            {post.scheduledAt && (
              <div className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-text-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-medium" title={formatFullDate(post.scheduledAt)}>
                  {formatScheduledTime(post.scheduledAt)}
                </span>
              </div>
            )}
            {post.publishedAt && (
              <div className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-text-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
                </svg>
                <span className="font-medium">{formatFullDate(post.publishedAt)}</span>
              </div>
            )}
            {post.retryCount !== undefined && post.retryCount > 0 && (
              <span className="text-text-2">
                Retry #{post.retryCount}
              </span>
            )}
          </div>
          
          {post.status === 'failed' && onRetry && (
            <button
              onClick={() => onRetry(post.id)}
              className="text-sm text-link hover:underline"
            >
              Retry
            </button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function EmptyState({ filter }: { filter: FilterStatus }) {
  const messages: Record<FilterStatus, string> = {
    all: 'No posts yet. Start composing!',
    scheduled: 'No scheduled posts. Time to plan ahead.',
    publishing: 'No posts currently publishing.',
    draft: 'No drafts. Your ideas await.',
    published: 'No published posts yet.',
    failed: 'No failed posts.',
  }

  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 animate-fade-in">
      <svg className="w-20 h-20 text-text-2 mb-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      <p className="text-[17px] text-text-1 text-center">{messages[filter]}</p>
    </div>
  )
}

export default function QueuePage() {
  const [filter, setFilter] = useState<FilterStatus>('all')
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPosts = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = filter === 'all' ? '' : `?status=${filter}`
      const res = await fetch(`/api/posts${params}`)
      const data = await res.json()
      if (data.error) {
        setError(data.error)
      } else {
        setPosts(data.posts || [])
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to fetch posts')
    } finally {
      setLoading(false)
    }
  }, [filter])

  useEffect(() => {
    fetchPosts()
  }, [fetchPosts])

  const handleRetry = async (id: string) => {
    try {
      await fetch(`/api/posts?id=${id}`, {
        method: 'PUT',
        body: JSON.stringify({ status: 'scheduled' }),
      })
      fetchPosts()
    } catch (e) {
      console.error('Retry failed:', e)
    }
  }

  const sortedPosts = [...posts].sort((a, b) => {
    if (a.scheduledAt && b.scheduledAt) {
      return a.scheduledAt.getTime() - b.scheduledAt.getTime()
    }
    return b.createdAt.getTime() - a.createdAt.getTime()
  })

  return (
    <PageShell>
      <PageHeader title="Queue" />
      
      <div className="px-4 py-3">
        <SegmentedControl
          options={filterOptions}
          value={filter}
          onChange={(v) => setFilter(v as FilterStatus)}
        />
      </div>

      <div className="px-4 pb-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <span className="text-text-1">Loading...</span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 px-4">
            <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
            <button onClick={fetchPosts} className="text-link hover:underline">
              Retry
            </button>
          </div>
        ) : sortedPosts.length === 0 ? (
          <EmptyState filter={filter} />
        ) : (
          <div className="space-y-3">
            {sortedPosts.map(post => (
              <PostCard key={post.id} post={post} onRetry={handleRetry} />
            ))}
          </div>
        )}
      </div>
    </PageShell>
  )
}
