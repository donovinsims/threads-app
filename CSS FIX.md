Here's the complete, correctly-implemented rewrite of every file:

***

## `app/globals.css` — Correct Token Values

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* ─── Soft Monochrome Design System ─── */
:root {
  --bg:        #f5f5f5;
  --surface-0: #ffffff;
  --surface-1: #fcfcfc;
  --surface-2: #f7f7f7;
  --border-0:  #e8e8e8;
  --border-1:  #ededed;
  --border-2:  #f2f2f2;
  --text-0:    #000000;
  --text-1:    #757575;
  --text-2:    #cfcfcf;
  --link:      #0099ff;

  /* Motion */
  --ease-spring:   cubic-bezier(0.32, 0.72, 0, 1);
  --ease-smooth:   cubic-bezier(0.4, 0, 0.2, 1);
  --duration-fast:   150ms;
  --duration-normal: 200ms;
  --duration-slow:   300ms;
  --press-scale: 0.97;
}

/* Dark mode — toggled by adding .dark to <html> */
.dark {
  --bg:        #0f0f0f;
  --surface-0: #141414;
  --surface-1: #1c1c1c;
  --surface-2: #242424;
  --border-0:  #212121;
  --border-1:  #2e2e2e;
  --border-2:  #262626;
  --text-0:    #ffffff;
  --text-1:    #919191;
  --text-2:    #575757;
  --link:      #0099ff;
}

/* System fallback for users who haven't manually toggled */
@media (prefers-color-scheme: dark) {
  :root:not(.dark):not(.light) {
    --bg:        #0f0f0f;
    --surface-0: #141414;
    --surface-1: #1c1c1c;
    --surface-2: #242424;
    --border-0:  #212121;
    --border-1:  #2e2e2e;
    --border-2:  #262626;
    --text-0:    #ffffff;
    --text-1:    #919191;
    --text-2:    #575757;
    --link:      #0099ff;
  }
}

