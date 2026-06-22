import { createServiceClient } from '@/lib/supabase/server'
import { UserTable } from '@/components/admin/UserTable'
import { COLORS, FONT_SIZE } from '@/lib/constants'
import type { UserWithEmail } from '@googlebusinessdata/shared-types'

export default async function AdminUsersPage() {
  const serviceClient = await createServiceClient()

  const { data: profiles } = await serviceClient
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(200)

  const { data: authUsers } = await serviceClient.auth.admin.listUsers({ perPage: 1000 })
  const emailMap = new Map((authUsers?.users ?? []).map(u => [u.id, u.email ?? '']))

  const users: UserWithEmail[] = (profiles ?? []).map(p => ({
    ...p,
    email: emailMap.get(p.id) ?? '',
  }))

  return (
    <div style={{ padding: '32px' }}>
      <h1 style={{ margin: '0 0 8px', fontSize: FONT_SIZE['2xl'], fontWeight: '700', color: COLORS.text }}>
        Kullanıcılar
      </h1>
      <p style={{ margin: '0 0 24px', fontSize: FONT_SIZE.sm, color: COLORS.textMuted }}>
        {users.length} kullanıcı
      </p>
      <UserTable users={users} />
    </div>
  )
}
