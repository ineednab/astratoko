'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { ChevronRight, ShoppingBag } from 'lucide-react'
import { formatRp } from '@/lib/utils'
import { orderAmount } from '@/lib/metrics'
import { getCategoryStyle } from '@/lib/categories'
import { supabase } from '@/lib/supabase'
import { Sidebar } from '@/components/Sidebar'
import type { Seller, Order, Product } from '@/lib/types'

type StatusFilter = 'all' | 'paid' | 'pending' | 'cancelled'

function relativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60_000)
  if (m < 1)  return 'Baru saja'
  if (m < 60) return `${m} mnt lalu`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h} jam lalu`
  const d = Math.floor(h / 24)
  return d === 1 ? 'Kemarin' : `${d} hr lalu`
}

function Skeleton() {
  return (
    <div className="flex h-screen bg-[#F4F6F8] overflow-hidden">
      <div className="w-64 bg-white border-r border-gray-100 flex-shrink-0 animate-pulse" />
      <div className="flex-1 p-8 space-y-4">
        <div className="h-10 bg-gray-100 rounded-xl w-48 animate-pulse" />
        <div className="h-12 bg-white rounded-xl animate-pulse" />
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-14 bg-white rounded-xl animate-pulse" />
        ))}
      </div>
    </div>
  )
}

export default function OrdersPage() {
  const [seller,   setSeller]   = useState<Seller | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [orders,   setOrders]   = useState<Order[]>([])
  const [loading,  setLoading]  = useState(true)
  const [filter,   setFilter]   = useState<StatusFilter>('all')

  const sellerIdRef = useRef<string | null>(null)

  useEffect(() => {
    const slug = (typeof localStorage !== 'undefined' && localStorage.getItem('seller_slug')) || '__no_seller__'
    Promise.all([
      fetch(`/api/sellers/${slug}`).then(r => r.json()),
      fetch(`/api/orders?slug=${slug}`).then(r => r.json()),
    ]).then(([sellerJson, ordersJson]) => {
      if (sellerJson.seller) {
        setSeller(sellerJson.seller)
        sellerIdRef.current = sellerJson.seller.id
      }
      if (sellerJson.products) setProducts(sellerJson.products)
      setOrders(ordersJson.orders ?? [])
    }).finally(() => setLoading(false))
  }, [])

  // Realtime
  useEffect(() => {
    if (!sellerIdRef.current) return
    const channel = supabase.channel(`orders:${sellerIdRef.current}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders', filter: `seller_id=eq.${sellerIdRef.current}` },
        payload => setOrders(prev => [payload.new as Order, ...prev])
      ).subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [loading])

  if (loading) return <Skeleton />

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter)

  const paidCount     = orders.filter(o => o.status === 'paid').length
  const pendingCount  = orders.filter(o => o.status === 'pending').length
  const gmv           = orders.filter(o => o.status === 'paid').reduce((s, o) => s + orderAmount(o), 0)

  const uniqueCustomers = new Set(
    orders.filter(o => o.status === 'paid').map(o => o.buyer_phone)
  ).size

  return (
    <>
      <div className="hidden lg:flex h-screen bg-[#F4F6F8] overflow-hidden">
        <Sidebar
          seller={seller}
          counts={{ products: products.length, orders: orders.length, customers: uniqueCustomers }}
        />

        <main className="flex-1 overflow-y-auto">
          <header className="sticky top-0 z-10 bg-white/90 backdrop-blur-md border-b border-gray-100 px-8 py-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 text-sm text-gray-400 mb-0.5">
                  <Link href="/dashboard" className="hover:text-gray-600 transition-colors">Overview</Link>
                  <ChevronRight size={12} />
                  <span className="text-gray-700 font-medium">Orders</span>
                </div>
                <p className="text-base font-extrabold text-gray-900 leading-tight">
                  {orders.length > 0 ? `${orders.length} Pesanan` : 'Pesanan'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <p className="text-xs text-gray-400 font-medium">Realtime via Supabase</p>
              </div>
            </div>
          </header>

          <div className="px-8 py-6 space-y-5 pb-16">

            {/* Summary bar */}
            {orders.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 px-6 py-5 flex items-center gap-5 shadow-sm">
                <div className="w-11 h-11 bg-app-blue/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <ShoppingBag size={20} className="text-app-blue" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-extrabold text-gray-900">Menunggu Pesanan Pertama</p>
                  <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">
                    Setiap kali pelanggan checkout di toko kamu, pesanannya langsung muncul di sini — realtime, tanpa perlu refresh.
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <p className="text-xs text-gray-500 font-medium">Live</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: 'Total Pesanan', value: orders.length, sub: 'semua waktu' },
                  { label: 'Lunas',         value: paidCount,     sub: `GMV Rp ${Math.round(gmv / 1000)}rb` },
                  { label: 'Menunggu',      value: pendingCount,  sub: 'perlu tindakan' },
                ].map(stat => (
                  <div key={stat.label} className="bg-white rounded-2xl border border-gray-100 px-5 py-4 shadow-sm">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">{stat.label}</p>
                    <p className="text-2xl font-extrabold text-gray-900 leading-none">{stat.value}</p>
                    <p className="text-xs text-gray-400 mt-1">{stat.sub}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Filter tabs */}
            <div className="flex items-center gap-1 bg-white border border-gray-100 rounded-xl p-1 w-fit shadow-sm">
              {([
                { key: 'all',       label: `Semua (${orders.length})` },
                { key: 'paid',      label: `Lunas (${paidCount})` },
                { key: 'pending',   label: `Pending (${pendingCount})` },
                { key: 'cancelled', label: `Batal (${orders.filter(o => o.status === 'cancelled').length})` },
              ] as const).map(f => (
                <button key={f.key} onClick={() => setFilter(f.key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    filter === f.key ? 'bg-app-blue text-white shadow-sm' : 'text-gray-400 hover:text-gray-600'
                  }`}
                >{f.label}</button>
              ))}
            </div>

            {/* Orders table */}
            {filtered.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 px-8 py-16 flex flex-col items-center text-center">
                <ShoppingBag size={24} className="text-gray-200 mb-3" />
                <p className="font-semibold text-gray-900 text-sm mb-1">
                  {orders.length === 0 ? 'Belum ada pesanan' : 'Tidak ada pesanan dengan filter ini'}
                </p>
                <p className="text-xs text-gray-400">
                  {orders.length === 0 ? 'Pesanan baru akan muncul di sini secara otomatis.' : 'Coba ubah filter di atas.'}
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                <div className="grid grid-cols-[80px_1.5fr_2fr_1.2fr_90px_1fr] gap-4 px-6 py-3 bg-gray-50/60 border-b border-gray-50">
                  {['Order ID', 'Pelanggan', 'Produk', 'Jumlah', 'Status', 'Waktu'].map(h => (
                    <p key={h} className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">{h}</p>
                  ))}
                </div>
                <div className="divide-y divide-gray-50">
                  {filtered.map(order => {
                    const { color, Icon } = getCategoryStyle(order.category)
                    return (
                      <div key={order.id}
                        className="grid grid-cols-[80px_1.5fr_2fr_1.2fr_90px_1fr] gap-4 items-center px-6 py-3.5 hover:bg-gray-50/50 transition-colors"
                      >
                        <p className="text-xs font-mono text-gray-400">#{order.id.slice(0, 8).toUpperCase()}</p>
                        <div>
                          <p className="text-sm font-semibold text-gray-900 truncate">{order.buyer_name || 'Pembeli'}</p>
                          <p className="text-xs text-gray-400 truncate">{order.buyer_phone}</p>
                        </div>
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: color }}>
                            <Icon size={11} className="text-white" />
                          </div>
                          <p className="text-sm text-gray-700 truncate">{order.product_name}</p>
                        </div>
                        <p className="text-sm font-bold text-gray-900">{formatRp(order.price)}</p>
                        <span className={`text-xs font-semibold px-2 py-1 rounded-lg w-fit ${
                          order.status === 'paid'    ? 'bg-green-100 text-green-700' :
                          order.status === 'pending' ? 'bg-blue-100 text-app-blue'  : 'bg-gray-100 text-gray-500'
                        }`}>
                          {order.status === 'paid' ? 'Lunas' : order.status === 'pending' ? 'Pending' : 'Batal'}
                        </span>
                        <p className="text-xs text-gray-400">{relativeTime(order.created_at)}</p>
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
