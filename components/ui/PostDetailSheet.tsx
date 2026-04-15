'use client'

import { useState, useEffect, useCallback } from 'react'
import { BottomSheet } from './BottomSheet'
import { Button } from './Button'
import { Card, CardContent } from './Card'
import { Input } from './Input'
import { formatFullDate } from '@/lib/mock-data'
import type { Post, PostStatus, Media } from '@/types/post'

interface PostDetailSheetProps {
  post: Post | null
  isOpen: boolean
  onClose: () => void
  onUpdate?: (id: string, updates: { content?: string; scheduledAt?: Date }) => Promise<void>
  onRetry?: (id: string) => Promise<void>
  onDelete?: (id: string) => Promise<void>
}

const statusLabels: Record<PostStatus, string> = {
  draft: 'Draft',
  scheduled: 'Scheduled',
  publishing: 'Publishing',
  published: 'Published',
  failed: 'Failed',
}

const statusDescriptions: Record<PostStatus, string> = {
  draft: 'This post is saved but not scheduled.',
  scheduled: 'This post will publish automatically.',
  publishing: 'This post is currently being published.',
  published: 'This post is live on Threads.',
  failed: 'Publishing failed. Tap to retry.',
}

export function PostDetailSheet({
  post,
  isOpen,
  onClose,
  onUpdate,
  onRetry,
  onDelete,
}: PostDetailSheetProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState('')
  const [editScheduledAt, setEditScheduledAt] = useState('')
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [showMediaViewer, setShowMediaViewer] = useState(false)
  const [mediaIndex, setMediaIndex] = useState(0)

  // Reset edit state when post changes
  useEffect(() => {
    if (post) {
      setEditContent(post.content)
      setEditScheduledAt(post.scheduledAt ? new Date(post.scheduledAt).toISOString().slice(0, 16) : '')
      setIsEditing(false)
    }
  }, [post])

  const canEdit = post && (post.status === 'draft' || post.status === 'scheduled')
  const canRetry = post && post.status === 'failed'
  const canDelete = post && post.status !== 'publishing'
  const isLocked = post && (post.status === 'published' || post.status === 'publishing')

  const handleSave = useCallback(async () => {
    if (!post || !onUpdate || !editContent.trim()) return
    setSaving(true)
    try {
      const updates: { content: string; scheduledAt?: Date } = { content: editContent.trim() }
      if (editScheduledAt) {
        updates.scheduledAt = new Date(editScheduledAt)
      }
      await onUpdate(post.id, updates)
      setIsEditing(false)
    } finally {
      setSaving(false)
    }
  }, [post, onUpdate, editContent, editScheduledAt])

  const handleRetry = useCallback(async () => {
    if (!post || !onRetry) return
    setSaving(true)
    try {
      await onRetry(post.id)
    } finally {
      setSaving(false)
    }
  }, [post, onRetry])

  const handleDelete = useCallback(async () => {
    if (!post || !onDelete || !confirm('Delete this post?')) return
    setDeleting(true)
    try {
      await onDelete(post.id)
      onClose()
    } finally {
      setDeleting(false)
    }
  }, [post, onDelete, onClose])

  const handleCancelEdit = useCallback(() => {
    if (post) {
      setEditContent(post.content)
      setEditScheduledAt(post.scheduledAt ? new Date(post.scheduledAt).toISOString().slice(0, 16) : '')
    }
    setIsEditing(false)
  }, [post])

  const renderMedia = (media: Media[], size: 'thumb' | 'full') => {
    if (!media?.length) return null
    if (size === 'thumb') {
      return (
        <div className="flex gap-2 mt-3">
          {media.map((m, i) => (
            <div
              key={m.id || i}
              className="w-16 h-16 rounded-lg overflow-hidden bg-surface-2"
              onClick={() => { setMediaIndex(i); setShowMediaViewer(true) }}
            >
              {m.type === 'image' ? (
                <img src={m.url} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-text-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>
      )
    }
    // Full size
    const currentMedia = media[mediaIndex]
    if (!currentMedia) return null
    return (
      <div className="fixed inset-0 z-60 bg-black/90 flex items-center justify-center">
        <button
          className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center"
          onClick={() => setShowMediaViewer(false)}
        >
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <div className="max-w-full max-h-full p-4">
          {currentMedia.type === 'image' ? (
            <img src={currentMedia.url} alt="" className="max-w-full max-h-[80vh] object-contain" />
          ) : (
            <video src={currentMedia.url} controls className="max-w-full max-h-[80vh]" />
          )}
        </div>
        {media.length > 1 && (
          <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-2">
            {media.map((_, i) => (
              <button
                key={i}
                className={`w-2 h-2 rounded-full ${i === mediaIndex ? 'bg-white' : 'bg-white/40'}`}
                onClick={() => setMediaIndex(i)}
              />
            ))}
          </div>
        )}
      </div>
    )
  }

  if (!post) return null

  return (
    <>
      <BottomSheet isOpen={isOpen} onClose={onClose} title="Post Details">
        {/* Status Badge */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-1">
            <span className={`px-2.5 py-1 text-[12px] font-semibold rounded-full ${
              post.status === 'failed' ? 'bg-red-500/10 text-red-500' :
              post.status === 'published' ? 'bg-surface-2 text-text-1' :
              post.status === 'publishing' ? 'bg-surface-2 text-text-0' :
              'bg-link/10 text-link'
            }`}>
              {statusLabels[post.status]}
            </span>
            {post.threadOrder !== undefined && (
              <span className="text-xs text-text-2">
                Part {post.threadOrder + 1}
              </span>
            )}
          </div>
          <p className="text-[13px] text-text-1">
            {statusDescriptions[post.status]}
          </p>
          {post.status === 'failed' && post.error && (
            <p className="text-xs text-red-500 mt-2">
              {post.error}
            </p>
          )}
        </div>

        {/* Content */}
        <Card className="mb-4">
          <CardContent className="p-4">
            {isEditing ? (
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                placeholder="What's on your mind?"
                className="w-full min-h-[120px] bg-transparent text-text-0 text-[17px] leading-relaxed resize-none placeholder:text-text-2 focus:outline-none"
                autoFocus
              />
            ) : (
              <p className="text-[17px] leading-relaxed whitespace-pre-wrap">
                {post.content}
              </p>
            )}
            {post.media && !isEditing && renderMedia(post.media, 'thumb')}
          </CardContent>
        </Card>

        {/* Schedule */}
        {isEditing && canEdit && (
          <div className="mb-4">
            <label className="text-[13px] font-medium text-text-1 mb-2 block">
              Schedule
            </label>
            <Input
              type="datetime-local"
              value={editScheduledAt}
              onChange={(e) => setEditScheduledAt(e.target.value)}
              className="w-full"
            />
            {post.scheduledAt && !editScheduledAt && (
              <button
                onClick={() => setEditScheduledAt('')}
                className="text-xs text-text-2 mt-2"
              >
                Clear schedule
              </button>
            )}
          </div>
        )}

        {!isEditing && post.scheduledAt && (
          <div className="flex items-center gap-2 mb-4 text-[14px] text-text-1">
            <svg className="w-4 h-4 text-text-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{formatFullDate(post.scheduledAt)}</span>
          </div>
        )}

        {/* Publish Info */}
        {(post.publishedAt || post.threadsPostId || post.retryCount) && (
          <Card className="mb-4">
            <CardContent className="p-4">
              <h3 className="text-[13px] font-semibold text-text-1 mb-2">PUBLISH INFO</h3>
              <div className="space-y-2 text-[13px]">
                {post.publishedAt && (
                  <div className="flex justify-between">
                    <span className="text-text-2">Published</span>
                    <span className="text-text-0">{formatFullDate(post.publishedAt)}</span>
                  </div>
                )}
                {post.threadsPostId && (
                  <div className="flex justify-between">
                    <span className="text-text-2">Threads ID</span>
                    <span className="text-text-0 font-mono text-xs">{post.threadsPostId}</span>
                  </div>
                )}
                {post.retryCount !== undefined && post.retryCount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-text-2">Retries</span>
                    <span className="text-text-0">{post.retryCount}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Locked State */}
        {isLocked && (
          <div className="flex items-center gap-2 p-3 bg-surface-2 rounded-lg mb-4 text-[14px] text-text-1">
            <svg className="w-5 h-5 text-text-2 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span>
              {post.status === 'published'
                ? 'This post is already published and cannot be edited.'
                : 'This post is currently publishing.'
              }
            </span>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-3">
          {isEditing ? (
            <>
              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  onClick={handleCancelEdit}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  loading={saving}
                  disabled={!editContent.trim()}
                  className="flex-1"
                >
                  Save
                </Button>
              </div>
            </>
          ) : (
            <>
              {canEdit && (
                <Button
                  onClick={() => setIsEditing(true)}
                  className="w-full"
                >
                  Edit Post
                </Button>
              )}

              {canRetry && onRetry && (
                <Button
                  onClick={handleRetry}
                  loading={saving}
                  className="w-full"
                >
                  Retry Now
                </Button>
              )}

              {canDelete && (
                <Button
                  variant="danger"
                  onClick={handleDelete}
                  loading={deleting}
                  className="w-full"
                >
                  Delete Post
                </Button>
              )}
            </>
          )}
        </div>
      </BottomSheet>

      {/* Media Viewer */}
      {showMediaViewer && post.media && renderMedia(post.media, 'full')}
    </>
  )
}