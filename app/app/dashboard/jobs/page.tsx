import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { JobHistoryList } from '@/components/dashboard/JobHistoryList'
import { Button } from '@/components/ui/Button'
import { COLORS, FONT_SIZE } from '@/lib/constants'
import type { ScrapingJob } from '@googlebusinessdata/shared-types'

export default async function JobsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: jobs } = await supabase
    .from('scraping_jobs')
    .select('*')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })
    .limit(50)

  return (
    <div style={{ padding: '32px' }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: '24px',
      }}>
        <div>
          <h1 style={{ margin: 0, fontSize: FONT_SIZE['2xl'], fontWeight: '700', color: COLORS.text }}>
            İşler
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: FONT_SIZE.sm, color: COLORS.textMuted }}>
            Tüm scraping işleriniz
          </p>
        </div>
        <Link href="/dashboard/jobs/new">
          <Button size="md">+ Yeni İş</Button>
        </Link>
      </div>

      <JobHistoryList jobs={(jobs ?? []) as ScrapingJob[]} />
    </div>
  )
}
