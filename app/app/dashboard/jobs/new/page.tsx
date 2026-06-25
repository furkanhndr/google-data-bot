import { JobForm } from '@/components/dashboard/JobForm'

export default function NewJobPage() {
  return (
    <div className="p-8 max-w-[800px]">
      <div className="mb-7">
        <h1 className="m-0 text-2xl font-bold text-text">
          Yeni İş
        </h1>
        <p className="mt-1 text-sm text-textMuted">
          Google Maps'ten çekilecek veri için parametreleri belirleyin.
        </p>
      </div>
      <JobForm />
    </div>
  )
}
