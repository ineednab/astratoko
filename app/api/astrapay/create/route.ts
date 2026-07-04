import { NextResponse } from 'next/server'
import { createPayment } from '@/lib/astrapay'

export async function POST(req: Request) {
  try {
    const { merchantTransactionId, amount, description } = await req.json()

    if (!merchantTransactionId || !amount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const result = await createPayment({
      merchantTransactionId,
      amount: Number(amount),
      description: description ?? 'AstraToko Payment',
    })

    if (result.error) {
      console.error('[AstraPay] createPayment error:', result.raw)
      return NextResponse.json({ error: result.error, raw: result.raw }, { status: 502 })
    }

    return NextResponse.json(result)
  } catch (err) {
    console.error('[AstraPay] create route error:', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
