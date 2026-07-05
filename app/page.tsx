'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import {
  ArrowRight, Check, ChevronDown, Zap, Star, Users,
  TrendingUp, MessageCircle, Package, CreditCard, Bot, Bell,
} from 'lucide-react'
import { formatRp, formatRpShort } from '@/lib/utils'

// ── Utilities ─────────────────────────────────────────────────────────────────

function useCountUp(target: number, duration = 1400, active = true) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!active || target === 0) { setCount(0); return }
    let id: number
    const start = Date.now()
    const tick = () => {
      const t = Math.min((Date.now() - start) / duration, 1)
      setCount(Math.round(target * (1 - Math.pow(1 - t, 3))))
      if (t < 1) id = requestAnimationFrame(tick)
    }
    id = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(id)
  }, [target, duration, active])
  return count
}

function useInView(threshold = 0.25) {
  const ref = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true) }, { threshold })
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])
  return { ref, inView }
}

// ── Hero Phone Mockup ─────────────────────────────────────────────────────────

const HERO_ORDERS = [
  { initial: 'A', name: 'Order baru masuk',    product: 'Brake Pad',      amount: 'Rp 85.000'  },
  { initial: 'B', name: 'Pembayaran berhasil', product: 'Helm Half Face', amount: 'Rp 185.000' },
  { initial: 'C', name: 'Repeat customer',     product: 'Oli Federal',    amount: 'Rp 52.000'  },
]

