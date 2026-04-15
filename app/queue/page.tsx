'use client'

import { useState, useEffect, useCallback } from 'react'
import { PageShell, PageHeader } from '@/components/PageShell'
import { Card, CardContent } from '@/components/ui/Card'
import { SegmentedControl } from '@/components/ui/SegmentedControl'
import { PostDetailSheet } from '@/components/ui/PostDetailSheet'
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

const statusConfig: Record<PostStatus, { label: string; className: string }> = {
  scheduled:  { label: 'Scheduled',  className: 'bg-link/10 text-link' },
  draft:      { label: 'Draft',      className: 'bg-surface-2 text-text-1 border border-border-1' },
  publishing: { label: 'Publishing', className: 'bg-surface-2 text-text-0 border border-border-1' },
  published:  { label: 'Published',  className: 'bg-surface-2 text-text-1 border border-border-1' },
  failed:     { label: 'Failed',     className: 'bg-surface-2 text-red-500 border border-border-1' },
}

function PostCard({ post, onClick }: { post: Post; onClick?: () => void }) {
  const status = statusConfig[post.status]

  return (
    <Card interactive className="mb-3" onClick={onClick}>
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
                <p className="text-xs text-red-500 mt-2">
                  {post.error}
                </p>
              )}
            </div>
            <span className={`shrink-0 px-2.5 py-1 text-[12px] font-semibold rounded-full ${status.className}`}>
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
        </div>
      </CardContent>
    </Card>
  )
}

function EmptyState({ filter }: { filter: FilterStatus }) {
  const messages: Record<FilterStatus, { title: string; sub: string }> = {
    all:        { title: 'No posts yet',          sub: 'Write your first thread to get started.' },
    scheduled:  { title: 'Nothing scheduled',     sub: 'Plan ahead — compose a post and pick a time.' },
    publishing: { title: 'Nothing publishing',    sub: 'Posts will appear here when going live.' },
    draft:      { title: 'No drafts saved',       sub: 'Start writing and your draft saves automatically.' },
    published:  { title: 'No published posts yet', sub: "Posts you've sent will appear here." },
    failed:     { title: 'No failed posts',       sub: 'All clear.' },
  }
  const { title, sub } = messages[filter]

  return (
    <div className="flex flex-col items-center justify-center py-24 px-8 animate-fade-in text-center">
      <div className="w-16 h-16 rounded-2xl bg-surface-2 border border-border-1 flex items-center justify-center mb-5">
        <svg className="w-8 h-8 text-text-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.25}
            d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
        </svg>
      </div>
      <p className="text-[17px] font-semibold text-text-0 mb-1">{title}</p>
      <p className="text-[14px] text-text-1 max-w-[240px]">{sub}</p>
    </div>
  )
}

export default function QueuePage() {
  const [filter, setFilter] = useState<FilterStatus>('all')
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)

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

  const handleUpdate = async (id: string, updates: { content?: string; scheduledAt?: Date }) => {
    try {
      const body: Record<string, unknown> = {}
      if (updates.content) body.content = updates.content
      if (updates.scheduledAt) body.scheduledAt = updates.scheduledAt.toISOString()
      await fetch(`/api/posts?id=${id}`, {
        method: 'PUT',
        body: JSON.stringify(body),
      })
      fetchPosts()
    } catch (e) {
      console.error('Update failed:', e)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/posts?id=${id}`, { method: 'DELETE' })
      fetchPosts()
    } catch (e) {
      console.error('Delete failed:', e)
    }
  }

  const sortedPosts = [...posts].sort((a, b) => {
    if (a.scheduledAt && b.scheduledAt) {
      return a.scheduledAt.getTime() - b.scheduledAt.getTime()
    }
    return b.createdAt.getTime() - a.createdAt.getTime()
  })

  const draftCount = posts.filter(p => p.status === 'draft').length

  return (
    <PageShell>
      <PageHeader title="Queue" />

      <div className="px-0">
        <SegmentedControl
          options={filterOptions}
          value={filter}
          onChange={(v) => setFilter(v as FilterStatus)}
        />
      </div>

      <div className="px-4 pb-6 pt-3">
        {filter === 'all' && draftCount > 0 && (
          <Card interactive className="mb-4" onClick={() => setFilter('draft')}>
            <CardContent className="p-4 flex items-center justify-between">
              <span className="text-[15px] text-text-0">
                {draftCount} draft{draftCount !== 1 ? 's' : ''} saved
              </span>
              <span className="text-[14px] font-semibold text-link">View Drafts →</span>
            </CardContent>
          </Card>
        )}

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="skeleton h-4 w-3/4 rounded mb-3" />
                  <div className="skeleton h-3 w-1/2 rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 px-4">
            <p className="text-red-500 text-[14px] mb-4">{error}</p>
            <button onClick={fetchPosts} className="text-link text-[14px] hover:underline">
              Retry
            </button>
          </div>
        ) : sortedPosts.length === 0 ? (
          <EmptyState filter={filter} />
        ) : (
          <div className="space-y-3">
            {sortedPosts.map(post => (
              <PostCard
                key={post.id}
                post={post}
                onClick={() => setSelectedPost(post)}
              />
            ))}
          </div>
        )}
      </div>

      <PostDetailSheet
        post={selectedPost}
        isOpen={!!selectedPost}
        onClose={() => setSelectedPost(null)}
        onUpdate={handleUpdate}
        onRetry={handleRetry}
        onDelete={handleDelete}
      />
    </PageShell>
  )
}
