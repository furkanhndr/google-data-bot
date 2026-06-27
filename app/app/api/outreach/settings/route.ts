import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('outreach_settings')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ settings: data })
}

export async function PUT(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const payload = {
    user_id: user.id,
    sender_name: clean(body.sender_name),
    company_name: clean(body.company_name),
    sender_email: clean(body.sender_email),
    reply_to_email: clean(body.reply_to_email),
    sender_phone: clean(body.sender_phone),
    website: clean(body.website),
    email_signature: clean(body.email_signature),
  }

  const { data, error } = await supabase
    .from('outreach_settings')
    .upsert(payload, { onConflict: 'user_id' })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ settings: data })
}

function clean(value: unknown) {
  return typeof value === 'string' && value.trim() ? value.trim() : null
}
