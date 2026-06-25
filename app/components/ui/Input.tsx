'use client'

import { useState } from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
}

export function Input({ label, error, hint, className = '', ...props }: InputProps) {
  const [focused, setFocused] = useState(false)

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-sm font-medium text-text">
          {label}
          {props.required && <span className="text-danger ml-0.5">*</span>}
        </label>
      )}
      <input
        onFocus={e => { setFocused(true); props.onFocus?.(e) }}
        onBlur={e => { setFocused(false); props.onBlur?.(e) }}
        className={`px-3 py-2.25 border rounded-md text-base text-text bg-white outline-none w-full box-border transition-colors ${
          error ? 'border-danger' : focused ? 'border-blue-400' : 'border-border'
        } disabled:bg-bg ${className}`}
        {...props}
      />
      {error && (
        <span className="text-xs text-danger">{error}</span>
      )}
      {hint && !error && (
        <span className="text-xs text-textMuted">{hint}</span>
      )}
    </div>
  )
}
