'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { ChevronRight, Share2, MessageCircle, Gift, Search } from 'lucide-react'
import { formatRp } from '@/lib/utils'
import { customerTier, orderAmount, type CustomerTier } from '@/lib/metrics'
import { Sidebar } from '@/components/Sidebar'
import type { Seller, Order, Product } from '@/lib/types'

type CustFilter = 'all' | 'baru' | 'kembali' | 'loyal' | 'vip' | 'dormant'

interface DerivedCustomer {
  name: string; phone: string; maskedPhone: string
  orderCount: number; totalSpend: number
  lastOrderTime: string; lastProduct: string
  points: number; initial: string
  badge: CustomerTier
}

const AVATAR_COLORS = ['#3B5BDB','#2F9E44','#F08C00','#E03131','#7048E8','#1098AD','#D6336C','#0C8599']

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
      {message}
    </div>
  )
}

function Skeleton() {
  return (
    <div className="flex h-screen bg-[#F4F6F8] overflow-hidden">
      <div className="w-64 bg-white border-r border-gray-100 flex-shrink-0 animate-pulse" />
      <div className="flex-1 p-8 space-y-4">
        <div className="h-10 bg-gray-100 rounded-xl w-48 animate-pulse" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-20 bg-white rounded-xl animate-pulse" />
        ))}
      </div>
    </div>
  )
}

