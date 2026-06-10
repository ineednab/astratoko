import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-astrapay-blue rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">AT</span>
          </div>
          <span className="font-bold text-astrapay-blue text-xl">AstraToko</span>
        </div>
        <Link href="/dashboard" className="btn-primary text-sm py-2 px-4">
          Mulai Gratis
        </Link>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 py-20 text-center">
        <div className="inline-block bg-astrapay-blue-pale text-astrapay-blue text-sm font-semibold px-4 py-2 rounded-full mb-6">
          Powered by AstraPay
        </div>
        <h1 className="text-5xl font-extrabold text-gray-900 leading-tight mb-6">
          Toko digital kamu.<br />
          <span className="text-astrapay-blue">Customer kamu.</span><br />
          Margin kamu.
        </h1>
        <p className="text-xl text-gray-500 mb-4 max-w-2xl mx-auto">
          Seller Tokopedia & Shopee kehilangan rata-rata{' '}
          <strong className="text-astrapay-red">22% margin</strong> ke platform fee setiap bulan.
          AstraToko membantu kamu mempertahankan repeat buyer — tanpa bayar komisi lagi.
        </p>
        <p className="text-gray-400 mb-10">Setup 10 menit. Import dari CSV. Langsung live.</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/dashboard" className="btn-primary text-lg py-4 px-8">
            Buat Toko Sekarang →
          </Link>
          <Link href="/toko/toko-rizky" className="btn-secondary text-lg py-4 px-8">
            Lihat Demo Toko
          </Link>
        </div>
      </section>

      {/* Pain point stats */}
      <section className="bg-astrapay-gray py-16">
        <div className="max-w-4xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-extrabold text-astrapay-red mb-2">22%</div>
              <div className="text-gray-600">Fee rata-rata Tokopedia<br />yang hilang setiap transaksi</div>
            </div>
            <div>
              <div className="text-4xl font-extrabold text-astrapay-blue mb-2">Rp 18 jt</div>
              <div className="text-gray-600">Rata-rata penghematan<br />seller aktif per tahun</div>
            </div>
            <div>
              <div className="text-4xl font-extrabold text-green-600 mb-2">10 mnt</div>
              <div className="text-gray-600">Waktu setup toko<br />dari CSV ke live</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-4xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">Kenapa AstraToko?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[
            { icon: '📦', title: 'Import dari CSV', desc: 'Upload katalog Tokopedia atau Shopee kamu — produk auto-import dalam 3 detik.' },
            { icon: '💰', title: 'Fee Savings Calculator', desc: 'Lihat berapa yang kamu hemat vs bayar komisi marketplace. Angka konkret, bukan estimasi.' },
            { icon: '🏪', title: 'Storefront Instan', desc: 'Toko kamu langsung live di astratoko.com/nama-toko-kamu. Share via WhatsApp.' },
            { icon: '💳', title: 'AstraPay Checkout', desc: 'QRIS dan AstraPay terintegrasi. Buyer kamu sudah familiar — konversi lebih tinggi.' },
          ].map((f) => (
            <div key={f.title} className="card flex gap-4">
              <span className="text-3xl">{f.icon}</span>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">{f.title}</h3>
                <p className="text-gray-500 text-sm">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-astrapay-blue py-20 text-center">
        <h2 className="text-3xl font-bold text-white mb-4">Siap pertahankan margin kamu?</h2>
        <p className="text-blue-200 mb-8">Gratis setup. Tidak perlu kartu kredit.</p>
        <Link href="/dashboard" className="bg-white text-astrapay-blue font-bold px-8 py-4 rounded-xl hover:bg-blue-50 transition-colors text-lg">
          Mulai Sekarang →
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 px-6 py-8 text-center text-gray-400 text-sm">
        <p>AstraToko by Astra Financial Services • Powered by AstraPay</p>
      </footer>
    </div>
  )
}
