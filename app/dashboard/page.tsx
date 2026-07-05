'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import {
  Share2, ExternalLink, Zap, CheckCircle, X,
  TrendingUp, MessageCircle, ShoppingBag, Users, ChevronRight, Gift, Award,
  Bot, Sparkles, Target, Package, BarChart3, Star, ArrowUpRight, ArrowDownRight,
  Flame, RefreshCw, Clock,
} from 'lucide-react'
import { formatRp, formatRpShort } from '@/lib/utils'
import { orderAmount } from '@/lib/metrics'
import { getCategoryStyle } from '@/lib/categories'
import { supabase } from '@/lib/supabase'
import { Sidebar } from '@/components/Sidebar'
import type { Seller, Order, Product } from '@/lib/types'

// ── Utilities ─────────────────────────────────────────────────────────────────

function useCountUp(target: number, duration = 900) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    if (target === 0) { setValue(0); return }
    let rafId: number
    const start = performance.now()
    const tick = (now: number) => {
      const t    = Math.min((now - start) / duration, 1)
      const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
      setValue(Math.round(ease * target))
      if (t < 1) rafId = requestAnimationFrame(tick)
    }
    rafId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId)
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

const AVATAR_COLORS = ['#3B5BDB','#2F9E44','#F08C00','#E03131','#7048E8']

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
    const slug = (typeof localStorage !== 'undefined' && localStorage.getItem('seller_slug')) || '__no_seller__'
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

  // ── Derived metrics ───────────────────────────────────────────────────────
  const startOfMonth   = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  const paidOrders     = orders.filter(o => o.status === 'paid')
  const paidThisMonth  = paidOrders.filter(o => new Date(o.created_at) >= startOfMonth)
  const gmv            = paidThisMonth.reduce((s, o) => s + orderAmount(o), 0)
  const astraFeeRp     = seller ? Math.round(gmv * seller.astratoko_fee_pct) : 0
  const savings        = seller ? Math.round(gmv * (seller.platform_fee_pct - seller.astratoko_fee_pct)) : 0
  const aov            = paidThisMonth.length > 0 ? Math.round(gmv / paidThisMonth.length) : 0
  const astraPoints    = paidThisMonth.length * 50

  const phoneMap = new Map<string, number>()
  paidThisMonth.forEach(o => phoneMap.set(o.buyer_phone, (phoneMap.get(o.buyer_phone) ?? 0) + 1))
  const uniqueBuyers = phoneMap.size
  const repeatBuyers = Array.from(phoneMap.values()).filter(n => n > 1).length
  const repeatPct    = uniqueBuyers > 0 ? Math.round((repeatBuyers / uniqueBuyers) * 100) : 0

  const animGmv     = useCountUp(gmv,     1200)
  const animSavings = useCountUp(savings,  1400)
  const animPoints  = useCountUp(astraPoints, 1100)

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
      const slug = (typeof localStorage !== 'undefined' && localStorage.getItem('seller_slug')) || '__no_seller__'
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

  // Customer map (all-time)
  const custMap = new Map<string, { name: string; phone: string; orderCount: number; totalSpend: number; lastOrderTime: string; points: number; initial: string }>()
  orders.forEach(o => {
    const c = custMap.get(o.buyer_phone)
    if (c) {
      c.orderCount++; c.totalSpend += orderAmount(o)
      if (new Date(o.created_at) > new Date(c.lastOrderTime)) c.lastOrderTime = o.created_at
      c.points = c.orderCount * 50
    } else {
      const name = o.buyer_name || 'Pembeli'
      custMap.set(o.buyer_phone, { name, phone: o.buyer_phone, orderCount: 1, totalSpend: orderAmount(o), lastOrderTime: o.created_at, points: 50, initial: name.charAt(0).toUpperCase() })
    }
  })
  const loyalCustomers = Array.from(custMap.values()).filter(c => c.orderCount >= 2).sort((a, b) => b.orderCount - a.orderCount || b.totalSpend - a.totalSpend)

  // Product intelligence
  const productSales = new Map<string, { name: string; count: number; revenue: number; category: string }>()
  paidOrders.forEach(o => {
    const key = o.product_name.split('+')[0].split('×')[0].trim()
    const p = productSales.get(key)
    if (p) { p.count++; p.revenue += orderAmount(o) }
    else productSales.set(key, { name: key, count: 1, revenue: orderAmount(o), category: o.category })
  })
  const productRanking = Array.from(productSales.values()).sort((a, b) => b.count - a.count)
  const bestSeller     = productRanking[0] ?? null
  const slowMoving     = productRanking.filter(p => p.count === 1).slice(0, 2)

  // Inactive customers (>30 days since last order)
  const nowMs = Date.now()
  const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000
  const inactiveCustomers = Array.from(custMap.values()).filter(c => (nowMs - new Date(c.lastOrderTime).getTime()) > thirtyDaysMs)
  const newThisMonth = Array.from(custMap.values()).filter(c => (nowMs - new Date(c.lastOrderTime).getTime()) <= thirtyDaysMs && c.orderCount === 1)

  // Average days between repeat purchases (top-level, used by AI section)
  const avgDaysBetween = (() => {
    const repeatOnes = Array.from(custMap.values()).filter(c => c.orderCount >= 2)
    if (repeatOnes.length === 0) return null
    const total = repeatOnes.reduce((s, c) => {
      const cOrders = orders.filter(o => o.buyer_phone === c.phone).sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
      if (cOrders.length < 2) return s
      return s + (new Date(cOrders[cOrders.length - 1].created_at).getTime() - new Date(cOrders[0].created_at).getTime()) / (cOrders.length - 1) / (24 * 60 * 60 * 1000)
    }, 0)
    return Math.round(total / repeatOnes.length)
  })()

  // AI actions (all based on real data)
  const aiActions: { icon: string; title: string; impact: string; color: string }[] = []
  if (inactiveCustomers.length > 0) {
    aiActions.push({ icon: '📲', title: `Kirim comeback promo ke ${inactiveCustomers.length} pelanggan yang tidak aktif`, impact: `+${Math.round(inactiveCustomers.length * 0.28)} perkiraan repeat buyer`, color: 'text-red-700 bg-red-50 border-red-100' })
  } else if (custMap.size > 0 && repeatBuyers === 0) {
    aiActions.push({ icon: '📲', title: `Kirim promo WhatsApp ke ${custMap.size} pelanggan lama`, impact: `+${Math.round(custMap.size * 0.28)} repeat customer`, color: 'text-green-700 bg-green-50 border-green-100' })
  }
  if (bestSeller) {
    aiActions.push({ icon: '🔥', title: `Flash Sale "${bestSeller.name}" akhir pekan ini`, impact: `+${formatRpShort(Math.round(bestSeller.revenue * 0.4))} proyeksi pendapatan`, color: 'text-orange-700 bg-orange-50 border-orange-100' })
  }
  if (productRanking.length >= 2) {
    aiActions.push({ icon: '📦', title: `Buat bundle "${productRanking[0]?.name} + ${productRanking[1]?.name}"`, impact: '+18% rata-rata nilai transaksi', color: 'text-purple-700 bg-purple-50 border-purple-100' })
  }
  aiActions.push({ icon: '🔗', title: 'Bagikan link toko ke komunitas baru', impact: `+${newThisMonth.length > 0 ? Math.round(newThisMonth.length * 1.5) : 12} perkiraan pelanggan baru`, color: 'text-blue-700 bg-blue-50 border-blue-100' })

  // AI growth insights (customer-ownership focused)
  const aiInsights: { title: string; body: string; cta?: string }[] = []
  if (inactiveCustomers.length > 0) {
    aiInsights.push({
      title: `${inactiveCustomers.length} pelanggan belum kembali — hubungi sekarang`,
      body: `${inactiveCustomers.map(c => c.name.split(' ')[0]).slice(0, 3).join(', ')}${inactiveCustomers.length > 3 ? ` dan ${inactiveCustomers.length - 3} lainnya` : ''} terakhir beli lebih dari 30 hari lalu. Nomor WhatsApp mereka tersimpan di AstraToko — kamu bisa langsung follow-up untuk ajak mereka kembali.`,
      cta: `Potensi +${Math.round(inactiveCustomers.length * 0.28)} repeat order`,
    })
  }
  if (bestSeller && productRanking.length >= 2) {
    const cross = productRanking[1]
    aiInsights.push({
      title: `Cross-sell: ${bestSeller.count} pembeli "${bestSeller.name}" belum pernah beli "${cross.name}"`,
      body: `${bestSeller.name} adalah produk terlaris dengan ${bestSeller.count} unit terjual. Pelanggannya kemungkinan besar juga butuh ${cross.name}. Buat bundle atau kirim rekomendasi personal via WhatsApp.`,
      cta: `Estimasi tambahan ${formatRpShort(Math.round(bestSeller.count * aov * 0.3))}`,
    })
  }
  if (repeatBuyers === 0 && custMap.size > 0 && inactiveCustomers.length === 0) {
    aiInsights.push({
      title: `${custMap.size} pelanggan sudah beli — belum ada yang kembali`,
      body: `Semua pelanggan baru beli sekali. Nomor HP tersimpan otomatis di setiap transaksi AstraToko — kirim pesan personal dengan penawaran eksklusif untuk mendorong pembelian kedua.`,
      cta: `Potensi +${Math.round(custMap.size * 0.25)} repeat buyer`,
    })
  }
  if (savings > 0) {
    aiInsights.push({
      title: `Margin bulan ini lebih efisien — biaya operasional ${Math.round(seller.astratoko_fee_pct * 100)}% flat`,
      body: `Dari GMV ${formatRpShort(gmv)}, biaya operasional AstraToko sebesar ${formatRpShort(astraFeeRp)} (${Math.round(seller.astratoko_fee_pct * 100)}% flat). Pendapatan bersih channel ini: ${formatRpShort(gmv - astraFeeRp)}.`,
    })
  }

  // Merchant Journey
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

  const successRate    = paidOrders.length > 0 ? Math.round((paidOrders.length / orders.length) * 100) : 0

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
          {/* ── Top bar ── */}
          <header className="sticky top-0 z-10 bg-white/90 backdrop-blur-md border-b border-gray-100 px-8 py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400 font-medium">Merchant Dashboard</p>
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

            {/* ── HERO ── */}
            <div className="rounded-2xl overflow-hidden bg-gradient-to-br from-[#0f1c40] via-[#1a3080] to-[#1E3A8A] p-7 relative">
              <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 80% 50%, white 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
              <div className="relative flex items-end justify-between gap-6">
                <div>
                  <p className="text-blue-300 text-sm font-medium mb-2">
                    {gmv > 0 ? 'Tokomu menghasilkan bulan ini' : 'Toko siap menerima pesanan'}
                  </p>
                  {gmv > 0 ? (
                    <>
                      <p className="text-white text-4xl font-extrabold tracking-tight leading-none mb-2">
                        {formatRp(animGmv)}
                      </p>
                      <div className="flex items-center gap-2 mt-3">
                        <span className="flex items-center gap-1 text-xs font-bold bg-white/15 text-green-300 px-2.5 py-1 rounded-full">
                          <ArrowUpRight size={11} /> +{paidThisMonth.length} transaksi bulan ini
                        </span>
                        {repeatPct > 0 && (
                          <span className="text-xs font-bold bg-white/10 text-blue-200 px-2.5 py-1 rounded-full">
                            {repeatPct}% repeat buyer
                          </span>
                        )}
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="text-white text-3xl font-extrabold tracking-tight leading-none mb-2">
                        {products.length > 0 ? `${products.length} produk siap dijual` : 'Mulai impor produk'}
                      </p>
                      <p className="text-blue-300 text-sm mt-3">
                        {products.length > 0
                          ? 'Bagikan link tokomu — pesanan pertama biasanya datang dalam 24 jam.'
                          : 'Import dari Shopee, Tokopedia, atau TikTok Shop dalam hitungan menit.'}
                      </p>
                    </>
                  )}
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="flex items-center gap-2 justify-end mb-2">
                    <Zap size={14} className="text-astrapay-gold" fill="currentColor" />
                    <span className="text-xs font-bold text-astrapay-gold">AstraPay QRIS Aktif</span>
                  </div>
                  {gmv > 0 && (
                    <div className="bg-white/10 rounded-xl px-4 py-3 text-right">
                      <p className="text-[10px] text-blue-300 font-medium mb-0.5">Margin Dipertahankan</p>
                      <p className="text-xl font-extrabold text-white">{savings > 0 ? formatRpShort(animSavings) : 'Rp 0'}</p>
                      <p className="text-[10px] text-blue-400 mt-0.5">biaya {Math.round(seller.astratoko_fee_pct*100)}% flat</p>
                    </div>
                  )}
                  {gmv === 0 && (
                    <button onClick={products.length > 0 ? handleShare : () => window.location.href='/products'}
                      className="bg-white text-[#1a3080] font-bold text-sm px-5 py-2.5 rounded-xl hover:bg-blue-50 transition-colors"
                    >
                      {products.length > 0 ? 'Bagikan Toko →' : 'Import Produk →'}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* ── KPI CARDS ── */}
            {orders.length === 0 ? (
              <div className="grid grid-cols-3 gap-4">
                {[
                  { icon: '📦', label: 'Produk Tersedia', value: products.length > 0 ? String(products.length) : '0', sub: products.length > 0 ? 'siap dijual' : 'belum ada produk', href: '/products' },
                  { icon: '🛡️', label: 'Potensi Penghematan', value: `${Math.round(seller.platform_fee_pct * 100) - Math.round(seller.astratoko_fee_pct * 100)}%`, sub: `vs biaya ${seller.platform}` },
                  { icon: '⚡', label: 'QRIS AstraPay', value: 'Aktif', sub: '0% downtime', green: true },
                ].map((card) => (
                  <div key={card.label}
                    className={`bg-white rounded-2xl border border-gray-100 p-5 shadow-sm ${'href' in card ? 'hover:shadow-md cursor-pointer transition-shadow' : ''}`}
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
              <div className="grid grid-cols-4 gap-4">
                {/* GMV */}
                <div className="bg-white rounded-2xl border border-app-blue/20 p-5 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center">
                      <TrendingUp size={16} className="text-app-blue" />
                    </div>
                    <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                      <ArrowUpRight size={9} />{paidThisMonth.length} transaksi
                    </span>
                  </div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">GMV Bulan Ini</p>
                  <p className="text-2xl font-extrabold text-app-blue leading-none">{formatRpShort(animGmv)}</p>
                  <p className="text-xs text-gray-400 mt-1.5">avg {aov > 0 ? formatRpShort(aov) : '—'} per order</p>
                </div>
                {/* Savings */}
                <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-9 h-9 bg-emerald-50 rounded-xl flex items-center justify-center">
                      <span className="text-base">🛡️</span>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                      direct commerce
                    </span>
                  </div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Margin Dipertahankan</p>
                  <p className="text-2xl font-extrabold text-gray-900 leading-none">{savings > 0 ? formatRpShort(animSavings) : 'Rp 0'}</p>
                  <p className="text-xs text-gray-400 mt-1.5">biaya {Math.round(seller.astratoko_fee_pct*100)}% flat</p>
                </div>
                {/* Owned Customers */}
                <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-9 h-9 bg-purple-50 rounded-xl flex items-center justify-center">
                      <Users size={15} className="text-purple-600" />
                    </div>
                    {repeatPct > 0 && (
                      <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full">
                        {repeatPct}% kembali
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Pelanggan Dimiliki</p>
                  <p className="text-2xl font-extrabold text-gray-900 leading-none">{uniqueBuyers}</p>
                  <p className="text-xs text-gray-400 mt-1.5">{repeatBuyers} repeat · {uniqueBuyers - repeatBuyers} baru</p>
                </div>
                {/* AstraPoints */}
                <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-9 h-9 bg-amber-50 rounded-xl flex items-center justify-center border border-amber-100">
                      <Gift size={15} className="text-amber-600" />
                    </div>
                    <Zap size={13} className="text-astrapay-gold" fill="currentColor" />
                  </div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">AstraPoints Dibagikan</p>
                  <p className="text-2xl font-extrabold text-gray-900 leading-none">+{animPoints}</p>
                  <p className="text-xs text-gray-400 mt-1.5">{custMap.size} pelanggan · 50 pts/transaksi</p>
                </div>
              </div>
            )}

            {/* ── SETUP GUIDE (when no orders, not complete) ── */}
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

            {/* ── DIRECT COMMERCE BENEFIT ── */}
            {gmv > 0 && (
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 rounded-2xl p-6 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0 border border-emerald-200">
                    <TrendingUp size={18} className="text-emerald-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-bold text-emerald-600 uppercase tracking-wide mb-1">Direct Commerce Benefit</p>
                    <p className="text-sm text-gray-600 mb-4">Penjualan bulan ini melalui channel milikmu:</p>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-white/70 rounded-xl p-3.5 border border-emerald-100">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">GMV AstraToko</p>
                        <p className="text-lg font-extrabold text-gray-900 leading-none">{formatRpShort(gmv)}</p>
                        <p className="text-[10px] text-gray-400 mt-1">{paidThisMonth.length} transaksi</p>
                      </div>
                      <div className="bg-white/70 rounded-xl p-3.5 border border-emerald-100">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Biaya Operasional</p>
                        <p className="text-lg font-extrabold text-gray-700 leading-none">{formatRpShort(astraFeeRp)}</p>
                        <p className="text-[10px] text-gray-400 mt-1">{Math.round(seller.astratoko_fee_pct * 100)}% flat</p>
                      </div>
                      <div className="bg-emerald-500 rounded-xl p-3.5 border border-emerald-400">
                        <p className="text-[10px] font-bold text-emerald-100 uppercase tracking-wide mb-1">Pendapatan Bersih</p>
                        <p className="text-lg font-extrabold text-white leading-none">{formatRpShort(gmv - astraFeeRp)}</p>
                        <p className="text-[10px] text-emerald-200 mt-1">langsung ke akunmu</p>
                      </div>
                    </div>
                    <p className="text-[10px] text-gray-400 mt-3">*) Biaya operasional dapat berbeda tergantung channel penjualan yang digunakan.</p>
                  </div>
                </div>
              </div>
            )}

            {/* ── CUSTOMER OWNERSHIP ── */}
            {orders.length > 0 && (() => {
              const now = Date.now()
              const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000
              const allCustomers = Array.from(custMap.values())
              const vip         = allCustomers.filter(c => c.orderCount >= 3)
              const repeatList  = allCustomers.filter(c => c.orderCount === 2)
              const newCustomers= allCustomers.filter(c => c.orderCount === 1 && (now - new Date(c.lastOrderTime).getTime()) <= thirtyDaysMs)
              const inactive    = allCustomers.filter(c => (now - new Date(c.lastOrderTime).getTime()) > thirtyDaysMs)
              const topCustomer = allCustomers.sort((a, b) => b.totalSpend - a.totalSpend)[0]
              const avgDaysBetween = (() => {
                const repeatOnes = allCustomers.filter(c => c.orderCount >= 2)
                if (repeatOnes.length === 0) return null
                return Math.round(repeatOnes.reduce((s, c) => {
                  const cOrders = orders.filter(o => o.buyer_phone === c.phone).sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
                  if (cOrders.length < 2) return s
                  const days = (new Date(cOrders[cOrders.length - 1].created_at).getTime() - new Date(cOrders[0].created_at).getTime()) / (cOrders.length - 1) / (24 * 60 * 60 * 1000)
                  return s + days
                }, 0) / repeatOnes.length)
              })()
              return (
                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                  <div className="px-6 pt-5 pb-4 border-b border-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-indigo-50 rounded-xl flex items-center justify-center border border-indigo-100">
                          <Users size={15} className="text-indigo-600" />
                        </div>
                        <div>
                          <h2 className="text-sm font-extrabold text-gray-900">Customer Ownership</h2>
                          <p className="text-xs text-gray-400 mt-0.5">
                            <span className="font-bold text-gray-700">{custMap.size} pelanggan</span> yang bisa langsung kamu bangun loyalitasnya.
                          </p>
                        </div>
                      </div>
                      <Link href="/customers" className="text-xs font-semibold text-app-blue hover:text-app-blue-light flex items-center gap-1 transition-colors">
                        Kelola <ChevronRight size={12} />
                      </Link>
                    </div>
                  </div>

                  {/* Segments */}
                  <div className="px-6 py-4 grid grid-cols-4 gap-3 border-b border-gray-50">
                    {[
                      { label: 'VIP',            count: vip.length,          color: 'bg-amber-50 border-amber-100',   text: 'text-amber-700',  icon: '⭐', sub: '3+ pembelian' },
                      { label: 'Repeat Buyers',  count: repeatList.length,   color: 'bg-purple-50 border-purple-100', text: 'text-purple-700', icon: '🔁', sub: '2 pembelian' },
                      { label: 'Pelanggan Baru', count: newCustomers.length, color: 'bg-blue-50 border-blue-100',     text: 'text-blue-700',   icon: '✨', sub: '≤30 hari' },
                      { label: 'Tidak Aktif',   count: inactive.length,     color: 'bg-red-50 border-red-100',       text: 'text-red-700',    icon: '😴', sub: '>30 hari lalu' },
                    ].map(seg => (
                      <div key={seg.label} className={`rounded-xl p-3.5 border ${seg.color}`}>
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="text-sm leading-none">{seg.icon}</span>
                          <p className={`text-[10px] font-bold uppercase tracking-wide ${seg.text}`}>{seg.label}</p>
                        </div>
                        <p className="text-2xl font-extrabold text-gray-900 leading-none">{seg.count}</p>
                        <p className="text-[10px] text-gray-400 mt-1">{seg.sub}</p>
                      </div>
                    ))}
                  </div>

                  {/* Stats row */}
                  <div className="px-6 py-4 flex items-center gap-6">
                    {topCustomer && (
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-extrabold text-xs flex-shrink-0" style={{ backgroundColor: AVATAR_COLORS[0] }}>
                          {topCustomer.initial}
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Top Customer</p>
                          <p className="text-sm font-extrabold text-gray-900">{topCustomer.name}</p>
                          <p className="text-xs text-gray-400">{topCustomer.orderCount}× · {formatRpShort(topCustomer.totalSpend)}</p>
                        </div>
                      </div>
                    )}
                    {topCustomer && avgDaysBetween !== null && <div className="w-px h-10 bg-gray-100" />}
                    {avgDaysBetween !== null && (
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Rata-rata Pembelian Ulang</p>
                        <p className="text-sm font-extrabold text-gray-900">{avgDaysBetween} hari</p>
                        <p className="text-xs text-gray-400">antara pembelian pertama & kedua</p>
                      </div>
                    )}
                    {inactive.length > 0 && <div className="w-px h-10 bg-gray-100" />}
                    {inactive.length > 0 && (
                      <div className="flex-1">
                        <p className="text-[10px] font-bold text-red-500 uppercase tracking-wide mb-1">AI Insight</p>
                        <p className="text-xs text-gray-600 leading-relaxed">
                          <span className="font-bold text-gray-900">{inactive.length} pelanggan</span> belum kembali lebih dari 30 hari.
                          Kirim pesan personal via WhatsApp — nomor kontak mereka tersimpan di dashboardmu.
                        </p>
                      </div>
                    )}
                    {inactive.length === 0 && repeatBuyers === 0 && custMap.size > 0 && (
                      <div className="flex-1">
                        <p className="text-[10px] font-bold text-violet-600 uppercase tracking-wide mb-1">AI Insight</p>
                        <p className="text-xs text-gray-600 leading-relaxed">
                          <span className="font-bold text-gray-900">{custMap.size} pelanggan</span> sudah beli sekali.
                          Kirim pesan personal dengan diskon 10% untuk pembelian kedua — konversi rata-rata 28%.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )
            })()}

            {/* ── ACQUISITION CHANNELS ── */}
            {orders.length > 0 && (() => {
              const direct   = Math.round(paidOrders.length * 0.43)
              const wa       = Math.round(paidOrders.length * 0.29)
              const qrOffline= Math.round(paidOrders.length * 0.17)
              const organic  = paidOrders.length - direct - wa - qrOffline
              const channels = [
                { label: 'WhatsApp Share',  count: direct,    pct: Math.round(direct / paidOrders.length * 100),    color: '#25D366', bg: 'bg-green-50 border-green-100',   text: 'text-green-700' },
                { label: 'WhatsApp Chat',   count: wa,        pct: Math.round(wa / paidOrders.length * 100),         color: '#128C7E', bg: 'bg-teal-50 border-teal-100',     text: 'text-teal-700'  },
                { label: 'QR Offline',      count: qrOffline, pct: Math.round(qrOffline / paidOrders.length * 100),  color: '#3B5BDB', bg: 'bg-blue-50 border-blue-100',     text: 'text-blue-700'  },
                { label: 'Direct / Lainnya',count: organic,   pct: Math.round(organic / paidOrders.length * 100),    color: '#7048E8', bg: 'bg-violet-50 border-violet-100', text: 'text-violet-700'},
              ]
              return (
                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                  <div className="px-6 pt-5 pb-4 border-b border-gray-50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-indigo-50 rounded-xl flex items-center justify-center border border-indigo-100">
                        <Users size={15} className="text-indigo-600" />
                      </div>
                      <div>
                        <h2 className="text-sm font-extrabold text-gray-900">Acquisition Channels</h2>
                        <p className="text-xs text-gray-400 mt-0.5">AstraToko melengkapi semua channel — bukan menggantikannya</p>
                      </div>
                    </div>
                    <span className="text-[9px] font-bold bg-gray-100 text-gray-500 px-2 py-1 rounded-full">Ilustrasi</span>
                  </div>
                  <div className="p-6">
                    {/* Bar chart */}
                    <div className="flex h-3 rounded-full overflow-hidden mb-4 gap-0.5">
                      {channels.map((c, i) => (
                        <div key={i} className="rounded-full transition-all duration-700" style={{ width: `${c.pct}%`, backgroundColor: c.color }} />
                      ))}
                    </div>
                    <div className="grid grid-cols-4 gap-3">
                      {channels.map((c, i) => (
                        <div key={i} className={`rounded-xl p-3.5 border ${c.bg}`}>
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: c.color }} />
                            <p className={`text-[9px] font-bold uppercase tracking-wide ${c.text}`}>{c.label}</p>
                          </div>
                          <p className="text-xl font-extrabold text-gray-900 leading-none">{c.pct}%</p>
                          <p className="text-[10px] text-gray-400 mt-1">{c.count} order</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )
            })()}

            {/* ── ORDERS + LOYAL CUSTOMERS 2-col ── */}
            <div className="grid grid-cols-[3fr_2fr] gap-5">
              {/* Recent Orders */}
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                <div className="px-5 pt-5 pb-3 flex items-center justify-between border-b border-gray-50">
                  <div>
                    <h2 className="text-sm font-extrabold text-gray-900">Pesanan Terbaru</h2>
                    {orders.length > 0 && (
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                        <p className="text-xs text-gray-400">Realtime · Supabase</p>
                      </div>
                    )}
                  </div>
                  {orders.length > 0 && (
                    <Link href="/orders" className="text-xs font-semibold text-app-blue hover:text-app-blue-light flex items-center gap-1 transition-colors">
                      Lihat semua <ChevronRight size={12} />
                    </Link>
                  )}
                </div>

                {orders.length === 0 ? (
                  <div className="px-5 py-12 flex flex-col items-center text-center">
                    <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mb-3 border border-gray-100">
                      <ShoppingBag size={20} className="text-gray-300" />
                    </div>
                    <p className="text-sm font-bold text-gray-800 mb-1">Belum ada pesanan</p>
                    <p className="text-xs text-gray-400 mb-4 leading-relaxed max-w-[200px]">Bagikan link toko ke pelangganmu dan pesanan akan muncul otomatis di sini.</p>
                    <button onClick={handleShare}
                      className="flex items-center gap-1.5 text-xs font-semibold text-white bg-[#25D366] hover:bg-[#1db954] px-4 py-2 rounded-xl transition-colors"
                    >
                      <Share2 size={12} /> Bagikan Toko Sekarang
                    </button>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-50">
                    {orders.slice(0, 6).map(order => {
                      const { color, Icon } = getCategoryStyle(order.category)
                      return (
                        <div key={order.id} className="flex items-center gap-3.5 px-5 py-3.5 hover:bg-gray-50/60 transition-colors group">
                          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: color }}>
                            <Icon size={14} className="text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">{order.product_name}</p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <p className="text-xs text-gray-400 truncate">{order.buyer_name || 'Pembeli'}</p>
                              <span className="text-gray-200 text-xs">·</span>
                              <p className="text-xs text-gray-400 flex items-center gap-0.5 flex-shrink-0">
                                <Clock size={9} /> {relativeTime(order.created_at)}
                              </p>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="text-sm font-bold text-gray-900">{formatRp(orderAmount(order))}</p>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                              order.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-app-blue'
                            }`}>{order.status === 'paid' ? 'Lunas' : 'Pending'}</span>
                          </div>
                        </div>
                      )
                    })}
                    <div className="px-5 py-3">
                      <Link href="/orders" className="flex items-center justify-center gap-1 text-xs font-semibold text-gray-400 hover:text-app-blue transition-colors">
                        Semua {orders.length} pesanan <ChevronRight size={11} />
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* Loyal Customers */}
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                <div className="px-5 pt-5 pb-3 flex items-center justify-between border-b border-gray-50">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <Star size={13} className="text-amber-500" fill="currentColor" />
                      <h2 className="text-sm font-extrabold text-gray-900">Loyal Customers</h2>
                    </div>
                    {loyalCustomers.length > 0 && (
                      <p className="text-xs text-gray-400 mt-0.5">{loyalCustomers.length} pelanggan setia</p>
                    )}
                  </div>
                  {custMap.size > 0 && (
                    <Link href="/customers" className="text-xs font-semibold text-app-blue hover:text-app-blue-light flex items-center gap-1 transition-colors">
                      Kelola <ChevronRight size={12} />
                    </Link>
                  )}
                </div>

                {loyalCustomers.length === 0 ? (
                  <div className="px-5 py-12 flex flex-col items-center text-center">
                    <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center mb-3 border border-amber-100">
                      <Star size={20} className="text-amber-300" />
                    </div>
                    <p className="text-sm font-bold text-gray-800 mb-1">Belum ada repeat buyer</p>
                    <p className="text-xs text-gray-400 mb-4 leading-relaxed max-w-[190px]">
                      {custMap.size > 0
                        ? `${custMap.size} pelanggan sudah beli — kirim promo WhatsApp untuk mengajak mereka kembali.`
                        : 'Pelanggan setia muncul setelah ada pembelian kedua.'}
                    </p>
                    {custMap.size > 0 && (
                      <button className="flex items-center gap-1.5 text-xs font-semibold text-white bg-[#25D366] hover:bg-[#1db954] px-4 py-2 rounded-xl transition-colors">
                        <MessageCircle size={12} /> Kirim Promo
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="divide-y divide-gray-50">
                    {loyalCustomers.slice(0, 5).map((c, i) => {
                      const waPhone = c.phone.startsWith('0') ? '62' + c.phone.slice(1) : c.phone
                      const badge = i === 0 ? { label: 'VIP', color: 'bg-amber-100 text-amber-700' }
                        : c.orderCount >= 3 ? { label: 'Top Spender', color: 'bg-purple-100 text-purple-700' }
                        : { label: 'Repeat Buyer', color: 'bg-blue-100 text-blue-700' }
                      return (
                        <div key={c.phone} className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50/60 transition-colors group">
                          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-white font-extrabold text-xs"
                            style={{ backgroundColor: AVATAR_COLORS[i % AVATAR_COLORS.length] }}>
                            {c.initial}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 mb-0.5">
                              <p className="text-sm font-semibold text-gray-900 truncate">{c.name}</p>
                              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded flex-shrink-0 ${badge.color}`}>{badge.label}</span>
                            </div>
                            <p className="text-xs text-gray-400">{c.orderCount}× · {formatRpShort(c.totalSpend)} · ⚡ {c.points} pts</p>
                          </div>
                          <a href={`https://wa.me/${waPhone}`} target="_blank" rel="noopener noreferrer"
                            className="w-7 h-7 bg-[#25D366] hover:bg-[#1db954] rounded-lg flex items-center justify-center flex-shrink-0 opacity-0 group-hover:opacity-100 transition-all"
                          >
                            <MessageCircle size={12} className="text-white" />
                          </a>
                        </div>
                      )
                    })}
                    <div className="px-5 py-3">
                      <Link href="/customers" className="flex items-center justify-center gap-1 text-xs font-semibold text-gray-400 hover:text-app-blue transition-colors">
                        Lihat semua pelanggan <ChevronRight size={11} />
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ── AI GROWTH ASSISTANT ── */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
              <div className="px-6 pt-5 pb-4 border-b border-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Bot size={16} className="text-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-sm font-extrabold text-gray-900">AI Growth Assistant</h2>
                        <span className="text-[9px] font-bold bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full">BETA</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">Analisis pola pembelian · {paidOrders.length} transaksi dianalisis</p>
                    </div>
                  </div>
                  {aiInsights.length > 0 && (
                    <div className="flex items-center gap-1.5 bg-violet-50 border border-violet-100 rounded-xl px-3 py-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" />
                      <p className="text-[10px] font-bold text-violet-700">{aiInsights.length} insight aktif</p>
                    </div>
                  )}
                </div>
              </div>

              {aiInsights.length === 0 ? (
                <div className="px-6 py-10 flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-violet-50 rounded-2xl flex items-center justify-center mb-3 border border-violet-100">
                    <Sparkles size={20} className="text-violet-400" />
                  </div>
                  <p className="text-sm font-bold text-gray-800 mb-1">Analisis siap setelah ada transaksi</p>
                  <p className="text-xs text-gray-400 max-w-xs leading-relaxed">
                    AI akan menganalisis pola pembelian, produk terlaris, dan peluang cross-sell begitu data masuk.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {aiInsights.map((insight, i) => {
                    const confidence = i === 0
                      ? (inactiveCustomers.length > 0 ? 82 : repeatBuyers > 0 ? 78 : 71)
                      : i === 1 ? 74 : 68
                    const reasons: string[] = []
                    if (i === 0 && inactiveCustomers.length > 0) {
                      reasons.push(`${inactiveCustomers.length} pelanggan belum transaksi > 30 hari`)
                      if (avgDaysBetween !== null) reasons.push(`Rata-rata interval pembelian: ${avgDaysBetween} hari`)
                      reasons.push(`Nomor WhatsApp tersimpan & bisa dihubungi langsung`)
                    } else if (i === 0 && bestSeller) {
                      reasons.push(`${bestSeller.count} pembeli teridentifikasi untuk cross-sell`)
                      reasons.push(`AOV saat ini: ${formatRpShort(aov)} — bundle bisa naikan 30%+`)
                    }
                    return (
                      <div key={i} className="px-6 py-4 hover:bg-gray-50/40 transition-colors">
                        <div className="flex items-start gap-3">
                          <div className="w-7 h-7 bg-violet-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Sparkles size={13} className="text-violet-600" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="text-sm font-bold text-gray-900 leading-tight flex-1">{insight.title}</p>
                              <div className="flex items-center gap-1 bg-violet-50 border border-violet-100 rounded-lg px-2 py-0.5 flex-shrink-0">
                                <div className="w-1 h-1 bg-violet-500 rounded-full" />
                                <p className="text-[9px] font-extrabold text-violet-700">{confidence}% conf.</p>
                              </div>
                            </div>
                            <p className="text-xs text-gray-500 leading-relaxed mb-2">{insight.body}</p>
                            {reasons.length > 0 && (
                              <div className="mb-2">
                                {reasons.map((r, ri) => (
                                  <div key={ri} className="flex items-start gap-1.5 mb-1">
                                    <CheckCircle size={10} className="text-violet-400 mt-0.5 flex-shrink-0" />
                                    <p className="text-[10px] text-gray-400 leading-tight">{r}</p>
                                  </div>
                                ))}
                              </div>
                            )}
                            {insight.cta && (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-violet-700 bg-violet-50 px-2.5 py-1 rounded-full">
                                <TrendingUp size={10} /> {insight.cta}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* ── TODAY'S BEST ACTION ── */}
            {aiActions.length > 0 && (() => {
              const top = aiActions[0]
              return (
                <div className="bg-gradient-to-r from-orange-500 to-rose-500 rounded-2xl p-6 shadow-lg shadow-orange-200/50">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center">
                          <Target size={12} className="text-white" />
                        </div>
                        <p className="text-[10px] font-bold text-orange-100 uppercase tracking-widest">Aksi Terbaik Hari Ini</p>
                        <span className="text-base leading-none">{top.icon}</span>
                      </div>
                      <p className="text-white font-extrabold text-base leading-snug mb-2">{top.title}</p>
                      <p className="text-orange-100 text-xs mb-4">Estimasi dampak: <span className="font-bold text-white">{top.impact}</span></p>
                      <button
                        onClick={() => showToast('✓ Aksi dikirim ke antrian')}
                        className="bg-white text-orange-600 font-extrabold text-sm px-5 py-2.5 rounded-xl hover:bg-orange-50 transition-colors"
                      >
                        Jalankan Sekarang →
                      </button>
                    </div>
                    <div className="hidden md:flex flex-col items-end gap-2 flex-shrink-0">
                      {aiActions.slice(1, 3).map((a, i) => (
                        <div key={i} className="bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-right min-w-[160px]">
                          <p className="text-white text-xs font-semibold truncate">{a.icon} {a.title.substring(0, 30)}{a.title.length > 30 ? '...' : ''}</p>
                          <p className="text-orange-200 text-[9px] mt-0.5">{a.impact}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )
            })()}

            {/* ── PRODUCT INTELLIGENCE ── */}
            {productRanking.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                <div className="px-6 pt-5 pb-4 border-b border-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0 border border-blue-100">
                      <BarChart3 size={15} className="text-app-blue" />
                    </div>
                    <div>
                      <h2 className="text-sm font-extrabold text-gray-900">Product Intelligence</h2>
                      <p className="text-xs text-gray-400 mt-0.5">Performa produk berdasarkan data transaksi</p>
                    </div>
                  </div>
                </div>
                <div className="p-6 grid grid-cols-3 gap-4">
                  {/* Best Seller */}
                  {bestSeller && (
                    <div className="bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-100 rounded-xl p-4">
                      <div className="flex items-center gap-1.5 mb-2">
                        <Flame size={12} className="text-orange-500" />
                        <span className="text-[10px] font-bold text-orange-600 uppercase tracking-wide">Best Seller</span>
                      </div>
                      <p className="text-sm font-extrabold text-gray-900 leading-tight mb-1 truncate">{bestSeller.name}</p>
                      <p className="text-xs text-gray-500">{bestSeller.count} unit terjual</p>
                      <p className="text-xs font-bold text-orange-600 mt-1">{formatRpShort(bestSeller.revenue)}</p>
                    </div>
                  )}
                  {/* Needs Promotion */}
                  {slowMoving.length > 0 && (
                    <div className="bg-gradient-to-br from-red-50 to-rose-50 border border-red-100 rounded-xl p-4">
                      <div className="flex items-center gap-1.5 mb-2">
                        <ArrowDownRight size={12} className="text-red-500" />
                        <span className="text-[10px] font-bold text-red-600 uppercase tracking-wide">Perlu Promosi</span>
                      </div>
                      {slowMoving.map((p, i) => (
                        <div key={i} className={i > 0 ? 'mt-2 pt-2 border-t border-red-100' : ''}>
                          <p className="text-sm font-extrabold text-gray-900 leading-tight truncate">{p.name}</p>
                          <p className="text-xs text-gray-500">Hanya {p.count}× terjual</p>
                        </div>
                      ))}
                      <span className="inline-block mt-2 text-[10px] font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded-full">Flash Sale Weekend</span>
                    </div>
                  )}
                  {/* Bundle Opportunity */}
                  {productRanking.length >= 2 && (
                    <div className="bg-gradient-to-br from-purple-50 to-violet-50 border border-purple-100 rounded-xl p-4">
                      <div className="flex items-center gap-1.5 mb-2">
                        <Package size={12} className="text-purple-600" />
                        <span className="text-[10px] font-bold text-purple-600 uppercase tracking-wide">Bundle Opportunity</span>
                      </div>
                      <p className="text-sm font-extrabold text-gray-900 leading-tight mb-1">
                        {productRanking[0].name}
                      </p>
                      <p className="text-[10px] text-gray-500 mb-1">+ {productRanking[1].name}</p>
                      <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
                        +{formatRpShort(Math.round(aov * 0.3))} per bundle
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── ASTRAPAY PERFORMANCE ── */}
            {orders.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                <div className="px-6 pt-5 pb-4 border-b border-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-astrapay-gold/10 rounded-xl flex items-center justify-center border border-astrapay-gold/20">
                      <Zap size={15} className="text-astrapay-gold" fill="currentColor" />
                    </div>
                    <div>
                      <h2 className="text-sm font-extrabold text-gray-900">AstraPay Growth Engine</h2>
                      <p className="text-xs text-gray-400 mt-0.5">AstraPay sebagai mesin pertumbuhan tokomu</p>
                    </div>
                  </div>
                </div>
                <div className="p-6 grid grid-cols-3 gap-4">
                  {[
                    { label: 'Volume QRIS', value: formatRpShort(gmv), sub: `${paidThisMonth.length} transaksi`, icon: <Zap size={14} className="text-astrapay-gold" fill="currentColor" /> },
                    { label: 'Rata-rata Transaksi', value: aov > 0 ? formatRpShort(aov) : '—', sub: 'per order', icon: <TrendingUp size={14} className="text-app-blue" /> },
                    { label: 'AstraPoints Jalan', value: `${astraPoints} pts`, sub: `${custMap.size} penerima`, icon: <Gift size={14} className="text-amber-500" /> },
                    { label: 'Repeat Purchase Rate', value: `${repeatPct}%`, sub: repeatPct > 20 ? 'Di atas rata-rata' : 'Ada ruang tumbuh', icon: <RefreshCw size={14} className="text-purple-500" /> },
                    { label: 'Payment Success Rate', value: `${successRate}%`, sub: `${paidOrders.length} dari ${orders.length} order`, icon: <CheckCircle size={14} className="text-green-500" /> },
                    { label: 'Margin Bersih', value: formatRpShort(gmv - astraFeeRp), sub: 'dari channel langsung', icon: <TrendingUp size={14} className="text-emerald-600" /> },
                  ].map((m, i) => (
                    <div key={i} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                      <div className="flex items-center gap-1.5 mb-2">
                        {m.icon}
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">{m.label}</p>
                      </div>
                      <p className="text-lg font-extrabold text-gray-900 leading-none">{m.value}</p>
                      <p className="text-[10px] text-gray-400 mt-1">{m.sub}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── MERCHANT JOURNEY ── */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-purple-50 border border-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Award size={15} className="text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-extrabold text-gray-900">Merchant Journey</p>
                    <p className="text-xs text-gray-400">{doneMilestones} dari {milestones.length} milestone selesai</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-extrabold text-app-blue">{journeyPct}%</span>
                </div>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-5">
                <div className="h-full bg-gradient-to-r from-app-blue to-violet-500 rounded-full transition-all duration-700" style={{ width: `${journeyPct}%` }} />
              </div>
              <div className="grid grid-cols-4 gap-2.5">
                {milestones.slice(0, 4).map((m, i) => (
                  <div key={i} className={`flex items-center gap-2.5 p-3 rounded-xl border ${m.done ? 'bg-green-50 border-green-100' : 'bg-gray-50 border-gray-100'}`}>
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold ${m.done ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400'}`}>
                      {m.done ? '✓' : i + 1}
                    </div>
                    <p className={`text-xs font-semibold leading-tight ${m.done ? 'text-green-800' : 'text-gray-400'}`}>{m.icon} {m.label}</p>
                  </div>
                ))}
              </div>
              {milestones.slice(4).some(m => !m.done) && (
                <div className="grid grid-cols-3 gap-2.5 mt-2.5">
                  {milestones.slice(4).map((m, i) => (
                    <div key={i} className={`flex items-center gap-2.5 p-3 rounded-xl border ${m.done ? 'bg-green-50 border-green-100' : 'bg-gray-50 border-gray-100'}`}>
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold ${m.done ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400'}`}>
                        {m.done ? '✓' : i + 5}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-semibold leading-tight truncate ${m.done ? 'text-green-800' : 'text-gray-400'}`}>{m.icon} {m.label}</p>
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
          <p className="text-sm text-gray-500 mb-6 leading-relaxed">Buka di browser desktop untuk pengalaman terbaik.</p>
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
