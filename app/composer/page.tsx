'use client'

import { useState, useEffect } from 'react'
import { PageShell, PageHeader } from '@/components/PageShell'
import { Button } from '@/components/ui/Button'
import { Textarea, Input } from '@/components/ui/Input'
import { BottomSheet } from '@/components/ui/BottomSheet'
import { AIPanel } from '@/components/hermes/AIPanel'
import { useDraft } from '@/hooks/useDraft'

const MAX_CHARS = 500

export default function ComposerPage() {
  const { posts, updatePost, addPost, removePost, lastSaved, clearDraft, isSaving } = useDraft()
  const [content, setContent] = useState('')
  const [showScheduleSheet, setShowScheduleSheet] = useState(false)
  const [showAIPanel, setShowAIPanel] = useState(false)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')

  useEffect(() => {
    if (posts.length > 0) {
      setContent(posts[0]?.content || '')
    }
  }, [posts])

  const charCount = content.length
  const isOverLimit = charCount > MAX_CHARS
  const isEmpty = content.trim().length === 0

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value)
    if (posts.length > 0) {
      updatePost(0, e.target.value)
    }
  }

  const handleSchedule = () => {
    console.log('Schedule post:', { content, date: selectedDate, time: selectedTime })
    setShowScheduleSheet(false)
    clearDraft()
    setContent('')
  }

  return (
    <PageShell>
      <PageHeader title="Compose" />
      
      <div className="px-4 py-4">
        <div className="relative">
          <Textarea
            value={content}
            onChange={handleContentChange}
            placeholder="What's on your mind?"
            className="min-h-[220px] text-lg leading-relaxed"
            autoFocus
          />
          
          <div className="absolute bottom-3 right-3 flex items-center gap-3">
            {lastSaved && (
              <span className="text-xs text-text-2">
                {isSaving ? 'Saving...' : `Saved ${lastSaved.toLocaleTimeString()}`}
              </span>
            )}
            <span className={`text-[13px] font-medium ${isOverLimit ? 'text-[#cc0000] dark:text-[#ff4d4d]' : 'text-text-2'}`}>
              {charCount}/{MAX_CHARS}
            </span>
            <button
              onClick={() => setShowAIPanel(true)}
              className="w-8 h-8 rounded-full bg-surface-2 hover:bg-surface-1 transition-spring flex items-center justify-center"
              aria-label="AI Assistant"
            >
              <svg className="w-4 h-4 text-text-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
              </svg>
            </button>
          </div>
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
                    className="p-2 text-text-2 pressable hover:text-[#cc0000] dark:hover:text-[#ff4d4d] transition-spring"
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
        <div className="space-y-5">
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
