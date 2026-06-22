'use client'

import { COLORS, FONT_SIZE, RADIUS } from '@/lib/constants'
import type { ReactNode } from 'react'

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost'
type Size    = 'sm' | 'md' | 'lg'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
  children: ReactNode
}

const variantStyles: Record<Variant, React.CSSProperties> = {
  primary: {
    backgroundColor: COLORS.primary,
    color: '#fff',
    border: 'none',
  },
  secondary: {
    backgroundColor: '#fff',
    color: COLORS.text,
    border: `1px solid ${COLORS.border}`,
  },
  danger: {
    backgroundColor: COLORS.danger,
    color: '#fff',
    border: 'none',
  },
  ghost: {
    backgroundColor: 'transparent',
    color: COLORS.textMuted,
    border: 'none',
  },
}

const sizeStyles: Record<Size, React.CSSProperties> = {
  sm: { padding: '5px 10px', fontSize: FONT_SIZE.xs },
  md: { padding: '8px 16px', fontSize: FONT_SIZE.sm },
  lg: { padding: '11px 20px', fontSize: FONT_SIZE.base },
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  children,
  style,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading

  return (
    <button
      disabled={isDisabled}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px',
        fontWeight: '500',
        borderRadius: RADIUS.md,
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        opacity: isDisabled ? 0.6 : 1,
        transition: 'opacity 0.15s, background-color 0.15s',
        whiteSpace: 'nowrap',
        ...variantStyles[variant],
        ...sizeStyles[size],
        ...style,
      }}
      {...props}
    >
      {loading && (
        <span style={{
          width: '12px',
          height: '12px',
          border: '2px solid currentColor',
          borderTopColor: 'transparent',
          borderRadius: '50%',
          display: 'inline-block',
          animation: 'spin 0.6s linear infinite',
        }} />
      )}
      {children}
    </button>
  )
}
