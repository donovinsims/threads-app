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

export function ListRow({ label, description, value, valueClassName = '', trailing, onClick, className = '', ...props }: ListRowProps) {
  const isClickable = !!onClick
  return (
    <div
      onClick={onClick}
      className={`
        flex items-center justify-between px-4 py-3.5 min-h-[52px]
        bg-surface-0 transition-spring
        ${isClickable ? 'pressable cursor-pointer active:bg-surface-2' : ''}
        ${className}
      `.trim()}
      {...props}
    >
      <div className="flex-1 min-w-0">
        <p className="text-[15px] font-medium text-text-0 truncate">{label}</p>
        {description && (
          <p className="text-[13px] text-text-1 mt-0.5 truncate">{description}</p>
        )}
      </div>
      {(value || trailing) && (
        <div className="ml-4 flex items-center gap-2 shrink-0">
          {value && typeof value === 'string' ? (
            <span className={`text-[14px] text-text-1 ${valueClassName}`}>{value}</span>
          ) : value}
          {trailing}
        </div>
      )}
      {isClickable && !trailing && (
        <svg className="w-4 h-4 text-text-2 ml-2 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      )}
    </div>
  )
}

interface ListProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
}

export function List({ className = '', children, ...props }: ListProps & { children: ReactNode }) {
  return (
    <div className={`overflow-hidden rounded-2xl bg-surface-0 border border-border-1 divide-y divide-border-2 ${className}`} {...props}>
      {children}
    </div>
  )
}
