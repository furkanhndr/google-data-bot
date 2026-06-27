import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getDefaultTemplate } from '@/lib/outreach'
import type { OutreachChannel } from '@googlebusinessdata/shared-types'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let { data, error } = await supabase
    .from('message_templates')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  if (!data || data.length === 0) {
    const defaults = [getDefaultTemplate('whatsapp'), getDefaultTemplate('email')].map(t => ({
      ...t,
      user_id: user.id,
    }))

    const seed = await supabase
      .from('message_templates')
      .insert(defaults)
      .select('*')
      .order('created_at', { ascending: true })

    if (seed.error) return NextResponse.json({ error: seed.error.message }, { status: 500 })
    data = seed.data ?? []
  }

  return NextResponse.json({ templates: data ?? [] })
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const channel = body.channel === 'email' ? 'email' : 'whatsapp'
  const defaults = getDefaultTemplate(channel as OutreachChannel)

  const payload = {
    user_id: user.id,
    channel,
    name: clean(body.name) ?? defaults.name,
    subject: channel === 'email' ? clean(body.subject) : null,
    body: clean(body.body) ?? defaults.body,
    is_default: Boolean(body.is_default),
    is_active: body.is_active !== false,
  }

  if (payload.is_default) {
    await supabase
      .from('message_templates')
      .update({ is_default: false })
      .eq('user_id', user.id)
      .eq('channel', channel)
  }

  const { data, error } = await supabase
    .from('message_templates')
    .insert(payload)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ template: data }, { status: 201 })
}

function clean(value: unknown) {
  return typeof value === 'string' && value.trim() ? value.trim() : null
}