function HeroPhone() {
  const [toastIdx,   setToastIdx]   = useState(0)
  const [toastPhase, setToastPhase] = useState<'in' | 'out' | 'hidden'>('hidden')
  const [revenue,    setRevenue]    = useState(1_250_000)
  const [orderCount, setOrderCount] = useState(7)

  useEffect(() => {
    const show = () => {
      setToastPhase('in')
      setTimeout(() => setToastPhase('out'), 2600)
      setTimeout(() => {
        setToastPhase('hidden')
        setToastIdx(i => {
          const next = (i + 1) % HERO_ORDERS.length
          const order = HERO_ORDERS[next]
          const parsed = parseInt(order.amount.replace(/\D/g, ''))
          setRevenue(v => v + parsed)
          setOrderCount(c => c + 1)
          return next
        })
      }, 3100)
    }
    const t = setTimeout(show, 1200)
    const iv = setInterval(show, 4500)
    return () => { clearTimeout(t); clearInterval(iv) }
  }, [])

  const toast = HERO_ORDERS[toastIdx]

  return (
    <div className="relative mx-auto w-[240px] select-none">
      {/* Notification toast */}
      {toastPhase !== 'hidden' && (
        <div className={`absolute -top-5 -right-14 z-20 bg-white rounded-2xl shadow-2xl border border-gray-100 px-3 py-2.5 flex items-center gap-2 min-w-[190px] transition-all duration-300 ${toastPhase === 'in' ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}`}>
          <div className="w-7 h-7 bg-green-500 rounded-xl flex items-center justify-center flex-shrink-0">
            <Check size={13} className="text-white" strokeWidth={3} />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold text-gray-900 truncate">{toast.name}</p>
            <p className="text-[10px] text-green-600 font-semibold">{toast.amount} · AstraPay</p>
          </div>
        </div>
      )}

      {/* Phone shell */}
      <div className="bg-gray-900 rounded-[2.8rem] p-2.5 shadow-2xl shadow-blue-900/25 ring-1 ring-white/10">
        <div className="bg-white rounded-[2.35rem] overflow-hidden min-h-[460px]">
          {/* Notch */}
          <div className="bg-gray-900 h-6 flex items-center justify-center">
            <div className="w-14 h-3.5 bg-gray-800 rounded-full" />
          </div>

          {/* Store header */}
          <div className="bg-app-blue px-3 pt-3 pb-3">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center">
                  <span className="text-white font-extrabold text-xs">✦</span>
                </div>
                <div>
                  <p className="text-white font-extrabold text-[11px]">Toko Rizky</p>
                  <div className="flex items-center gap-1">
                    <div className="w-1 h-1 bg-green-400 rounded-full animate-pulse" />
                    <p className="text-green-300 text-[8px] font-semibold">Aktif</p>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-blue-200 text-[8px]">Hari ini</p>
                <p className="text-white font-extrabold text-[13px]">{formatRpShort(revenue)}</p>
              </div>
            </div>
            {/* Mini KPI row */}
            <div className="flex gap-1.5">
              <div className="flex-1 bg-white/10 rounded-xl px-2 py-1.5 text-center">
                <p className="text-white font-extrabold text-sm leading-none">{orderCount}</p>
                <p className="text-blue-200 text-[8px] mt-0.5">Order</p>
              </div>
              <div className="flex-1 bg-white/10 rounded-xl px-2 py-1.5 text-center">
                <p className="text-white font-extrabold text-sm leading-none">3</p>
                <p className="text-blue-200 text-[8px] mt-0.5">Repeat</p>
              </div>
              <div className="flex-1 bg-white/10 rounded-xl px-2 py-1.5 text-center">
                <p className="text-white font-extrabold text-sm leading-none">QRIS</p>
                <p className="text-blue-200 text-[8px] mt-0.5">Aktif</p>
              </div>
            </div>
          </div>

          {/* Products */}
          <div className="p-2.5">
            <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mb-2">Produk Terlaris</p>
            {[
              { name: 'Brake Pad XYZ',   price: 'Rp 85.000',  color: '#3B5BDB', sold: 24 },
              { name: 'Oli Federal 1L',  price: 'Rp 52.000',  color: '#2F9E44', sold: 19 },
              { name: 'Helm Half Face',  price: 'Rp 185.000', color: '#E67700', sold: 12 },
            ].map((p, i) => (
              <div key={i} className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: p.color + '22' }}>
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: p.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[9px] font-semibold text-gray-800 truncate">{p.name}</p>
                  <p className="text-[9px] font-extrabold text-app-blue">{p.price}</p>
                </div>
                <p className="text-[8px] text-gray-400 font-medium">{p.sold} terjual</p>
              </div>
            ))}

            {/* AI Insight strip */}
            <div className="mt-2 bg-violet-50 border border-violet-100 rounded-xl px-2.5 py-2 flex items-start gap-1.5">
              <Bot size={9} className="text-violet-500 mt-0.5 flex-shrink-0" />
              <p className="text-[8px] text-violet-700 leading-relaxed">
                3 pembeli Brake Pad belum beli Oli. Buat bundle.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── How It Works ──────────────────────────────────────────────────────────────

const HOW_STEPS = [
  {
    num: 1,
    icon: Package,
    title: 'Import produk',
    desc: 'Upload CSV dari Shopee, Tokopedia, atau TikTok. Semua produk langsung live.',
  },
  {
    num: 2,
    icon: CreditCard,
    title: 'QRIS & AstraPay aktif',
    desc: 'Pelanggan langsung bisa bayar. Tanpa setup tambahan.',
  },
  {
    num: 3,
    icon: Bell,
    title: 'Order pertama masuk',
    desc: 'Data pelanggan (nama, nomor, riwayat) langsung tersimpan milikmu.',
  },
  {
    num: 4,
    icon: Users,
    title: 'Pelanggan kembali langsung',
    desc: 'Bukan lewat marketplace. Tidak ada komisi ulang.',
  },
]

