'use client'

import { useState, useEffect } from 'react'
import { PageShell, PageHeader } from '@/components/PageShell'
import { Button } from '@/components/ui/Button'
import { Textarea, Input } from '@/components/ui/Input'
import { BottomSheet } from '@/components/ui/BottomSheet'
import { Card, CardContent } from '@/components/ui/Card'
import { MediaPicker } from '@/components/ui/MediaPicker'
import { AIPanel } from '@/components/hermes/AIPanel'
import { useDraft } from '@/hooks/useDraft'
import type { Media } from '@/types/post'

const MAX_CHARS = 500

function CharRing({ count, max }: { count: number; max: number }) {
  const pct = Math.min(count / max, 1)
  const r = 12
  const circ = 2 * Math.PI * r
  const dash = pct * circ
  const isOver = count > max
  const isHigh = pct >= 0.8

  const stroke = isOver ? '#ef4444' : isHigh ? '#0099ff' : '#0099ff'
  const trackColor = 'var(--surface-2)'

  return (
    <div className="relative w-7 h-7 flex items-center justify-center shrink-0">
      <svg className="absolute inset-0" viewBox="0 0 28 28" width="28" height="28">
        <circle cx="14" cy="14" r={r} fill="none" stroke={trackColor} strokeWidth="2.5" />
        <circle
          cx="14" cy="14" r={r} fill="none"
          stroke={stroke} strokeWidth="2.5"
          strokeDasharray={`${dash} ${circ}`}
          strokeDashoffset={circ / 4}
          strokeLinecap="round"
          style={{ transform: 'rotate(-90deg)', transformOrigin: '14px 14px', transition: 'stroke-dasharray 0.15s ease' }}
        />
      </svg>
      <span className={`relative text-[10px] font-semibold ${isOver ? 'text-red-500' : 'text-text-1'}`}>
        {count}
      </span>
    </div>
  )
}

function DraftIndicator({ lastSaved, isSaving }: { lastSaved: Date | null; isSaving: boolean }) {
  if (!lastSaved && !isSaving) return null
  return (
    <div className="flex items-center gap-1.5 text-[12px] text-text-2">
      {!isSaving && lastSaved && (
        <>
          <svg className="w-3 h-3 text-link" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
          <span>Saved</span>
        </>
      )}
      {isSaving && <span>Saving...</span>}
    </div>
  )
}

const QUICK_PICKS = [
  { label: 'Tomorrow 9am', date: '', time: '' },
  { label: 'Tomorrow 1pm', date: '', time: '' },
  { label: 'Tomorrow 6pm', date: '', time: '' },
  { label: 'Next Monday 9am', date: '', time: '' },
]

function getQuickPickDateTime(index: number): { date: string; time: string } {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)

  if (index === 0) {
    const d = new Date(tomorrow)
    d.setHours(9, 0, 0, 0)
    return { date: d.toISOString().split('T')[0] ?? '', time: '09:00' }
  }
  if (index === 1) {
    const d = new Date(tomorrow)
    d.setHours(13, 0, 0, 0)
    return { date: d.toISOString().split('T')[0] ?? '', time: '13:00' }
  }
  if (index === 2) {
    const d = new Date(tomorrow)
    d.setHours(18, 0, 0, 0)
    return { date: d.toISOString().split('T')[0] ?? '', time: '18:00' }
  }
  const monday = new Date()
  const day = monday.getDay()
  const daysUntilMonday = day === 0 ? 1 : 8 - day
  monday.setDate(monday.getDate() + daysUntilMonday)
  monday.setHours(9, 0, 0, 0)
  return { date: monday.toISOString().split('T')[0] ?? '', time: '09:00' }
}

