import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 text-center max-w-sm mx-auto">
      <div className="w-20 h-20 bg-app-blue-pale rounded-3xl flex items-center justify-center mx-auto mb-5">
        <span className="text-4xl select-none">🗺️</span>
      </div>
      <p className="text-xs font-bold text-app-blue uppercase tracking-widest mb-3">404</p>
      <h1 className="font-extrabold text-gray-900 text-2xl mb-2">Halaman tidak ditemukan</h1>
      <p className="text-gray-500 text-sm mb-8 leading-relaxed">
        URL yang kamu akses tidak tersedia. Mungkin sudah dipindah atau salah ketik.
      </p>
      <Link href="/"
        className="w-full bg-app-blue hover:bg-app-blue-light text-white font-bold py-3.5 rounded-2xl text-sm flex items-center justify-center gap-2 transition-colors mb-3"
      >
        Kembali ke Beranda
      </Link>
      <Link href="/mulai" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
        Buat toko gratis →
      </Link>
    </div>
  )
}
