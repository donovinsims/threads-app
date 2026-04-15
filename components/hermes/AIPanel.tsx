'use client'

import { useState, useCallback } from 'react'
import { BottomSheet } from '@/components/ui/BottomSheet'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Input'
import {
  loadHermesConfig,
  createMockAdapter,
  createHttpAdapter,
  type HermesAdapter,
  type RewriteRequest,
  type ExpandRequest,
  type GenerateDraftRequest,
  type HermesError,
} from '@/lib/hermes'

type ActionType = 'rewrite' | 'expand' | 'generate' | null

interface AIPanelProps {
  isOpen: boolean
  onClose: () => void
  currentContent: string
  onApplyContent: (content: string) => void
}

interface ActionState {
  type: ActionType
  loading: boolean
  error: string | null
  result: string | null
}

export function AIPanel({ isOpen, onClose, currentContent, onApplyContent }: AIPanelProps) {
  const [action, setAction] = useState<ActionState>({
    type: null,
    loading: false,
    error: null,
    result: null
  })
  const [tone, setTone] = useState<'professional' | 'casual' | 'engaging' | 'humorous'>('engaging')
  const [prompt, setPrompt] = useState('')

  const getAdapter = useCallback((): HermesAdapter | null => {
    const config = loadHermesConfig()
    if (!config.enabled) return null

    if (config.apiUrl) {
      return createHttpAdapter(config)
    }
    return createMockAdapter()
  }, [])

  const handleAction = useCallback(async (actionType: ActionType) => {
    const adapter = getAdapter()
    if (!adapter) {
      setAction(prev => ({
        ...prev,
        error: 'Hermes is not enabled. Enable it in Settings.'
      }))
      return
    }

    setAction({ type: actionType, loading: true, error: null, result: null })

    try {
      let result: string

      if (actionType === 'rewrite') {
        const request: RewriteRequest = {
          content: currentContent,
          tone
        }
        const response = await adapter.rewrite(request)
        result = response.content
      } else if (actionType === 'expand') {
        const request: ExpandRequest = {
          content: currentContent,
          targetLength: 400
        }
        const response = await adapter.expand(request)
        result = response.content
      } else if (actionType === 'generate') {
        if (!prompt.trim()) {
          setAction(prev => ({ ...prev, loading: false, error: 'Please enter a topic or prompt' }))
          return
        }
        const request: GenerateDraftRequest = {
          prompt: prompt.trim(),
          type: 'single'
        }
        const response = await adapter.generateDraft(request)
        result = response.content
      } else {
        return
      }

      setAction(prev => ({ ...prev, loading: false, result }))
    } catch (err) {
      const error = err as HermesError
      let message = 'An unexpected error occurred'
      
      if (error.code === 'TIMEOUT') {
        message = 'Request timed out. Please try again.'
      } else if (error.message) {
        message = error.message
      }
      
      setAction(prev => ({ ...prev, loading: false, error: message }))
    }
  }, [getAdapter, currentContent, tone, prompt])

  const handleReset = useCallback(() => {
    setAction({ type: null, loading: false, error: null, result: null })
    setPrompt('')
  }, [])

  const handleApply = useCallback(() => {
    if (action.result) {
      onApplyContent(action.result)
      handleReset()
      onClose()
    }
  }, [action.result, onApplyContent, handleReset, onClose])

  const handleClose = useCallback(() => {
    handleReset()
    onClose()
  }, [handleReset, onClose])

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={handleClose}
      title="AI Assistant"
    >
      <div className="space-y-5">
        {action.error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-red-700 dark:text-red-300">{action.error}</p>
            </div>
          </div>
        )}

        {action.result ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-1 mb-2">
                Generated Content
              </label>
              <Textarea
                value={action.result}
                readOnly
                className="min-h-[150px] bg-surface-1"
              />
            </div>
            
            <div className="flex gap-3">
              <Button
                variant="secondary"
                size="md"
                className="flex-1"
                onClick={handleReset}
              >
                Try Again
              </Button>
              <Button
                variant="primary"
                size="md"
                className="flex-1"
                onClick={handleApply}
              >
                Apply to Post
              </Button>
            </div>
          </div>
        ) : action.loading ? (
          <div className="py-8 text-center">
            <div className="w-8 h-8 border-2 border-link border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-text-1">Thinking...</p>
          </div>
        ) : action.type === null ? (
          <div className="space-y-3">
            <p className="text-sm text-text-1 mb-4">
              AI-generated content is never auto-published. You always review before posting.
            </p>
            
            <button
              onClick={() => setAction(s => ({ ...s, type: 'rewrite' }))}
              className="w-full p-4 bg-surface-1 rounded-xl hover:bg-surface-2 transition-spring text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-surface-2 flex items-center justify-center">
                  <svg className="w-5 h-5 text-text-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-text-0">Rewrite</p>
                  <p className="text-sm text-text-1">Improve phrasing and clarity</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => setAction(s => ({ ...s, type: 'expand' }))}
              className="w-full p-4 bg-surface-1 rounded-xl hover:bg-surface-2 transition-spring text-left"
              disabled={!currentContent.trim()}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-surface-2 flex items-center justify-center">
                  <svg className="w-5 h-5 text-text-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16m-7 6h7" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-text-0">Expand</p>
                  <p className="text-sm text-text-1">Add more context to short content</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => setAction(s => ({ ...s, type: 'generate' }))}
              className="w-full p-4 bg-surface-1 rounded-xl hover:bg-surface-2 transition-spring text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-surface-2 flex items-center justify-center">
                  <svg className="w-5 h-5 text-text-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-text-0">Generate Draft</p>
                  <p className="text-sm text-text-1">Create content from a topic</p>
                </div>
              </div>
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {action.type === 'rewrite' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-text-1 mb-2">
                    Tone
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {(['professional', 'casual', 'engaging', 'humorous'] as const).map(t => (
                      <button
                        key={t}
                        onClick={() => setTone(t)}
                        className={`px-3 py-1.5 text-sm rounded-full transition-spring ${
                          tone === t
                            ? 'bg-link text-white'
                            : 'bg-surface-2 text-text-1 hover:bg-surface-1'
                        }`}
                      >
                        {t.charAt(0).toUpperCase() + t.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-text-1 mb-2">
                    Original Content
                  </label>
                  <Textarea
                    value={currentContent}
                    readOnly
                    className="min-h-[100px] bg-surface-1"
                  />
                </div>
              </>
            )}

            {action.type === 'expand' && (
              <div>
                <label className="block text-sm font-medium text-text-1 mb-2">
                  Content to Expand
                </label>
                <Textarea
                  value={currentContent}
                  readOnly
                  className="min-h-[100px] bg-surface-1"
                />
                <p className="text-xs text-text-2 mt-2">
                  Will expand into a more detailed post (~400 chars)
                </p>
              </div>
            )}

            {action.type === 'generate' && (
              <div>
                <label className="block text-sm font-medium text-text-1 mb-2">
                  Topic or Prompt
                </label>
                <Textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g., tips for better productivity, thoughts on remote work..."
                  className="min-h-[100px]"
                />
              </div>
            )}

            <div className="flex gap-3">
              <Button
                variant="secondary"
                size="md"
                className="flex-1"
                onClick={handleReset}
              >
                Back
              </Button>
              <Button
                variant="primary"
                size="md"
                className="flex-1"
                onClick={() => handleAction(action.type)}
                disabled={action.type === 'generate' && !prompt.trim()}
              >
                Generate
              </Button>
            </div>
          </div>
        )}
      </div>
    </BottomSheet>
  )
}
