'use client'

import { useEffect, useRef, useState, HTMLAttributes } from 'react'

interface BottomSheetProps extends HTMLAttributes<HTMLDivElement> {
  isOpen: boolean
  onClose: () => void
  title?: string
}

export function BottomSheet({ 
  isOpen, 
  onClose, 
  title,
  className = '',
  children,
  ...props 
}: BottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragY, setDragY] = useState(0)
  const dragStartY = useRef(0)

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  const handleDragStart = (e: React.TouchEvent | React.MouseEvent) => {
    if ('touches' in e && e.touches?.[0]) {
      dragStartY.current = e.touches[0].clientY
    } else if ('clientY' in e) {
      dragStartY.current = e.clientY
    }
    setIsDragging(true)
  }

  const handleDragMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isDragging) return
    let currentY: number | undefined
    if ('touches' in e && e.touches?.[0]) {
      currentY = e.touches[0].clientY
    } else if ('clientY' in e) {
      currentY = e.clientY
    }
    if (currentY === undefined) return
    const delta = currentY - dragStartY.current
    if (delta > 0) {
      setDragY(delta)
    }
  }

  const handleDragEnd = () => {
    setIsDragging(false)
    if (dragY > 100) {
      onClose()
    }
    setDragY(0)
  }

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end justify-center animate-fade-in"
      onClick={onClose}
      {...props}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in" />
      
      <div
        ref={sheetRef}
        className={`
          relative w-full max-w-lg
          bg-surface-0 rounded-t-2xl
          max-h-[85vh] overflow-auto
          animate-slide-up
          ${className}
        `.trim()}
        style={{ transform: `translateY(${dragY}px)`, transition: isDragging ? 'none' : 'transform 0.3s var(--ease-spring)' }}
        onClick={(e) => e.stopPropagation()}
        onMouseDown={handleDragStart}
        onMouseMove={handleDragMove}
        onMouseUp={handleDragEnd}
        onMouseLeave={handleDragEnd}
        onTouchStart={handleDragStart}
        onTouchMove={handleDragMove}
        onTouchEnd={handleDragEnd}
      >
        <div className="sticky top-0 bg-surface-0 px-4 pt-3 pb-2 z-10">
          <div className="w-10 h-1 bg-border-1 rounded-full mx-auto mb-3" />
          {title && (
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-text-0">{title}</h2>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-1 transition-spring pressable"
                aria-label="Close"
              >
                <svg className="w-5 h-5 text-text-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}
        </div>
        
        <div className="px-4 pb-6">
          {children}
        </div>
      </div>
    </div>
  )
}
