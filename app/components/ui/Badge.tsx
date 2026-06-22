import { COLORS, FONT_SIZE, RADIUS } from '@/lib/constants'
import type { ReactNode } from 'react'

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info'

const variantMap: Record<BadgeVariant, { bg: string; color: string }> = {
  default: { bg: COLORS.bg,           color: COLORS.textMuted },
  success: { bg: COLORS.successLight,  color: COLORS.success },
  warning: { bg: COLORS.warningLight,  color: COLORS.warning },
  danger:  { bg: COLORS.dangerLight,   color: COLORS.danger },
  info:    { bg: COLORS.primaryLight,  color: COLORS.primary },
}

interface BadgeProps {
  variant?: BadgeVariant
  children: ReactNode
}

export function Badge({ variant = 'default', children }: BadgeProps) {
  const { bg, color } = variantMap[variant]
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      padding: '2px 8px',
      borderRadius: RADIUS.full,
      fontSize: FONT_SIZE.xs,
      fontWeight: '500',
      backgroundColor: bg,
      color,
      whiteSpace: 'nowrap',
    }}>
      {children}
    </span>
  )
}

// Job status → badge variant mapping
export function JobStatusBadge({ status }: { status: string }) {
  const map: Record<string, { variant: BadgeVariant; label: string }> = {
    pending:   { variant: 'warning', label: 'Bekliyor' },
    running:   { variant: 'info',    label: 'Çalışıyor' },
    completed: { variant: 'success', label: 'Tamamlandı' },
    failed:    { variant: 'danger',  label: 'Hata' },
    cancelled: { variant: 'default', label: 'İptal' },
  }
  const { variant, label } = map[status] ?? { variant: 'default', label: status }
  return <Badge variant={variant}>{label}</Badge>
}