function HowItWorks() {
  const { ref, inView } = useInView(0.15)
  return (
    <div ref={ref} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {HOW_STEPS.map((step, i) => {
        const Icon = step.icon
        return (
          <div key={i} className={`transition-all duration-500 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
            style={{ transitionDelay: `${i * 80}ms` }}>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-app-blue rounded-xl flex items-center justify-center flex-shrink-0">
                <Icon size={14} className="text-white" />
              </div>
              {i < HOW_STEPS.length - 1 && (
                <div className="flex-1 h-px bg-gray-200 hidden lg:block" />
              )}
            </div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{step.num}</p>
            <p className="text-sm font-extrabold text-gray-900 mb-1">{step.title}</p>
            <p className="text-xs text-gray-500 leading-relaxed">{step.desc}</p>
          </div>
        )
      })}
    </div>
  )
}

// ── Live Dashboard Preview ────────────────────────────────────────────────────

const DASH_ORDERS = [
  { initial: 'A', product: 'Brake Pad XYZ',      amount: 'Rp 85.000',  time: '2m lalu'  },
  { initial: 'B', product: 'Helm Half Face SNI', amount: 'Rp 185.000', time: '14m lalu' },
  { initial: 'C', product: 'Oli Federal 1L',     amount: 'Rp 52.000',  time: '1j lalu'  },
]

function LiveDashboard() {
  const { ref, inView } = useInView(0.2)
  const [aiVisible, setAiVisible] = useState(false)
  const revenue = useCountUp(4_850_000, 1800, inView)
  const savings  = useCountUp(875_000,  1400, inView)

  useEffect(() => {
    if (!inView) return
    const t = setTimeout(() => setAiVisible(true), 2200)
    return () => clearTimeout(t)
  }, [inView])

  return (
    <div ref={ref} className={`transition-all duration-600 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
      <div className="bg-gray-950 rounded-2xl p-5 border border-white/5">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-app-blue rounded-xl flex items-center justify-center flex-shrink-0">
              <span className="text-white font-extrabold text-xs">R</span>
            </div>
            <div>
              <p className="text-white font-bold text-[11px]">Toko Rizky</p>
              <p className="text-gray-500 text-[9px]">Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-[9px] text-green-400 font-bold bg-green-400/10 px-2.5 py-1 rounded-full">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" /> Live
          </div>
        </div>

        {/* KPIs */}
        <div className="bg-gray-900/80 rounded-xl p-4 mb-3 grid grid-cols-3 gap-3">
          <div>
            <p className="text-[8px] text-gray-600 uppercase tracking-widest font-bold mb-1">GMV Bulan Ini</p>
            <p className="text-xl font-extrabold text-white leading-none">{formatRpShort(revenue)}</p>
          </div>
          <div>
            <p className="text-[8px] text-gray-600 uppercase tracking-widest font-bold mb-1">Fee Dihindari</p>
            <p className="text-xl font-extrabold text-green-400 leading-none">+{formatRpShort(savings)}</p>
          </div>
          <div>
            <p className="text-[8px] text-gray-600 uppercase tracking-widest font-bold mb-1">Repeat Buyer</p>
            <p className="text-xl font-extrabold text-purple-400 leading-none">67%</p>
          </div>
        </div>

        {/* Orders */}
        <div className="bg-white/[0.03] border border-white/5 rounded-xl overflow-hidden mb-3">
          <div className="px-3 py-2 border-b border-white/5">
            <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Pesanan Terbaru</p>
          </div>
          {DASH_ORDERS.map((o, i) => (
            <div key={i}
              className={`flex items-center gap-2.5 px-3 py-2.5 border-b border-white/[0.04] last:border-0 transition-all duration-500 ${inView ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}
              style={{ transitionDelay: `${i * 150 + 300}ms` }}>
              <div className="w-7 h-7 bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-gray-300 font-bold text-[10px]">{o.initial}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-semibold text-gray-200 truncate">{o.product}</p>
                <p className="text-[9px] text-gray-500">{o.time}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-[11px] font-bold text-gray-200">{o.amount}</p>
                <span className="text-[8px] font-bold text-green-400">Lunas</span>
              </div>
            </div>
          ))}
        </div>

        {/* AI Insight - animates in after delay */}
        <div className={`bg-violet-950/60 border border-violet-800/40 rounded-xl p-3 transition-all duration-700 ${aiVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`}>
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-5 h-5 bg-violet-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <Bot size={10} className="text-white" />
            </div>
            <p className="text-[9px] font-bold text-violet-300 uppercase tracking-wide">AI tahu siapa yang harus kamu follow-up hari ini</p>
          </div>
          <p className="text-[10px] text-gray-300 leading-relaxed">
            4 pelanggan tidak aktif 30+ hari. Nomor WhatsApp tersimpan.
            <span className="text-white font-semibold"> Hubungi sekarang →</span>
          </p>
        </div>
      </div>
    </div>
  )
}

// ── AI Recommendation Cards ───────────────────────────────────────────────────

const AI_CARDS = [
  {
    icon: MessageCircle,
    iconColor: 'text-violet-600',
    iconBg: 'bg-violet-50',
    tag: 'Retensi',
    tagColor: 'text-violet-600',
    title: '4 pelanggan belum kembali.',
    body: 'Nomor WhatsApp mereka tersimpan di databasemu. Di marketplace, kamu tidak punya akses ini.',
    impact: '+28% recovery rate',
    impactColor: 'bg-violet-50 text-violet-700',
  },
  {
    icon: Package,
    iconColor: 'text-violet-600',
    iconBg: 'bg-violet-50',
    tag: 'Cross-sell',
    tagColor: 'text-violet-600',
    title: 'Pembeli Brake Pad belum beli Oli.',
    body: 'Buat bundle. Rata-rata order value naik 38% dengan satu penawaran.',
    impact: 'Est. +Rp 208.000',
    impactColor: 'bg-violet-50 text-violet-700',
  },
  {
    icon: Star,
    iconColor: 'text-violet-600',
    iconBg: 'bg-violet-50',
    tag: 'VIP',
    tagColor: 'text-violet-600',
    title: '2 pelanggan sudah 3+ order.',
    body: 'Kirim reward eksklusif langsung via WhatsApp. Tidak perlu marketplace jadi perantara.',
    impact: 'Retensi naik 40%',
    impactColor: 'bg-violet-50 text-violet-700',
  },
]

function AICards() {
  const { ref, inView } = useInView(0.15)
  return (
    <div ref={ref} className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {AI_CARDS.map((card, i) => {
        const Icon = card.icon
        return (
          <div key={i}
            className={`bg-white border border-gray-100 rounded-2xl p-5 shadow-sm transition-all duration-500 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
            style={{ transitionDelay: `${i * 80}ms` }}>
            <div className="flex items-center gap-2 mb-4">
              <div className={`w-7 h-7 ${card.iconBg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                <Icon size={14} className={card.iconColor} />
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-widest ${card.tagColor}`}>{card.tag}</span>
            </div>
            <p className="text-sm font-extrabold text-gray-900 mb-1.5 leading-snug">{card.title}</p>
            <p className="text-xs text-gray-500 leading-relaxed mb-4">{card.body}</p>
            <div className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full ${card.impactColor}`}>
              <TrendingUp size={10} /> {card.impact}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── Savings Calculator ────────────────────────────────────────────────────────

const PLATFORMS = [
  { key: 'Tokopedia', fee: 0.22 },
  { key: 'Shopee',    fee: 0.20 },
  { key: 'TikTok',   fee: 0.25 },
]

function SavingsCalculator() {
  const { ref, inView } = useInView(0.2)
  const [gmv,      setGmv]      = useState(20_000_000)
  const [platform, setPlatform] = useState('Tokopedia')
  const feeRate   = PLATFORMS.find(p => p.key === platform)?.fee ?? 0.22
  const feeMarket = Math.round(gmv * feeRate)
  const feeAstra  = Math.round(gmv * 0.025)
  const savings   = feeMarket - feeAstra
  const animSavings = useCountUp(savings, 500, inView)

  return (
    <div ref={ref} className={`bg-white border border-gray-100 rounded-2xl p-7 shadow-sm transition-all duration-600 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
      {/* Platform toggle */}
      <div className="flex gap-2 mb-6">
        {PLATFORMS.map(p => (
          <button key={p.key} onClick={() => setPlatform(p.key)}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all border-2 ${platform === p.key ? 'border-app-blue bg-app-blue text-white' : 'border-gray-100 bg-gray-50 text-gray-500 hover:border-gray-200'}`}>
            {p.key}
          </button>
        ))}
      </div>

      {/* GMV slider */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-gray-700">GMV per bulan</span>
          <span className="text-base font-extrabold text-gray-900">{formatRp(gmv)}</span>
        </div>
        <input type="range" min={5_000_000} max={100_000_000} step={1_000_000} value={gmv}
          onChange={e => setGmv(Number(e.target.value))} className="w-full accent-app-blue" />
        <div className="flex justify-between mt-1.5">
          {[5, 20, 50, 100].map(v => (
            <button key={v} onClick={() => setGmv(v * 1_000_000)}
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full transition-colors ${gmv === v * 1_000_000 ? 'bg-app-blue text-white' : 'text-gray-400 hover:text-gray-600'}`}>
              {v}jt
            </button>
          ))}
        </div>
      </div>

      {/* Fee comparison */}
      <div className="space-y-3 mb-5">
        <div>
          <div className="flex justify-between text-xs font-semibold mb-1.5">
            <span className="text-gray-500">{platform} ({Math.round(feeRate * 100)}%)</span>
            <span className="text-red-500">-{formatRpShort(feeMarket)}</span>
          </div>
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-red-400 rounded-full transition-all duration-500" style={{ width: `${Math.round(feeRate * 100)}%` }} />
          </div>
        </div>
        <div>
          <div className="flex justify-between text-xs font-semibold mb-1.5">
            <span className="text-gray-500">AstraToko (2.5%)</span>
            <span className="text-app-blue">-{formatRpShort(feeAstra)}</span>
          </div>
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-app-blue rounded-full transition-all duration-500" style={{ width: '2.5%' }} />
          </div>
        </div>
      </div>

      {/* Savings result */}
      <div className="bg-green-50 border border-green-100 rounded-2xl px-5 py-4">
        <p className="text-xs text-green-600 font-semibold mb-1">Kamu hemat per bulan</p>
        <p className="text-3xl font-extrabold text-green-700 tracking-tight">+{formatRp(animSavings)}</p>
        <p className="text-xs text-green-500 mt-1">{formatRpShort(savings * 12)} per tahun</p>
      </div>
    </div>
  )
}

// ── FAQ ───────────────────────────────────────────────────────────────────────

const FAQ_ITEMS = [
  {
    q: 'AstraToko menggantikan marketplace?',
    a: 'Tidak. Marketplace efektif untuk akuisisi pelanggan baru. AstraToko membantu setelah transaksi pertama: repeat buyer langsung ke tokomu, tanpa komisi ulang.',
  },
  {
    q: 'Perlu skill teknis?',
    a: 'Tidak. Upload CSV dari marketplace, isi nama toko, dan langsung live. Rata-rata kurang dari 10 menit.',
  },
  {
    q: 'Data pelanggan saya aman?',
    a: 'Data pelanggan adalah milikmu, bukan milik AstraToko. Kamu bisa export kapanpun.',
  },
  {
    q: 'Berapa fee AstraToko?',
    a: 'Setup gratis. Fee 2.5% flat per transaksi, dibanding 20-25% komisi marketplace.',
  },
]

function FAQSection() {
  const [open, setOpen] = useState<number | null>(null)
  const { ref, inView } = useInView(0.1)
  return (
    <div ref={ref} className={`transition-all duration-600 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
      <div className="space-y-2">
        {FAQ_ITEMS.map((item, i) => (
          <div key={i} className="border border-gray-100 rounded-2xl overflow-hidden">
            <button onClick={() => setOpen(open === i ? null : i)}
              className="w-full flex items-center justify-between px-5 py-4 text-left bg-white hover:bg-gray-50 transition-colors">
              <span className="font-semibold text-gray-900 text-sm pr-4">{item.q}</span>
              <ChevronDown size={15} className={`text-gray-400 flex-shrink-0 transition-transform duration-200 ${open === i ? 'rotate-180' : ''}`} />
            </button>
            {open === i && (
              <div className="px-5 pb-4 bg-white">
                <p className="text-sm text-gray-500 leading-relaxed">{item.a}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">

      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-app-blue rounded-lg flex items-center justify-center">
              <span className="text-white font-extrabold text-sm">AT</span>
            </div>
            <span className="font-bold text-app-blue text-lg">AstraToko</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/toko/tokorizky?demo=true" className="text-sm text-gray-500 hover:text-gray-900 transition-colors hidden sm:block">
              Demo Toko
            </Link>
            <Link href="/mulai" className="bg-app-blue hover:bg-app-blue-light text-white font-bold text-sm py-2 px-5 rounded-xl transition-colors">
              Mulai Gratis
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Section 1: Hero ── */}
      <section className="max-w-6xl mx-auto px-6 pt-16 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div>
            <h1 className="text-[2.8rem] font-extrabold text-gray-900 leading-[1.08] tracking-tight mb-5">
              Repeat order masuk.<br />
              <span className="text-app-blue">Komisi marketplace tidak.</span>
            </h1>
            <p className="text-lg text-gray-500 leading-relaxed mb-8 max-w-md">
              Simpan nama, nomor WhatsApp, dan riwayat setiap pelanggan.
              Saat mereka beli lagi, langsung ke tokomu tanpa komisi ulang.
            </p>
            <Link href="/mulai" className="inline-flex items-center gap-2.5 bg-app-blue hover:bg-app-blue-light text-white font-bold text-base px-8 py-3.5 rounded-2xl transition-colors shadow-md shadow-blue-200">
              Mulai Gratis <ArrowRight size={18} />
            </Link>
          </div>

          <div className="flex justify-center md:justify-end">
            <HeroPhone />
          </div>
        </div>
      </section>

      {/* Trust bar */}
      <div className="border-y border-gray-100 py-3.5 bg-gray-50/60">
        <div className="max-w-6xl mx-auto px-6 flex flex-wrap justify-center gap-x-8 gap-y-2">
          {[
            'Import dari Shopee, Tokopedia, TikTok',
            'QRIS & AstraPay siap pakai',
            'Data pelanggan 100% milikmu',
            'Fee 2.5% flat, bukan 20-25%',
          ].map(item => (
            <div key={item} className="flex items-center gap-2 text-sm text-gray-500">
              <Check size={13} className="text-green-500" strokeWidth={3} />
              {item}
            </div>
          ))}
        </div>
      </div>

      {/* ── Section 2: Cara Kerja ── */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-gray-900">Dari import ke repeat customer.</h2>
          <p className="text-gray-500 mt-3 text-sm">Empat langkah, kurang dari 10 menit.</p>
        </div>
        <HowItWorks />
      </section>

      {/* ── Section 3: Dashboard ── */}
      <section className="bg-gray-950 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-14 items-center">
            <div>
              <h2 className="text-3xl font-extrabold text-white mb-4">
                AstraToko tahu siapa<br />
                <span className="text-green-400">yang harus kamu follow-up hari ini.</span>
              </h2>
              <p className="text-gray-400 text-sm leading-relaxed mb-6">
                Setiap transaksi AstraPay langsung tercatat. AI menganalisis pola dan memberi
                rekomendasi konkret: siapa yang harus dihubungi, produk apa yang layak di-bundle,
                dan pelanggan mana yang hampir churn.
              </p>
              <ul className="space-y-2.5">
                {[
                  'Notifikasi order real-time',
                  'Segmen otomatis: VIP, Repeat, Baru, Tidak Aktif',
                  'Nomor WhatsApp pelanggan tersimpan',
                  'AI cross-sell & retensi',
                ].map(item => (
                  <li key={item} className="flex items-center gap-2.5 text-gray-300 text-sm">
                    <div className="w-4 h-4 rounded-full bg-green-500/20 border border-green-500/40 flex items-center justify-center flex-shrink-0">
                      <Check size={8} className="text-green-400" strokeWidth={3} />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/dashboard/tokorizky"
                className="mt-7 inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
                Buka dashboard demo <ArrowRight size={14} />
              </Link>
            </div>
            <LiveDashboard />
          </div>
        </div>
      </section>

      {/* ── Section 4: AI Recommendations ── */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <p className="text-xs font-bold text-violet-500 uppercase tracking-widest mb-3">AI Insights</p>
          <h2 className="text-3xl font-extrabold text-gray-900 mb-3">
            Data berubah jadi aksi.
          </h2>
          <p className="text-gray-500 max-w-lg mx-auto text-sm leading-relaxed">
            Di marketplace, data pelanggan bukan milikmu. Di AstraToko, setiap transaksi memperkaya database yang bisa langsung kamu gunakan.
          </p>
        </div>
        <AICards />
      </section>

      {/* ── Section 5: Savings Calculator ── */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-14 items-center">
            <div>
              <h2 className="text-3xl font-extrabold text-gray-900 mb-4">
                Repeat order lewat tokomu<br />
                <span className="text-green-600">jauh lebih menguntungkan.</span>
              </h2>
              <p className="text-gray-500 text-sm leading-relaxed mb-6">
                Kalau pelanggan yang sama beli 10x lewat marketplace, kamu bayar komisi 10 kali.
                Mulai dari order kedua di AstraToko, fee tetap 2.5%.
              </p>
              <div className="bg-white border border-gray-200 rounded-2xl p-4 flex items-start gap-3">
                <Zap size={14} className="text-amber-500 mt-0.5 flex-shrink-0" fill="currentColor" />
                <p className="text-sm text-gray-600 leading-relaxed">
                  Geser slider untuk melihat penghematan berdasarkan GMV tokomu.
                </p>
              </div>
            </div>
            <SavingsCalculator />
          </div>
        </div>
      </section>

      {/* ── Section 6: FAQ + CTA ── */}
      <section className="max-w-3xl mx-auto px-6 py-20">
        <h2 className="text-2xl font-extrabold text-gray-900 mb-8 text-center">Pertanyaan Umum</h2>
        <FAQSection />

        {/* Final CTA */}
        <div className="mt-16 text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-4">
            Mulai bangun customer database<br />milikmu sendiri.
          </h2>
          <p className="text-gray-500 mb-8 max-w-md mx-auto leading-relaxed">
            Setiap transaksi pertama adalah awal dari hubungan yang kamu miliki, bukan milik marketplace.
          </p>
          <Link href="/mulai" className="inline-flex items-center gap-2.5 bg-app-blue hover:bg-app-blue-light text-white font-bold text-base px-10 py-4 rounded-2xl transition-colors shadow-lg shadow-blue-200">
            Mulai Gratis <ArrowRight size={18} />
          </Link>
          <p className="text-sm text-gray-400 mt-4">Setup kurang dari 10 menit · Tidak perlu kartu kredit</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-white px-6 py-10">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-6 h-6 bg-app-blue rounded flex items-center justify-center">
                <span className="text-white font-bold text-[10px]">AT</span>
              </div>
              <span className="font-bold text-gray-800 text-sm">AstraToko</span>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              Powered by AstraPay · QRIS · AstraPoints
            </p>
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-1.5">
            {[
              { label: 'Demo Toko',  href: '/toko/tokorizky?demo=true' },
              { label: 'Dashboard', href: '/dashboard/tokorizky' },
              { label: 'Mulai',     href: '/mulai' },
            ].map(link => (
              <Link key={link.label} href={link.href} className="text-sm text-gray-400 hover:text-gray-700 transition-colors">{link.label}</Link>
            ))}
          </div>
        </div>
      </footer>

    </div>
  )
}
