import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { MARKETPLACE_FEES } from '@/lib/mock-data'

function toSlug(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

export async function POST(req: Request) {
  const body = await req.json()
  const { name, whatsapp, platform, location = '' } = body as Record<string, string>

  if (!name?.trim() || !whatsapp?.trim() || !platform?.trim()) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const slug = toSlug(name)
  const initial = name.trim()[0].toUpperCase()
  const platform_fee_pct = MARKETPLACE_FEES[platform] ?? 0.22

  const { data, error } = await supabase
    .from('sellers')
    .insert({ name: name.trim(), slug, initial, location, whatsapp, platform, platform_fee_pct })
    .select()
    .single()

  if (error) {
    if (error.code === '23505') {
      // Slug conflict — append timestamp suffix
      const fallbackSlug = `${slug}-${Date.now().toString(36)}`
      const { data: data2, error: error2 } = await supabase
        .from('sellers')
        .insert({ name: name.trim(), slug: fallbackSlug, initial, location, whatsapp, platform, platform_fee_pct })
        .select()
        .single()
      if (error2) return NextResponse.json({ error: error2.message }, { status: 500 })
      return NextResponse.json({ seller: data2 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ seller: data })
}
