import { createServiceClient } from '@/lib/supabase/server'
import { UserTable } from '@/components/admin/UserTable'
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
    <div className="p-8">
      <h1 className="mb-2 text-2xl font-bold text-text">
        Kullanıcılar
      </h1>
      <p className="mb-6 text-sm text-textMuted">
        {users.length} kullanıcı
      </p>
      <UserTable users={users} />
    </div>
  )
}
