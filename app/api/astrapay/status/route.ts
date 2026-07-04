import { NextResponse } from 'next/server'
import { checkPaymentStatus } from '@/lib/astrapay'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const id     = url.searchParams.get('id')
  const amount = url.searchParams.get('amount')

  if (!id || !amount) return NextResponse.json({ error: 'Missing id or amount' }, { status: 400 })

  const result = await checkPaymentStatus({
    merchantTransactionId: id,
    amount: Number(amount),
  })
  return NextResponse.json(result)
}
