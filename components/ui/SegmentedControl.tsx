'use client'

import { HTMLAttributes } from 'react'

interface SegmentedControlProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  options: { value: string; label: string }[]
  value: string
  onChange: (value: string) => void
}

export function SegmentedControl({ options, value, onChange, className = '', ...props }: SegmentedControlProps) {
  return (
    <div
      className={`flex overflow-x-auto scrollbar-none border-b border-border-0 ${className}`}
      {...props}
    >
      {options.map((option) => {
        const isActive = value === option.value
        return (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={`
              shrink-0 px-4 py-3 text-[14px] font-semibold
              transition-spring pressable
              border-b-2 -mb-px
              ${isActive
                ? 'text-text-0 border-link'
                : 'text-text-1 border-transparent hover:text-text-0'
              }
            `}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
