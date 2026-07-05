'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import {
  ArrowLeft, MessageCircle, Star, ShoppingBag, Zap,
  TrendingUp, Bot, CheckCircle, Clock, Package,
} from 'lucide-react'
import { formatRp, formatRpShort } from '@/lib/utils'
import { customerTier, orderAmount } from '@/lib/metrics'
import { getCategoryStyle } from '@/lib/categories'
import { Sidebar } from '@/components/Sidebar'
import type { Seller, Order, Product } from '@/lib/types'

function relativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60_000)
  if (m < 60) return `${Math.max(1, m)} mnt lalu`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h} jam lalu`
  const d = Math.floor(h / 24)
  return `${d} hari lalu`
}

const AVATAR_COLORS = ['#3B5BDB','#2F9E44','#F08C00','#E03131','#7048E8','#0C8599','#E64980']

export default function CustomerDetailPage() {
  const params    = useParams()
  const rawPhone  = params.phone as string
  const phone     = decodeURIComponent(rawPhone)

  const [seller,   setSeller]   = useState<Seller | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [allOrders,setAllOrders]= useState<Order[]>([])
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    const slug = (typeof localStorage !== 'undefined' && localStorage.getItem('seller_slug')) || '__no_seller__'
    Promise.all([
      fetch(`/api/sellers/${slug}`).then(r => r.json()),
      fetch(`/api/orders?slug=${slug}`).then(r => r.json()),
    ]).then(([s, o]) => {
      if (s.seller)   setSeller(s.seller)
      if (s.products) setProducts(o.products ?? s.products ?? [])
      setAllOrders(o.orders ?? [])
    }).finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="hidden lg:flex h-screen bg-[#F4F6F8] overflow-hidden">
        <div className="w-64 bg-white border-r border-gray-100 flex-shrink-0 animate-pulse" />
        <div className="flex-1 p-8">
          <div className="h-8 bg-gray-100 rounded-xl w-48 animate-pulse mb-6" />
          <div className="h-64 bg-white rounded-2xl animate-pulse" />
        </div>
      </div>
    )
  }

  if (!seller) {
    return (
      <div className="min-h-screen bg-[#F4F6F8] flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 mb-4">Toko tidak ditemukan</p>
          <Link href="/mulai" className="text-app-blue font-semibold text-sm">Buat toko →</Link>
        </div>
      </div>
    )
  }

  // Build customer profile from orders
  const custOrders = allOrders.filter(o => o.buyer_phone === phone && o.status === 'paid')
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  if (custOrders.length === 0) {
    return (
      <div className="hidden lg:flex h-screen bg-[#F4F6F8] overflow-hidden">
        <Sidebar seller={seller} counts={{ products: products.length, orders: allOrders.length, customers: 0 }} />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-2xl mb-3">🔍</p>
            <p className="font-bold text-gray-900 mb-2">Pelanggan tidak ditemukan</p>
            <Link href="/customers" className="text-sm text-app-blue font-semibold">← Kembali ke daftar</Link>
          </div>
        </main>
      </div>
    )
  }

  const name        = custOrders[0].buyer_name || 'Pembeli'
  const initial     = name.charAt(0).toUpperCase()
  const ltv         = custOrders.reduce((s, o) => s + orderAmount(o), 0)
  const orderCount  = custOrders.length
  const points      = orderCount * 50
  const lastOrder   = custOrders[0]
  const tier        = customerTier({ orderCount, totalSpend: ltv, lastOrderTime: lastOrder.created_at })
  const firstOrder  = custOrders[custOrders.length - 1]
  const waPhone     = phone.startsWith('0') ? '62' + phone.slice(1) : phone

  // Favorite product
  const prodCount = new Map<string, number>()
  custOrders.forEach(o => prodCount.set(o.product_name, (prodCount.get(o.product_name) ?? 0) + 1))
  const favProduct = Array.from(prodCount.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '—'

  // Days since last order
  const daysSinceLast = Math.floor((Date.now() - new Date(lastOrder.created_at).getTime()) / (24 * 60 * 60 * 1000))

  // AI confidence
  const confidence = daysSinceLast < 14 ? 82 : daysSinceLast < 30 ? 68 : 45
  const avatarColor = AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length]

  const allCustPhones = new Set(allOrders.filter(o => o.status === 'paid').map(o => o.buyer_phone))
  const custCountTotal = allCustPhones.size

  return (
    <>
      <div className="hidden lg:flex h-screen bg-[#F4F6F8] overflow-hidden">
        <Sidebar seller={seller} counts={{ products: products.length, orders: allOrders.length, customers: custCountTotal }} />

        <main className="flex-1 overflow-y-auto">
          {/* Top bar */}
          <header className="sticky top-0 z-10 bg-white/90 backdrop-blur-md border-b border-gray-100 px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Link href="/customers" className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-xl flex items-center justify-center transition-colors">
                  <ArrowLeft size={14} className="text-gray-600" />
                </Link>
                <div>
                  <p className="text-xs text-gray-400 font-medium">Customer Detail</p>
                  <p className="text-base font-extrabold text-gray-900 leading-tight">{name}</p>
                </div>
              </div>
              <a href={`https://wa.me/${waPhone}`} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 bg-[#25D366] hover:bg-[#1db954] text-white font-semibold px-4 py-2 rounded-xl text-sm transition-colors">
                <MessageCircle size={14} /> WhatsApp
              </a>
            </div>
          </header>

          <div className="px-8 py-6 space-y-5 pb-16">

            {/* Hero profile card */}
            <div className="bg-gradient-to-br from-[#0f1c40] via-[#1a3080] to-[#1E3A8A] rounded-2xl p-7 relative overflow-hidden">
              <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 80% 50%, white 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
              <div className="relative flex items-start gap-6">
                {/* Avatar */}
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-extrabold text-2xl flex-shrink-0" style={{ backgroundColor: avatarColor }}>
                  {initial}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-white font-extrabold text-xl">{name}</p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${tier.cls}`}>{tier.icon} {tier.label}</span>
                  </div>
                  <p className="text-blue-300 text-sm mb-4">{phone}</p>
                  <div className="grid grid-cols-4 gap-3">
                    {[
                      { label: 'Lifetime Value',      value: formatRpShort(ltv),     sub: `${orderCount} transaksi`       },
                      { label: 'AstraPoints',          value: `${points} pts`,        sub: 'diperoleh total'               },
                      { label: 'Produk Favorit',       value: favProduct.split(' ').slice(0, 2).join(' '), sub: `${prodCount.get(favProduct)}× dibeli` },
                      { label: 'Terakhir Beli',        value: `${daysSinceLast}h lalu`, sub: relativeTime(lastOrder.created_at) },
                    ].map((m, i) => (
                      <div key={i} className="bg-white/10 rounded-xl px-3 py-2.5">
                        <p className="text-[9px] text-blue-300 font-bold uppercase tracking-wide mb-1">{m.label}</p>
                        <p className="text-white font-extrabold text-sm leading-none">{m.value}</p>
                        <p className="text-[9px] text-blue-400 mt-0.5">{m.sub}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* AI Prediction */}
            <div className="bg-violet-950 border border-violet-800/40 rounded-2xl p-5">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 bg-violet-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Bot size={16} className="text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <p className="text-sm font-bold text-white">AI Prediction</p>
                    <div className="flex items-center gap-1 bg-violet-800/50 border border-violet-600/40 rounded-lg px-2 py-0.5">
                      <div className="w-1 h-1 bg-violet-400 rounded-full animate-pulse" />
                      <p className="text-[9px] font-extrabold text-violet-300">{confidence}% confidence</p>
                    </div>
                  </div>
                  <p className="text-violet-200 text-sm leading-relaxed mb-3">
                    {daysSinceLast < 14
                      ? `${name.split(' ')[0]} kemungkinan besar akan beli lagi dalam 7–14 hari ke depan.`
                      : daysSinceLast < 30
                      ? `${name.split(' ')[0]} mulai menjauh — waktu yang tepat untuk kirim penawaran personal.`
                      : `${name.split(' ')[0]} sudah ${daysSinceLast} hari tidak aktif. Kirim pesan sekarang untuk reaktivasi.`
                    }
                  </p>
                  <div className="space-y-1.5 mb-3">
                    {[
                      orderCount >= 2 ? `${orderCount} pembelian sebelumnya — pola repeat terdeteksi` : 'Baru 1 pembelian — dorong repeat dengan penawaran kedua',
                      points > 0 ? `${points} AstraPoints terkumpul — pertimbangkan reward eksklusif` : 'Belum ada AstraPoints',
                      `Produk favorit: ${favProduct} — rekomendasikan produk pelengkap`,
                    ].map((r, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <CheckCircle size={10} className="text-violet-400 mt-0.5 flex-shrink-0" />
                        <p className="text-[10px] text-violet-300 leading-tight">{r}</p>
                      </div>
                    ))}
                  </div>
                  <a href={`https://wa.me/${waPhone}`} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 bg-[#25D366] hover:bg-[#1db954] text-white font-bold text-xs px-4 py-2 rounded-xl transition-colors">
                    <MessageCircle size={12} /> Hubungi Sekarang
                  </a>
                </div>
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center mb-3">
                  <TrendingUp size={15} className="text-app-blue" />
                </div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Total Belanja</p>
                <p className="text-2xl font-extrabold text-app-blue">{formatRp(ltv)}</p>
                <p className="text-xs text-gray-400 mt-1">{orderCount} transaksi · avg {formatRpShort(Math.round(ltv / orderCount))}</p>
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                <div className="w-9 h-9 bg-amber-50 rounded-xl flex items-center justify-center mb-3 border border-amber-100">
                  <Star size={15} className="text-amber-500" fill="currentColor" />
                </div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">AstraPoints</p>
                <p className="text-2xl font-extrabold text-gray-900">{points}</p>
                <p className="text-xs text-gray-400 mt-1">50 pts per transaksi</p>
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                <div className="w-9 h-9 bg-purple-50 rounded-xl flex items-center justify-center mb-3">
                  <Clock size={15} className="text-purple-600" />
                </div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Member Sejak</p>
                <p className="text-sm font-extrabold text-gray-900">
                  {new Date(firstOrder.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {Math.floor((Date.now() - new Date(firstOrder.created_at).getTime()) / (24 * 60 * 60 * 1000))} hari lalu
                </p>
              </div>
            </div>

            {/* Order history */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
              <div className="px-6 pt-5 pb-4 border-b border-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-100">
                    <ShoppingBag size={14} className="text-gray-600" />
                  </div>
                  <div>
                    <h2 className="text-sm font-extrabold text-gray-900">Riwayat Pembelian</h2>
                    <p className="text-xs text-gray-400">{orderCount} transaksi</p>
                  </div>
                </div>
                <Zap size={14} className="text-astrapay-gold" fill="currentColor" />
              </div>
              <div className="divide-y divide-gray-50">
                {custOrders.map(order => {
                  const { color, Icon } = getCategoryStyle(order.category)
                  return (
                    <div key={order.id} className="flex items-center gap-3.5 px-6 py-4">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: color }}>
                        <Icon size={14} className="text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{order.product_name}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <Package size={9} className="text-gray-300" />
                          <p className="text-xs text-gray-400">{order.category || 'Produk'} · {relativeTime(order.created_at)}</p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-bold text-gray-900">{formatRp(orderAmount(order))}</p>
                        <div className="flex items-center justify-end gap-1 mt-0.5">
                          <CheckCircle size={9} className="text-green-500" />
                          <span className="text-[10px] font-bold text-green-600">Lunas</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

          </div>
        </main>
      </div>

      {/* Mobile */}
      <div className="lg:hidden min-h-screen bg-[#F4F6F8] flex items-center justify-center p-8">
        <div className="text-center max-w-xs">
          <p className="text-4xl mb-4">💻</p>
          <p className="font-extrabold text-gray-900 text-lg mb-2">Dashboard untuk Desktop</p>
          <p className="text-sm text-gray-500 mb-6">Buka di browser desktop untuk pengalaman terbaik.</p>
          <Link href="/customers" className="inline-flex items-center gap-2 bg-app-blue text-white font-bold px-5 py-3 rounded-xl text-sm">
            ← Kembali
          </Link>
        </div>
      </div>
    </>
  )
}
