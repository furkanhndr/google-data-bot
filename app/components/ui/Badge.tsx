import type { ReactNode } from 'react'

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info'

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-gray-50 text-textMuted',
  success: 'bg-green-50 text-green-700',
  warning: 'bg-yellow-50 text-yellow-700',
  danger:  'bg-red-50 text-danger',
  info:    'bg-blue-50 text-primary',
}

interface BadgeProps {
  variant?: BadgeVariant
  children: ReactNode
}

export function Badge({ variant = 'default', children }: BadgeProps) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${
      variantClasses[variant]
    }`}>
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
