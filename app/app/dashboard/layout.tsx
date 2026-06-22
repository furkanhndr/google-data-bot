import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import type { ReactNode } from 'react'
import type { UserProfile } from '@googlebusinessdata/shared-types'

export default async function Layout({ children }: { children: ReactNode }) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/auth/login')
  if (profile.is_suspended) redirect('/auth/login?error=suspended')

  return (
    <DashboardLayout profile={{ ...(profile as UserProfile), email: user.email }}>
      {children}
    </DashboardLayout>
  )
}
