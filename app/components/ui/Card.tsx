import { COLORS } from '@/lib/constants'
import type { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  padding?: string
  className?: string
}

const paddingClasses: Record<string, string> = {
  '0': 'p-0',
  '16px': 'p-4',
  '24px': 'p-6',
}

const colorClasses: Record<string, string> = {
  [COLORS.primary]: 'text-primary',
  [COLORS.success]: 'text-success',
  [COLORS.danger]: 'text-danger',
  [COLORS.textMuted]: 'text-textMuted',
  '#7C3AED': 'text-violet-600',
  '#D97706': 'text-warning',
  '#FBBF24': 'text-amber-400',
}

export function Card({ children, padding = '24px', className = '' }: CardProps) {
  return (
    <div className={`bg-bgCard rounded-lg border border-border shadow-sm ${paddingClasses[padding] ?? 'p-6'} ${className}`}>
      {children}
    </div>
  )
}

interface StatCardProps {
  label: string
  value: string | number
  sub?: string
  color?: string
}

export function StatCard({ label, value, sub, color = COLORS.primary }: StatCardProps) {
  return (
    <Card>
      <div className="text-xs text-textMuted mb-2">{label}</div>
      <div className={`text-3xl font-bold leading-tight ${colorClasses[color] ?? 'text-primary'}`}>{value}</div>
      {sub && <div className="text-xs text-textLight mt-1.5">{sub}</div>}
    </Card>
  )
}
