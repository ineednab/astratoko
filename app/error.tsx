'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Route error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 text-center max-w-sm mx-auto">
      <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center mx-auto mb-5">
        <span className="text-4xl select-none">😵</span>
      </div>
      <p className="text-xs font-bold text-red-500 uppercase tracking-widest mb-3">Error</p>
      <h1 className="font-extrabold text-gray-900 text-2xl mb-2">Ada yang tidak beres</h1>
      <p className="text-gray-500 text-sm mb-8 leading-relaxed">
        Terjadi kesalahan saat memuat halaman ini. Coba lagi, atau kembali ke beranda.
      </p>
      <button
        onClick={reset}
        className="w-full bg-app-blue hover:bg-app-blue-light text-white font-bold py-3.5 rounded-2xl text-sm flex items-center justify-center gap-2 transition-colors mb-3"
      >
        Coba Lagi
      </button>
      <Link href="/" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
        Kembali ke Beranda
      </Link>
    </div>
  )
}
