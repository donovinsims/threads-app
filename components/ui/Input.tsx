'use client'

import { forwardRef, InputHTMLAttributes, TextareaHTMLAttributes } from 'react'

type InputType = 'text' | 'email' | 'password' | 'number' | 'date' | 'time' | 'datetime-local'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  type?: InputType
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
          <label 
            htmlFor={inputId}
            className="block text-sm font-medium text-text-1 mb-1.5"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`
            w-full h-11 px-3
            bg-surface-2 text-text-0
            border border-border-0 rounded-lg
            placeholder:text-text-2
            focus:outline-none focus:border-link focus:ring-1 focus:ring-link
            transition-spring
            disabled:opacity-50 disabled:cursor-not-allowed
            pressable
            ${error ? 'border-[#cc0000] dark:border-[#ff4d4d]' : ''}
            ${className}
          `.trim()}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-red-500">{error}</p>
        )}
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
          <label 
            htmlFor={inputId}
            className="block text-sm font-medium text-text-1 mb-1.5"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          className={`
            w-full min-h-[120px] px-3 py-2.5
            bg-surface-2 text-text-0
            border border-border-0 rounded-lg
            placeholder:text-text-2
            focus:outline-none focus:border-link focus:ring-1 focus:ring-link
            transition-spring
            resize-none
            disabled:opacity-50 disabled:cursor-not-allowed
            pressable
            ${error ? 'border-[#cc0000] dark:border-[#ff4d4d]' : ''}
            ${className}
          `.trim()}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-red-500">{error}</p>
        )}
      </div>
    )
  }
)

Textarea.displayName = 'Textarea'
