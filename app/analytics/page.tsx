'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  ChevronRight, TrendingUp, TrendingDown, Users, ShoppingBag,
  Zap, ArrowUpRight, Package, BarChart3, RefreshCw, Star,
} from 'lucide-react'
import { Sidebar } from '@/components/Sidebar'
import { formatRp, formatRpShort } from '@/lib/utils'
import { orderAmount, customerTier } from '@/lib/metrics'
import type { Seller, Product, Order } from '@/lib/types'

type Period = '30d' | 'month' | 'all'

function paidOnly(orders: Order[]) {
  return orders.filter(o => o.status === 'paid')
}

function startOf(period: Period): Date {
  const now = new Date()
  if (period === 'month') return new Date(now.getFullYear(), now.getMonth(), 1)
  if (period === '30d')   return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  return new Date(0)
}

// ── Mini bar chart (pure CSS) ─────────────────────────────────────────────────
function BarChart({ data, color = '#1E3A8A' }: { data: { label: string; value: number }[]; color?: string }) {
  const max = Math.max(...data.map(d => d.value), 1)
  return (
    <div className="flex items-end gap-1 h-24 w-full">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
          <div
            className="w-full rounded-t-sm transition-all duration-500"
            style={{ height: `${Math.max(3, (d.value / max) * 88)}px`, backgroundColor: d.value > 0 ? color : '#E5E7EB' }}
          />
          {/* tooltip */}
          {d.value > 0 && (
            <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[9px] font-bold px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
              {formatRpShort(d.value)}
            </div>
          )}
          <p className="text-[8px] text-gray-400 font-medium truncate w-full text-center">{d.label}</p>
        </div>
      ))}
    </div>
  )
}

// ── Horizontal bar ────────────────────────────────────────────────────────────
function HBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.max(2, Math.round((value / max) * 100)) : 2
  return (
    <div className="h-2 bg-gray-100 rounded-full overflow-hidden flex-1">
      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: color }} />
    </div>
  )
}

