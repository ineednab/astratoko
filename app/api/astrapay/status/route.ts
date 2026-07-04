import { NextResponse } from 'next/server'
import { checkPaymentStatus } from '@/lib/astrapay'

export async function GET(req: Request) {
  const id = new URL(req.url).searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  const result = await checkPaymentStatus(id)
  return NextResponse.json(result)
}
