import Link from 'next/link'
import {
  Package,
  Calculator,
  Store,
  CreditCard,
  ArrowRight,
  UploadCloud,
  Settings,
  Share2,
} from 'lucide-react'

function formatRp(n: number) {
  return 'Rp ' + n.toLocaleString('id-ID')
}

function FeeCompareCard() {
  const gmv = 18_400_000
  const feeMarket = Math.round(gmv * 0.22)
  const feeAstra = Math.round(gmv * 0.025)
  const savings = feeMarket - feeAstra

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-2xl shadow-blue-900/10 p-7">
      <p className="text-xs font-semibold text-gray-400 tracking-wider uppercase mb-5">
        Simulasi Penghematan
      </p>
      <div className="mb-5">
        <p className="text-xs text-gray-400 mb-1">GMV Bulan Ini</p>
        <p className="text-2xl font-extrabold text-gray-900 tracking-tight">{formatRp(gmv)}</p>
      </div>
      <div className="space-y-2 mb-5">
        <div className="flex items-center justify-between rounded-xl bg-red-50 px-4 py-3">
          <span className="text-sm text-gray-600">
            Fee Tokopedia{' '}
            <span className="text-gray-400 text-xs">(22%)</span>
          </span>
          <span className="text-sm font-bold text-astrapay-red">-{formatRp(feeMarket)}</span>
        </div>
        <div className="flex items-center justify-between rounded-xl bg-blue-50 px-4 py-3">
          <span className="text-sm text-gray-600">
            Fee AstraToko{' '}
            <span className="text-gray-400 text-xs">(2.5%)</span>
          </span>
          <span className="text-sm font-bold text-app-blue">-{formatRp(feeAstra)}</span>
        </div>
      </div>
      <div className="border-t border-gray-100 pt-4 flex items-center justify-between">
        <span className="text-sm font-medium text-gray-500">Hemat per bulan</span>
        <span className="text-xl font-extrabold text-green-600">+{formatRp(savings)}</span>
      </div>
      <p className="mt-1 text-xs text-gray-400 text-right">{formatRp(savings * 12)} per tahun</p>
    </div>
  )
}

