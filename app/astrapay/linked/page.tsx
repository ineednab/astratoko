'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function AstraPayLinkedPage() {
  const [status, setStatus] = useState<'saving' | 'done' | 'error'>('saving')

  useEffect(() => {
    async function handleCallback() {
      const params = new URLSearchParams(window.location.search)

      // Log semua query params untuk debugging
      console.log('[AstraPay Linked] query params:', Object.fromEntries(params.entries()))

      const signature      = params.get('signature')      ?? params.get('token')        ?? params.get('authCode')
      const merchantUserId = params.get('merchantUserId') ?? params.get('merchant_user_id') ?? params.get('phoneNo') ?? params.get('phone')
      const referenceNo    = params.get('referenceNo')    ?? params.get('reference_no')

      if (signature && merchantUserId) {
        const { error } = await supabase
          .from('astrapay_links')
          .upsert({
            merchant_user_id: merchantUserId,
            signature,
            linked_at: new Date().toISOString(),
          }, { onConflict: 'merchant_user_id' })

        if (error) {
          console.error('[AstraPay Linked] upsert error:', error)
          setStatus('error')
        } else {
          console.log('[AstraPay Linked] saved signature for', merchantUserId)
          setStatus('done')
        }
      } else {
        // Tidak ada signature di URL — mungkin AstraPay pakai server callback
        // Tetap anggap sukses, biarkan polling di storefront yang verify
        console.log('[AstraPay Linked] no signature in URL, assuming server callback')
        setStatus('done')
      }

      // Tutup tab setelah 2 detik
      setTimeout(() => window.close(), 2000)
    }

    handleCallback()
  }, [])

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 text-center">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
        <span className="text-3xl">{status === 'error' ? '⚠️' : '✓'}</span>
      </div>
      <h1 className="text-xl font-extrabold text-gray-900 mb-2">
        {status === 'saving' ? 'Menghubungkan...' : 'Akun AstraPay Terhubung!'}
      </h1>
      <p className="text-sm text-gray-500 mb-6">Kembali ke tab sebelumnya dan lanjutkan pembayaran.</p>
      <p className="text-xs text-gray-300">Tab ini akan otomatis ditutup...</p>
    </div>
  )
}
