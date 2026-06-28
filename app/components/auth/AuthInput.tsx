'use client'

import { useId, useState, type ReactNode } from 'react'

function IconMail() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-[18px] w-[18px]" aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.7" />
      <path d="m3.5 6.5 8.5 6 8.5-6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  )
}

function IconLock() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-[18px] w-[18px]" aria-hidden="true">
      <rect x="4.5" y="11" width="15" height="9.5" rx="2" stroke="currentColor" strokeWidth="1.7" />
      <path d="M7.5 11V7.5a4.5 4.5 0 0 1 9 0V11" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  )
}

function IconUser() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-[18px] w-[18px]" aria-hidden="true">
      <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.7" />
      <path d="M4.5 20c1.2-3.5 4-5.5 7.5-5.5s6.3 2 7.5 5.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  )
}

function IconEye({ off = false }: { off?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-[18px] w-[18px]" aria-hidden="true">
      <path
        d="M2.5 12S5.8 6 12 6s9.5 6 9.5 6-3.3 6-9.5 6-9.5-6-9.5-6Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="2.6" stroke="currentColor" strokeWidth="1.7" />
      {off && <path d="M3 3 21 21" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />}
    </svg>
  )
}

const ICONS = { mail: IconMail, lock: IconLock, user: IconUser } as const

interface AuthInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'id'> {
  label: string
  icon: keyof typeof ICONS
  error?: string
  trailing?: ReactNode
}

export function AuthInput({ label, icon, error, trailing, type, className = '', ...props }: AuthInputProps) {
  const id = useId()
  const [revealed, setRevealed] = useState(false)
  const Icon = ICONS[icon]
  const isPassword = type === 'password'
  const resolvedType = isPassword ? (revealed ? 'text' : 'password') : type

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-text">
        {label}
        {props.required && <span className="ml-0.5 text-danger">*</span>}
      </label>
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-textLight">
          <Icon />
        </span>
        <input
          id={id}
          type={resolvedType}
          className={`w-full rounded-lg border bg-white py-2.5 pl-10 ${isPassword ? 'pr-10' : 'pr-3.5'} text-[15px] text-text outline-none transition-colors box-border placeholder:text-textLight disabled:bg-bg disabled:cursor-not-allowed ${
            error ? 'border-danger' : 'border-border focus:border-primary'
          } ${className}`}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setRevealed(r => !r)}
            tabIndex={-1}
            aria-label={revealed ? 'Şifreyi gizle' : 'Şifreyi göster'}
            className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-textLight transition-colors hover:text-textMuted"
          >
            <IconEye off={revealed} />
          </button>
        )}
        {trailing}
      </div>
      {error && <span className="text-xs text-danger">{error}</span>}
    </div>
  )
}