function PreviewCard({ content, media = [] }: { content: string; media?: Media[] }) {
  // media is set but unused in preview - kept for future media preview
  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-surface-2 shrink-0" />
          <div>
            <p className="text-[14px] font-semibold text-text-0">Your Name</p>
            <p className="text-[12px] text-text-1">@username</p>
          </div>
        </div>
        <p className="text-[15px] text-text-0 leading-relaxed whitespace-pre-wrap">
          {content || <span className="text-text-2">Your post preview will appear here...</span>}
        </p>
        {media.length > 0 && (
          <div className="grid grid-cols-2 gap-2 rounded-xl overflow-hidden">
            {media.map((item) => (
              <div key={item.id} className="aspect-square bg-surface-2">
                {item.type === 'image' ? (
                  <img src={item.url} alt="Media" className="w-full h-full object-cover" />
                ) : (
                  <video src={item.url} className="w-full h-full object-cover" muted playsInline />
                )}
              </div>
            ))}
          </div>
        )}
        <div className="flex items-center gap-6 pt-1 border-t border-border-2">
          <span className="text-[13px] text-text-2">Reply</span>
          <span className="text-[13px] text-text-2">Repost</span>
          <span className="text-[13px] text-text-2">Like</span>
          <span className="text-[13px] text-text-2">Share</span>
        </div>
      </CardContent>
    </Card>
  )
}

