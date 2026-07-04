import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// AstraPay calls this after a customer successfully links their account.
// Body: { signature, merchantUserId, callbackTimestamp }
// We store the signature so it can be used in future payment requests.
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { signature, merchantUserId, callbackTimestamp } = body

    console.log('[AstraPay Link Callback]', { merchantUserId, callbackTimestamp })

    if (signature && merchantUserId) {
      await supabase
        .from('astrapay_links')
        .upsert({
          merchant_user_id: merchantUserId,
          signature,
          linked_at: callbackTimestamp ?? new Date().toISOString(),
        }, { onConflict: 'merchant_user_id' })
    }

    return NextResponse.json({ status: 'OK', message: '' })
  } catch (err) {
    console.error('[AstraPay Link Callback] error:', err)
    return NextResponse.json({ status: 'OK', message: '' })
  }
}
