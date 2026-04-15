'use client'

import { forwardRef, InputHTMLAttributes, TextareaHTMLAttributes } from 'react'

const baseClass = `
  w-full transition-spring
  bg-surface-2 text-text-0
  border border-border-1 rounded-xl
  placeholder:text-text-2
  focus:outline-none focus:border-link focus:ring-1 focus:ring-link
  disabled:opacity-40 disabled:cursor-not-allowed
`

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-[13px] font-medium text-text-1 mb-1.5">
            {label}
          </label>
        )}
        <input
          ref={ref} id={inputId}
          className={`${baseClass} h-11 px-3 ${error ? 'border-red-500' : ''} ${className}`.trim()}
          {...props}
        />
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      </div>
    )
  }
)
Input.displayName = 'Input'

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className = '', id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-[13px] font-medium text-text-1 mb-1.5">
            {label}
          </label>
        )}
        <textarea
          ref={ref} id={inputId}
          className={`${baseClass} min-h-[120px] px-3 py-3 resize-none ${error ? 'border-red-500' : ''} ${className}`.trim()}
          {...props}
        />
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      </div>
    )
  }
)
Textarea.displayName = 'Textarea'