const STEPS = [
  {
    icon: UploadCloud,
    title: 'Import Katalog',
    desc: 'Upload file CSV dari Tokopedia atau Shopee. Produk, harga, dan stok auto-import dalam hitungan detik.',
  },
  {
    icon: Settings,
    title: 'Setup Toko',
    desc: 'Isi nama toko, logo, dan nomor WhatsApp kamu. Toko kamu langsung punya URL sendiri.',
  },
  {
    icon: Share2,
    title: 'Share ke Buyer',
    desc: 'Kirim link astratoko.com/nama-toko ke repeat buyer kamu via WhatsApp dan mulai terima pesanan.',
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-app-blue rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-white font-extrabold text-sm leading-none">AT</span>
            </div>
            <span className="font-bold text-app-blue text-lg">AstraToko</span>
          </div>
          <Link href="/import" className="btn-primary text-sm py-2 px-5">
            Mulai Gratis
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-14 pb-20 grid grid-cols-1 md:grid-cols-[1fr_400px] gap-12 items-center">
        <div className="animate-fadein">
          <div className="inline-flex items-center gap-2 bg-app-blue-pale text-app-blue text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-app-blue inline-block flex-shrink-0"></span>
            Powered by AstraPay
          </div>
          <h1 className="text-5xl md:text-[3.75rem] font-extrabold text-gray-900 leading-[1.06] tracking-tight mb-5">
            Toko kamu.<br />
            <span className="text-app-blue">Margin kamu.</span>
          </h1>
          <p className="text-lg text-gray-500 leading-relaxed mb-8 max-w-[480px]">
            Seller marketplace kehilangan rata-rata{' '}
            <strong className="text-astrapay-red font-semibold">22% margin</strong>{' '}
            ke platform setiap bulan. Pertahankan repeat buyer tanpa bayar komisi lagi.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/import"
              className="btn-primary inline-flex items-center gap-2 text-base"
            >
              Mulai Gratis <ArrowRight size={18} />
            </Link>
            <Link href="/toko/toko-rizky" className="btn-secondary text-base">
              Lihat Demo Toko
            </Link>
          </div>
        </div>

        <div className="animate-fadein-delay">
          <FeeCompareCard />
        </div>
      </section>

      {/* Stats */}
      <section className="bg-astrapay-blue py-16">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              value: '22%',
              label: 'Fee rata-rata Tokopedia yang hilang dari setiap transaksi',
            },
            {
              value: 'Rp 3,5 jt',
              label: 'Rata-rata penghematan seller aktif per bulan',
            },
            {
              value: '10 mnt',
              label: 'Waktu setup toko dari import CSV hingga live',
            },
          ].map((stat) => (
            <div key={stat.value} className="border-l-2 border-white/20 pl-6">
              <div className="text-4xl font-extrabold text-white mb-2 tracking-tight">
                {stat.value}
              </div>
              <div className="text-blue-200 text-sm leading-relaxed">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-6xl mx-auto px-6 py-20 animate-fadein-delay-2">
        <h2 className="text-3xl font-bold text-gray-900 mb-12">Mulai dalam 3 langkah</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {STEPS.map((step) => {
            const Icon = step.icon
            return (
              <div key={step.title}>
                <div className="w-10 h-10 bg-app-blue-pale rounded-xl flex items-center justify-center mb-4">
                  <Icon size={20} className="text-app-blue" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* Features bento */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Kenapa AstraToko?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Large - Import CSV */}
          <div className="md:col-span-2 bg-app-blue rounded-2xl p-8 text-white">
            <Package size={32} className="mb-4 text-blue-300" />
            <h3 className="text-xl font-bold mb-2">Import dari CSV Tokopedia & Shopee</h3>
            <p className="text-blue-200 text-sm leading-relaxed max-w-sm">
              Upload file CSV ekspor dari marketplace kamu. Semua produk, harga, dan stok
              auto-import. Tidak perlu input ulang satu per satu.
            </p>
          </div>

          {/* Small - Calculator */}
          <div className="bg-app-blue-pale rounded-2xl p-6">
            <Calculator size={28} className="mb-3 text-app-blue" />
            <h3 className="text-base font-bold text-gray-900 mb-2">Fee Savings Calculator</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Lihat angka konkret berapa yang kamu hemat setiap bulan dibanding bayar komisi
              marketplace.
            </p>
          </div>

          {/* Small - Storefront */}
          <div className="bg-astrapay-gray rounded-2xl p-6">
            <Store size={28} className="mb-3 text-app-blue" />
            <h3 className="text-base font-bold text-gray-900 mb-2">Storefront Instan</h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              URL toko kamu sendiri di astratoko.com/nama-toko. Share langsung via WhatsApp ke
              repeat buyer.
            </p>
          </div>

          {/* Large - AstraPay Checkout */}
          <div className="md:col-span-2 bg-gray-900 rounded-2xl p-8 text-white">
            <CreditCard size={32} className="mb-4 text-blue-400" />
            <h3 className="text-xl font-bold mb-2">Checkout via AstraPay & QRIS</h3>
            <p className="text-gray-400 text-sm leading-relaxed max-w-sm">
              Buyer kamu sudah familiar dengan AstraPay dan QRIS. Checkout yang familiar
              meningkatkan konversi dan mengurangi cart abandonment.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-astrapay-gray py-20">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            Siap pertahankan margin kamu?
          </h2>
          <p className="text-gray-500 mb-8">Gratis setup. Tidak perlu kartu kredit.</p>
          <Link
            href="/import"
            className="btn-primary inline-flex items-center gap-2 text-base px-8 py-4"
          >
            Mulai Gratis <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 px-6 py-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-sm text-gray-400">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-app-blue rounded flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-xs leading-none">AT</span>
            </div>
            <span className="font-medium text-gray-600">AstraToko</span>
          </div>
          <p>AstraToko by Astra Financial Services. Powered by AstraPay.</p>
        </div>
      </footer>
    </div>
  )
}
