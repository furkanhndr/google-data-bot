'use client'

import type { ReactNode } from 'react'

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost'
type Size    = 'sm' | 'md' | 'lg'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
  children: ReactNode
}

const variantClasses: Record<Variant, string> = {
  primary: 'bg-primary text-white border-none',
  secondary: 'bg-white text-text border border-border',
  danger: 'bg-danger text-white border-none',
  ghost: 'bg-transparent text-textMuted border-none',
}

const sizeClasses: Record<Size, string> = {
  sm: 'px-2.5 py-1.25 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-5 py-2.75 text-base',
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  children,
  className = '',
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading

  return (
    <button
      disabled={isDisabled}
      className={`inline-flex items-center justify-center gap-1.5 font-medium rounded-md cursor-pointer transition-all whitespace-nowrap disabled:opacity-60 disabled:cursor-not-allowed ${
        variantClasses[variant]
      } ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {loading && (
        <span className="inline-block w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
      )}
      {children}
    </button>
  )
}
