import type { ReactNode } from 'react'
import { COLORS, SHADOW } from '@/lib/constants'

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: COLORS.bg,
      padding: '24px',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '420px',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
          }}>
            <div style={{
              width: '36px',
              height: '36px',
              backgroundColor: COLORS.primary,
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: '18px',
              fontWeight: '700',
            }}>G</div>
            <span style={{
              fontSize: '20px',
              fontWeight: '700',
              color: COLORS.text,
            }}>BusinessData</span>
          </div>
        </div>

        {/* Card */}
        <div style={{
          backgroundColor: COLORS.bgCard,
          borderRadius: '12px',
          padding: '32px',
          boxShadow: SHADOW.md,
          border: `1px solid ${COLORS.border}`,
        }}>
          {children}
        </div>
      </div>
    </div>
  )
}
