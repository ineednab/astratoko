'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import {
  Share2, ExternalLink, Zap, CheckCircle, X,
  TrendingUp, MessageCircle, ShoppingBag, Users, ChevronRight, Gift, Award,
} from 'lucide-react'
import { formatRp, formatRpShort } from '@/lib/utils'
import { getCategoryStyle } from '@/lib/categories'
import { supabase } from '@/lib/supabase'
import { Sidebar } from '@/components/Sidebar'
import type { Seller, Order, Product } from '@/lib/types'

// ── Utilities ─────────────────────────────────────────────────────────────────

function useCountUp(target: number, duration = 900) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    if (target === 0) { setValue(0); return }
    const start = performance.now()
    const tick = (now: number) => {
      const t    = Math.min((now - start) / duration, 1)
      const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
      setValue(Math.round(ease * target))
      if (t < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [target, duration])
  return value
}

function relativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60_000)
  if (m < 1)  return 'Baru saja'
  if (m < 60) return `${m} mnt lalu`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h} jam lalu`
  return `${Math.floor(h / 24)} hr lalu`
}

function Toast({ message }: { message: string }) {
  return (
    <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-2 bg-gray-900 text-white text-sm font-medium px-4 py-2.5 rounded-full shadow-xl animate-fadein">
      <CheckCircle size={14} className="text-green-400 flex-shrink-0" />
      {message}
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="flex h-screen bg-[#F4F6F8] overflow-hidden">
      <div className="w-64 bg-white border-r border-gray-100 flex-shrink-0 animate-pulse" />
      <div className="flex-1 p-8 space-y-5">
        <div className="h-10 bg-gray-100 rounded-xl w-64 animate-pulse" />
        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-28 bg-white rounded-2xl animate-pulse" />)}
        </div>
        <div className="grid grid-cols-2 gap-5">
          <div className="h-80 bg-white rounded-2xl animate-pulse" />
          <div className="h-80 bg-white rounded-2xl animate-pulse" />
        </div>
      </div>
    </div>
  )
}

// Demo controls — only shown when NEXT_PUBLIC_DEMO_MODE=true
const DEMO_STAGES = [
  { scenario: 'a' as const, emoji: '🌱', label: 'Fresh Start',      sub: '0 pesanan',  color: 'bg-gray-700 hover:bg-gray-600' },
  { scenario: 'b' as const, emoji: '📦', label: 'First Orders',     sub: '3 pesanan',  color: 'bg-indigo-800 hover:bg-indigo-700' },
  { scenario: 'c' as const, emoji: '📈', label: 'Growing Business', sub: '9 pesanan',  color: 'bg-violet-800 hover:bg-violet-700' },
]

function FloatingDemoControls({ onReset, resetting }: { onReset: (s: 'a' | 'b' | 'c') => void; resetting: boolean }) {
  const [open, setOpen] = useState(false)
  if (process.env.NEXT_PUBLIC_DEMO_MODE !== 'true') return null
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-2">
      {open && (
        <div className="bg-gray-950 border border-white/10 rounded-2xl p-3 shadow-2xl animate-fadein w-52">
          <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-2.5 px-1">🎮 Demo Controls</p>
          <div className="space-y-1.5">
            {DEMO_STAGES.map((s, i) => (
              <button key={i} onClick={() => { onReset(s.scenario); setOpen(false) }} disabled={resetting}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left transition-colors disabled:opacity-50 ${s.color}`}
              >
                <span className="text-base leading-none flex-shrink-0">{s.emoji}</span>
                <div>
                  <p className="text-white text-xs font-bold leading-none">{s.label}</p>
                  <p className="text-gray-400 text-[10px] mt-0.5">{s.sub}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
      <button onClick={() => setOpen(v => !v)}
        className={`w-11 h-11 rounded-full shadow-xl flex items-center justify-center text-lg transition-all ${open ? 'bg-gray-900 rotate-45' : 'bg-gray-900 hover:bg-gray-800'}`}
      >
        {open ? '✕' : '🎮'}
      </button>
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [seller,        setSeller]        = useState<Seller | null>(null)
  const [products,      setProducts]      = useState<Product[]>([])
  const [orders,        setOrders]        = useState<Order[]>([])
  const [loading,       setLoading]       = useState(true)
  const [toast,         setToast]         = useState('')
  const [hasShared,     setHasShared]     = useState(false)
  const [hasOpenedStore,setHasOpenedStore]= useState(false)
  const [hero5Order,    setHero5Order]    = useState<Order | null>(null)
  const [demoResetting, setDemoResetting] = useState(false)

  const hasFirstOrderRef = useRef(false)

  const showToast = useCallback((msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(''), 2500)
  }, [])

  useEffect(() => {
    const slug = (typeof localStorage !== 'undefined' && localStorage.getItem('seller_slug')) || 'toko-rizky'
    Promise.all([
      fetch(`/api/sellers/${slug}`).then(r => r.json()),
      fetch(`/api/orders?slug=${slug}`).then(r => r.json()),
    ]).then(([sellerJson, ordersJson]) => {
      if (sellerJson.seller)   setSeller(sellerJson.seller)
      if (sellerJson.products) setProducts(sellerJson.products)
      const loaded: Order[] = ordersJson.orders ?? []
      if (loaded.length > 0) hasFirstOrderRef.current = true
      setOrders(loaded)
    }).finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (typeof localStorage === 'undefined') return
    setHasShared(localStorage.getItem('has_shared_store') === 'true')
    setHasOpenedStore(localStorage.getItem('has_opened_store') === 'true')
  }, [])

  // Supabase Realtime
  const currentSellerId = seller?.id
  useEffect(() => {
    if (!currentSellerId) return
    const channel = supabase.channel(`overview:${currentSellerId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders', filter: `seller_id=eq.${currentSellerId}` },
        (payload) => {
          const newOrder = payload.new as Order
          if (!hasFirstOrderRef.current) { hasFirstOrderRef.current = true; setHero5Order(newOrder) }
          setOrders(prev => [newOrder, ...prev])
        }
      ).subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [currentSellerId])

  useEffect(() => {
    if (!hero5Order) return
    const t = setTimeout(() => setHero5Order(null), 6000)
    return () => clearTimeout(t)
  }, [hero5Order])

  // ── Derived metrics (before early returns so hooks stay unconditional) ────
  const startOfMonth   = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  const paidOrders     = orders.filter(o => o.status === 'paid')
  const paidThisMonth  = paidOrders.filter(o => new Date(o.created_at) >= startOfMonth)
  const gmv            = paidThisMonth.reduce((s, o) => s + o.price, 0)
  const savings        = seller ? Math.round(gmv * (seller.platform_fee_pct - seller.astratoko_fee_pct)) : 0
  const aov            = paidThisMonth.length > 0 ? Math.round(gmv / paidThisMonth.length) : 0
  const astraPoints    = paidThisMonth.length * 50

  const phoneMap = new Map<string, number>()
  paidThisMonth.forEach(o => phoneMap.set(o.buyer_phone, (phoneMap.get(o.buyer_phone) ?? 0) + 1))
  const uniqueBuyers = phoneMap.size
  const repeatBuyers = Array.from(phoneMap.values()).filter(n => n > 1).length
  const repeatPct    = uniqueBuyers > 0 ? Math.round((repeatBuyers / uniqueBuyers) * 100) : 0

  const healthScore = Math.min(100,
    (paidThisMonth.length > 0 ? 20 : 0) + (savings > 0 ? 25 : 0) +
    (uniqueBuyers > 0 ? 20 : 0) + (repeatPct > 0 ? 15 : 0) + (products.length > 0 ? 20 : 0)
  )

  const animGmv    = useCountUp(gmv,     1200)
  const animSavings= useCountUp(savings, 1400)

  // ── Callbacks ─────────────────────────────────────────────────────────────
  const handleShare = useCallback(() => {
    if (!seller) return
    const url = `${window.location.origin}/toko/${seller.slug}`
    const msg = encodeURIComponent(`Halo! Sekarang kamu bisa belanja langsung di ${seller.name} lewat AstraToko — bayar pakai AstraPay. Cek di sini: ${url}`)
    window.open(`https://wa.me/?text=${msg}`, '_blank')
    setHasShared(true)
    if (typeof localStorage !== 'undefined') localStorage.setItem('has_shared_store', 'true')
    showToast('🎉 Tokomu sudah dibagikan!')
  }, [seller, showToast])

  const handleOpenStore = useCallback(() => {
    if (!seller) return
    window.open(`/toko/${seller.slug}`, '_blank')
    setHasOpenedStore(true)
    if (typeof localStorage !== 'undefined') localStorage.setItem('has_opened_store', 'true')
  }, [seller])

  const handleDemoReset = useCallback(async (scenario: 'a' | 'b' | 'c') => {
    setDemoResetting(true)
    try {
      await fetch('/api/demo/reset', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ scenario }) })
      const slug = (typeof localStorage !== 'undefined' && localStorage.getItem('seller_slug')) || 'toko-rizky'
      const ordersJson = await fetch(`/api/orders?slug=${slug}`).then(r => r.json())
      const loaded: Order[] = ordersJson.orders ?? []
      hasFirstOrderRef.current = loaded.length > 0
      setOrders(loaded)
      setHero5Order(null)
      showToast(scenario === 'a' ? 'Data direset ✓' : scenario === 'b' ? '3 pesanan dimuat ✓' : '9 pesanan dimuat ✓')
    } finally { setDemoResetting(false) }
  }, [showToast])

  // ── Early returns ─────────────────────────────────────────────────────────
  if (loading) return <DashboardSkeleton />
  if (!seller) {
    return (
      <div className="min-h-screen bg-[#F4F6F8] flex items-center justify-center">
        <div className="text-center max-w-sm">
          <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto mb-5 shadow-sm border border-gray-100">
            <span className="text-4xl">🏪</span>
          </div>
          <h2 className="font-extrabold text-gray-900 text-xl mb-2">Toko belum ditemukan</h2>
          <p className="text-gray-500 text-sm mb-8 leading-relaxed">Buat toko baru gratis — siap dalam kurang dari 10 menit.</p>
          <Link href="/mulai" className="bg-app-blue text-white font-bold py-4 px-8 rounded-2xl inline-flex items-center gap-2 hover:bg-app-blue-light transition-colors">
            Buat Toko Sekarang →
          </Link>
        </div>
      </div>
    )
  }

  // ── More derivations ──────────────────────────────────────────────────────

  // Top customers (for snapshot)
  const custMap = new Map<string, { name: string; phone: string; orderCount: number; totalSpend: number; lastOrderTime: string; points: number; initial: string }>()
  orders.forEach(o => {
    const c = custMap.get(o.buyer_phone)
    if (c) {
      c.orderCount++; c.totalSpend += o.price
      if (new Date(o.created_at) > new Date(c.lastOrderTime)) c.lastOrderTime = o.created_at
      c.points = c.orderCount * 50
    } else {
      const name = o.buyer_name || 'Pembeli'
      custMap.set(o.buyer_phone, { name, phone: o.buyer_phone, orderCount: 1, totalSpend: o.price, lastOrderTime: o.created_at, points: 50, initial: name.charAt(0).toUpperCase() })
    }
  })
  const topCustomers = Array.from(custMap.values()).sort((a, b) => b.totalSpend - a.totalSpend).slice(0, 5)

  // Merchant Journey milestones
  interface Milestone { label: string; done: boolean; icon: string; current?: number; target?: number }
  const milestones: Milestone[] = [
    { label: 'Toko dibuat',              done: true,                        icon: '🏪' },
    { label: 'QRIS AstraPay aktif',      done: true,                        icon: '⚡' },
    { label: 'Produk diimpor',           done: products.length > 0,         icon: '📦' },
    { label: 'Pelanggan pertama',        done: paidOrders.length > 0,       icon: '🎯' },
    { label: '5 penjualan langsung',     done: paidThisMonth.length >= 5,   icon: '📈', current: paidThisMonth.length, target: 5 },
    { label: 'Repeat customer pertama', done: repeatBuyers > 0,            icon: '🔁' },
    { label: 'Rp 1 juta GMV',           done: gmv >= 1_000_000,            icon: '💰', current: gmv, target: 1_000_000 },
  ]
  const doneMilestones = milestones.filter(m => m.done).length
  const journeyPct     = Math.round((doneMilestones / milestones.length) * 100)

  // Setup items
  const setupItems = [
    { label: products.length > 0 ? `${products.length} produk diimpor` : 'Import produk', done: products.length > 0, href: '/products' },
    { label: 'Bagikan toko ke pelanggan', done: hasShared, onClick: handleShare },
    { label: 'Buka toko sebagai pembeli', done: hasOpenedStore, onClick: handleOpenStore },
  ]
  const setupDoneCount = setupItems.filter(s => s.done).length
  const setupPct       = Math.round((setupDoneCount / setupItems.length) * 100)
  const setupComplete  = setupDoneCount === setupItems.length

  // Context-aware insights
  const insights: { icon: string; title: string; desc: string }[] = []
  if (orders.length === 0 && products.length > 0) {
    insights.push({ icon: '🚀', title: 'Tokomu sudah siap — bagikan ke pelanggan!', desc: `${products.length} produk sudah tersedia. Merchant yang bagikan link di hari pertama biasanya dapat order dalam 24 jam.` })
  }
  if (orders.length === 0 && products.length === 0) {
    insights.push({ icon: '📦', title: 'Mulai dengan impor produk', desc: 'Import langsung dari Shopee, Tokopedia, atau TikTok Shop dengan file CSV. Gratis dan cepat.' })
  }
  if (repeatPct > 0) {
    insights.push({ icon: '🔁', title: `${repeatPct}% pelanggan sudah balik lagi`, desc: 'Repeat rate di atas rata-rata UMKM. Pertahankan dengan promo personal via WhatsApp.' })
  }
  if (savings > 0) {
    insights.push({ icon: '💰', title: `Hemat ${formatRpShort(savings)} dari biaya marketplace`, desc: `Fee ${Math.round(seller.platform_fee_pct * 100)}% ${seller.platform} dihindari bulan ini. Selisihnya langsung masuk kantong.` })
  }
  if (topCustomers.length > 0 && topCustomers[0].orderCount === 1) {
    insights.push({ icon: '📲', title: 'Belum ada repeat customer — kirim promo sekarang', desc: 'Hubungi pelanggan yang pernah beli dan ajak belanja lagi. Konversi pelanggan lama jauh lebih mudah dari pelanggan baru.' })
  }
  const AVATAR_COLORS = ['#3B5BDB','#2F9E44','#F08C00','#E03131','#7048E8']

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      <div className="hidden lg:flex h-screen bg-[#F4F6F8] overflow-hidden">
        {toast && <Toast message={toast} />}

        <Sidebar
          seller={seller}
          counts={{ products: products.length, orders: orders.length, customers: custMap.size }}
        />

        <main className="flex-1 overflow-y-auto">
          {/* Top bar */}
          <header className="sticky top-0 z-10 bg-white/90 backdrop-blur-md border-b border-gray-100 px-8 py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400 font-medium">Overview</p>
                <p className="text-base font-extrabold text-gray-900 leading-tight">
                  Selamat datang, {seller.name.split(' ')[0]} 👋
                </p>
              </div>
              <div className="flex items-center gap-3">
                {hero5Order && (
                  <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-3 py-2 animate-fadein">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-xs font-semibold text-green-800">Pesanan baru masuk!</span>
                    <button onClick={() => setHero5Order(null)} className="text-green-500 hover:text-green-700 ml-1">
                      <X size={12} />
                    </button>
                  </div>
                )}
                <button onClick={handleShare}
                  className="flex items-center gap-2 bg-[#25D366] hover:bg-[#1db954] text-white font-semibold px-4 py-2 rounded-xl text-sm transition-colors"
                >
                  <Share2 size={14} /> Bagikan Toko
                </button>
                <button onClick={handleOpenStore}
                  className="flex items-center gap-2 bg-gray-50 hover:bg-gray-100 text-gray-700 font-semibold px-4 py-2 rounded-xl text-sm border border-gray-100 transition-colors"
                >
                  <ExternalLink size={14} /> Buka Toko
                </button>
              </div>
            </div>
          </header>

          <div className="px-8 py-6 space-y-5 pb-16">

            {/* ── SECTION 1: Merchant Journey (always first) ── */}
            <div className={`rounded-2xl border p-5 ${
              setupComplete && orders.length > 0
                ? 'bg-white border-gray-100 shadow-sm'
                : 'bg-white border-app-blue/15 shadow-sm'
            }`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 bg-purple-50 border border-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Award size={15} className="text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-extrabold text-gray-900">Merchant Journey</p>
                    <p className="text-xs text-gray-400">{doneMilestones}/{milestones.length} milestone selesai</p>
                  </div>
                </div>
                <span className="text-sm font-extrabold text-app-blue">{journeyPct}%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-4">
                <div className="h-full bg-app-blue rounded-full transition-all duration-700" style={{ width: `${journeyPct}%` }} />
              </div>
              <div className="grid grid-cols-4 gap-2">
                {milestones.slice(0, 4).map((m, i) => (
                  <div key={i} className={`flex items-center gap-2 p-2.5 rounded-xl border ${
                    m.done ? 'bg-green-50 border-green-100' : 'bg-gray-50 border-gray-100'
                  }`}>
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold ${
                      m.done ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400'
                    }`}>{m.done ? '✓' : i + 1}</div>
                    <p className={`text-xs font-medium leading-tight ${m.done ? 'text-green-800' : 'text-gray-400'}`}>
                      {m.icon} {m.label}
                    </p>
                  </div>
                ))}
              </div>
              {milestones.slice(4).some(m => !m.done) && (
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {milestones.slice(4).map((m, i) => (
                    <div key={i} className={`flex items-center gap-2 p-2.5 rounded-xl border ${
                      m.done ? 'bg-green-50 border-green-100' : 'bg-gray-50 border-gray-100'
                    }`}>
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold ${
                        m.done ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400'
                      }`}>{m.done ? '✓' : i + 5}</div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-medium leading-tight truncate ${m.done ? 'text-green-800' : 'text-gray-400'}`}>
                          {m.icon} {m.label}
                        </p>
                        {m.current !== undefined && m.target !== undefined && !m.done && (
                          <div className="mt-1 h-1 bg-gray-200 rounded-full overflow-hidden">
                            <div className="h-full bg-app-blue/40 rounded-full" style={{ width: `${Math.min(100, Math.round((m.current / m.target) * 100))}%` }} />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ── SECTION 2: KPI Cards (progressive disclosure) ── */}
            {orders.length === 0 ? (
              /* Zero-state KPIs — minimal, no fake zeroes */
              <div className="grid grid-cols-3 gap-4">
                {[
                  { icon: '📦', label: 'Produk Tersedia', value: products.length > 0 ? String(products.length) : '0', sub: products.length > 0 ? 'siap dijual' : 'belum ada produk', href: '/products' },
                  { icon: '🛡️', label: 'Potensi Penghematan', value: `${Math.round(seller.platform_fee_pct * 100) - Math.round(seller.astratoko_fee_pct * 100)}%`, sub: `vs biaya ${seller.platform}` },
                  { icon: '⚡', label: 'QRIS AstraPay', value: 'Aktif', sub: '0% downtime', green: true },
                ].map((card) => (
                  <div key={card.label} className={`bg-white rounded-2xl border border-gray-100 p-5 shadow-sm ${'href' in card ? 'hover:shadow-md cursor-pointer transition-shadow' : ''}`}
                    onClick={'href' in card && card.href ? () => window.location.href = card.href : undefined}
                  >
                    <span className="text-xl leading-none mb-3 block">{card.icon}</span>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">{card.label}</p>
                    <p className={`text-2xl font-extrabold leading-none ${'green' in card && card.green ? 'text-green-600' : 'text-gray-900'}`}>{card.value}</p>
                    <p className="text-xs text-gray-400 mt-1.5">{card.sub}</p>
                  </div>
                ))}
              </div>
            ) : (
              /* Growth KPIs */
              <div className="grid grid-cols-4 gap-4">
                {[
                  { icon: '💰', label: 'GMV Bulan Ini',         value: formatRpShort(animGmv),                     sub: `${paidThisMonth.length} transaksi`,         highlight: true },
                  { icon: '🛡️', label: 'Marketplace Cost Saved', value: savings > 0 ? formatRpShort(animSavings) : 'Rp 0', sub: `vs biaya ${seller.platform}` },
                  { icon: '👥', label: 'Pelanggan Langsung',    value: String(uniqueBuyers),                        sub: `${repeatBuyers} repeat buyer` },
                  { icon: '💚', label: 'Business Health',        value: `${healthScore}`,                           sub: healthScore >= 60 ? 'Good' : 'Needs attention' },
                ].map(card => (
                  <div key={card.label} className={`bg-white rounded-2xl border p-5 shadow-sm hover:shadow-md transition-shadow ${card.highlight ? 'border-app-blue/20' : 'border-gray-100'}`}>
                    <span className="text-xl leading-none mb-3 block">{card.icon}</span>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">{card.label}</p>
                    <p className={`text-2xl font-extrabold leading-none ${card.highlight ? 'text-app-blue' : 'text-gray-900'}`}>{card.value}</p>
                    <p className="text-xs text-gray-400 mt-1.5">{card.sub}</p>
                  </div>
                ))}
              </div>
            )}

            {/* ── SECTION 3: Setup Guide (when no orders yet) ── */}
            {orders.length === 0 && !setupComplete && (
              <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-extrabold text-gray-900 text-sm">Setup Toko</h3>
                  <span className="text-sm font-bold text-app-blue">{setupPct}%</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mb-4">
                  <div className="h-full bg-app-blue rounded-full transition-all duration-700" style={{ width: `${setupPct}%` }} />
                </div>
                <div className="space-y-2">
                  {setupItems.map((item, i) => {
                    const content = (
                      <div className={`flex items-center gap-3 p-3.5 rounded-xl border text-left w-full transition-colors ${
                        item.done ? 'border-green-100 bg-green-50' : 'border-gray-100 hover:border-app-blue/20 hover:bg-blue-50/20'
                      }`}>
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${item.done ? 'bg-green-500' : 'border-2 border-gray-200'}`}>
                          {item.done && <CheckCircle size={12} className="text-white fill-white" />}
                        </div>
                        <p className={`text-sm font-semibold flex-1 ${item.done ? 'text-green-800 line-through decoration-green-300' : 'text-gray-800'}`}>
                          {item.label}
                        </p>
                        {!item.done && <ChevronRight size={13} className="text-gray-300 flex-shrink-0" />}
                      </div>
                    )
                    if ('href' in item && item.href) return <Link key={i} href={item.href}>{content}</Link>
                    return <button key={i} onClick={item.done ? undefined : item.onClick}>{content}</button>
                  })}
                </div>
              </div>
            )}

            {/* ── SECTION 4: Orders + Customers 2-col ── */}
            <div className="grid grid-cols-[3fr_2fr] gap-5">
              {/* Recent Orders */}
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                <div className="px-5 pt-5 pb-3 flex items-center justify-between border-b border-gray-50">
                  <div>
                    <h2 className="text-sm font-extrabold text-gray-900">Pesanan Terbaru</h2>
                    {orders.length > 0 && <p className="text-xs text-gray-400 mt-0.5">Realtime · Supabase</p>}
                  </div>
                  {orders.length > 0 && (
                    <Link href="/orders" className="text-xs font-semibold text-app-blue hover:text-app-blue-light flex items-center gap-1 transition-colors">
                      Lihat semua <ChevronRight size={12} />
                    </Link>
                  )}
                </div>

                {orders.length === 0 ? (
                  <div className="px-5 py-10 flex flex-col items-center text-center">
                    <ShoppingBag size={20} className="text-gray-200 mb-3" />
                    <p className="text-sm font-semibold text-gray-800 mb-1">Belum ada pesanan</p>
                    <p className="text-xs text-gray-400 mb-4">Pesanan muncul otomatis saat ada transaksi.</p>
                    <button onClick={handleShare}
                      className="flex items-center gap-1.5 text-xs font-semibold text-[#25D366] hover:text-[#1db954] transition-colors"
                    >
                      <Share2 size={12} /> Bagikan toko sekarang
                    </button>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-50">
                    {orders.slice(0, 6).map(order => {
                      const { color, Icon } = getCategoryStyle(order.category)
                      return (
                        <div key={order.id} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50/50 transition-colors">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: color }}>
                            <Icon size={13} className="text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">{order.product_name}</p>
                            <p className="text-xs text-gray-400 truncate">{order.buyer_name || 'Pembeli'} · {relativeTime(order.created_at)}</p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="text-sm font-bold text-gray-900">{formatRp(order.price)}</p>
                            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md ${
                              order.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-app-blue'
                            }`}>{order.status === 'paid' ? 'Lunas' : 'Pending'}</span>
                          </div>
                        </div>
                      )
                    })}
                    <div className="px-5 py-3 border-t border-gray-50">
                      <Link href="/orders" className="flex items-center justify-center gap-1 text-xs font-semibold text-gray-400 hover:text-app-blue transition-colors">
                        Semua {orders.length} pesanan <ChevronRight size={11} />
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* Top Customers snapshot */}
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                <div className="px-5 pt-5 pb-3 flex items-center justify-between border-b border-gray-50">
                  <div>
                    <h2 className="text-sm font-extrabold text-gray-900">Pelanggan</h2>
                    {custMap.size > 0 && <p className="text-xs text-gray-400 mt-0.5">{custMap.size} kontak tersimpan</p>}
                  </div>
                  {custMap.size > 0 && (
                    <Link href="/customers" className="text-xs font-semibold text-app-blue hover:text-app-blue-light flex items-center gap-1 transition-colors">
                      Kelola <ChevronRight size={12} />
                    </Link>
                  )}
                </div>

                {custMap.size === 0 ? (
                  <div className="px-5 py-10 flex flex-col items-center text-center">
                    <Users size={20} className="text-gray-200 mb-3" />
                    <p className="text-sm font-semibold text-gray-800 mb-1">Belum ada pelanggan</p>
                    <p className="text-xs text-gray-400">Kontak tersimpan otomatis saat ada pembelian.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-50">
                    {topCustomers.map((c, i) => {
                      const waPhone = c.phone.startsWith('0') ? '62' + c.phone.slice(1) : c.phone
                      const isRepeat = c.orderCount >= 2
                      return (
                        <div key={c.phone} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50/50 transition-colors group">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-white font-extrabold text-xs"
                            style={{ backgroundColor: AVATAR_COLORS[i % AVATAR_COLORS.length] }}>
                            {c.initial}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <p className="text-sm font-semibold text-gray-900 truncate">{c.name}</p>
                              {isRepeat && <span className="text-[9px] font-bold bg-amber-100 text-amber-700 px-1 py-0.5 rounded flex-shrink-0">🔁</span>}
                            </div>
                            <p className="text-xs text-gray-400">{c.orderCount}× · ⚡ {c.points} pts</p>
                          </div>
                          <a href={`https://wa.me/${waPhone}`} target="_blank" rel="noopener noreferrer"
                            className="w-7 h-7 bg-[#25D366] hover:bg-[#1db954] rounded-lg flex items-center justify-center flex-shrink-0 opacity-0 group-hover:opacity-100 transition-all"
                          >
                            <MessageCircle size={12} className="text-white" />
                          </a>
                        </div>
                      )
                    })}
                    <div className="px-5 py-3 border-t border-gray-50">
                      <Link href="/customers" className="flex items-center justify-center gap-1 text-xs font-semibold text-gray-400 hover:text-app-blue transition-colors">
                        Lihat semua pelanggan <ChevronRight size={11} />
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ── SECTION 5: AstraPay + AstraPoints (compact) ── */}
            {orders.length > 0 && (
              <div className="grid grid-cols-2 gap-5">
                <div className="bg-white rounded-2xl border border-gray-100 px-5 py-4 shadow-sm flex items-center gap-4">
                  <div className="w-10 h-10 bg-astrapay-gold/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Zap size={18} className="text-astrapay-gold" fill="currentColor" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-400 font-medium">AstraPay Volume Bulan Ini</p>
                    <p className="text-xl font-extrabold text-gray-900 leading-tight">{gmv > 0 ? formatRp(gmv) : 'Rp 0'}</p>
                    <p className="text-xs text-gray-400">{paidThisMonth.length} transaksi QRIS · avg {aov > 0 ? formatRpShort(aov) : '—'}</p>
                  </div>
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 px-5 py-4 shadow-sm flex items-center gap-4">
                  <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center flex-shrink-0 border border-amber-100">
                    <Gift size={18} className="text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-400 font-medium">AstraPoints Terdistribusi</p>
                    <p className="text-xl font-extrabold text-gray-900 leading-tight">+{astraPoints} pts</p>
                    <p className="text-xs text-gray-400">{custMap.size} pelanggan · 50 pts per transaksi</p>
                  </div>
                </div>
              </div>
            )}

            {/* ── SECTION 6: Insights ── */}
            {insights.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-7 h-7 bg-app-blue/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <TrendingUp size={14} className="text-app-blue" />
                  </div>
                  <h3 className="text-sm font-extrabold text-gray-900">Growth Insights</h3>
                </div>
                <div className="space-y-3">
                  {insights.slice(0, 2).map((insight, i) => (
                    <div key={i} className="flex items-start gap-3 p-3.5 bg-gray-50 rounded-xl border border-gray-100">
                      <span className="text-lg leading-none flex-shrink-0 mt-0.5">{insight.icon}</span>
                      <div>
                        <p className="text-sm font-bold text-gray-900 leading-tight">{insight.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{insight.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </main>

        <FloatingDemoControls onReset={handleDemoReset} resetting={demoResetting} />
      </div>

      {/* Mobile */}
      <div className="lg:hidden min-h-screen bg-[#F4F6F8] flex items-center justify-center p-8">
        {toast && <Toast message={toast} />}
        <div className="text-center max-w-xs">
          <p className="text-4xl mb-4">💻</p>
          <p className="font-extrabold text-gray-900 text-lg mb-2">Dashboard untuk Desktop</p>
          <p className="text-sm text-gray-500 mb-6 leading-relaxed">
            Buka di browser desktop untuk pengalaman terbaik.
          </p>
          {seller && (
            <Link href={`/toko/${seller.slug}`}
              className="inline-flex items-center gap-2 bg-app-blue text-white font-bold px-5 py-3 rounded-xl text-sm hover:bg-app-blue-light transition-colors"
            >
              <ExternalLink size={14} /> Buka Toko Saya
            </Link>
          )}
        </div>
      </div>
    </>
  )
}
