'use client'

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import { COLORS, FONT_SIZE, RADIUS, SHADOW } from '@/lib/constants'

type ToastType = 'success' | 'error' | 'warning' | 'info'

interface Toast {
  id: number
  type: ToastType
  message: string
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void
}

const ToastContext = createContext<ToastContextValue>({ toast: () => {} })

export function useToast() {
  return useContext(ToastContext)
}

const icons: Record<ToastType, string> = {
  success: '✓',
  error:   '✕',
  warning: '⚠',
  info:    'ℹ',
}

const colors: Record<ToastType, { bg: string; color: string; border: string }> = {
  success: { bg: COLORS.successLight, color: COLORS.success, border: '#86EFAC' },
  error:   { bg: COLORS.dangerLight,  color: COLORS.danger,  border: '#FCA5A5' },
  warning: { bg: COLORS.warningLight, color: COLORS.warning, border: '#FCD34D' },
  info:    { bg: COLORS.primaryLight, color: COLORS.primary, border: '#93C5FD' },
}

let _id = 0

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = useCallback((message: string, type: ToastType = 'info') => {
    const id = ++_id
    setToasts(prev => [...prev, { id, type, message }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000)
  }, [])

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {/* Toast stack */}
      <div style={{
        position: 'fixed', bottom: '24px', right: '24px',
        display: 'flex', flexDirection: 'column', gap: '8px',
        zIndex: 200,
        pointerEvents: 'none',
      }}>
        {toasts.map(t => {
          const { bg, color, border } = colors[t.type]
          return (
            <div key={t.id} style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '12px 16px',
              backgroundColor: bg,
              border: `1px solid ${border}`,
              borderRadius: RADIUS.md,
              boxShadow: SHADOW.md,
              fontSize: FONT_SIZE.sm,
              color,
              minWidth: '260px',
              maxWidth: '380px',
              pointerEvents: 'auto',
              animation: 'slideIn 0.2s ease',
            }}>
              <span style={{ fontWeight: '700', flexShrink: 0 }}>{icons[t.type]}</span>
              <span>{t.message}</span>
            </div>
          )
        })}
      </div>
      <style>{`@keyframes slideIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }`}</style>
    </ToastContext.Provider>
  )
}
