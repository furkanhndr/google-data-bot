'use client'

import { COLORS, FONT_SIZE, RADIUS } from '@/lib/constants'
import { useState } from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
}

export function Input({ label, error, hint, style, ...props }: InputProps) {
  const [focused, setFocused] = useState(false)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      {label && (
        <label style={{
          fontSize: FONT_SIZE.sm,
          fontWeight: '500',
          color: COLORS.text,
        }}>
          {label}
          {props.required && <span style={{ color: COLORS.danger, marginLeft: '2px' }}>*</span>}
        </label>
      )}
      <input
        onFocus={e => { setFocused(true); props.onFocus?.(e) }}
        onBlur={e => { setFocused(false); props.onBlur?.(e) }}
        style={{
          padding: '9px 12px',
          border: `1px solid ${error ? COLORS.danger : focused ? COLORS.borderFocus : COLORS.border}`,
          borderRadius: RADIUS.md,
          fontSize: FONT_SIZE.base,
          color: COLORS.text,
          backgroundColor: props.disabled ? COLORS.bg : '#fff',
          outline: 'none',
          width: '100%',
          boxSizing: 'border-box',
          transition: 'border-color 0.15s',
          ...style,
        }}
        {...props}
      />
      {error && (
        <span style={{ fontSize: FONT_SIZE.xs, color: COLORS.danger }}>{error}</span>
      )}
      {hint && !error && (
        <span style={{ fontSize: FONT_SIZE.xs, color: COLORS.textMuted }}>{hint}</span>
      )}
    </div>
  )
}
