import { NextResponse } from 'next/server'
import { ensureDemoSeller } from '@/lib/demo-seed'

export async function POST() {
  if (process.env.NEXT_PUBLIC_DEMO_MODE !== 'true') {
    return NextResponse.json({ error: 'Not in demo mode' }, { status: 403 })
  }

  const seller = await ensureDemoSeller()
  if (!seller) {
    return NextResponse.json({ error: 'Failed to seed demo seller' }, { status: 500 })
  }

  return NextResponse.json({ ok: true, seller_id: seller.id, slug: seller.slug })
}