export default function ComposerPage() {
  const { posts, updatePost, addPost, removePost, lastSaved, clearDraft, isSaving } = useDraft()
  const [content, setContent] = useState('')
  const [media, setMedia] = useState<Media[]>([])
  const [showScheduleSheet, setShowScheduleSheet] = useState(false)
  const [showAIPanel, setShowAIPanel] = useState(false)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [mode, setMode] = useState<'write' | 'preview'>('write')

  useEffect(() => {
    if (posts.length > 0) {
      setContent(posts[0]?.content || '')
      setMedia(posts[0]?.media || [])
    }
  }, [posts])

  useEffect(() => {
    if (posts.length > 0 && media !== posts[0]?.media) {
      updatePost(0, content, media)
    }
  }, [media])

  const charCount = content.length
  const isOverLimit = charCount > MAX_CHARS
  const isEmpty = content.trim().length === 0

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value)
    if (posts.length > 0) {
      updatePost(0, e.target.value)
    }
  }

  const handleQuickPick = (index: number) => {
    const { date, time } = getQuickPickDateTime(index)
    setSelectedDate(date)
    setSelectedTime(time)
  }

  const handleSchedule = async () => {
    const scheduledAt = new Date(`${selectedDate}T${selectedTime}`)
    
    const response = await fetch('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content,
        media,
        scheduledAt: scheduledAt.toISOString(),
      }),
    })

    if (response.ok) {
      setShowScheduleSheet(false)
      clearDraft()
      setContent('')
      setMedia([])
    }
  }

  const handlePostNow = async () => {
    const response = await fetch('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content,
        media,
      }),
    })

    if (response.ok) {
      clearDraft()
      setContent('')
      setMedia([])
    }
  }

  return (
    <PageShell>
      <PageHeader
        title="Compose"
        action={
          <div className="flex bg-surface-2 rounded-full p-0.5">
            <button
              onClick={() => setMode('write')}
              className={`px-3 py-1.5 text-[12px] font-semibold rounded-full transition-spring pressable ${mode === 'write' ? 'bg-surface-0 text-text-0 shadow-sm' : 'text-text-1'}`}
            >
              Write
            </button>
            <button
              onClick={() => setMode('preview')}
              className={`px-3 py-1.5 text-[12px] font-semibold rounded-full transition-spring pressable ${mode === 'preview' ? 'bg-surface-0 text-text-0 shadow-sm' : 'text-text-1'}`}
            >
              Preview
            </button>
          </div>
        }
      />

      <div className="px-4 py-4">
        {mode === 'write' ? (
          <div className="relative">
            <Textarea
              value={content}
              onChange={handleContentChange}
              placeholder="What's on your mind?"
              className="min-h-[220px] text-lg leading-relaxed"
              autoFocus
            />

            <div className="absolute bottom-3 right-3 flex items-center gap-3">
              <DraftIndicator lastSaved={lastSaved} isSaving={isSaving} />
              <CharRing count={charCount} max={MAX_CHARS} />
              <button
                onClick={() => setShowAIPanel(true)}
                className="w-8 h-8 rounded-full bg-surface-2 hover:bg-surface-1 transition-spring flex items-center justify-center pressable"
                aria-label="AI Assistant"
              >
                <svg className="w-4 h-4 text-text-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
                </svg>
              </button>
            </div>
          </div>
        ) : (
          <PreviewCard content={content} media={media} />
        )}

        <div className="mt-4">
          <MediaPicker
            media={media}
            onMediaChange={setMedia}
            disabled={false}
          />
        </div>

        {posts.length > 1 && (
          <div className="mt-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[15px] font-semibold text-text-1">
                Thread ({posts.length} posts)
              </span>
              <Button variant="ghost" size="sm" onClick={addPost}>
                Add Post
              </Button>
            </div>

            <div className="space-y-3">
              {posts.slice(1).map((post, index) => (
                <div key={index + 1} className="flex items-start gap-2">
                  <span className="text-sm text-text-2 pt-2.5 font-medium">
                    {index + 2}.
                  </span>
                  <div className="flex-1">
                    <Textarea
                      value={post.content}
                      onChange={(e) => updatePost(index + 1, e.target.value)}
                      placeholder={`Part ${index + 2}...`}
                      className="min-h-[80px] text-sm"
                    />
                  </div>
                  <button
                    onClick={() => removePost(index + 1)}
                    className="p-2 text-text-2 pressable hover:text-red-500 transition-spring"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {posts.length <= 1 && (
          <Button
            variant="ghost"
            size="md"
            onClick={addPost}
            className="mt-4 w-full"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            Add to Thread
          </Button>
        )}
      </div>

      <div className="fixed bottom-[72px] left-0 right-0 bg-surface-0 border-t border-border-0 p-4 z-20">
        <div className="max-w-lg mx-auto flex gap-3">
          <Button
            variant="secondary"
            size="lg"
            className="flex-1"
            onClick={() => setShowScheduleSheet(true)}
            disabled={isEmpty || isOverLimit}
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Schedule
          </Button>
          <Button
            variant="primary"
            size="lg"
            className="flex-1"
            disabled={isEmpty || isOverLimit}
            onClick={handlePostNow}
          >
            Post Now
          </Button>
        </div>
      </div>

      <BottomSheet
        isOpen={showScheduleSheet}
        onClose={() => setShowScheduleSheet(false)}
        title="Schedule Post"
      >
        <div className="space-y-4">
          <div>
            <p className="text-[11px] font-semibold text-text-2 uppercase tracking-wider px-1 mb-2">Quick picks</p>
            <div className="grid grid-cols-2 gap-2">
              {QUICK_PICKS.map((pick, i) => (
                <button
                  key={i}
                  onClick={() => handleQuickPick(i)}
                  className="py-2.5 px-3 bg-surface-2 border border-border-1 rounded-xl text-[13px] font-medium text-text-0 hover:bg-surface-1 active:scale-[0.98] transition-spring pressable text-left"
                >
                  {pick.label}
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-border-2 pt-4 space-y-4">
            <Input
              type="date"
              label="Date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
            />

            <Input
              type="time"
              label="Time"
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
            />

            <Button
              variant="primary"
              size="lg"
              className="w-full"
              onClick={handleSchedule}
              disabled={!selectedDate || !selectedTime}
            >
              Confirm Schedule
            </Button>
          </div>
        </div>
      </BottomSheet>

      <AIPanel
        isOpen={showAIPanel}
        onClose={() => setShowAIPanel(false)}
        currentContent={content}
        onApplyContent={(newContent) => {
          setContent(newContent)
          if (posts.length > 0) {
            updatePost(0, newContent)
          }
        }}
      />
    </PageShell>
  )
}
