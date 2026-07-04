import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// AstraPay calls this URL after payment is processed.
// Body: { merchantTransactionId, astrapayTransactionId, amount, status, callbackTimestamp, callbackSecurity }
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { merchantTransactionId, astrapayTransactionId, status } = body

    console.log('[AstraPay Callback]', { merchantTransactionId, status })

    if (status === 'Approved') {
      await supabase
        .from('orders')
        .update({ status: 'paid', payment_id: astrapayTransactionId ?? null })
        .eq('payment_tx_id', merchantTransactionId)
    } else if (status === 'Reject' || status === 'Timeout') {
      await supabase
        .from('orders')
        .update({ status: 'cancelled' })
        .eq('payment_tx_id', merchantTransactionId)
    }

    return NextResponse.json({ status: 'OK', message: '' })
  } catch (err) {
    console.error('[AstraPay Callback] error:', err)
    return NextResponse.json({ status: 'OK', message: '' })
  }
}