/* ─── Animations ─── */
@keyframes slide-up {
  from { transform: translateY(100%); opacity: 0; }
  to   { transform: translateY(0);    opacity: 1; }
}
@keyframes fade-in {
  from { opacity: 0; }
  to   { opacity: 1; }
}
@keyframes scale-in {
  from { transform: scale(0.95); opacity: 0; }
  to   { transform: scale(1);    opacity: 1; }
}
@keyframes skeleton-loading {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.animate-slide-up { animation: slide-up  0.3s var(--ease-spring) forwards; }
.animate-fade-in  { animation: fade-in   0.2s var(--ease-smooth) forwards; }
.animate-scale-in { animation: scale-in  0.2s var(--ease-spring) forwards; }

/* ─── Utility Classes ─── */
.transition-spring {
  transition:
    transform         var(--duration-fast) var(--ease-spring),
    opacity           var(--duration-fast) var(--ease-smooth),
    background-color  var(--duration-fast) var(--ease-smooth),
    color             var(--duration-fast) var(--ease-smooth),
    border-color      var(--duration-fast) var(--ease-smooth);
}

.pressable {
  cursor: pointer;
  transition: transform var(--duration-fast) var(--ease-spring);
  -webkit-tap-highlight-color: transparent;
}
.pressable:active { transform: scale(var(--press-scale)); }

.disabled { opacity: 0.4; cursor: not-allowed; pointer-events: none; }

.skeleton {
  background: linear-gradient(
    90deg,
    var(--surface-1) 0%,
    var(--surface-2) 50%,
    var(--surface-1) 100%
  );
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s ease-in-out infinite;
}

/* ─── Base Layer ─── */
@layer base {
  html {
    background-color: var(--bg);
    color: var(--text-0);
    -webkit-tap-highlight-color: transparent;
    -webkit-touch-callout: none;
  }
  body {
    background-color: var(--bg);
    color: var(--text-0);
    font-feature-settings: 'kern' 1, 'liga' 1;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
  * { scroll-behavior: auto; }
  button, [role="button"] { user-select: none; }
}
```


***

## `components/PageShell.tsx` — Nav + Shell + Header

The Tailwind config maps `var(--surface-0)` → `bg-surface-0`, `var(--border-0)` → `border-border-0`, etc.  Use those classes throughout. Active nav items use `text-link`; inactive use `text-text-1`.

```tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  {
    href: '/queue',
    label: 'Queue',
    activeIcon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
        <rect x="3" y="5"  width="18" height="2.5" rx="1.25"/>
        <rect x="3" y="10.75" width="18" height="2.5" rx="1.25"/>
        <rect x="3" y="16.5" width="18" height="2.5" rx="1.25"/>
      </svg>
    ),
    inactiveIcon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 10.75h16M4 15.5h16" />
      </svg>
    ),
  },
  {
    href: '/composer',
    label: 'Compose',
    activeIcon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" fill="currentColor"/>
        <path d="M8 12h8M12 8v8" stroke="white" strokeWidth={2} strokeLinecap="round"/>
      </svg>
    ),
    inactiveIcon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" strokeWidth={1.5}/>
        <path d="M8 12h8M12 8v8" strokeWidth={1.5} strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    href: '/settings',
    label: 'Settings',
    activeIcon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
        <path fillRule="evenodd" clipRule="evenodd" d="M11.078 2.25c-.917 0-1.699.663-1.85 1.567L9.05 4.889c-.02.12-.115.26-.297.348a7.493 7.493 0 00-.986.57c-.166.115-.334.126-.45.083L6.3 5.508a1.875 1.875 0 00-2.282.819l-.922 1.597a1.875 1.875 0 00.432 2.385l.84.692c.095.078.17.229.154.43a7.598 7.598 0 000 1.139c.015.2-.059.352-.153.43l-.841.692a1.875 1.875 0 00-.432 2.385l.922 1.597a1.875 1.875 0 002.282.818l1.019-.382c.115-.043.283-.031.45.082.312.214.641.405.985.57.182.088.277.228.297.35l.178 1.071c.151.904.933 1.567 1.85 1.567h1.844c.916 0 1.699-.663 1.85-1.567l.178-1.072c.02-.12.114-.26.297-.349.344-.165.673-.356.985-.57.167-.114.335-.125.45-.082l1.02.382a1.875 1.875 0 002.28-.819l.923-1.597a1.875 1.875 0 00-.432-2.385l-.84-.692c-.095-.078-.17-.229-.154-.43a7.614 7.614 0 000-1.139c-.016-.2.059-.352.153-.43l.84-.692c.708-.582.891-1.59.433-2.385l-.922-1.597a1.875 1.875 0 00-2.282-.818l-1.02.382c-.114.043-.282.031-.449-.083a7.49 7.49 0 00-.985-.57c-.183-.087-.277-.227-.297-.348l-.179-1.072a1.875 1.875 0 00-1.85-1.567h-1.843zM12 15.75a3.75 3.75 0 100-7.5 3.75 3.75 0 000 7.5z"/>
      </svg>
    ),
    inactiveIcon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.559.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.894.149c-.424.07-.764.383-.929.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.398.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.272-.806.108-1.204-.165-.397-.506-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.108-1.204l-.526-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
]

export function BottomNav() {
  const pathname = usePathname()
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-surface-0 border-t border-border-0 z-40">
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex flex-col items-center justify-center
                min-w-[64px] min-h-[56px] py-2 px-3
                transition-spring pressable
                ${isActive ? 'text-link' : 'text-text-1'}
              `}
            >
              {isActive ? item.activeIcon : item.inactiveIcon}
              <span className={`text-[11px] font-semibold mt-1 ${isActive ? 'text-link' : 'text-text-1'}`}>
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
      <div className="pb-safe" />
    </nav>
  )
}

export function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-bg pb-[72px]">
      <div className="max-w-lg mx-auto">
        {children}
      </div>
    </div>
  )
}

export function PageHeader({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <header className="sticky top-0 z-30 bg-surface-0 border-b border-border-0">
      <div className="flex items-center justify-between px-4 pt-5 pb-4">
        <h1 className="text-[22px] font-semibold tracking-tight text-text-0">{title}</h1>
        {action && <div className="flex items-center gap-2">{action}</div>}
      </div>
    </header>
  )
}

export function FAB({ onClick, children }: { onClick?: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-[88px] right-4 w-14 h-14 bg-link text-white rounded-2xl flex items-center justify-center hover:opacity-90 active:scale-95 transition-spring z-30"
    >
      {children}
    </button>
  )
}
```


***

## `components/ui/Button.tsx`

Per the design system, `--link` is the **only accent color** — primary buttons are `bg-link`. Secondary uses `bg-surface-2` (the interactive surface layer) with a `border-border-1` outline. Everything via Tailwind classes :

```tsx
'use client'

import { forwardRef, ButtonHTMLAttributes } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:   'bg-link text-white hover:opacity-90 active:opacity-80',
  secondary: 'bg-surface-2 text-text-0 border border-border-1 hover:bg-surface-1 active:opacity-80',
  ghost:     'bg-transparent text-link hover:bg-surface-2 active:bg-surface-1',
  danger:    'bg-surface-2 text-red-500 border border-border-1 hover:bg-surface-1',
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-[13px] rounded-lg',
  md: 'h-11 px-4 text-[15px] rounded-xl',
  lg: 'h-14 px-6 text-[17px] rounded-xl',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading = false, disabled, className = '', children, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center font-semibold
        transition-spring pressable
        disabled:opacity-40 disabled:cursor-not-allowed
        min-h-[44px]
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className}
      `.trim()}
      {...props}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      {children}
    </button>
  )
)
Button.displayName = 'Button'
```


***

## `components/ui/Card.tsx`

`--surface-0` = primary card (sits on `--bg`). `--surface-1` = nested/inset card. `--border-1` = component border per the design guide:[^1]

```tsx
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
```


***

## `components/ui/Input.tsx`

`bg-surface-2` for inputs — that is the *interactive surface* token per your design file. Border uses `border-border-1` (component-level). Focus ring uses `focus:ring-link focus:border-link`:[^1]

```tsx
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

