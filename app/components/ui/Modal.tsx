'use client'

import { useEffect } from 'react'
import { COLORS, FONT_SIZE, RADIUS, SHADOW } from '@/lib/constants'
import type { ReactNode } from 'react'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  width?: number
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
        style={{
          position: 'fixed', inset: 0,
          backgroundColor: 'rgba(0,0,0,0.45)',
          zIndex: 100,
        }}
      />
      {/* Dialog */}
      <div style={{
        position: 'fixed',
        top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '100%',
        maxWidth: width,
        backgroundColor: COLORS.bgCard,
        borderRadius: RADIUS.xl,
        boxShadow: SHADOW.lg,
        zIndex: 101,
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '20px 24px',
          borderBottom: `1px solid ${COLORS.border}`,
        }}>
          <h2 style={{ margin: 0, fontSize: FONT_SIZE.lg, fontWeight: '600', color: COLORS.text }}>
            {title}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: COLORS.textMuted, fontSize: '20px', lineHeight: 1, padding: '2px',
            }}
          >×</button>
        </div>
        {/* Body */}
        <div style={{ padding: '24px' }}>
          {children}
        </div>
      </div>
    </>
  )
}
