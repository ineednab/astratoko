'use client'

import { useEffect } from 'react'

export default function AstraPayPaidPage() {
  useEffect(() => {
    const t = setTimeout(() => window.close(), 1500)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 text-center">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
        <span className="text-3xl">✓</span>
      </div>
      <h1 className="text-xl font-extrabold text-gray-900 mb-2">Pembayaran Berhasil!</h1>
      <p className="text-sm text-gray-500">Kembali ke tab sebelumnya untuk melihat pesananmu.</p>
    </div>
  )
}
