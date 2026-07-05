'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  ArrowRight,
  Check,
  ChevronDown,
  UploadCloud,
  Store,
  CreditCard,
  Users,
  Zap,
  Package,
  Star,
  ShieldCheck,
  Bell,
  Share2,
  TrendingUp,
} from 'lucide-react'
import { formatRp, formatRpShort } from '@/lib/utils'

// ── Utility ───────────────────────────────────────────────────────────────────

function useCountUp(target: number, duration = 1200) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (target === 0) { setCount(0); return }
    let animId: number
    const start = Date.now()
    const tick = () => {
      const elapsed = Date.now() - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.round(target * eased))
      if (progress < 1) animId = requestAnimationFrame(tick)
    }
    animId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(animId)
  }, [target, duration])
  return count
}

// ── Phone Mockup ─────────────────────────────────────────────────────────────

const MINI_PRODUCTS = [
  { name: 'Produk Terlaris', price: 'Rp 85.000', color: '#3B5BDB', badge: '🔥' },
  { name: 'Pilihan Terbaik', price: 'Rp 52.000', color: '#2F9E44', badge: '⭐' },
  { name: 'Stok Terbatas',   price: 'Rp 185.000', color: '#E67700', badge: '⚡' },
  { name: 'Produk Baru',     price: 'Rp 45.000',  color: '#7048E8', badge: '✨' },
]

const TOAST_ORDERS = [
  { buyer: 'Dua Lipa',          product: 'Kampas Rem Premium', amount: 'Rp 85.000'  },
  { buyer: 'Sabrina Carpenter', product: 'Helm SNI Full Face',  amount: 'Rp 185.000' },
  { buyer: 'Justin Bieber',     product: 'Oli Motor Federal',   amount: 'Rp 52.000'  },
]