interface InputProps extends InputHTMLAttributes<HTMLInputElement> { label?: string; error?: string }
interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> { label?: string; error?: string }

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
```


***

## `components/ui/SegmentedControl.tsx` — Horizontal Scroll Strip

The current component breaks on mobile with 6 items . Rewrite as a horizontally scrollable tab strip where the active item gets `text-text-0` and a `border-b-2 border-link` indicator — matching the BlackTwist queue filter style:[^2]

```tsx
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
```

Add to `tailwind.config.ts` under `theme.extend`:

```ts
// Remove scrollbar on the tab strip
plugins: [
  require('@tailwindcss/forms'), // if you use it
],
// In globals.css add:
// .scrollbar-none { -ms-overflow-style: none; scrollbar-width: none; }
// .scrollbar-none::-webkit-scrollbar { display: none; }
```

Or just add these two rules to the bottom of `globals.css`:

```css
.scrollbar-none { -ms-overflow-style: none; scrollbar-width: none; }
.scrollbar-none::-webkit-scrollbar { display: none; }
```


***

## `components/ui/ListRow.tsx`

Remove the hardcoded `active:bg-surface-1` class and replace with `bg-surface-0` base, using the design system's hover surface per the elevation model. Section headers use `text-text-2` uppercase per the iOS settings pattern:[^1]

```tsx
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

export function List({ className = '', children, ...props }: HTMLAttributes<HTMLDivElement> & { children: ReactNode }) {
  return (
    <div className={`overflow-hidden rounded-2xl bg-surface-0 border border-border-1 divide-y divide-border-2 ${className}`} {...props}>
      {children}
    </div>
  )
}
```


***

## `components/ui/BottomSheet.tsx`

Sheet background is `bg-surface-0` (primary card surface). Drag handle uses `bg-border-1`. The close button uses `bg-surface-2` on hover — the interactive hover surface:[^1]

```tsx
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
        onTouchStart={(e) => dragStart(e.touches[^0].clientY)}
        onTouchMove={(e) => dragMove(e.touches[^0].clientY)}
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
```


***

## `app/queue/page.tsx` — Status Pills Using Design System Only

The current status pills use hardcoded hex colors like `#e0f0ff` . Since this is a personal internal app with no public users, simplify status to use **text color only** — no colored backgrounds. Only `--link` gets a background (for Scheduled, as the primary action state):[^1]

```tsx
// In the statusConfig — replace hardcoded colors:
const statusConfig: Record<PostStatus, { label: string; className: string }> = {
  scheduled:  { label: 'Scheduled',  className: 'bg-link/10 text-link' },
  draft:      { label: 'Draft',      className: 'bg-surface-2 text-text-1 border border-border-1' },
  publishing: { label: 'Publishing', className: 'bg-surface-2 text-text-0 border border-border-1' },
  published:  { label: 'Published',  className: 'bg-surface-2 text-text-1 border border-border-1' },
  failed:     { label: 'Failed',     className: 'bg-surface-2 text-red-500 border border-border-1' },
}

// In PostCard, replace the status badge:
<span className={`shrink-0 px-2.5 py-1 text-[12px] font-semibold rounded-full ${status.className}`}>
  {status.label}
</span>
```

