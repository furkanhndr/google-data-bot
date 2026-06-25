'use client'

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'

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

const toastClasses: Record<ToastType, { bg: string; text: string; border: string }> = {
  success: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-300' },
  error:   { bg: 'bg-red-50',   text: 'text-danger',   border: 'border-red-300' },
  warning: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-300' },
  info:    { bg: 'bg-blue-50',   text: 'text-primary', border: 'border-blue-300' },
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
      <div className="fixed bottom-6 right-6 flex flex-col gap-2 z-50 pointer-events-none">
        {toasts.map(t => {
          const { bg, text, border } = toastClasses[t.type]
          return (
            <div key={t.id} className={`flex items-center gap-2.5 px-4 py-3 rounded-md shadow-md text-sm min-w-65 max-w-95 pointer-events-auto animate-slideIn ${
              bg
            } border ${border} ${text}`}>
              <span className="font-bold flex-shrink-0">{icons[t.type]}</span>
              <span>{t.message}</span>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}