// ── Stat chip ─────────────────────────────────────────────────────────────────
function Delta({ value, suffix = '' }: { value: number; suffix?: string }) {
  if (value === 0) return <span className="text-[10px] text-gray-400 font-medium">—</span>
  const pos = value > 0
  return (
    <span className={`inline-flex items-center gap-0.5 text-[10px] font-bold ${pos ? 'text-green-600' : 'text-red-500'}`}>
      {pos ? <ArrowUpRight size={9} /> : <TrendingDown size={9} />}
      {pos ? '+' : ''}{value}{suffix}
    </span>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function AnalyticsPage() {
  const [seller,   setSeller]   = useState<Seller | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [orders,   setOrders]   = useState<Order[]>([])
  const [period,   setPeriod]   = useState<Period>('month')

  useEffect(() => {
    const slug = (typeof localStorage !== 'undefined' && localStorage.getItem('seller_slug')) || '__no_seller__'
    Promise.all([
      fetch(`/api/sellers/${slug}`).then(r => r.json()),
      fetch(`/api/orders?slug=${slug}`).then(r => r.json()),
    ]).then(([s, o]) => {
      if (s.seller)   setSeller(s.seller)
      if (s.products) setProducts(s.products)
      setOrders(o.orders ?? [])
    })
  }, [])

  // ── Derived ───────────────────────────────────────────────────────────────
  const paid    = paidOnly(orders)
  const cutoff  = startOf(period)
  const inRange = paid.filter(o => new Date(o.created_at) >= cutoff)

  // previous period (same length, before cutoff)
  const periodMs  = period === 'all' ? 0 : (Date.now() - cutoff.getTime())
  const prevStart = period === 'all' ? new Date(0) : new Date(cutoff.getTime() - periodMs)
  const prevRange = period === 'all' ? [] : paid.filter(o => {
    const t = new Date(o.created_at).getTime()
    return t >= prevStart.getTime() && t < cutoff.getTime()
  })

  const gmv      = inRange.reduce((s, o) => s + orderAmount(o), 0)
  const prevGmv  = prevRange.reduce((s, o) => s + orderAmount(o), 0)
  const gmvDelta = prevGmv > 0 ? Math.round(((gmv - prevGmv) / prevGmv) * 100) : 0

  const savings      = seller ? Math.round(gmv * (seller.platform_fee_pct - seller.astratoko_fee_pct)) : 0
  const prevSavings  = seller ? Math.round(prevGmv * (seller.platform_fee_pct - seller.astratoko_fee_pct)) : 0
  const savingsDelta = prevSavings > 0 ? Math.round(((savings - prevSavings) / prevSavings) * 100) : 0

  const phoneSet  = new Map<string, number>()
  inRange.forEach(o => phoneSet.set(o.buyer_phone, (phoneSet.get(o.buyer_phone) ?? 0) + 1))
  const uniqueBuyers = phoneSet.size
  const repeatBuyers = Array.from(phoneSet.values()).filter(n => n > 1).length
  const repeatPct    = uniqueBuyers > 0 ? Math.round((repeatBuyers / uniqueBuyers) * 100) : 0

  const prevPhoneSet = new Map<string, number>()
  prevRange.forEach(o => prevPhoneSet.set(o.buyer_phone, (prevPhoneSet.get(o.buyer_phone) ?? 0) + 1))
  const buyerDelta = uniqueBuyers - prevPhoneSet.size

  const aov      = inRange.length > 0 ? Math.round(gmv / inRange.length) : 0
  const prevAov  = prevRange.length > 0 ? Math.round(prevGmv / prevRange.length) : 0
  const aovDelta = prevAov > 0 ? Math.round(((aov - prevAov) / prevAov) * 100) : 0

  // Daily revenue chart (last N days, this month, or the full span for "all")
  const earliestPaidMs = paid.length
    ? Math.min(...paid.map(o => new Date(o.created_at).getTime()))
    : Date.now()
  const allSpanDays = Math.ceil((Date.now() - earliestPaidMs) / (24 * 60 * 60 * 1000)) + 1
  const chartDays = period === 'all'
    ? Math.min(Math.max(allSpanDays, 7), 90)
    : (period === '30d' ? 30 : new Date().getDate())
  const chartData = Array.from({ length: chartDays }, (_, i) => {
    const d   = new Date()
    d.setDate(d.getDate() - (chartDays - 1 - i))
    const key = `${d.getDate()}/${d.getMonth() + 1}`
    const val = paid
      .filter(o => {
        const od = new Date(o.created_at)
        return od.getDate() === d.getDate() && od.getMonth() === d.getMonth() && od.getFullYear() === d.getFullYear()
      })
      .reduce((s, o) => s + orderAmount(o), 0)
    return { label: i % Math.ceil(chartDays / 8) === 0 ? key : '', value: val, fullLabel: key }
  })

  // Product leaderboard
  const prodMap = new Map<string, { name: string; count: number; revenue: number; category: string }>()
  inRange.forEach(o => {
    const key = o.product_id ?? o.product_name.split('+')[0].split('×')[0].trim()
    const p = prodMap.get(key)
    if (p) { p.count += (o.quantity ?? 1); p.revenue += orderAmount(o) }
    else prodMap.set(key, { name: o.product_name.split('+')[0].split('×')[0].trim(), count: o.quantity ?? 1, revenue: orderAmount(o), category: o.category })
  })
  const prodRanking = Array.from(prodMap.values()).sort((a, b) => b.revenue - a.revenue)
  const maxRevenue  = prodRanking[0]?.revenue ?? 1

  // Category breakdown
  const catMap = new Map<string, { count: number; revenue: number }>()
  inRange.forEach(o => {
    const c = catMap.get(o.category || 'Lainnya')
    if (c) { c.count++; c.revenue += orderAmount(o) }
    else catMap.set(o.category || 'Lainnya', { count: 1, revenue: orderAmount(o) })
  })
  const catRanking  = Array.from(catMap.entries()).sort((a, b) => b[1].revenue - a[1].revenue)
  const maxCatRev   = catRanking[0]?.[1].revenue ?? 1

  // Customer segments
  const allCustMap  = new Map<string, { name: string; orders: number; spend: number; last: string }>()
  paid.forEach(o => {
    const c = allCustMap.get(o.buyer_phone)
    if (c) { c.orders++; c.spend += orderAmount(o); if (new Date(o.created_at) > new Date(c.last)) c.last = o.created_at }
    else allCustMap.set(o.buyer_phone, { name: o.buyer_name || 'Pembeli', orders: 1, spend: orderAmount(o), last: o.created_at })
  })
  const allCustomers  = Array.from(allCustMap.values())
  const tierOf = (c: { orders: number; spend: number; last: string }) =>
    customerTier({ orderCount: c.orders, totalSpend: c.spend, lastOrderTime: c.last }).label
  const vip           = allCustomers.filter(c => tierOf(c) === 'VIP')
  const loyalList     = allCustomers.filter(c => tierOf(c) === 'Loyal')
  const repeatList    = allCustomers.filter(c => tierOf(c) === 'Kembali')
  const newCust       = allCustomers.filter(c => tierOf(c) === 'Baru')
  const inactive      = allCustomers.filter(c => tierOf(c) === 'Dormant')
  const topCustomer   = allCustomers.sort((a, b) => b.spend - a.spend)[0]

  const uniqueCustomers = new Set(paid.map(o => o.buyer_phone)).size

  const PERIOD_LABELS: Record<Period, string> = {
    month: 'Bulan Ini',
    '30d': '30 Hari Terakhir',
    all:   'Semua Waktu',
  }

  const CATEGORY_COLORS: Record<string, string> = {
    Rem: '#EF4444', Oli: '#F59E0B', Helm: '#3B5BDB', Mesin: '#7048E8',
    Ban: '#2F9E44', Filter: '#0EA5E9', Elektrik: '#F97316', Transmisi: '#EC4899',
    Aksesoris: '#14B8A6', Lainnya: '#6B7280',
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      <div className="hidden lg:flex h-screen bg-[#F4F6F8] overflow-hidden">
        <Sidebar seller={seller} counts={{ products: products.length, orders: orders.length, customers: uniqueCustomers }} />

        <main className="flex-1 overflow-y-auto">
          {/* Header */}
          <header className="sticky top-0 z-10 bg-white/90 backdrop-blur-md border-b border-gray-100 px-8 py-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 text-sm text-gray-400 mb-0.5">
                  <Link href="/dashboard" className="hover:text-gray-600">Overview</Link>
                  <ChevronRight size={12} />
                  <span className="text-gray-700 font-medium">Analytics</span>
                </div>
                <p className="text-base font-extrabold text-gray-900">Business Analytics</p>
              </div>
              {/* Period selector */}
              <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
                {(['month', '30d', 'all'] as Period[]).map(p => (
                  <button key={p} onClick={() => setPeriod(p)}
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${period === p ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    {PERIOD_LABELS[p]}
                  </button>
                ))}
              </div>
            </div>
          </header>

          {orders.length === 0 ? (
            <div className="px-8 py-20 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-4 border border-blue-100">
                <BarChart3 size={28} className="text-app-blue" />
              </div>
              <p className="font-extrabold text-gray-900 text-lg mb-2">Belum ada data</p>
              <p className="text-sm text-gray-400 max-w-xs leading-relaxed">Analytics akan tampil otomatis setelah ada transaksi pertama.</p>
            </div>
          ) : (
            <div className="px-8 py-6 space-y-5 pb-16">

              {/* ── KPIs ── */}
              <div className="grid grid-cols-4 gap-4">
                {[
                  {
                    label: 'Total GMV', value: formatRpShort(gmv), sub: `${inRange.length} transaksi`,
                    delta: gmvDelta, deltaSuffix: '%',
                    icon: <TrendingUp size={15} className="text-app-blue" />, bg: 'bg-blue-50', border: 'border-app-blue/20',
                  },
                  {
                    label: 'Fee Dihindari', value: formatRpShort(savings), sub: `vs ${seller?.platform ?? 'marketplace'}`,
                    delta: savingsDelta, deltaSuffix: '%',
                    icon: <span className="text-sm">🛡️</span>, bg: 'bg-emerald-50', border: 'border-emerald-100',
                  },
                  {
                    label: 'Pelanggan Unik', value: String(uniqueBuyers), sub: `${repeatBuyers} repeat (${repeatPct}%)`,
                    delta: buyerDelta, deltaSuffix: '',
                    icon: <Users size={15} className="text-purple-600" />, bg: 'bg-purple-50', border: 'border-purple-100',
                  },
                  {
                    label: 'Avg Order Value', value: aov > 0 ? formatRpShort(aov) : '—', sub: 'per transaksi',
                    delta: aovDelta, deltaSuffix: '%',
                    icon: <ShoppingBag size={15} className="text-amber-600" />, bg: 'bg-amber-50', border: 'border-amber-100',
                  },
                ].map(card => (
                  <div key={card.label} className={`bg-white rounded-2xl border ${card.border} p-5 shadow-sm`}>
                    <div className="flex items-center justify-between mb-3">
                      <div className={`w-8 h-8 ${card.bg} rounded-xl flex items-center justify-center`}>{card.icon}</div>
                      {period !== 'all' && <Delta value={card.delta} suffix={card.deltaSuffix} />}
                    </div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">{card.label}</p>
                    <p className="text-2xl font-extrabold text-gray-900 leading-none">{card.value}</p>
                    <p className="text-xs text-gray-400 mt-1.5">{card.sub}</p>
                  </div>
                ))}
              </div>

              {/* ── Revenue Chart + Category ── */}
              <div className="grid grid-cols-[3fr_2fr] gap-5">
                {/* Bar chart */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <h3 className="text-sm font-extrabold text-gray-900">Tren Pendapatan</h3>
                      <p className="text-xs text-gray-400 mt-0.5">{PERIOD_LABELS[period]}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-400">Total</p>
                      <p className="text-base font-extrabold text-app-blue">{formatRpShort(gmv)}</p>
                    </div>
                  </div>
                  <BarChart data={chartData} color="#1E3A8A" />
                </div>

                {/* Category breakdown */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                  <h3 className="text-sm font-extrabold text-gray-900 mb-4">Kategori Terlaris</h3>
                  {catRanking.length === 0 ? (
                    <p className="text-xs text-gray-400">Belum ada data kategori.</p>
                  ) : (
                    <div className="space-y-3">
                      {catRanking.slice(0, 6).map(([cat, { count, revenue }]) => (
                        <div key={cat} className="space-y-1">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: CATEGORY_COLORS[cat] ?? '#6B7280' }} />
                              <p className="text-xs font-semibold text-gray-800">{cat}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs font-bold text-gray-900">{formatRpShort(revenue)}</p>
                              <p className="text-[9px] text-gray-400">{count} order</p>
                            </div>
                          </div>
                          <HBar value={revenue} max={maxCatRev} color={CATEGORY_COLORS[cat] ?? '#6B7280'} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* ── Product Leaderboard + Customer Segments ── */}
              <div className="grid grid-cols-[3fr_2fr] gap-5">
                {/* Product leaderboard */}
                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                  <div className="px-6 pt-5 pb-4 border-b border-gray-50 flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-extrabold text-gray-900">Product Leaderboard</h3>
                      <p className="text-xs text-gray-400 mt-0.5">Diurutkan berdasarkan pendapatan</p>
                    </div>
                    <Link href="/products" className="text-xs font-semibold text-app-blue flex items-center gap-1 hover:text-app-blue-light transition-colors">
                      Kelola <ChevronRight size={12} />
                    </Link>
                  </div>
                  {prodRanking.length === 0 ? (
                    <div className="px-6 py-10 text-center">
                      <p className="text-sm text-gray-400">Belum ada data produk.</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-50">
                      {prodRanking.slice(0, 7).map((p, i) => (
                        <div key={p.name} className="flex items-center gap-4 px-6 py-3.5 hover:bg-gray-50/40 transition-colors">
                          <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-[11px] font-extrabold flex-shrink-0 ${
                            i === 0 ? 'bg-amber-100 text-amber-700' : i === 1 ? 'bg-gray-100 text-gray-600' : i === 2 ? 'bg-orange-100 text-orange-600' : 'bg-gray-50 text-gray-400'
                          }`}>
                            {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
                          </div>
                          <div className="flex-1 min-w-0 space-y-1">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-semibold text-gray-900 truncate">{p.name}</p>
                              <p className="text-sm font-bold text-gray-900 ml-2 flex-shrink-0">{formatRpShort(p.revenue)}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <HBar value={p.revenue} max={maxRevenue} color={i === 0 ? '#F59E0B' : '#1E3A8A'} />
                              <p className="text-[10px] text-gray-400 flex-shrink-0">{p.count} unit</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Customer segments */}
                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                  <div className="px-6 pt-5 pb-4 border-b border-gray-50">
                    <h3 className="text-sm font-extrabold text-gray-900">Segmentasi Pelanggan</h3>
                    <p className="text-xs text-gray-400 mt-0.5">{allCustomers.length} total kontak dimiliki</p>
                  </div>
                  <div className="p-6 space-y-3">
                    {[
                      { label: 'VIP (5+ / Rp500rb)', count: vip.length,        color: '#F59E0B', bg: 'bg-amber-50',  icon: '⭐' },
                      { label: 'Loyal (3+ order)',    count: loyalList.length,  color: '#7048E8', bg: 'bg-purple-50', icon: '💜' },
                      { label: 'Kembali (2 order)',   count: repeatList.length, color: '#1E40AF', bg: 'bg-blue-50',   icon: '🔁' },
                      { label: 'Pelanggan Baru',      count: newCust.length,    color: '#16A34A', bg: 'bg-green-50',  icon: '✨' },
                      { label: 'Dormant >30 hari',    count: inactive.length,   color: '#6B7280', bg: 'bg-gray-100',  icon: '😴' },
                    ].map(seg => (
                      <div key={seg.label} className="flex items-center gap-3">
                        <div className={`w-8 h-8 ${seg.bg} rounded-xl flex items-center justify-center text-sm flex-shrink-0`}>{seg.icon}</div>
                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-semibold text-gray-700">{seg.label}</p>
                            <p className="text-xs font-extrabold text-gray-900">{seg.count}</p>
                          </div>
                          <HBar value={seg.count} max={Math.max(allCustomers.length, 1)} color={seg.color} />
                        </div>
                      </div>
                    ))}

                    {topCustomer && (
                      <>
                        <div className="border-t border-gray-50 pt-3 mt-1">
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-2">Top Customer</p>
                          <div className="flex items-center gap-3 bg-amber-50 border border-amber-100 rounded-xl p-3">
                            <div className="w-9 h-9 bg-amber-400 rounded-xl flex items-center justify-center text-white font-extrabold text-sm flex-shrink-0">
                              {topCustomer.name.charAt(0)}
                            </div>
                            <div>
                              <p className="text-sm font-extrabold text-gray-900">{topCustomer.name}</p>
                              <p className="text-xs text-gray-500">{topCustomer.orders}× · {formatRpShort(topCustomer.spend)}</p>
                            </div>
                            <Star size={14} className="text-amber-500 fill-amber-400 ml-auto flex-shrink-0" />
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* ── Marketplace Savings Deep Dive ── */}
              {seller && gmv > 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-9 h-9 bg-emerald-50 rounded-xl flex items-center justify-center border border-emerald-100">
                      <span className="text-lg">🛡️</span>
                    </div>
                    <div>
                      <h3 className="text-sm font-extrabold text-gray-900">Analisis Penghematan vs Marketplace</h3>
                      <p className="text-xs text-gray-400 mt-0.5">{PERIOD_LABELS[period]}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-4">
                    {[
                      { label: 'Total GMV', value: formatRp(gmv), sub: `${inRange.length} transaksi`, color: 'text-gray-900' },
                      { label: `Fee ${seller.platform} (${Math.round(seller.platform_fee_pct * 100)}%)`, value: formatRp(Math.round(gmv * seller.platform_fee_pct)), sub: 'yang akan terpotong', color: 'text-red-500' },
                      { label: `Fee AstraToko (${Math.round(seller.astratoko_fee_pct * 100)}%)`, value: formatRp(Math.round(gmv * seller.astratoko_fee_pct)), sub: 'yang kamu bayar', color: 'text-gray-600' },
                      { label: 'Kamu Hemat', value: formatRp(savings), sub: 'langsung masuk kantong', color: 'text-emerald-600' },
                    ].map(item => (
                      <div key={item.label} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-2">{item.label}</p>
                        <p className={`text-lg font-extrabold leading-none ${item.color}`}>{item.value}</p>
                        <p className="text-[10px] text-gray-400 mt-1">{item.sub}</p>
                      </div>
                    ))}
                  </div>
                  {/* Visual comparison bar */}
                  <div className="mt-5 space-y-2">
                    <div className="flex items-center gap-3">
                      <p className="text-[10px] text-gray-500 w-28 flex-shrink-0">{seller.platform}</p>
                      <div className="flex-1 h-5 bg-red-100 rounded-lg overflow-hidden">
                        <div className="h-full bg-red-400 rounded-lg flex items-center justify-end pr-2 transition-all duration-700"
                          style={{ width: `${Math.round(seller.platform_fee_pct * 100)}%` }}>
                          <span className="text-[9px] text-white font-bold">{Math.round(seller.platform_fee_pct * 100)}%</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="text-[10px] text-gray-500 w-28 flex-shrink-0">AstraToko</p>
                      <div className="flex-1 h-5 bg-emerald-100 rounded-lg overflow-hidden">
                        <div className="h-full bg-emerald-400 rounded-lg flex items-center justify-end pr-2 transition-all duration-700"
                          style={{ width: `${Math.round(seller.astratoko_fee_pct * 100)}%` }}>
                          <span className="text-[9px] text-white font-bold">{Math.round(seller.astratoko_fee_pct * 100)}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── AstraPay metrics ── */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-9 h-9 bg-astrapay-gold/10 rounded-xl flex items-center justify-center border border-astrapay-gold/20">
                    <Zap size={15} className="text-astrapay-gold" fill="currentColor" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-gray-900">AstraPay Performance</h3>
                    <p className="text-xs text-gray-400 mt-0.5">Metrik QRIS {PERIOD_LABELS[period].toLowerCase()}</p>
                  </div>
                </div>
                <div className="grid grid-cols-5 gap-4">
                  {[
                    { label: 'Volume QRIS',          value: formatRpShort(gmv),                icon: <Zap size={13} className="text-astrapay-gold" fill="currentColor" /> },
                    { label: 'Transaksi',            value: String(inRange.length),            icon: <ShoppingBag size={13} className="text-app-blue" /> },
                    { label: 'Avg Transaksi',        value: aov > 0 ? formatRpShort(aov) : '—', icon: <TrendingUp size={13} className="text-green-500" /> },
                    { label: 'AstraPoints Jalan',    value: `${inRange.length * 50} pts`,      icon: <Star size={13} className="text-amber-500" /> },
                    { label: 'Repeat Purchase Rate', value: `${repeatPct}%`,                   icon: <RefreshCw size={13} className="text-purple-500" /> },
                  ].map(m => (
                    <div key={m.label} className="bg-gray-50 rounded-xl p-4 border border-gray-100 text-center">
                      <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center mx-auto mb-2 border border-gray-100 shadow-sm">
                        {m.icon}
                      </div>
                      <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wide mb-1">{m.label}</p>
                      <p className="text-base font-extrabold text-gray-900">{m.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── Inactive alert ── */}
              {inactive.length > 0 && (
                <div className="bg-gradient-to-r from-violet-50 to-purple-50 border border-violet-100 rounded-2xl p-5 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-9 h-9 bg-violet-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Package size={15} className="text-violet-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-extrabold text-gray-900 mb-1">
                        {inactive.length} pelanggan belum kembali lebih dari 30 hari
                      </p>
                      <p className="text-xs text-gray-500 leading-relaxed mb-3">
                        {inactive.slice(0, 3).map(c => c.name.split(' ')[0]).join(', ')}{inactive.length > 3 ? ` dan ${inactive.length - 3} lainnya` : ''} —
                        pelanggan lama 5× lebih mudah dikonversi dibandingkan pelanggan baru. Kirim promo WhatsApp sekarang.
                      </p>
                      <Link href="/customers"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-violet-700 bg-violet-100 px-3 py-1.5 rounded-xl hover:bg-violet-200 transition-colors"
                      >
                        Lihat & Hubungi Pelanggan <ChevronRight size={11} />
                      </Link>
                    </div>
                  </div>
                </div>
              )}

            </div>
          )}
        </main>
      </div>

      {/* Mobile */}
      <div className="lg:hidden min-h-screen bg-[#F4F6F8] flex items-center justify-center p-8">
        <Link href="/dashboard" className="inline-flex items-center gap-2 bg-app-blue text-white font-bold px-5 py-3 rounded-xl text-sm">← Dashboard</Link>
      </div>
    </>
  )
}
