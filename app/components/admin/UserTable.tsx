'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { useToast } from '@/components/ui/Toast'
import { useRouter } from 'next/navigation'
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
      <div className="flex flex-col gap-4">

        {/* Role */}
        <div>
          <label className="text-sm font-medium text-text block mb-1.5">Rol</label>
          <div className="flex gap-2">
            {(['customer', 'admin'] as const).map(r => (
              <button
                key={r}
                onClick={() => setRole(r)}
                className={`flex-1 p-2 border-2 rounded-md cursor-pointer text-sm ${
                  role === r
                    ? 'border-primary bg-primaryLight text-primary font-semibold'
                    : 'border-border bg-white text-text font-normal'
                }`}
              >
                {r === 'admin' ? 'Admin' : 'Kullanıcı'}
              </button>
            ))}
          </div>
        </div>

        {/* Plan */}
        <div>
          <label className="text-sm font-medium text-text block mb-1.5">Plan</label>
          <div className="flex gap-2">
            {(['free', 'premium'] as const).map(p => (
              <button
                key={p}
                onClick={() => setPlan(p)}
                className={`flex-1 p-2 border-2 rounded-md cursor-pointer text-sm ${
                  plan === p
                    ? 'border-warning bg-warningLight text-warning font-semibold'
                    : 'border-border bg-white text-text font-normal'
                }`}
              >
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
        <div className={`flex items-center justify-between px-3.5 py-2.5 rounded-md border ${isSuspended ? 'bg-dangerLight border-red-300' : 'bg-bg border-border'}`}>
          <div>
            <div className="text-sm font-medium text-text">Hesap Askıya Alma</div>
            <div className="text-xs text-textMuted">Kullanıcı giriş yapamaz ve yeni iş oluşturamaz</div>
          </div>
          <button
            onClick={() => setIsSuspended(!isSuspended)}
            className={`px-3.5 py-1.5 rounded-md border-none cursor-pointer text-sm font-semibold ${
              isSuspended ? 'bg-danger text-white' : 'bg-border text-textMuted'
            }`}
          >
            {isSuspended ? 'Askıda' : 'Aktif'}
          </button>
        </div>

        {/* Actions */}
        <div className="flex gap-2.5 justify-end mt-1">
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
      <div className="mb-4">
        <input
          placeholder="E-posta veya isim ara..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="px-3.5 py-2 border border-border rounded-md text-sm outline-none w-[280px]"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto border border-border rounded-md bg-bgCard">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-bg">
              {['E-posta', 'Ad', 'Rol', 'Plan', 'Kredi', 'Durum', 'Kayıt', ''].map(h => (
                <th key={h} className="px-3.5 py-2.5 text-left font-semibold text-textMuted border-b-2 border-border whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-10 text-center text-textMuted">
                  Kullanıcı bulunamadı.
                </td>
              </tr>
            ) : filtered.map(u => (
              <tr key={u.id} className="border-b border-border">
                <td className="px-3.5 py-2.5 text-text font-medium">{u.email}</td>
                <td className="px-3.5 py-2.5 text-textMuted">{u.display_name ?? '—'}</td>
                <td className="px-3.5 py-2.5">
                  <Badge variant={u.role === 'admin' ? 'info' : 'default'}>
                    {u.role === 'admin' ? 'Admin' : 'Kullanıcı'}
                  </Badge>
                </td>
                <td className="px-3.5 py-2.5">
                  <Badge variant={u.plan === 'premium' ? 'warning' : 'default'}>
                    {u.plan === 'premium' ? '⭐ Premium' : 'Ücretsiz'}
                  </Badge>
                </td>
                <td className="px-3.5 py-2.5 text-text">
                  {u.credits_used} / {u.credits_total}
                </td>
                <td className="px-3.5 py-2.5">
                  <Badge variant={u.is_suspended ? 'danger' : 'success'}>
                    {u.is_suspended ? 'Askıda' : 'Aktif'}
                  </Badge>
                </td>
                <td className="px-3.5 py-2.5 text-textMuted whitespace-nowrap">
                  {formatDate(u.created_at)}
                </td>
                <td className="px-3.5 py-2.5">
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
