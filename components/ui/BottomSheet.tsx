'use client'

import { useEffect, useRef, useState, HTMLAttributes } from 'react'

interface BottomSheetProps extends HTMLAttributes<HTMLDivElement> {
  isOpen: boolean
  onClose: () => void
  title?: string
}

export function BottomSheet({ isOpen, onClose, title, className = '', children, ...props }: BottomSheetProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [dragY, setDragY] = useState(0)
  const dragStartY = useRef(0)

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => { if (e.key === 'Escape' && isOpen) onClose() }
    document.addEventListener('keydown', onEsc)
    return () => document.removeEventListener('keydown', onEsc)
  }, [isOpen, onClose])

  const dragStart = (clientY: number) => { dragStartY.current = clientY; setIsDragging(true) }
  const dragMove = (clientY: number) => {
    if (!isDragging) return
    const delta = clientY - dragStartY.current
    if (delta > 0) setDragY(delta)
  }
  const dragEnd = () => {
    setIsDragging(false)
    if (dragY > 100) onClose()
    setDragY(0)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center animate-fade-in" onClick={onClose} {...props}>
      <div className="absolute inset-0 bg-black/50" />
      <div
        className={`
          relative w-full max-w-lg bg-surface-0 border border-border-0
          rounded-t-3xl max-h-[85vh] overflow-auto animate-slide-up
          ${className}
        `.trim()}
        style={{
          transform: `translateY(${dragY}px)`,
          transition: isDragging ? 'none' : 'transform 0.3s var(--ease-spring)',
        }}
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => dragStart(e.clientY)}
        onMouseMove={(e) => dragMove(e.clientY)}
        onMouseUp={dragEnd}
        onMouseLeave={dragEnd}
        onTouchStart={(e) => dragStart(e.touches[0]?.clientY ?? 0)}
        onTouchMove={(e) => dragMove(e.touches[0]?.clientY ?? 0)}
        onTouchEnd={dragEnd}
      >
        <div className="sticky top-0 bg-surface-0 px-4 pt-3 pb-2 z-10 border-b border-border-2">
          <div className="w-9 h-1 bg-border-1 rounded-full mx-auto mb-3" />
          {title && (
            <div className="flex items-center justify-between">
              <h2 className="text-[17px] font-semibold text-text-0">{title}</h2>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-transparent hover:bg-surface-2 transition-spring pressable"
                aria-label="Close"
              >
                <svg className="w-4 h-4 text-text-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}
        </div>
        <div className="px-4 pb-8 pt-2">{children}</div>
      </div>
    </div>
  )
}
