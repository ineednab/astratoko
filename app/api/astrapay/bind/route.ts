import { NextResponse } from 'next/server'
import { registerAccountBinding } from '@/lib/astrapay'

export async function POST(req: Request) {
  try {
    const { phoneNo, name, email } = await req.json()

    if (!phoneNo) {
      return NextResponse.json({ error: 'phoneNo required' }, { status: 400 })
    }

    const origin = new URL(req.url).origin

    const result = await registerAccountBinding({
      phoneNo,
      externalUid:      phoneNo,
      finishBindingUrl: `${origin}/astrapay/linked`,
      name,
      email,
    })

    if (result.error) {
      console.error('[AstraPay] registerAccountBinding error:', result.raw ?? result.error)
      return NextResponse.json({ error: result.error, raw: result.raw }, { status: 502 })
    }

    return NextResponse.json({
      redirectUrl: result.redirectUrl,
      authCode:    result.authCode,
      referenceNo: result.referenceNo,
    })
  } catch (err) {
    console.error('[AstraPay] bind route error:', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
