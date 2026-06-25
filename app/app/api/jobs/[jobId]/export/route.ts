import { NextResponse, type NextRequest } from 'next/server'
import { Readable } from 'stream'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { generateXLSX, getCsvHeader, serializeCsvRow } from '@/lib/utils/export'
import { EXPORT_SIGNED_URL_EXPIRY } from '@/lib/constants'
import type { BusinessResult, ExportFormat } from '@googlebusinessdata/shared-types'

type Params = { params: Promise<{ jobId: string }> }
const EXPORT_CHUNK_SIZE = 500
const MAX_XLSX_EXPORT = 2000

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>

async function* paginateResults(supabase: SupabaseServerClient, jobId: string): AsyncGenerator<BusinessResult> {
  let from = 0

  while (true) {
    const { data, error } = await supabase
      .from('business_results')
      .select('*')
      .eq('job_id', jobId)
      .order('scraped_at', { ascending: true })
      .range(from, from + EXPORT_CHUNK_SIZE - 1)

    if (error) throw new Error(error.message)
    if (!data || data.length === 0) break

    for (const row of data as BusinessResult[]) {
      yield row
    }

    if (data.length < EXPORT_CHUNK_SIZE) break
    from += EXPORT_CHUNK_SIZE
  }
}

async function* streamCsvRows(supabase: SupabaseServerClient, jobId: string) {
  yield Buffer.from('﻿' + getCsvHeader() + '\n', 'utf8')

  let rowCount = 0
  for await (const result of paginateResults(supabase, jobId)) {
    yield Buffer.from(serializeCsvRow(result) + '\n', 'utf8')
    rowCount += 1
  }

  if (rowCount === 0) {
    throw new Error('Sonuç bulunamadı.')
  }
}

export async function POST(request: NextRequest, { params }: Params) {
  const { jobId } = await params
  const supabase  = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: job, error: jobError } = await supabase
    .from('scraping_jobs')
    .select('id, status, scraped_count')
    .eq('id', jobId)
    .eq('user_id', user.id)
    .single()

  if (jobError) return NextResponse.json({ error: jobError.message }, { status: 500 })
  if (!job) return NextResponse.json({ error: 'İş bulunamadı.' }, { status: 404 })
  if (job.status !== 'completed') {
    return NextResponse.json({ error: 'Sadece tamamlanmış işler export edilebilir.' }, { status: 400 })
  }

  const body = await request.json()
  const format = (body.format ?? 'csv') as ExportFormat
  if (!['csv', 'xlsx'].includes(format)) {
    return NextResponse.json({ error: 'Geçersiz format.' }, { status: 400 })
  }

  const rowCount = job.scraped_count ?? 0
  if (format === 'xlsx' && rowCount > MAX_XLSX_EXPORT) {
    return NextResponse.json({
      error: `XLSX dışa aktarım sınırı ${MAX_XLSX_EXPORT} satırla sınırlıdır. Lütfen CSV formatını kullanın.`,
    }, { status: 400 })
  }

  const timestamp = Date.now()
  const filename  = `${job.id}_${timestamp}.${format}`
  const storagePath = `${user.id}/${jobId}/${filename}`
  const contentType = format === 'xlsx'
    ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    : 'text/csv;charset=utf-8'

  const serviceClient = await createServiceClient()

  if (format === 'csv') {
    try {
      const csvStream = Readable.from(streamCsvRows(supabase, jobId))
      const { error: uploadError } = await serviceClient.storage
        .from('exports')
        .upload(storagePath, csvStream, {
          contentType,
          upsert: true,
        })

      const { data: signedData } = await serviceClient.storage
        .from('exports')
        .createSignedUrl(storagePath, EXPORT_SIGNED_URL_EXPIRY)

      const downloadUrl = signedData?.signedUrl ?? null

      await supabase.from('export_history').insert({
        user_id:         user.id,
        job_id:          jobId,
        format,
        row_count:       rowCount,
        file_size_bytes: null,
        storage_path:    uploadError ? null : storagePath,
        download_url:    uploadError ? null : downloadUrl,
        expires_at:      uploadError ? null : new Date(Date.now() + EXPORT_SIGNED_URL_EXPIRY * 1000).toISOString(),
      })

      if (uploadError) {
        const fallbackStream = Readable.from(streamCsvRows(supabase, jobId))
        const fallbackChunks: Buffer[] = []
        for await (const chunk of fallbackStream) {
          fallbackChunks.push(chunk as Buffer)
        }

        return new NextResponse(Buffer.concat(fallbackChunks), {
          status: 200,
          headers: {
            'Content-Type': contentType,
            'Content-Disposition': `attachment; filename="${filename}"`,
          },
        })
      }

      return NextResponse.json({
        url:      downloadUrl ?? `/api/jobs/${jobId}/export/download?path=${encodeURIComponent(storagePath)}`,
        filename,
        rowCount,
        format,
      })
    } catch (error) {
      return NextResponse.json({ error: (error as Error).message }, { status: 500 })
    }
  }

  const { data: results, error: fetchError } = await supabase
    .from('business_results')
    .select('*')
    .eq('job_id', jobId)
    .order('scraped_at', { ascending: true })

  if (fetchError) return NextResponse.json({ error: fetchError.message }, { status: 500 })
  if (!results || results.length === 0) {
    return NextResponse.json({ error: 'Sonuç bulunamadı.' }, { status: 404 })
  }

  const fileBuffer = generateXLSX(results as BusinessResult[])

  const { error: uploadError } = await serviceClient.storage
    .from('exports')
    .upload(storagePath, fileBuffer, {
      contentType,
      upsert: true,
    })

  if (uploadError) {
    return new NextResponse(new Uint8Array(fileBuffer), {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  }

  const { data: signedData } = await serviceClient.storage
    .from('exports')
    .createSignedUrl(storagePath, EXPORT_SIGNED_URL_EXPIRY)

  const downloadUrl = signedData?.signedUrl ?? null

  await supabase.from('export_history').insert({
    user_id:         user.id,
    job_id:          jobId,
    format,
    row_count:       rowCount,
    file_size_bytes: fileBuffer.length,
    storage_path:    storagePath,
    download_url:    downloadUrl,
    expires_at:      new Date(Date.now() + EXPORT_SIGNED_URL_EXPIRY * 1000).toISOString(),
  })

  return NextResponse.json({
    url:      downloadUrl ?? `/api/jobs/${jobId}/export/download?path=${encodeURIComponent(storagePath)}`,
    filename,
    rowCount,
    format,
  })
}