export default function CustomersPage() {
  const [seller,   setSeller]   = useState<Seller | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [orders,   setOrders]   = useState<Order[]>([])
  const [loading,  setLoading]  = useState(true)
  const [filter,   setFilter]   = useState<CustFilter>('all')
  const [search,   setSearch]   = useState('')
  const [toast,    setToast]    = useState('')

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
      setOrders(ordersJson.orders ?? [])
    }).finally(() => setLoading(false))
  }, [])

  if (loading) return <Skeleton />

  // Derive customers (paid orders only, consistent with customer detail + CRM)
  const customerMap = new Map<string, DerivedCustomer>()
  orders.filter(order => order.status === 'paid').forEach(order => {
    const c = customerMap.get(order.buyer_phone)
    if (c) {
      c.orderCount++
      c.totalSpend += orderAmount(order)
      if (new Date(order.created_at) > new Date(c.lastOrderTime)) {
        c.lastOrderTime = order.created_at
        c.lastProduct   = order.product_name
      }
      c.points = c.orderCount * 50
      c.badge  = customerTier({ orderCount: c.orderCount, totalSpend: c.totalSpend, lastOrderTime: c.lastOrderTime })
    } else {
      const ph   = order.buyer_phone
      const name = order.buyer_name || 'Pembeli'
      const spend = orderAmount(order)
      customerMap.set(ph, {
        name, phone: ph,
        maskedPhone: ph.length >= 8 ? ph.slice(0, 4) + '****' + ph.slice(-4) : ph,
        orderCount: 1, totalSpend: spend,
        lastOrderTime: order.created_at, lastProduct: order.product_name,
        points: 50, initial: name.charAt(0).toUpperCase(),
        badge: customerTier({ orderCount: 1, totalSpend: spend, lastOrderTime: order.created_at }),
      })
    }
  })
  const allCustomers = Array.from(customerMap.values()).sort(
    (a, b) => new Date(b.lastOrderTime).getTime() - new Date(a.lastOrderTime).getTime()
  )

  const filtered = allCustomers.filter(c => {
    const matchSearch = search === '' || c.name.toLowerCase().includes(search.toLowerCase())
    const matchFilter =
      filter === 'all'     ||
      (filter === 'baru'    && c.badge.label === 'Baru')    ||
      (filter === 'kembali' && c.badge.label === 'Kembali') ||
      (filter === 'loyal'   && c.badge.label === 'Loyal')   ||
      (filter === 'vip'     && c.badge.label === 'VIP')     ||
      (filter === 'dormant' && c.badge.label === 'Dormant')
    return matchSearch && matchFilter
  })

  const totalPoints = allCustomers.reduce((s, c) => s + c.points, 0)
  const repeatCount = allCustomers.filter(c => c.orderCount >= 2).length

  const handleBroadcast = () => {
    if (!seller) return
    const url  = `${window.location.origin}/toko/${seller.slug}`
    const msg  = encodeURIComponent(`Halo! Ada promo spesial dari ${seller.name} — belanja langsung & dapat AstraPoints bonus! 🎁 ${url}`)
    window.open(`https://wa.me/?text=${msg}`, '_blank')
    showToast('🎉 Broadcast dikirim!')
  }

  return (
    <>
      <div className="hidden lg:flex h-screen bg-[#F4F6F8] overflow-hidden">
        {toast && <Toast message={toast} />}

        <Sidebar
          seller={seller}
          counts={{ products: products.length, orders: orders.length, customers: allCustomers.length }}
        />

        <main className="flex-1 overflow-y-auto">
          <header className="sticky top-0 z-10 bg-white/90 backdrop-blur-md border-b border-gray-100 px-8 py-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 text-sm text-gray-400 mb-0.5">
                  <Link href="/dashboard" className="hover:text-gray-600 transition-colors">Overview</Link>
                  <ChevronRight size={12} />
                  <span className="text-gray-700 font-medium">Customers</span>
                </div>
                <p className="text-base font-extrabold text-gray-900 leading-tight">
                  {allCustomers.length > 0 ? `${allCustomers.length} Pelanggan` : 'Pelanggan'}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={handleBroadcast}
                  className="flex items-center gap-2 bg-[#25D366] hover:bg-[#1db954] text-white font-semibold px-4 py-2 rounded-xl text-sm transition-colors"
                >
                  <Share2 size={14} /> Broadcast Promo
                </button>
              </div>
            </div>
          </header>

          <div className="px-8 py-6 space-y-5 pb-16">

            {/* Stats */}
            {allCustomers.length > 0 && (
              <div className="grid grid-cols-4 gap-4">
                {[
                  { label: 'Total Pelanggan',    value: allCustomers.length, sub: 'kontak tersimpan' },
                  { label: 'Repeat Customer',    value: repeatCount,         sub: 'balik lagi beli' },
                  { label: 'AstraPoints Disebar', value: `+${totalPoints}`,  sub: 'total loyalty points' },
                  { label: 'Avg. Pesanan',       value: allCustomers.length > 0
                    ? Math.round(orders.filter(o => o.status === 'paid').length / allCustomers.length * 10) / 10
                    : '—',                                                   sub: 'pesanan per pelanggan' },
                ].map(stat => (
                  <div key={stat.label} className="bg-white rounded-2xl border border-gray-100 px-5 py-4 shadow-sm">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">{stat.label}</p>
                    <p className="text-2xl font-extrabold text-gray-900 leading-none">{stat.value}</p>
                    <p className="text-xs text-gray-400 mt-1">{stat.sub}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Search + filter */}
            {allCustomers.length > 0 && (
              <div className="flex items-center gap-3">
                <div className="relative max-w-sm flex-1">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
                  <input value={search} onChange={e => setSearch(e.target.value)}
                    placeholder="Cari nama pelanggan..."
                    className="w-full pl-9 pr-3 py-2.5 bg-white border border-gray-100 rounded-xl text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:border-app-blue/30 transition-colors shadow-sm"
                  />
                </div>
                <div className="flex items-center gap-1 bg-white border border-gray-100 rounded-xl p-1 shadow-sm">
                  {([
                    { key: 'all',     label: `Semua (${allCustomers.length})` },
                    { key: 'baru',    label: 'Baru' },
                    { key: 'kembali', label: 'Kembali' },
                    { key: 'loyal',   label: 'Loyal' },
                    { key: 'vip',     label: 'VIP' },
                    { key: 'dormant', label: 'Dormant' },
                  ] as const).map(f => (
                    <button key={f.key} onClick={() => setFilter(f.key)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        filter === f.key ? 'bg-app-blue text-white shadow-sm' : 'text-gray-400 hover:text-gray-600'
                      }`}
                    >{f.label}</button>
                  ))}
                </div>
              </div>
            )}

            {/* Customer list */}
            {allCustomers.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 px-8 py-12 flex flex-col items-center text-center">
                <p className="text-xs font-bold text-app-blue uppercase tracking-widest mb-3">Customer Database</p>
                <p className="font-extrabold text-gray-900 text-lg mb-2">Pelanggan pertama akan segera muncul</p>
                <p className="text-sm text-gray-400 mb-8 max-w-sm leading-relaxed">
                  Setiap kali ada yang checkout di tokomu, profilnya otomatis tersimpan — nama, WhatsApp, riwayat belanja, dan AstraPoints.
                </p>

                {/* Preview card */}
                <div className="bg-gray-50 border border-dashed border-gray-200 rounded-2xl p-5 w-full max-w-sm mb-8 text-left opacity-60 select-none">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-9 h-9 rounded-xl bg-app-blue flex items-center justify-center text-white font-extrabold text-sm flex-shrink-0">D</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900">Dian Pratiwi</p>
                      <p className="text-xs text-gray-400">0812****5678</p>
                    </div>
                    <span className="text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full flex-shrink-0">⭐ VIP</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: 'Riwayat Belanja', value: '5× pesanan' },
                      { label: 'Total Spend',      value: 'Rp 750.000' },
                      { label: 'AstraPoints',      value: '⚡ 250 poin' },
                      { label: 'Terakhir Beli',   value: '2 hr lalu' },
                    ].map(row => (
                      <div key={row.label} className="bg-white rounded-xl px-3 py-2 border border-gray-100">
                        <p className="text-[10px] text-gray-400">{row.label}</p>
                        <p className="text-xs font-bold text-gray-700 mt-0.5">{row.value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <button onClick={handleBroadcast}
                  className="flex items-center gap-2 bg-[#25D366] hover:bg-[#1db954] text-white font-bold px-5 py-3 rounded-xl text-sm transition-colors"
                >
                  <Share2 size={14} /> Bagikan Toko via WhatsApp
                </button>
              </div>
            ) : filtered.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 px-8 py-12 text-center">
                <p className="text-sm text-gray-400">Tidak ada pelanggan dengan filter ini.</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                <div className="grid grid-cols-[40px_200px_110px_1fr_120px_120px_80px_100px_92px] gap-3 px-6 py-3 bg-gray-50/60 border-b border-gray-50">
                  {['', 'Pelanggan', 'Status', 'Produk Terakhir', 'Pesanan', 'Total Belanja', 'Poin', 'Terakhir', ''].map((h, i) => (
                    <p key={i} className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">{h}</p>
                  ))}
                </div>
                <div className="divide-y divide-gray-50">
                  {filtered.map((customer, i) => {
                    const bgColor  = AVATAR_COLORS[i % AVATAR_COLORS.length]
                    const waPhone  = customer.phone.startsWith('0') ? '62' + customer.phone.slice(1) : customer.phone.replace(/^\+/, '')
                    const promoMsg = encodeURIComponent(
                      `Halo ${customer.name}! Ada promo spesial dari ${seller?.name ?? 'toko kami'} — belanja lagi & dapat ${customer.points + 100} AstraPoints bonus! 🎁`
                    )
                    return (
                      <div key={customer.phone}
                        className="grid grid-cols-[40px_200px_110px_1fr_120px_120px_80px_100px_92px] gap-3 items-center px-6 py-4 hover:bg-gray-50/50 transition-colors group"
                      >
                        <a href={`/customers/${encodeURIComponent(customer.phone)}`}
                          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-white font-extrabold text-sm hover:ring-2 hover:ring-app-blue hover:ring-offset-1 transition-all" style={{ backgroundColor: bgColor }}>
                          {customer.initial}
                        </a>
                        <div className="min-w-0">
                          <a href={`/customers/${encodeURIComponent(customer.phone)}`} className="text-sm font-semibold text-gray-900 truncate hover:text-app-blue transition-colors block">{customer.name}</a>
                          <p className="text-xs text-gray-400 mt-0.5">{customer.maskedPhone}</p>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-lg leading-none w-fit ${customer.badge.cls}`}>
                          {customer.badge.icon} {customer.badge.label}
                        </span>
                        <p className="text-sm text-gray-600 truncate">{customer.lastProduct}</p>
                        <p className="text-sm font-bold text-gray-900">{customer.orderCount}× pesanan</p>
                        <p className="text-sm font-bold text-gray-900">{formatRp(customer.totalSpend)}</p>
                        <p className="text-sm font-bold text-astrapay-gold">⚡ {customer.points}</p>
                        <p className="text-xs text-gray-400">{relativeTime(customer.lastOrderTime)}</p>
                        <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <a href={`https://wa.me/${waPhone}`} target="_blank" rel="noopener noreferrer"
                            title="Chat WhatsApp"
                            className="w-8 h-8 bg-[#25D366] hover:bg-[#1db954] rounded-lg flex items-center justify-center transition-colors"
                          >
                            <MessageCircle size={13} className="text-white" />
                          </a>
                          <a href={`https://wa.me/${waPhone}?text=${promoMsg}`} target="_blank" rel="noopener noreferrer"
                            title="Kirim Promosi"
                            className="w-8 h-8 bg-app-blue hover:bg-app-blue-light rounded-lg flex items-center justify-center transition-colors"
                          >
                            <Share2 size={12} className="text-white" />
                          </a>
                          <button title="Beri AstraPoints"
                            onClick={() => showToast(`⭐ 100 AstraPoints dikirim ke ${customer.name}!`)}
                            className="w-8 h-8 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg flex items-center justify-center transition-colors"
                          >
                            <Gift size={12} className="text-amber-600" />
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      <div className="lg:hidden min-h-screen bg-[#F4F6F8] flex items-center justify-center p-8">
        <div className="text-center max-w-xs">
          <p className="text-4xl mb-4">💻</p>
          <p className="font-extrabold text-gray-900 text-lg mb-2">Buka di Desktop</p>
          <Link href="/dashboard" className="inline-flex items-center gap-2 bg-app-blue text-white font-bold px-5 py-3 rounded-xl text-sm hover:bg-app-blue-light transition-colors">
            ← Kembali ke Dashboard
          </Link>
        </div>
      </div>
    </>
  )
}
