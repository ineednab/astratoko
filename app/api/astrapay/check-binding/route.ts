import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(req: Request) {
  const phone = new URL(req.url).searchParams.get('phone')
  if (!phone) return NextResponse.json({ bound: false })

  const { data } = await supabase
    .from('astrapay_links')
    .select('signature')
    .eq('merchant_user_id', phone)
    .maybeSingle()

  if (data?.signature) {
    return NextResponse.json({ bound: true, token: data.signature })
  }
  return NextResponse.json({ bound: false })
}
