'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { useToast } from '@/components/ui/Toast'
import { useRouter } from 'next/navigation'
import { COLORS, FONT_SIZE, RADIUS } from '@/lib/constants'
import type { UserWithEmail } from '@googlebusinessdata/shared-types'

function formatDate(iso: string) {
  return new Intl.DateTimeFormat('tr-TR', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(iso))
}

interface EditModalProps {
  user: UserWithEmail
  onClose: () => void
  onSaved: () => void
}

function EditUserModal({ user, onClose, onSaved }: EditModalProps) {
  const { toast } = useToast()
  const [role,         setRole]         = useState(user.role)
  const [plan,         setPlan]         = useState(user.plan)
  const [credits,      setCredits]      = useState(user.credits_total)
  const [isSuspended,  setIsSuspended]  = useState(user.is_suspended)
  const [loading,      setLoading]      = useState(false)

  async function handleSave() {
    setLoading(true)
    const res = await fetch(`/api/admin/users/${user.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role, plan, credits_total: credits, is_suspended: isSuspended }),
    })
    const data = await res.json()
    if (!res.ok) {
      toast(data.error ?? 'Kaydetme başarısız.', 'error')
    } else {
      toast('Kullanıcı güncellendi.', 'success')
      onSaved()
      onClose()
    }
    setLoading(false)
  }

  return (
    <Modal open title={`Düzenle: ${user.email}`} onClose={onClose} width={460}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

        {/* Role */}
        <div>
          <label style={{ fontSize: FONT_SIZE.sm, fontWeight: '500', color: COLORS.text, display: 'block', marginBottom: '6px' }}>Rol</label>
          <div style={{ display: 'flex', gap: '8px' }}>
            {(['customer', 'admin'] as const).map(r => (
              <button key={r} onClick={() => setRole(r)} style={{
                flex: 1, padding: '8px', border: `2px solid ${role === r ? COLORS.primary : COLORS.border}`,
                borderRadius: RADIUS.md, cursor: 'pointer', fontWeight: role === r ? '600' : '400',
                backgroundColor: role === r ? COLORS.primaryLight : '#fff',
                color: role === r ? COLORS.primary : COLORS.text, fontSize: FONT_SIZE.sm,
              }}>
                {r === 'admin' ? 'Admin' : 'Kullanıcı'}
              </button>
            ))}
          </div>
        </div>

        {/* Plan */}
        <div>
          <label style={{ fontSize: FONT_SIZE.sm, fontWeight: '500', color: COLORS.text, display: 'block', marginBottom: '6px' }}>Plan</label>
          <div style={{ display: 'flex', gap: '8px' }}>
            {(['free', 'premium'] as const).map(p => (
              <button key={p} onClick={() => setPlan(p)} style={{
                flex: 1, padding: '8px', border: `2px solid ${plan === p ? '#D97706' : COLORS.border}`,
                borderRadius: RADIUS.md, cursor: 'pointer', fontWeight: plan === p ? '600' : '400',
                backgroundColor: plan === p ? '#FFFBEB' : '#fff',
                color: plan === p ? '#D97706' : COLORS.text, fontSize: FONT_SIZE.sm,
              }}>
                {p === 'premium' ? '⭐ Premium' : 'Ücretsiz'}
              </button>
            ))}
          </div>
        </div>

        {/* Credits */}
        <Input
          label="Toplam Kredi"
          type="number"
          min={0}
          value={credits}
          onChange={e => setCredits(parseInt(e.target.value) || 0)}
        />

        {/* Suspend toggle */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', backgroundColor: isSuspended ? COLORS.dangerLight : COLORS.bg, borderRadius: RADIUS.md, border: `1px solid ${isSuspended ? '#FCA5A5' : COLORS.border}` }}>
          <div>
            <div style={{ fontSize: FONT_SIZE.sm, fontWeight: '500', color: COLORS.text }}>Hesap Askıya Alma</div>
            <div style={{ fontSize: FONT_SIZE.xs, color: COLORS.textMuted }}>Kullanıcı giriş yapamaz ve yeni iş oluşturamaz</div>
          </div>
          <button onClick={() => setIsSuspended(!isSuspended)} style={{
            padding: '6px 14px', borderRadius: RADIUS.md, border: 'none', cursor: 'pointer',
            backgroundColor: isSuspended ? COLORS.danger : COLORS.border,
            color: isSuspended ? '#fff' : COLORS.textMuted,
            fontSize: FONT_SIZE.sm, fontWeight: '600',
          }}>
            {isSuspended ? 'Askıda' : 'Aktif'}
          </button>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '4px' }}>
          <Button variant="secondary" onClick={onClose}>İptal</Button>
          <Button loading={loading} onClick={handleSave}>Kaydet</Button>
        </div>
      </div>
    </Modal>
  )
}

export function UserTable({ users: initialUsers }: { users: UserWithEmail[] }) {
  const router = useRouter()
  const [users] = useState(initialUsers)
  const [editingUser, setEditingUser] = useState<UserWithEmail | null>(null)
  const [search,      setSearch]      = useState('')

  const filtered = search
    ? users.filter(u =>
        u.email.toLowerCase().includes(search.toLowerCase()) ||
        u.display_name?.toLowerCase().includes(search.toLowerCase())
      )
    : users

  return (
    <>
      {/* Search */}
      <div style={{ marginBottom: '16px' }}>
        <input
          placeholder="E-posta veya isim ara..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            padding: '8px 14px', border: `1px solid ${COLORS.border}`,
            borderRadius: RADIUS.md, fontSize: FONT_SIZE.sm, outline: 'none',
            width: '280px',
          }}
        />
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto', border: `1px solid ${COLORS.border}`, borderRadius: RADIUS.md, backgroundColor: COLORS.bgCard }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: FONT_SIZE.sm }}>
          <thead>
            <tr style={{ backgroundColor: COLORS.bg }}>
              {['E-posta', 'Ad', 'Rol', 'Plan', 'Kredi', 'Durum', 'Kayıt', ''].map(h => (
                <th key={h} style={{
                  padding: '10px 14px', textAlign: 'left', fontWeight: '600',
                  color: COLORS.textMuted, borderBottom: `2px solid ${COLORS.border}`,
                  whiteSpace: 'nowrap',
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ padding: '40px', textAlign: 'center', color: COLORS.textMuted }}>
                  Kullanıcı bulunamadı.
                </td>
              </tr>
            ) : filtered.map(u => (
              <tr key={u.id} style={{ borderBottom: `1px solid ${COLORS.border}` }}>
                <td style={{ padding: '10px 14px', color: COLORS.text, fontWeight: '500' }}>{u.email}</td>
                <td style={{ padding: '10px 14px', color: COLORS.textMuted }}>{u.display_name ?? '—'}</td>
                <td style={{ padding: '10px 14px' }}>
                  <Badge variant={u.role === 'admin' ? 'info' : 'default'}>
                    {u.role === 'admin' ? 'Admin' : 'Kullanıcı'}
                  </Badge>
                </td>
                <td style={{ padding: '10px 14px' }}>
                  <Badge variant={u.plan === 'premium' ? 'warning' : 'default'}>
                    {u.plan === 'premium' ? '⭐ Premium' : 'Ücretsiz'}
                  </Badge>
                </td>
                <td style={{ padding: '10px 14px', color: COLORS.text }}>
                  {u.credits_used} / {u.credits_total}
                </td>
                <td style={{ padding: '10px 14px' }}>
                  <Badge variant={u.is_suspended ? 'danger' : 'success'}>
                    {u.is_suspended ? 'Askıda' : 'Aktif'}
                  </Badge>
                </td>
                <td style={{ padding: '10px 14px', color: COLORS.textMuted, whiteSpace: 'nowrap' }}>
                  {formatDate(u.created_at)}
                </td>
                <td style={{ padding: '10px 14px' }}>
                  <Button size="sm" variant="secondary" onClick={() => setEditingUser(u)}>
                    Düzenle
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editingUser && (
        <EditUserModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSaved={() => {
            router.refresh()
            setEditingUser(null)
          }}
        />
      )}
    </>
  )
}