And the `EmptyState` — replace the generic document SVG with a proper empty state:

```tsx
function EmptyState({ filter }: { filter: FilterStatus }) {
  const messages: Record<FilterStatus, { title: string; sub: string }> = {
    all:        { title: 'No posts yet',          sub: 'Write your first thread to get started.' },
    scheduled:  { title: 'Nothing scheduled',     sub: 'Plan ahead — compose a post and pick a time.' },
    publishing: { title: 'Nothing publishing',    sub: 'Posts will appear here when going live.' },
    draft:      { title: 'No drafts saved',       sub: 'Start writing and your draft saves automatically.' },
    published:  { title: 'No published posts yet',sub: 'Posts you\'ve sent will appear here.' },
    failed:     { title: 'No failed posts',       sub: 'All clear.' },
  }
  const { title, sub } = messages[filter]

  return (
    <div className="flex flex-col items-center justify-center py-24 px-8 animate-fade-in text-center">
      <div className="w-16 h-16 rounded-2xl bg-surface-2 border border-border-1 flex items-center justify-center mb-5">
        <svg className="w-8 h-8 text-text-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.25}
            d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
        </svg>
      </div>
      <p className="text-[17px] font-semibold text-text-0 mb-1">{title}</p>
      <p className="text-[14px] text-text-1 max-w-[240px]">{sub}</p>
    </div>
  )
}
```


***

## `app/settings/page.tsx` — Remove Hardcoded Colors

The settings page  has a few hardcoded color violations to fix. Replace these specific sections:

```tsx
// ThemeToggle: replace bg-surface-2 toggle track, already correct
// bg-yellow-500 sun icon → use text-link instead (only one accent)
// Remove all dark:bg-yellow-900/30, dark:border-yellow-800, etc.

// Warning banner — replace:
// bg-yellow-50 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-800
// text-yellow-800 dark:text-yellow-200 text-yellow-700 dark:text-yellow-300
// With:
<div className="mb-4 p-3 bg-surface-2 rounded-xl border border-border-1">
  <p className="text-[13px] text-text-1">
    Your session is expiring {expiresIn ? `in ${formatExpiry(expiresIn)}` : 'soon'}.
    Please reconnect to continue.
  </p>
  <button onClick={handleReconnect} className="mt-2 text-[13px] font-semibold text-link">
    Reconnect Now →
  </button>
</div>

// Connected badge — replace bg-green-100 text-green-700 dark:... with:
<span className="px-2.5 py-1 text-[11px] font-semibold bg-link/10 text-link rounded-full">
  Connected
</span>

// Error card — replace bg-red-50 dark:bg-red-900/30 border-red-200... with:
<div className="p-3 bg-surface-2 rounded-xl border border-border-1">
  <p className="text-[13px] text-red-500 mb-2">Connection Error: {connectionStatus.error}</p>
  <Button variant="primary" size="sm" onClick={...}>Reconnect</Button>
</div>

// Health status values — replace text-green-600 dark:text-green-400 with text-link:
<ListRow label="Server Status" value="Online" valueClassName="text-link" />
<ListRow label="API Status"    value="Ready"  valueClassName="text-link" />
```


***

## The Rule Going Forward

Since your `tailwind.config.ts`  already bridges all CSS variables to Tailwind classes, the constraint is simple:


| Situation | Right approach |
| :-- | :-- |
| Background | `bg-bg` / `bg-surface-0` / `bg-surface-1` / `bg-surface-2` |
| Text | `text-text-0` / `text-text-1` / `text-text-2` |
| Borders | `border-border-0` / `border-border-1` / `border-border-2` |
| Accent (buttons, active, links) | `bg-link` / `text-link` / `ring-link` |
| Hover on interactive rows | `hover:bg-surface-2`, active `active:bg-surface-2` |
| Status colors | `text-link` (good), `text-red-500` (errors only) |
| ❌ Never | Hardcode `#hex`, `dark:bg-*` semantic overrides, or multi-color accent variants |

Every color decision traces back to one of your 10 variables  — the system is deliberately this constrained so the UI always feels cohesive.[^1]
<span style="display:none">[^3]</span>

<div align="center">⁂</div>

[^1]: UI_DESIGN_CORE_DESIGN_SYSTEM_AND_CSS.txt

[^2]: IMG_2222.jpeg

[^3]: UI_DESIGN_CORE_DESIGN_SYSTEM_AND_CSS.txt

