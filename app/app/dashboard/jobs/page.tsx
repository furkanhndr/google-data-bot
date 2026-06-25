import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { JobHistoryList } from '@/components/dashboard/JobHistoryList'
import { Button } from '@/components/ui/Button'
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
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="m-0 text-2xl font-bold text-text">
            İşler
          </h1>
          <p className="mt-1 text-sm text-textMuted">
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
