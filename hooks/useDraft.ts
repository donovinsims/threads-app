'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import type { Draft, DraftPost, Media } from '@/types/post'

const STORAGE_KEY = 'threads-app-draft'
const DEBOUNCE_MS = 500

interface UseDraftReturn {
  draft: Draft | null
  posts: DraftPost[]
  saveDraft: (posts: DraftPost[]) => void
  clearDraft: () => void
  lastSaved: Date | null
  isSaving: boolean
  updatePost: (index: number, content: string, media?: Media[]) => void
  addPost: () => void
  removePost: (index: number) => void
}

export function useDraft(): UseDraftReturn {
  const [draft, setDraft] = useState<Draft | null>(null)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as Draft
        setDraft(parsed)
        setLastSaved(new Date(parsed.savedAt))
      } catch {
        localStorage.removeItem(STORAGE_KEY)
      }
    }
  }, [])

  const saveDraft = useCallback((posts: DraftPost[]) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    setIsSaving(true)
    debounceRef.current = setTimeout(() => {
      const newDraft: Draft = {
        id: draft?.id || crypto.randomUUID(),
        posts,
        savedAt: new Date(),
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newDraft))
      setDraft(newDraft)
      setLastSaved(newDraft.savedAt)
      setIsSaving(false)
    }, DEBOUNCE_MS)
  }, [draft?.id])

  const clearDraft = useCallback(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }
    localStorage.removeItem(STORAGE_KEY)
    setDraft(null)
    setLastSaved(null)
  }, [])

  const updatePost = useCallback((index: number, content: string, media?: Media[]) => {
    const currentPosts = draft?.posts || []
    const newPosts = [...currentPosts]
    if (newPosts[index]) {
      newPosts[index] = { ...newPosts[index], content, media: media ?? newPosts[index].media }
      saveDraft(newPosts)
    }
  }, [draft?.posts, saveDraft])

  const addPost = useCallback(() => {
    const currentPosts = draft?.posts || []
    const newPost: DraftPost = {
      content: '',
      threadOrder: currentPosts.length,
    }
    saveDraft([...currentPosts, newPost])
  }, [draft?.posts, saveDraft])

  const removePost = useCallback((index: number) => {
    const currentPosts = draft?.posts || []
    const newPosts = currentPosts
      .filter((_, i) => i !== index)
      .map((post, i) => ({ ...post, threadOrder: i }))
    saveDraft(newPosts)
  }, [draft?.posts, saveDraft])

  return {
    draft,
    posts: draft?.posts || [],
    saveDraft,
    clearDraft,
    lastSaved,
    isSaving,
    updatePost,
    addPost,
    removePost,
  }
}
