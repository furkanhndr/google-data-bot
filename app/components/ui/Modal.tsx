'use client'

import { useEffect } from 'react'
import type { ReactNode } from 'react'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  width?: number
}

const widthClasses: Record<number, string> = {
  460: 'max-w-[460px]',
  480: 'max-w-[480px]',
}

export function Modal({ open, onClose, title, children, width = 480 }: ModalProps) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/45 z-50"
      />
      {/* Dialog */}
      <div className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full bg-bgCard rounded-xl shadow-lg z-50 overflow-hidden ${widthClasses[width] ?? 'max-w-[480px]'}`}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border">
          <h2 className="m-0 text-lg font-semibold text-text">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="bg-none border-none cursor-pointer text-textMuted text-xl leading-none p-0.5"
          >×</button>
        </div>
        {/* Body */}
        <div className="p-6">
          {children}
        </div>
      </div>
    </>
  )
}
