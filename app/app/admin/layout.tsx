import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AdminLayout } from '@/components/layout/AdminLayout'
import type { ReactNode } from 'react'

export default async function Layout({ children }: { children: ReactNode }) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') redirect('/dashboard')

  return (
    <AdminLayout email={user.email ?? ''}>
      {children}
    </AdminLayout>
  )
}
