'use client'

import { useState, HTMLAttributes } from 'react'

interface SegmentedControlProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  options: { value: string; label: string }[]
  value: string
  onChange: (value: string) => void
}

export function SegmentedControl({ 
  options, 
  value, 
  onChange,
  className = '',
  ...props 
}: SegmentedControlProps) {
  const [indicatorStyle, setIndicatorStyle] = useState<React.CSSProperties>({})

  const handleSelect = (optionValue: string, _index: number, event: React.MouseEvent<HTMLButtonElement>) => {
    const button = event.currentTarget
    const parent = button.parentElement
    if (parent) {
      const buttonRect = button.getBoundingClientRect()
      const parentRect = parent.getBoundingClientRect()
      setIndicatorStyle({
        width: buttonRect.width,
        transform: `translateX(${buttonRect.left - parentRect.left}px)`,
      })
    }
    onChange(optionValue)
  }

  return (
    <div 
      className={`
        relative flex bg-surface-1 rounded-lg p-1
        ${className}
      `.trim()}
      {...props}
    >
      <div 
        className="absolute top-1 bottom-1 bg-surface-0 rounded-md shadow-sm transition-all duration-200 ease-out"
        style={indicatorStyle}
      />
      {options.map((option, index) => (
        <button
          key={option.value}
          onClick={(e) => handleSelect(option.value, index, e)}
          className={`
            relative z-10 flex-1 py-2 px-3
            text-[13px] font-semibold rounded-md
            transition-spring
            pressable
            min-h-[36px]
            ${value === option.value ? 'text-text-0' : 'text-text-1 hover:text-text-0'}
          `}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
