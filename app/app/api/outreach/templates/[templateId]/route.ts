import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface Params {
  params: Promise<{ templateId: string }>
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const { templateId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()

  const { data: existing } = await supabase
    .from('message_templates')
    .select('id, channel')
    .eq('id', templateId)
    .eq('user_id', user.id)
    .single()

  if (!existing) return NextResponse.json({ error: 'Şablon bulunamadı.' }, { status: 404 })

  const payload = {
    name: clean(body.name),
    subject: existing.channel === 'email' ? clean(body.subject) : null,
    body: clean(body.body),
    is_default: Boolean(body.is_default),
    is_active: body.is_active !== false,
  }

  if (!payload.name || !payload.body) {
    return NextResponse.json({ error: 'Şablon adı ve mesaj gövdesi zorunludur.' }, { status: 400 })
  }

  if (payload.is_default) {
    await supabase
      .from('message_templates')
      .update({ is_default: false })
      .eq('user_id', user.id)
      .eq('channel', existing.channel)
  }

  const { data, error } = await supabase
    .from('message_templates')
    .update(payload)
    .eq('id', templateId)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ template: data })
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const { templateId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { error } = await supabase
    .from('message_templates')
    .delete()
    .eq('id', templateId)
    .eq('user_id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

function clean(value: unknown) {
  return typeof value === 'string' && value.trim() ? value.trim() : null
}
