import { HTMLAttributes } from 'react'

type CardVariant = 'default' | 'outlined'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant
  interactive?: boolean
}

export function Card({ 
  variant = 'default',
  interactive = false,
  className = '', 
  children, 
  ...props 
}: CardProps) {
  return (
    <div
      className={`
        rounded-xl overflow-hidden
        transition-spring
        ${variant === 'default' ? 'bg-surface-1' : 'bg-transparent border border-border-0'}
        ${interactive ? 'pressable cursor-pointer hover:bg-surface-1/80 active:scale-[0.98]' : ''}
        ${className}
      `.trim()}
      {...props}
    >
      {children}
    </div>
  )
}

type CardHeaderProps = HTMLAttributes<HTMLDivElement>

export function CardHeader({ className = '', children, ...props }: CardHeaderProps) {
  return (
    <div 
      className={`px-4 py-3 border-b border-border-0 ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

type CardContentProps = HTMLAttributes<HTMLDivElement>

export function CardContent({ className = '', children, ...props }: CardContentProps) {
  return (
    <div 
      className={`px-4 py-4 ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

type CardFooterProps = HTMLAttributes<HTMLDivElement>

export function CardFooter({ className = '', children, ...props }: CardFooterProps) {
  return (
    <div 
      className={`px-4 py-3 border-t border-border-0 bg-surface-0 ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
