import Link from 'next/link'
import { JobStatusBadge } from '@/components/ui/Badge'
import type { ScrapingJob } from '@googlebusinessdata/shared-types'

function formatDate(iso: string) {
  return new Intl.DateTimeFormat('tr-TR', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }).format(new Date(iso))
}

export function JobHistoryList({ jobs }: { jobs: ScrapingJob[] }) {
  if (jobs.length === 0) {
    return (
      <div className="text-center px-6 py-16 text-textMuted text-sm">
        <div className="text-[40px] mb-3">⚡</div>
        <div className="font-semibold text-text mb-1.5">Henüz iş yok</div>
        <div>İlk scraping işinizi başlatmak için "Yeni İş" butonuna tıklayın.</div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      {jobs.map(job => (
        <Link key={job.id} href={`/dashboard/jobs/${job.id}`} className="no-underline">
          <div className="bg-bgCard border border-border rounded-md px-5 py-4 shadow-sm flex items-center gap-4 cursor-pointer transition-colors hover:border-primary">
            {/* Icon */}
            <div className="w-10 h-10 flex-shrink-0 bg-primaryLight rounded-md flex items-center justify-center text-lg">🔍</div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-text text-sm overflow-hidden overflow-ellipsis whitespace-nowrap">
                {job.query} — {job.location}
              </div>
              <div className="text-xs text-textMuted mt-[3px]">
                {formatDate(job.created_at)}
              </div>
            </div>

            {/* Stats */}
            <div className="text-right flex-shrink-0">
              <div className="text-sm font-semibold text-text">
                {job.scraped_count.toLocaleString('tr-TR')} sonuç
              </div>
              <div className="mt-1">
                <JobStatusBadge status={job.status} />
              </div>
            </div>

            <span className="text-textLight text-lg">›</span>
          </div>
        </Link>
      ))}
    </div>
  )
}
