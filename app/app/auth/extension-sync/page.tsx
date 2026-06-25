'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { PageSpinner } from '@/components/ui/Spinner'

export default function ExtensionSyncPage() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const redirectTo   = searchParams.get('redirectTo') ?? '/dashboard'

  useEffect(() => {
    const supabase = createClient()

    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        // Post token to the auth-sync content script injected by the extension
        window.postMessage({
          type:         'EXTENSION_AUTH_SYNC',
          accessToken:  data.session.access_token,
          refreshToken: data.session.refresh_token,
        }, window.location.origin)
      }
      // Small delay to let the content script process the message
      setTimeout(() => router.replace(redirectTo), 300)
    })
  }, [redirectTo, router])

  return (
    <div className="flex items-center justify-center h-screen">
      <PageSpinner />
    </div>
  )
}
