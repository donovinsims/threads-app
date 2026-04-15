import { HTMLAttributes } from 'react'

type CardVariant = 'default' | 'outlined' | 'inset'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant
  interactive?: boolean
}

const variantClasses: Record<CardVariant, string> = {
  default:  'bg-surface-0 border border-border-1',
  outlined: 'bg-transparent border border-border-0',
  inset:    'bg-surface-1 border border-border-2',
}

export function Card({ variant = 'default', interactive = false, className = '', children, ...props }: CardProps) {
  return (
    <div
      className={`
        rounded-2xl overflow-hidden transition-spring
        ${variantClasses[variant]}
        ${interactive ? 'pressable cursor-pointer active:bg-surface-1' : ''}
        ${className}
      `.trim()}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardHeader({ className = '', children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`px-4 py-3 border-b border-border-2 ${className}`} {...props}>
      {children}
    </div>
  )
}

export function CardContent({ className = '', children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={`px-4 py-4 ${className}`} {...props}>{children}</div>
}

export function CardFooter({ className = '', children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`px-4 py-3 border-t border-border-2 bg-surface-1 ${className}`} {...props}>
      {children}
    </div>
  )
}
