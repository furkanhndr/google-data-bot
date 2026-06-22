import { NextResponse, type NextRequest } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { generateCSV, generateXLSX } from '@/lib/utils/export'
import { EXPORT_SIGNED_URL_EXPIRY } from '@/lib/constants'
import type { BusinessResult, ExportFormat } from '@googlebusinessdata/shared-types'

type Params = { params: Promise<{ jobId: string }> }

export async function POST(request: NextRequest, { params }: Params) {
  const { jobId } = await params
  const supabase  = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Verify job ownership and completion
  const { data: job } = await supabase
    .from('scraping_jobs')
    .select('id, status, scraped_count')
    .eq('id', jobId)
    .eq('user_id', user.id)
    .single()

  if (!job) return NextResponse.json({ error: 'İş bulunamadı.' }, { status: 404 })
  if (job.status !== 'completed') {
    return NextResponse.json({ error: 'Sadece tamamlanmış işler export edilebilir.' }, { status: 400 })
  }

  const body = await request.json()
  const format = (body.format ?? 'csv') as ExportFormat
  if (!['csv', 'xlsx'].includes(format)) {
    return NextResponse.json({ error: 'Geçersiz format.' }, { status: 400 })
  }

  // Fetch all results for this job
  const { data: results, error: fetchError } = await supabase
    .from('business_results')
    .select('*')
    .eq('job_id', jobId)
    .order('scraped_at', { ascending: true })

  if (fetchError) return NextResponse.json({ error: fetchError.message }, { status: 500 })
  if (!results || results.length === 0) {
    return NextResponse.json({ error: 'Sonuç bulunamadı.' }, { status: 404 })
  }

  // Generate file buffer
  const fileBuffer = format === 'xlsx'
    ? generateXLSX(results as BusinessResult[])
    : generateCSV(results as BusinessResult[])

  const timestamp = Date.now()
  const filename  = `${job.id}_${timestamp}.${format}`
  const storagePath = `${user.id}/${jobId}/${filename}`
  const contentType = format === 'xlsx'
    ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    : 'text/csv;charset=utf-8'

  // Upload to Supabase Storage (use service client to bypass RLS on storage)
  const serviceClient = await createServiceClient()
  const { error: uploadError } = await serviceClient.storage
    .from('exports')
    .upload(storagePath, fileBuffer, {
      contentType,
      upsert: true,
    })

  if (uploadError) {
    // Fallback: return file directly without storage if bucket not configured yet
    return new NextResponse(new Uint8Array(fileBuffer), {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  }

  // Generate signed URL
  const { data: signedData } = await serviceClient.storage
    .from('exports')
    .createSignedUrl(storagePath, EXPORT_SIGNED_URL_EXPIRY)

  const downloadUrl = signedData?.signedUrl ?? null

  // Record export history
  await supabase.from('export_history').insert({
    user_id:         user.id,
    job_id:          jobId,
    format,
    row_count:       results.length,
    file_size_bytes: fileBuffer.length,
    storage_path:    storagePath,
    download_url:    downloadUrl,
    expires_at:      new Date(Date.now() + EXPORT_SIGNED_URL_EXPIRY * 1000).toISOString(),
  })

  return NextResponse.json({
    url:      downloadUrl ?? `/api/jobs/${jobId}/export/download?path=${encodeURIComponent(storagePath)}`,
    filename,
    rowCount: results.length,
    format,
  })
}
