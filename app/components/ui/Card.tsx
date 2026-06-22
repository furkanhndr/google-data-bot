import { COLORS, RADIUS, SHADOW, SPACING } from '@/lib/constants'
import type { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  padding?: string
  style?: React.CSSProperties
}

export function Card({ children, padding = SPACING.lg, style }: CardProps) {
  return (
    <div style={{
      backgroundColor: COLORS.bgCard,
      borderRadius: RADIUS.lg,
      border: `1px solid ${COLORS.border}`,
      boxShadow: SHADOW.sm,
      padding,
      ...style,
    }}>
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
      <div style={{ fontSize: '13px', color: COLORS.textMuted, marginBottom: '8px' }}>{label}</div>
      <div style={{ fontSize: '28px', fontWeight: '700', color, lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: '12px', color: COLORS.textLight, marginTop: '6px' }}>{sub}</div>}
    </Card>
  )
}
