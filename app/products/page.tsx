'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import {
  Search, Upload, Plus, Package, ChevronRight, CheckCircle,
} from 'lucide-react'
import { formatRp } from '@/lib/utils'
import { getCategoryStyle, CATEGORY_STYLE } from '@/lib/categories'
import { Sidebar } from '@/components/Sidebar'
import type { Seller, Product, Order } from '@/lib/types'

function Toast({ message }: { message: string }) {
  return (
    <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-2 bg-gray-900 text-white text-sm font-medium px-4 py-2.5 rounded-full shadow-xl animate-fadein">
      <CheckCircle size={14} className="text-green-400 flex-shrink-0" />
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
        <div className="h-12 bg-white rounded-xl animate-pulse" />
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-16 bg-white rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  )
}

export default function ProductsPage() {
  const [seller,   setSeller]   = useState<Seller | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [orders,   setOrders]   = useState<Order[]>([])
  const [loading,  setLoading]  = useState(true)
  const [search,   setSearch]   = useState('')
  const [category, setCategory] = useState('all')
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

  // Sales count per product
  const salesCount: Record<string, number> = {}
  orders.filter(o => o.status === 'paid').forEach(o => {
    if (o.product_id) salesCount[o.product_id] = (salesCount[o.product_id] ?? 0) + 1
  })

  const categories = ['all', ...Object.keys(CATEGORY_STYLE)]
  const filtered = products.filter(p => {
    const matchSearch = search === '' || p.name.toLowerCase().includes(search.toLowerCase())
    const matchCat    = category === 'all' || p.category === category
    return matchSearch && matchCat
  })

  const topProductId = Object.entries(salesCount).sort((a, b) => b[1] - a[1])[0]?.[0]

  return (
    <>
      <div className="hidden lg:flex h-screen bg-[#F4F6F8] overflow-hidden">
        {toast && <Toast message={toast} />}

        <Sidebar
          seller={seller}
          counts={{ products: products.length, orders: orders.length }}
        />

        <main className="flex-1 overflow-y-auto">
          {/* Top bar */}
          <header className="sticky top-0 z-10 bg-white/90 backdrop-blur-md border-b border-gray-100 px-8 py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-base font-extrabold text-gray-900 leading-tight">Products</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {products.length > 0
                    ? `${products.length} produk · ${products.filter(p => p.stock > 0).length} aktif · ${products.filter(p => p.stock === 0).length} habis`
                    : 'Belum ada produk'}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Link href="/import"
                  className="flex items-center gap-2 bg-gray-50 hover:bg-gray-100 text-gray-700 font-semibold px-4 py-2 rounded-xl text-sm border border-gray-100 transition-colors"
                >
                  <Upload size={14} /> Import CSV
                </Link>
                <button
                  onClick={() => showToast('Tambah produk manual segera hadir 🚀')}
                  className="flex items-center gap-2 bg-app-blue hover:bg-app-blue-light text-white font-semibold px-4 py-2 rounded-xl text-sm transition-colors"
                >
                  <Plus size={14} /> Tambah Produk
                </button>
              </div>
            </div>
          </header>

          <div className="px-8 py-6 space-y-5 pb-16">

            {/* Stats bar */}
            {products.length > 0 && (
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span className="text-sm text-gray-600 font-medium">{products.length} produk aktif</span>
                </div>
                <div className="text-sm text-gray-400">
                  {Object.keys(CATEGORY_STYLE).filter(cat => products.some(p => p.category === cat)).length} kategori
                </div>
                {topProductId && (
                  <div className="text-sm text-gray-400">
                    Terlaris: <span className="font-semibold text-gray-700">{products.find(p => p.id === topProductId)?.name}</span>
                    <span className="ml-1 text-app-blue font-semibold">({salesCount[topProductId]}× terjual)</span>
                  </div>
                )}
              </div>
            )}

            {/* Search + filter */}
            <div className="flex items-center gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
                <input
                  value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Cari nama produk..."
                  className="w-full pl-9 pr-3 py-2.5 bg-white border border-gray-100 rounded-xl text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:border-app-blue/30 transition-colors shadow-sm"
                />
              </div>
              <div className="flex items-center gap-1 bg-white border border-gray-100 rounded-xl p-1 shadow-sm overflow-x-auto">
                {categories.map(cat => (
                  <button key={cat} onClick={() => setCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                      category === cat ? 'bg-app-blue text-white shadow-sm' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {cat === 'all' ? 'Semua' : cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Product list */}
            {products.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 px-8 py-16 flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-4 border border-gray-100">
                  <Package size={24} className="text-gray-300" />
                </div>
                <p className="font-semibold text-gray-900 mb-1">Belum ada produk</p>
                <p className="text-sm text-gray-400 mb-6 max-w-xs leading-relaxed">
                  Import produkmu dari Shopee, Tokopedia, atau TikTok Shop dengan file CSV.
                </p>
                <Link href="/import"
                  className="flex items-center gap-2 bg-app-blue hover:bg-app-blue-light text-white font-bold px-5 py-3 rounded-xl text-sm transition-colors"
                >
                  <Upload size={14} /> Import Produk Sekarang
                </Link>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                {/* Table header */}
                <div className="grid grid-cols-[48px_1fr_130px_120px_70px_90px_100px_88px] gap-3 px-6 py-3 bg-gray-50/60 border-b border-gray-50">
                  {['', 'Nama Produk', 'Kategori', 'Harga', 'Stok', 'Status', 'Terjual', ''].map((h, i) => (
                    <p key={i} className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">{h}</p>
                  ))}
                </div>

                {filtered.length === 0 ? (
                  <div className="px-6 py-10 text-center">
                    <p className="text-sm text-gray-400">Tidak ada produk yang cocok dengan filter ini.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-50">
                    {filtered.map(product => {
                      const { color, Icon } = getCategoryStyle(product.category)
                      const sold   = salesCount[product.id] ?? 0
                      const isTop  = product.id === topProductId && sold > 0
                      const isOOS  = product.stock === 0
                      return (
                        <div key={product.id}
                          className="grid grid-cols-[48px_1fr_130px_120px_70px_90px_100px_88px] gap-3 items-center px-6 py-4 hover:bg-gray-50/50 transition-colors group"
                        >
                          {/* Icon */}
                          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 relative" style={{ backgroundColor: color }}>
                            <Icon size={15} className="text-white" />
                          </div>

                          {/* Name */}
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-semibold text-gray-900 truncate">{product.name}</p>
                              {isTop && (
                                <span className="text-[9px] font-bold bg-amber-100 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded-full leading-none flex-shrink-0">
                                  🏆
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Category */}
                          <span className="text-xs font-medium text-gray-500 bg-gray-50 px-2.5 py-1 rounded-lg w-fit">{product.category}</span>

                          {/* Price */}
                          <p className="text-sm font-bold text-gray-900">{formatRp(product.price)}</p>

                          {/* Stock */}
                          <p className={`text-sm font-semibold ${isOOS ? 'text-red-500' : 'text-gray-700'}`}>
                            {isOOS ? '—' : product.stock}
                          </p>

                          {/* Status badge */}
                          {isOOS ? (
                            <span className="text-[10px] font-bold bg-red-50 text-red-600 border border-red-200 px-2 py-1 rounded-lg w-fit">
                              Habis
                            </span>
                          ) : sold > 0 ? (
                            <span className="text-[10px] font-bold bg-green-50 text-green-700 border border-green-200 px-2 py-1 rounded-lg w-fit">
                              Aktif
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold bg-gray-50 text-gray-500 border border-gray-200 px-2 py-1 rounded-lg w-fit">
                              Draft
                            </span>
                          )}

                          {/* Sold */}
                          <p className="text-sm">
                            {sold > 0 ? <span className="font-semibold text-app-blue">{sold}× terjual</span> : <span className="text-gray-300">—</span>}
                          </p>

                          {/* Actions */}
                          <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => showToast('Edit produk segera hadir 🚀')}
                              className="text-xs font-semibold text-gray-500 hover:text-gray-800 px-2.5 py-1.5 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => showToast('Produk diarsipkan 🗂️')}
                              className="text-xs font-semibold text-red-400 hover:text-red-600 px-2 py-1.5 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                            >
                              ⋯
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Import nudge */}
            {products.length > 0 && (
              <div className="flex items-center justify-between bg-white border border-gray-100 rounded-2xl px-6 py-4 shadow-sm">
                <div>
                  <p className="text-sm font-semibold text-gray-800">Tambah lebih banyak produk?</p>
                  <p className="text-xs text-gray-400 mt-0.5">Import langsung dari Shopee, Tokopedia, atau TikTok Shop.</p>
                </div>
                <Link href="/import"
                  className="flex items-center gap-2 text-sm font-semibold text-app-blue hover:text-app-blue-light transition-colors flex-shrink-0"
                >
                  <Upload size={13} /> Import CSV <ChevronRight size={13} />
                </Link>
              </div>
            )}

          </div>
        </main>
      </div>

      {/* Mobile fallback */}
      <div className="lg:hidden min-h-screen bg-[#F4F6F8] flex items-center justify-center p-8">
        <div className="text-center max-w-xs">
          <p className="text-4xl mb-4">💻</p>
          <p className="font-extrabold text-gray-900 text-lg mb-2">Buka di Desktop</p>
          <p className="text-sm text-gray-500 mb-6 leading-relaxed">Dashboard merchant AstraToko dioptimalkan untuk layar desktop.</p>
          <Link href="/dashboard" className="inline-flex items-center gap-2 bg-app-blue text-white font-bold px-5 py-3 rounded-xl text-sm hover:bg-app-blue-light transition-colors">
            ← Kembali ke Dashboard
          </Link>
        </div>
      </div>
    </>
  )
}
