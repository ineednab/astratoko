import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// SNAP BI Direct Debit Payment Notify
// AstraPay POSTs this when a payment completes.
// latestTransactionStatus: 00=Success, 05=Canceled, 06=Failed
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { originalPartnerReferenceNo, originalReferenceNo, latestTransactionStatus } = body

    console.log('[AstraPay Notify]', { originalPartnerReferenceNo, latestTransactionStatus })

    if (latestTransactionStatus === '00') {
      await supabase
        .from('orders')
        .update({ status: 'paid', payment_id: originalReferenceNo ?? null })
        .eq('payment_tx_id', originalPartnerReferenceNo)
    } else if (latestTransactionStatus === '05' || latestTransactionStatus === '06') {
      await supabase
        .from('orders')
        .update({ status: 'cancelled' })
        .eq('payment_tx_id', originalPartnerReferenceNo)
    }

    return NextResponse.json({ responseCode: '2005600', responseMessage: 'Request has been processed successfully' })
  } catch (err) {
    console.error('[AstraPay Notify] error:', err)
    return NextResponse.json({ responseCode: '2005600', responseMessage: 'Request has been processed successfully' })
  }
}
