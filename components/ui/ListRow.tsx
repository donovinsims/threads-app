'use client'

import { HTMLAttributes, ReactNode } from 'react'

interface ListRowProps extends HTMLAttributes<HTMLDivElement> {
  label: string
  description?: string
  value?: string | ReactNode
  valueClassName?: string
  trailing?: ReactNode
  onClick?: () => void
}

export function ListRow({ 
  label, 
  description, 
  value, 
  valueClassName = '',
  trailing,
  onClick,
  className = '',
  ...props 
}: ListRowProps) {
  const isClickable = !!onClick

  return (
    <div
      onClick={onClick}
      className={`
        flex items-center justify-between
        px-4 py-3.5
        min-h-[56px]
        bg-surface-0
        ${isClickable ? 'cursor-pointer active:bg-surface-1 transition-colors' : ''}
        ${className}
      `.trim()}
      {...props}
    >
      <div className="flex-1 min-w-0">
        <p className="text-base font-medium text-text-0 truncate">{label}</p>
        {description && (
          <p className="text-sm text-text-1 mt-0.5 truncate">{description}</p>
        )}
      </div>
      
      {(value || trailing) && (
        <div className="ml-4 flex items-center gap-2">
          {value && typeof value === 'string' ? (
            <span className={`text-sm text-text-1 ${valueClassName}`}>{value}</span>
          ) : (
            value
          )}
          {trailing}
        </div>
      )}
      
      {isClickable && !trailing && (
        <svg className="w-5 h-5 text-text-2 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      )}
    </div>
  )
}

interface ListProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
}

export function List({ className = '', children, ...props }: ListProps) {
  return (
    <div 
      className={`overflow-hidden rounded-xl bg-surface-0 ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
