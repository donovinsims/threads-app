import { useState, useRef } from 'react'
import type { Media, MediaType } from '@/types/post'

export type UploadState = 'idle' | 'uploading' | 'uploaded' | 'failed'

interface MediaPickerProps {
  media: Media[]
  onMediaChange: (media: Media[]) => void
  disabled?: boolean
}

export function MediaPicker({ media, onMediaChange, disabled }: MediaPickerProps) {
  const [uploadState, setUploadState] = useState<UploadState>('idle')
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || disabled) return

    setError(null)
    setUploadState('uploading')
    setUploadProgress(0)

    try {
      const formData = new FormData()
      formData.append('file', file)

      setUploadProgress(20)

      const response = await fetch('/api/media', {
        method: 'POST',
        body: formData,
      })

      setUploadProgress(80)

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error || 'Upload failed')
      }

      const result = await response.json() as {
        url: string
        id: string
        type: MediaType
        size: number
      }

      setUploadProgress(100)

      const newMedia: Media = {
        id: result.id,
        type: result.type,
        url: result.url,
      }

      onMediaChange([...media, newMedia])
      setUploadState('uploaded')

      setTimeout(() => setUploadState('idle'), 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
      setUploadState('failed')
    }
  }

  const removeMedia = async (index: number) => {
    const removed = media[index]
    if (!removed) return
    
    media.splice(index, 1)
    onMediaChange([...media])

    try {
      await fetch(`/api/media?url=${encodeURIComponent(removed.url)}`, {
        method: 'DELETE',
      })
    } catch {
      // Silent cleanup failure
    }
  }

  const openPicker = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="space-y-3">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp,video/mp4,video/quicktime"
        onChange={handleFileSelect}
        className="hidden"
      />

      {media.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          {media.map((item, index) => (
            <MediaPreview
              key={item.id}
              media={item}
              onRemove={() => removeMedia(index)}
              disabled={disabled}
            />
          ))}
        </div>
      )}

      {uploadState === 'uploading' && (
        <div className="h-20 bg-surface-2 rounded-xl flex items-center justify-center">
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 animate-spin text-link" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span className="text-sm text-text-1">Uploading... {uploadProgress}%</span>
          </div>
        </div>
      )}

      {uploadState === 'failed' && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
          <p className="text-sm text-red-500">{error || 'Upload failed'}</p>
          <button
            onClick={() => setUploadState('idle')}
            className="text-sm text-link mt-1"
          >
            Try again
          </button>
        </div>
      )}

      {media.length === 0 && uploadState === 'idle' && (
        <button
          onClick={openPicker}
          disabled={disabled}
          className="w-full h-20 border-2 border-dashed border-border-1 rounded-xl flex items-center justify-center gap-2 text-text-1 hover:bg-surface-1 active:scale-[0.98] transition-spring pressable disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="text-sm font-medium">Add photo or video</span>
        </button>
      )}
    </div>
  )
}

interface MediaPreviewProps {
  media: Media
  onRemove: () => void
  disabled?: boolean
}

function MediaPreview({ media, onRemove, disabled }: MediaPreviewProps) {
  return (
    <div className="relative aspect-square rounded-xl overflow-hidden bg-surface-2">
      {media.type === 'image' ? (
        <img
          src={media.url}
          alt="Attached media"
          className="w-full h-full object-cover"
        />
      ) : (
        <video
          src={media.url}
          className="w-full h-full object-cover"
          muted
          playsInline
        />
      )}
      <button
        onClick={onRemove}
        disabled={disabled}
        className="absolute top-2 right-2 w-7 h-7 bg-black/60 rounded-full flex items-center justify-center pressable disabled:opacity-50"
        aria-label="Remove media"
      >
        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}
