'use client'

import { useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/Toast'

// Listens for the current user's job status changes via Supabase Realtime and
// shows an in-app toast when a job completes or fails. Renders nothing.
export function JobNotifier({ userId }: { userId: string }) {
  const { toast } = useToast()
  const seen = useRef<Set<string>>(new Set())

  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel('jobs-notify')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'scraping_jobs',
        filter: `user_id=eq.${userId}`,
      }, payload => {
        const job = payload.new as { id: string; status: string; query: string; scraped_count: number }
        const key = `${job.id}:${job.status}`
        if (seen.current.has(key)) return

        if (job.status === 'completed') {
          seen.current.add(key)
          toast(`"${job.query}" tamamlandı — ${job.scraped_count} sonuç hazır.`, 'success')
        } else if (job.status === 'failed') {
          seen.current.add(key)
          toast(`"${job.query}" işi başarısız oldu.`, 'error')
        }
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [userId, toast])

  return null
}
