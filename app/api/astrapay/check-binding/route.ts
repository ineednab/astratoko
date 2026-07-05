import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

function phoneVariants(phone: string): string[] {
  const digits = phone.replace(/\D/g, '')
  const variants = new Set<string>()
  if (digits) variants.add(digits)
  if (digits.startsWith('0')) variants.add('62' + digits.slice(1))
  if (digits.startsWith('62')) variants.add('0' + digits.slice(2))
  return Array.from(variants)
}

export async function GET(req: Request) {
  const phone = new URL(req.url).searchParams.get('phone')
  if (!phone) return NextResponse.json({ bound: false })

  const variants = phoneVariants(phone)
  const { data } = await supabase
    .from('astrapay_links')
    .select('signature')
    .in('merchant_user_id', variants)
    .maybeSingle()

  if (data?.signature) {
    return NextResponse.json({ bound: true, token: data.signature })
  }
  return NextResponse.json({ bound: false })
}