function PhoneMockup() {
  const [toastIdx, setToastIdx]     = useState(0)
  const [toastPhase, setToastPhase] = useState<'in' | 'out' | 'hidden'>('hidden')

  useEffect(() => {
    const show = () => {
      setToastPhase('in')
      setTimeout(() => setToastPhase('out'), 2600)
      setTimeout(() => {
        setToastPhase('hidden')
        setToastIdx((i) => (i + 1) % TOAST_ORDERS.length)
      }, 3000)
    }
    const initial = setTimeout(show, 1200)
    const interval = setInterval(show, 4500)
    return () => { clearTimeout(initial); clearInterval(interval) }
  }, [])

  const toast = TOAST_ORDERS[toastIdx]

  return (
    <div className="relative mx-auto w-[220px] md:w-[260px] animate-float">
      {toastPhase !== 'hidden' && (
        <div className={`absolute -top-5 -right-10 z-20 bg-white rounded-2xl shadow-2xl shadow-gray-900/15 border border-gray-100 px-3.5 py-2.5 flex items-center gap-2.5 min-w-[170px] ${toastPhase === 'in' ? 'animate-toast-in' : 'animate-toast-out'}`}>
          <div className="w-8 h-8 bg-green-500 rounded-xl flex items-center justify-center flex-shrink-0">
            <Check size={14} className="text-white" strokeWidth={3} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-900 leading-none mb-0.5">{toast.buyer} beli {toast.product}</p>
            <p className="text-[10px] text-green-600 font-semibold leading-none">{toast.amount} masuk ✓</p>
          </div>
        </div>
      )}

      <div className="absolute -bottom-6 -left-10 z-20 bg-app-blue rounded-2xl shadow-xl px-3.5 py-2.5 text-white min-w-[140px]">
        <div className="flex items-center gap-1.5 mb-0.5">
          <Zap size={10} className="text-astrapay-gold" fill="currentColor" />
          <p className="text-[9px] text-blue-300 font-semibold uppercase tracking-wide">AstraPay</p>
        </div>
        <p className="text-xs font-extrabold leading-none">Pembayaran Berhasil</p>
        <p className="text-[10px] text-green-400 mt-0.5 font-semibold">{toast.amount} ✓</p>
      </div>

      <div className="bg-gray-900 rounded-[2.8rem] p-2.5 shadow-2xl shadow-blue-900/30 ring-1 ring-white/10">
        <div className="bg-white rounded-[2.35rem] overflow-hidden">
          <div className="bg-gray-900 h-7 flex items-center justify-center">
            <div className="w-16 h-4 bg-gray-800 rounded-full" />
          </div>
          <div className="bg-app-blue px-3 pt-3 pb-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white font-extrabold text-xs leading-none">✦</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-1">
                  <p className="text-white font-extrabold text-[11px] leading-none">Toko Kamu</p>
                  <span className="text-blue-300 text-[10px]">✓</span>
                </div>
                <p className="text-blue-200 text-[8px] mt-0.5">4.9 ★ · 12 produk</p>
              </div>
            </div>
            <div className="bg-white/15 rounded-lg px-2 py-1.5 flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full border border-blue-300 opacity-60" />
              <p className="text-blue-200 text-[8px]">Cari produk...</p>
            </div>
          </div>
          <div className="bg-amber-50 px-3 py-2 flex items-center gap-1.5 border-b border-amber-100">
            <Star size={10} className="text-astrapay-gold flex-shrink-0" fill="currentColor" />
            <p className="text-[8px] text-amber-800 font-semibold">+50 poin tiap transaksi via AstraPay</p>
          </div>
          <div className="p-2 grid grid-cols-2 gap-1.5">
            {MINI_PRODUCTS.map((p, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
                <div className="h-10 flex items-center justify-center relative" style={{ backgroundColor: p.color + '20' }}>
                  <div className="w-4 h-4 rounded-md" style={{ backgroundColor: p.color }} />
                  <span className="absolute top-0.5 left-0.5 text-[8px] leading-none">{p.badge}</span>
                </div>
                <div className="p-1.5">
                  <p className="text-[7px] font-semibold text-gray-800 leading-tight truncate mb-0.5">{p.name}</p>
                  <p className="text-[8px] font-extrabold text-app-blue">{p.price}</p>
                  <div className="mt-1 bg-app-blue rounded py-0.5 text-center">
                    <p className="text-white text-[6px] font-bold">+ Beli</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="px-2 pb-3">
            <div className="bg-gray-50 rounded-xl px-2 py-1.5 text-center">
              <p className="text-[7px] text-gray-400">
                Dikelola dengan <span className="text-app-blue font-semibold">AstraToko</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Interactive Demo ──────────────────────────────────────────────────────────

type DemoState = 'idle' | 'analyzing' | 'done'

function InteractiveDemo() {
  const [state, setState] = useState<DemoState>('idle')
  const productCount = useCountUp(state === 'done' ? 186 : 0, 900)

  function startDemo() {
    if (state !== 'idle') return
    setState('analyzing')
    setTimeout(() => setState('done'), 2200)
  }

  return (
    <div className="bg-white rounded-2xl border border-white/20 shadow-2xl overflow-hidden">
      <div className="bg-gray-100/80 border-b border-gray-200 px-4 py-2.5 flex items-center gap-2">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
        </div>
        <span className="text-[11px] text-gray-400 ml-1">astratoko.com/import</span>
      </div>
      <div className="p-6">
        {state === 'idle' && (
          <div className="text-center">
            <div className="w-14 h-14 bg-app-blue rounded-2xl flex items-center justify-center mx-auto mb-4">
              <UploadCloud size={26} className="text-white" />
            </div>
            <p className="font-bold text-gray-900 mb-1">Upload CSV Katalogmu</p>
            <p className="text-sm text-gray-400 mb-1">Shopee · Tokopedia · TikTok Shop</p>
            <p className="text-xs text-gray-300 mb-5">Estimasi setup &lt; 10 menit</p>
            <button onClick={startDemo} className="btn-primary text-sm py-2.5 px-5 inline-flex items-center gap-2">
              <UploadCloud size={15} /> Coba Import Demo
            </button>
          </div>
        )}
        {state === 'analyzing' && (
          <div className="text-center py-4">
            <div className="w-12 h-12 bg-app-blue-pale rounded-xl flex items-center justify-center mx-auto mb-4">
              <div className="w-5 h-5 border-2 border-app-blue border-t-transparent rounded-full animate-spin" />
            </div>
            <p className="font-semibold text-gray-900 mb-1">Membaca katalog...</p>
            <p className="text-sm text-gray-400">Menganalisis produk, harga, dan stok</p>
            <div className="mt-5 space-y-2">
              <div className="h-3 bg-gray-100 rounded-full animate-pulse" />
              <div className="h-3 bg-gray-100 rounded-full animate-pulse w-4/5 mx-auto" />
              <div className="h-3 bg-gray-100 rounded-full animate-pulse w-3/5 mx-auto" />
            </div>
          </div>
        )}
        {state === 'done' && (
          <div>
            <div className="flex items-center gap-2 text-green-600 text-xs font-medium mb-4">
              <Check size={13} />
              <span>Import selesai · katalog-demo.csv</span>
            </div>
            <div className="bg-app-blue rounded-2xl p-4 text-center mb-3">
              <p className="text-blue-200 text-xs mb-1">Produk berhasil diimport</p>
              <p className="text-5xl font-extrabold text-white tracking-tight leading-none mb-1">{productCount}</p>
              <p className="text-blue-200 text-xs">produk siap dijual</p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 mb-3">
              <div className="flex items-center justify-between mb-0.5">
                <p className="text-[10px] text-green-600 font-medium">Toko langsung live dalam</p>
                <span className="text-[10px] font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">QRIS aktif ✓</span>
              </div>
              <p className="text-2xl font-extrabold text-green-700 leading-none">kurang dari 10 menit</p>
              <p className="text-[10px] text-green-500 mt-1 font-mono">astratoko.com/nama-toko-kamu</p>
            </div>
            <div className="grid grid-cols-2 gap-1.5 mb-4">
              {['Harga ✓', 'Stok ✓', 'Kategori ✓', 'AstraPay ✓'].map((item) => (
                <div key={item} className="bg-gray-50 rounded-lg px-3 py-1.5 text-[11px] font-semibold text-gray-600 text-center">{item}</div>
              ))}
            </div>
            <Link href="/toko/tokorizky?demo=true" className="btn-primary w-full flex items-center justify-center gap-2 text-sm py-3">
              Lihat Demo Toko <ArrowRight size={15} />
            </Link>
            <button onClick={() => setState('idle')} className="w-full text-center text-[11px] text-gray-400 hover:text-gray-600 mt-3">
              Reset demo
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Dashboard Preview ─────────────────────────────────────────────────────────

const PREVIEW_ORDERS = [
  { buyer: 'Dua Lipa',          product: 'Kampas Rem Premium', amount: 'Rp 85.000',  time: '2m lalu',  color: '#3B5BDB' },
  { buyer: 'Justin Bieber',     product: 'Oli Motor Federal',  amount: 'Rp 52.000',  time: '14m lalu', color: '#2F9E44' },
  { buyer: 'Sabrina Carpenter', product: 'Helm SNI Full Face', amount: 'Rp 185.000', time: '1j lalu',  color: '#E67700' },
]

function DashboardPreview() {
  const animSavings = useCountUp(875_000,   1400)
  const animRevenue = useCountUp(4_850_000, 1800)
  return (
    <div className="bg-gray-900 rounded-2xl p-5 shadow-2xl border border-white/5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-app-blue rounded-xl flex items-center justify-center flex-shrink-0">
            <span className="text-white font-extrabold text-xs">R</span>
          </div>
          <div>
            <p className="text-white font-bold text-xs">Toko Rizky</p>
            <p className="text-gray-500 text-[10px]">Dashboard</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-green-400 font-medium bg-green-400/10 px-2 py-1 rounded-full">
          <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />Live
        </div>
      </div>

      {/* Business Health */}
      <div className="bg-gray-950 rounded-xl p-4 mb-3">
        <p className="text-[9px] text-gray-600 uppercase tracking-widest font-bold mb-1">Efisiensi Biaya Langsung</p>
        <p className="text-3xl font-extrabold text-white tracking-tight leading-none mb-1">{formatRpShort(animSavings)}</p>
        <p className="text-[10px] text-green-400 flex items-center gap-1">
          <TrendingUp size={9} /> margin direct channel bulan ini
        </p>
        <div className="grid grid-cols-3 gap-2 mt-3">
          {[
            { label: 'Direct Sales',  value: formatRpShort(animRevenue) },
            { label: 'Pesanan',       value: '9 ✓'                      },
            { label: 'Repeat Buyer',  value: '67%'                      },
          ].map((m) => (
            <div key={m.label} className="bg-white/5 rounded-lg p-2">
              <p className="text-[8px] text-gray-600 uppercase tracking-wide font-bold mb-0.5">{m.label}</p>
              <p className="text-xs font-extrabold text-white">{m.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent orders */}
      <div className="bg-white/[0.03] border border-white/5 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-3 py-2 border-b border-white/5">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Pesanan Terbaru</p>
          <div className="flex items-center gap-1 text-[9px] text-gray-600 font-medium">
            <Bell size={8} /> real-time
          </div>
        </div>
        {PREVIEW_ORDERS.map((order, i) => (
          <div key={i} className="flex items-center gap-2.5 px-3 py-2.5 border-b border-white/[0.04] last:border-0">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-white font-extrabold text-[9px]" style={{ backgroundColor: order.color }}>
              {order.buyer.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-semibold text-gray-200 truncate">{order.product}</p>
              <p className="text-[9px] text-gray-500">{order.buyer} · {order.time}</p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-[11px] font-bold text-gray-200">{order.amount}</p>
              <span className="text-[8px] font-bold text-green-400 bg-green-400/10 px-1.5 py-0.5 rounded-full">Lunas</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Savings Calculator ────────────────────────────────────────────────────────

const PLATFORM_FEES = [
  { key: 'Tokopedia', fee: 0.22, emoji: '🟢' },
  { key: 'Shopee',    fee: 0.20, emoji: '🟠' },
  { key: 'TikTok',   fee: 0.25, emoji: '⚫' },
]

function SavingsCalculator() {
  const [gmv,      setGmv]      = useState(20_000_000)
  const [platform, setPlatform] = useState('Tokopedia')
  const presets = [5_000_000, 20_000_000, 50_000_000, 100_000_000]

  const feeRate        = PLATFORM_FEES.find((p) => p.key === platform)?.fee ?? 0.22
  const feeMarketplace = Math.round(gmv * feeRate)
  const feeAstra       = Math.round(gmv * 0.025)
  const savings        = feeMarketplace - feeAstra

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-7">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Simulasi Penghematan</p>

      {/* Platform selector */}
      <div className="flex gap-2 mb-5">
        {PLATFORM_FEES.map((p) => (
          <button key={p.key} onClick={() => setPlatform(p.key)}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all border-2 ${
              platform === p.key
                ? 'border-app-blue bg-app-blue text-white'
                : 'border-gray-100 bg-gray-50 text-gray-600 hover:border-gray-200'
            }`}
          >
            {p.emoji} {p.key}
          </button>
        ))}
      </div>

      <div className="mb-5">
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-semibold text-gray-700">GMV per bulan</label>
          <span className="text-base font-extrabold text-gray-900">{formatRp(gmv)}</span>
        </div>
        <input
          type="range" min={5_000_000} max={100_000_000} step={1_000_000} value={gmv}
          onChange={(e) => setGmv(Number(e.target.value))}
          className="w-full accent-app-blue"
        />
        <div className="flex justify-between mt-2">
          {presets.map((p) => (
            <button key={p} onClick={() => setGmv(p)}
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full transition-colors ${gmv === p ? 'bg-app-blue text-white' : 'text-gray-400 hover:text-gray-600'}`}>
              {p / 1_000_000}jt
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between bg-red-50 rounded-xl px-4 py-3">
          <span className="text-sm text-gray-600">Biaya {platform} ({Math.round(feeRate * 100)}%)</span>
          <span className="text-sm font-bold text-red-500">-{formatRp(feeMarketplace)}</span>
        </div>
        <div className="flex items-center justify-between bg-blue-50 rounded-xl px-4 py-3">
          <span className="text-sm text-gray-600">Fee AstraToko (2.5%)</span>
          <span className="text-sm font-bold text-app-blue">-{formatRp(feeAstra)}</span>
        </div>
      </div>
      <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-4">
        <p className="text-xs text-green-600 font-medium mb-1">Potensi penghematan per bulan</p>
        <p className="text-3xl font-extrabold text-green-700 tracking-tight">+{formatRp(savings)}</p>
        <p className="text-xs text-green-500 mt-1">{formatRp(savings * 12)} per tahun</p>
      </div>
      <p className="text-xs text-gray-300 mt-3">Estimasi ilustratif. Fee AstraToko 2.5% flat per transaksi.</p>
    </div>
  )
}

// ── FAQ ───────────────────────────────────────────────────────────────────────

const FAQ_ITEMS = [
  {
    q: 'Apakah AstraToko menggantikan marketplace?',
    a: 'Tidak. Marketplace tetap menjadi channel akuisisi yang efektif untuk menjangkau pelanggan baru. AstraToko membantu melanjutkan hubungan pelanggan setelah transaksi pertama — sehingga kamu tidak perlu bayar komisi lagi setiap kali pelanggan yang sama kembali.',
  },
  {
    q: 'Apakah butuh skill teknis untuk setup?',
    a: 'Tidak perlu coding sama sekali. Upload CSV dari marketplace, isi nama toko, dan tokomu langsung live dalam kurang dari 10 menit.',
  },
  {
    q: 'Apakah mendukung QRIS dan AstraPay?',
    a: 'Ya. QRIS dan AstraPay sudah terintegrasi langsung. Pelangganmu bisa bayar dengan metode yang sudah familiar — tanpa perlu download app baru.',
  },
  {
    q: 'Apakah AstraToko gratis?',
    a: 'Setup toko gratis selamanya. AstraToko mengambil fee 2.5% per transaksi — jauh lebih rendah dari rata-rata biaya platform marketplace.',
  },
]

function FAQSection() {
  const [open, setOpen] = useState<number | null>(null)
  return (
    <div className="space-y-3">
      {FAQ_ITEMS.map((item, i) => (
        <div key={i} className="border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="w-full flex items-center justify-between px-5 py-4 text-left bg-white hover:bg-gray-50 transition-colors"
          >
            <span className="font-semibold text-gray-900 text-sm pr-4">{item.q}</span>
            <ChevronDown size={16} className={`text-gray-400 flex-shrink-0 transition-transform duration-200 ${open === i ? 'rotate-180' : ''}`} />
          </button>
          {open === i && (
            <div className="px-5 pb-4 bg-white">
              <p className="text-sm text-gray-500 leading-relaxed">{item.a}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

// ── Landing Page ──────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">

      {/* ── Nav ── */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-app-blue rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-white font-extrabold text-sm leading-none">AT</span>
            </div>
            <span className="font-bold text-app-blue text-lg">AstraToko</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/demo" className="text-sm text-gray-500 hover:text-gray-900 transition-colors hidden sm:block">
              Lihat Demo
            </Link>
            <Link href="/mulai" className="btn-primary text-sm py-2 px-5">Mulai Gratis</Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="max-w-6xl mx-auto px-6 pt-14 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div className="animate-fadein">
            <div className="inline-flex items-center gap-2 bg-app-blue-pale text-app-blue text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-app-blue inline-block flex-shrink-0" />
              Powered by AstraPay
            </div>
            <h1 className="text-5xl md:text-[3.25rem] font-extrabold text-gray-900 leading-[1.06] tracking-tight mb-5">
              Toko kamu.<br />
              Customer kamu.<br />
              <span className="text-app-blue">Margin kamu.</span>
            </h1>
            <p className="text-lg text-gray-500 leading-relaxed mb-8 max-w-md">
              Import katalog marketplace dalam sekali klik. AstraToko otomatis menyiapkan QRIS,
              AstraPay, AstraPoints, dan link tokomu siap dipakai dalam hitungan menit.
            </p>
            <div className="flex flex-wrap gap-3 mb-8">
              <Link href="/mulai" className="btn-primary inline-flex items-center gap-2 text-base px-7 py-3.5">
                Mulai Gratis <ArrowRight size={18} />
              </Link>
              <Link href="/demo" className="btn-secondary text-base px-7 py-3.5">Lihat Demo</Link>
            </div>

          </div>

          <div className="flex justify-center md:justify-end pt-10 md:pt-0 animate-slide-in-right">
            <PhoneMockup />
          </div>
        </div>
      </section>

      {/* ── Trust Bar ── */}
      <div className="border-y border-gray-100 py-4 bg-gray-50/60">
        <div className="max-w-6xl mx-auto px-6 flex flex-wrap justify-center gap-x-8 gap-y-2.5">
          {['Setup kurang dari 10 menit', 'Import katalog marketplace otomatis', 'QRIS & AstraPay siap pakai', 'Data pelanggan milikmu sepenuhnya'].map((item) => (
            <div key={item} className="flex items-center gap-2 text-sm text-gray-600">
              <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                <Check size={9} className="text-white" strokeWidth={3} />
              </div>
              {item}
            </div>
          ))}
        </div>
      </div>

      {/* ── Why AstraToko ── */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="max-w-2xl mx-auto text-center mb-14">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Akuisisi di mana saja.<br />
            <span className="text-app-blue">Hubungan pelanggan tetap milikmu.</span>
          </h2>
          <p className="text-gray-500 leading-relaxed">
            Marketplace, media sosial, dan toko offline sangat efektif untuk menjangkau pelanggan baru.
            AstraToko melanjutkan hubungan itu — melalui toko online yang langsung terhubung dengan ekosistem AstraPay.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-3xl mx-auto mb-14">
          <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Channel Akuisisi</p>
            <p className="font-bold text-gray-900 text-lg mb-3">Marketplace & Channel Lain</p>
            <ul className="space-y-2.5">
              {['Jangkauan ke jutaan pelanggan baru', 'Traffic & discovery built-in', 'Trust tinggi di kalangan pembeli', 'Mudah ditemukan lewat pencarian'].map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-gray-500">
                  <Check size={13} className="text-gray-300 mt-0.5 flex-shrink-0" />{item}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-app-blue rounded-2xl p-6">
            <p className="text-[10px] font-bold text-blue-300 uppercase tracking-widest mb-4">Channel Hubungan</p>
            <p className="font-bold text-white text-lg mb-3">AstraToko</p>
            <ul className="space-y-2.5">
              {['Pelanggan kembali langsung ke tokomu', 'Data pelanggan 100% milikmu', 'Bangun loyalitas jangka panjang', 'Direct relationship tanpa perantara'].map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-blue-100">
                  <Check size={13} className="text-blue-300 mt-0.5 flex-shrink-0" />{item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { n: '1', label: 'Dapatkan Pelanggan', desc: 'Temukan pelanggan baru lewat marketplace, media sosial, atau toko fisik', numBg: 'bg-gray-100', numColor: 'text-gray-500', titleColor: 'text-gray-700', border: 'border-gray-100' },
            { n: '2', label: 'Bagikan Toko Personal', desc: 'Kirim link tokomu via WhatsApp — satu klik, langsung ke storefront', numBg: 'bg-app-blue', numColor: 'text-white', titleColor: 'text-app-blue', border: 'border-blue-100' },
            { n: '3', label: 'Checkout via AstraPay', desc: 'Pelanggan bayar dengan QRIS atau AstraPay yang sudah mereka kenal', numBg: 'bg-app-blue', numColor: 'text-white', titleColor: 'text-app-blue', border: 'border-blue-100' },
            { n: '4', label: 'Pelanggan Kembali', desc: 'Data, AstraPoints, dan direct relationship — sepenuhnya milikmu', numBg: 'bg-green-500', numColor: 'text-white', titleColor: 'text-green-700', border: 'border-green-100' },
          ].map((step, i, arr) => (
            <div key={step.n} className={`bg-white rounded-2xl border ${step.border} p-6 shadow-sm text-center`}>
              <div className={`w-11 h-11 ${step.numBg} rounded-xl flex items-center justify-center mx-auto mb-4`}>
                <span className={`font-extrabold text-base ${step.numColor}`}>{step.n}</span>
              </div>
              <h3 className={`font-bold text-sm ${step.titleColor} mb-2`}>{step.label}</h3>
              <p className="text-xs text-gray-400 leading-relaxed">{step.desc}</p>
              {i < arr.length - 1 && (
                <div className="md:hidden mt-4 flex justify-center">
                  <ArrowRight size={16} className="text-gray-200 rotate-90" />
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── Demo ── */}
      <section className="bg-app-blue py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-blue-300 text-xs font-bold uppercase tracking-widest mb-4">Demo Interaktif</p>
              <h2 className="text-3xl font-bold text-white mb-4">
                Dari katalog ke toko online<br />dalam hitungan menit.
              </h2>
              <p className="text-blue-200 leading-relaxed mb-6">
                Coba demo interaktif dan lihat bagaimana AstraToko membantu menjalankan
                channel penjualanmu sendiri — tanpa daftar dulu.
              </p>
              <ul className="space-y-2.5">
                {[
                  'Import instan dari CSV marketplace',
                  'Preview toko sebelum live',
                  'QRIS dan AstraPay langsung aktif',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-blue-100 text-sm">
                    <Check size={14} className="text-green-400 flex-shrink-0" />{item}
                  </li>
                ))}
              </ul>
            </div>
            <InteractiveDemo />
          </div>
        </div>
      </section>

      {/* ── Demo → Calculator Bridge ── */}
      <div className="bg-app-blue border-t border-blue-700/40 py-5">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-center gap-2 text-center sm:text-left">
          <p className="text-blue-300 text-sm">Sudah yakin produknya mudah dipakai?</p>
          <span className="hidden sm:block text-blue-600">·</span>
          <p className="text-blue-100 text-sm font-semibold">Scroll ke bawah untuk hitung potensi penghematannya.</p>
          <ChevronDown size={14} className="text-blue-400 animate-bounce" />
        </div>
      </div>

      {/* ── How It Works ── */}
      <section className="bg-astrapay-gray py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Dari CSV ke toko live dalam 5 langkah.</h2>
          <p className="text-gray-500 mb-12">Tidak perlu coding. Tidak perlu server.</p>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8 relative">
            {[
              { n: '01', label: 'Export CSV', desc: 'Download ekspor produk dari Seller Center marketplace kamu.' },
              { n: '02', label: 'Upload', desc: 'Upload ke AstraToko. Kolom nama, harga, stok, kategori auto-mapping.' },
              { n: '03', label: 'Toko Live ⚡', desc: 'Konfirmasi produk — toko langsung aktif dan bisa diakses pembeli.' },
              { n: '04', label: 'Bagikan Link', desc: 'Kirim link tokomu ke repeat buyer via WhatsApp — langsung dari app.' },
              { n: '05', label: 'Terima Pesanan', desc: 'Order masuk via AstraPay. Notifikasi real-time di dashboard.' },
            ].map((step, i) => (
              <div key={step.n} className="relative flex md:flex-col gap-4 md:gap-0">
                {i < 4 && <div className="hidden md:block absolute top-5 left-full w-full h-px bg-gray-200 -translate-x-1/2 z-0" />}
                <div className="w-10 h-10 bg-app-blue rounded-xl flex items-center justify-center text-white font-extrabold text-xs flex-shrink-0 relative z-10">{step.n}</div>
                <div className="md:mt-4">
                  <h3 className="font-bold text-gray-900 mb-1 text-sm">{step.label}</h3>
                  <p className="text-gray-400 text-xs leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Feature Grid ── */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Semua yang kamu butuhkan, dalam satu platform.</h2>
        <p className="text-gray-500 mb-10">Dari import katalog hingga pembayaran dan loyalitas pelanggan.</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { Icon: Package,    title: 'Import Katalog',       desc: 'CSV dari Shopee, Tokopedia & TikTok Shop',            bg: 'bg-blue-50',   iconColor: 'text-app-blue' },
            { Icon: Store,      title: 'Toko Online',          desc: 'URL custom, mobile-first storefront',                 bg: 'bg-green-50',  iconColor: 'text-green-600' },
            { Icon: CreditCard, title: 'QRIS & AstraPay',      desc: 'Checkout siap pakai, tanpa app baru',                 bg: 'bg-purple-50', iconColor: 'text-purple-600' },
            { Icon: Star,       title: 'AstraPoints',          desc: 'Poin loyalty otomatis tiap transaksi',                bg: 'bg-amber-50',  iconColor: 'text-astrapay-gold' },
            { Icon: Bell,       title: 'Notifikasi Real-time', desc: 'Pesanan baru langsung masuk ke dashboard',            bg: 'bg-indigo-50', iconColor: 'text-indigo-600' },
            { Icon: Zap,        title: 'Setup < 10 Menit',    desc: 'Import CSV, preview produk, toko langsung live',      bg: 'bg-amber-50',  iconColor: 'text-astrapay-gold' },
            { Icon: Share2,     title: 'Share via WhatsApp',   desc: 'Bagikan link toko ke pelanggan dalam satu klik',      bg: 'bg-green-50',  iconColor: 'text-green-600' },
            { Icon: Users,      title: 'Order Dashboard',      desc: 'Kelola pesanan dan pantau penjualan real-time',       bg: 'bg-blue-50',   iconColor: 'text-app-blue' },
          ].map((item) => (
            <div key={item.title} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <div className={`w-10 h-10 ${item.bg} rounded-xl flex items-center justify-center mb-4`}>
                <item.Icon size={19} className={item.iconColor} />
              </div>
              <p className="font-bold text-gray-900 text-sm mb-1">{item.title}</p>
              <p className="text-xs text-gray-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Dashboard Preview ── */}
      <section className="bg-gray-950 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-blue-400 text-xs font-bold uppercase tracking-widest mb-4">Merchant Dashboard</p>
              <h2 className="text-3xl font-bold text-white mb-4">
                Order masuk.<br />
                <span className="text-green-400">Dashboard update seketika.</span>
              </h2>
              <p className="text-gray-400 leading-relaxed mb-6">
                Setiap transaksi via AstraPay langsung tercatat di dashboardmu — real-time,
                tanpa refresh. Tidak ada invoice manual. Tidak ada rekap akhir bulan yang ribet.
              </p>
              <ul className="space-y-3">
                {[
                  'Notifikasi order real-time via Supabase',
                  'Revenue dari direct channel langsung terhitung',
                  'Database pelanggan terbangun otomatis',
                  'Hubungi repeat buyer via WhatsApp 1-klik',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2.5 text-gray-300 text-sm">
                    <div className="w-4 h-4 rounded-full bg-green-500/20 border border-green-500/40 flex items-center justify-center flex-shrink-0">
                      <Check size={8} className="text-green-400" strokeWidth={3} />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <Link href="/dashboard" className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/15 border border-white/20 text-white font-semibold px-5 py-3 rounded-xl text-sm transition-colors">
                  Buka Dashboard Demo <ArrowRight size={15} />
                </Link>
              </div>
            </div>
            <DashboardPreview />
          </div>
        </div>
      </section>

      {/* ── Business Impact ── */}
      <section className="bg-astrapay-gray py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Dampak Bisnis</p>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Berapa potensi bisnismu<br />dengan AstraToko?
              </h2>
              <p className="text-gray-500 leading-relaxed mb-4">
                Geser slider sesuai GMV bulananmu. Lihat estimasi penghematan biaya platform
                ketika pelanggan yang sudah ada berbelanja langsung melalui tokomu.
              </p>
              <p className="text-xs text-gray-400">
                Estimasi ilustratif. Biaya aktual bergantung pada platform yang digunakan.
              </p>
            </div>
            <SavingsCalculator />
          </div>
        </div>
      </section>

      {/* ── Astra Ecosystem ── */}
      <section className="bg-app-blue py-20">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-blue-300 text-xs font-bold uppercase tracking-widest mb-4">Didukung Ekosistem Astra</p>
          <h2 className="text-3xl font-bold text-white mb-4">Ekosistem Astra, bukan sekadar toko.</h2>
          <p className="text-blue-200 max-w-xl mx-auto mb-12 leading-relaxed">
            AstraToko terintegrasi penuh dengan Astra Financial Services —
            memberikan pengalaman pembayaran yang sudah familiar bagi jutaan pengguna AstraPay.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {[
              { label: 'QRIS Universal', Icon: CreditCard },
              null,
              { label: 'AstraPay', Icon: Zap },
              null,
              { label: 'AstraPoints', Icon: Star },
              null,
              { label: 'Direct Customer', Icon: Users },
              null,
              { label: 'Loyal Buyer', Icon: ShieldCheck },
            ].map((item, i) =>
              item === null ? (
                <ArrowRight key={i} size={14} className="text-blue-400" />
              ) : (
                <div key={i} className="bg-white/10 rounded-xl px-4 py-3 text-center min-w-[96px]">
                  <item.Icon size={17} className="text-blue-300 mx-auto mb-1" />
                  <p className="text-white text-xs font-semibold">{item.label}</p>
                </div>
              )
            )}
          </div>
        </div>
      </section>

      {/* ── FAQ + Final CTA ── */}
      <section className="max-w-3xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-gray-900 mb-10 text-center">Pertanyaan Umum</h2>
        <FAQSection />
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Siap buka toko sendiri?</h2>
          <p className="text-gray-500 mb-1">Import produk. Terima pembayaran. Bangun hubungan langsung dengan pelanggan.</p>
          <p className="text-gray-400 text-sm mb-8">Gratis setup. Tidak perlu kartu kredit.</p>
          <Link href="/mulai" className="btn-primary inline-flex items-center gap-2 text-base px-8 py-4">
            Mulai Gratis <ArrowRight size={18} />
          </Link>
          <p className="mt-4 text-sm text-gray-400">
            Atau{' '}
            <Link href="/toko/tokorizky" className="text-app-blue hover:underline">lihat demo store →</Link>
          </p>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-gray-100 px-6 py-10">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-start justify-between gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 bg-app-blue rounded flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-xs leading-none">AT</span>
                </div>
                <span className="font-bold text-gray-800">AstraToko</span>
              </div>
              <p className="text-sm text-gray-400 max-w-xs leading-relaxed">
                Platform owned-commerce untuk seller Indonesia.<br />Powered by AstraPay.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-x-12 gap-y-2">
              {[
                { label: 'Mulai Gratis', href: '/mulai' },
                { label: 'Demo Store',  href: '/toko/tokorizky' },
                { label: 'Demo Flow',   href: '/demo' },
                { label: 'Dashboard',   href: '/dashboard' },
              ].map((link) => (
                <Link key={link.label} href={link.href} className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="border-t border-gray-100 pt-6 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-gray-400">
            <p>AstraToko by Astra Financial Services. Powered by AstraPay.</p>
            <div className="flex gap-5">
              <span>Privacy</span>
              <span>Terms</span>
              <span>Contact</span>
            </div>
          </div>
        </div>
      </footer>

    </div>
  )
}
