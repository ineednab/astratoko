'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ChevronRight, Settings, ExternalLink, Zap, Copy, CheckCircle } from 'lucide-react'
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

export default function SettingsPage() {
  const [seller,      setSeller]      = useState<Seller | null>(null)
  const [products,    setProducts]    = useState<Product[]>([])
  const [orders,      setOrders]      = useState<Order[]>([])
  const [toast,       setToast]       = useState('')
  const [bannerUrl,   setBannerUrl]   = useState('')
  const [savingBanner, setSavingBanner] = useState(false)

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 2500) }

  useEffect(() => {
    const slug = (typeof localStorage !== 'undefined' && localStorage.getItem('seller_slug')) || '__no_seller__'
    Promise.all([
      fetch(`/api/sellers/${slug}`).then(r => r.json()),
      fetch(`/api/orders?slug=${slug}`).then(r => r.json()),
    ]).then(([s, o]) => {
      if (s.seller)   { setSeller(s.seller); setBannerUrl(s.seller.banner_image_url ?? '') }
      if (s.products) setProducts(s.products)
      setOrders(o.orders ?? [])
    })
  }, [])

  const uniqueCustomers = new Set(orders.filter(o => o.status === 'paid').map(o => o.buyer_phone)).size

  async function saveBannerUrl() {
    if (!seller) return
    setSavingBanner(true)
    const res = await fetch(`/api/sellers/${seller.slug}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ banner_image_url: bannerUrl.trim() || null }),
    })
    setSavingBanner(false)
    if (res.ok) {
      const { seller: updated } = await res.json()
      setSeller(updated)
      showToast('Gambar banner tersimpan ✓')
    } else {
      showToast('Gagal menyimpan, coba lagi')
    }
  }

  const storeUrl = seller ? `${typeof window !== 'undefined' ? window.location.origin : ''}/toko/${seller.slug}` : ''

  return (
    <>
      <div className="hidden lg:flex h-screen bg-[#F4F6F8] overflow-hidden">
        {toast && <Toast message={toast} />}
        <Sidebar seller={seller} counts={{ products: products.length, orders: orders.length, customers: uniqueCustomers }} />
        <main className="flex-1 overflow-y-auto">
          <header className="sticky top-0 z-10 bg-white/90 backdrop-blur-md border-b border-gray-100 px-8 py-4">
            <div className="flex items-center gap-2 text-sm text-gray-400 mb-0.5">
              <Link href="/dashboard" className="hover:text-gray-600">Overview</Link>
              <ChevronRight size={12} />
              <span className="text-gray-700 font-medium">Settings</span>
            </div>
            <p className="text-base font-extrabold text-gray-900">Settings</p>
          </header>

          {seller ? (
            <div className="px-8 py-6 space-y-5 pb-16 max-w-2xl">
              {/* Store Info */}
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                <div className="px-6 py-4 border-b border-gray-50">
                  <h3 className="font-extrabold text-gray-900">Informasi Toko</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Detail dasar tokomu di AstraToko</p>
                </div>
                <div className="px-6 py-5 space-y-4">
                  {[
                    { label: 'Nama Toko', value: seller.name },
                    { label: 'Lokasi', value: seller.location },
                    { label: 'WhatsApp', value: seller.whatsapp },
                    { label: 'Platform Asal', value: seller.platform },
                  ].map(row => (
                    <div key={row.label} className="flex items-center justify-between py-1">
                      <p className="text-sm text-gray-500 font-medium">{row.label}</p>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-gray-900">{row.value}</p>
                        <button onClick={() => showToast('Edit toko segera hadir 🚀')}
                          className="text-xs text-gray-400 hover:text-app-blue transition-colors"
                        >Edit</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Store URL */}
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                <div className="px-6 py-4 border-b border-gray-50">
                  <h3 className="font-extrabold text-gray-900">Link Toko</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Bagikan link ini ke pelangganmu</p>
                </div>
                <div className="px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-gray-50 border border-gray-100 rounded-xl px-4 py-3">
                      <p className="text-sm text-gray-600 font-mono truncate">{storeUrl || '/toko/...'}</p>
                    </div>
                    <button
                      onClick={() => { if (storeUrl) { navigator.clipboard.writeText(storeUrl); showToast('Link tersalin! 📋') } }}
                      className="flex items-center gap-2 px-4 py-3 bg-gray-50 hover:bg-gray-100 border border-gray-100 rounded-xl text-sm font-semibold text-gray-700 transition-colors"
                    >
                      <Copy size={14} /> Salin
                    </button>
                    <Link href={`/toko/${seller.slug}`} target="_blank"
                      className="flex items-center gap-2 px-4 py-3 bg-app-blue hover:bg-app-blue-light text-white rounded-xl text-sm font-semibold transition-colors"
                    >
                      <ExternalLink size={14} /> Buka
                    </Link>
                  </div>
                </div>
              </div>

              {/* Banner Toko */}
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                <div className="px-6 py-4 border-b border-gray-50">
                  <h3 className="font-extrabold text-gray-900">Banner Toko</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Gambar produk/brand yang tampil di banner storefront</p>
                </div>
                <div className="px-6 py-5 space-y-3">
                  {seller.banner_image_url && (
                    <div className="rounded-xl overflow-hidden border border-gray-100 h-24 bg-gradient-to-r from-[#0f1c40] to-[#1E3A8A] flex items-center justify-end pr-2">
                      <img src={seller.banner_image_url} alt="Banner preview" className="h-full w-auto object-contain" />
                    </div>
                  )}
                  <div className="flex gap-2">
                    <input
                      type="url"
                      placeholder="https://... (URL gambar PNG/JPG)"
                      value={bannerUrl}
                      onChange={e => setBannerUrl(e.target.value)}
                      className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-app-blue/20 focus:border-app-blue transition-colors"
                    />
                    <button
                      onClick={saveBannerUrl}
                      disabled={savingBanner}
                      className="px-4 py-2.5 bg-app-blue hover:bg-app-blue-light text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
                    >
                      {savingBanner ? 'Menyimpan...' : 'Simpan'}
                    </button>
                  </div>
                  {bannerUrl && bannerUrl !== seller.banner_image_url && (
                    <p className="text-xs text-amber-600">Perubahan belum disimpan</p>
                  )}
                </div>
              </div>

              {/* AstraPay */}
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                <div className="px-6 py-4 border-b border-gray-50">
                  <div className="flex items-center gap-2">
                    <Zap size={15} className="text-astrapay-gold" fill="currentColor" />
                    <h3 className="font-extrabold text-gray-900">AstraPay QRIS</h3>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">Status integrasi pembayaran</p>
                </div>
                <div className="px-6 py-5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <p className="text-sm font-semibold text-gray-900">QRIS Aktif</p>
                  </div>
                  <span className="text-xs font-bold bg-green-100 text-green-700 border border-green-200 px-2.5 py-1 rounded-full">
                    Fee {Math.round(seller.astratoko_fee_pct * 100)}% vs {Math.round(seller.platform_fee_pct * 100)}% marketplace
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="px-8 py-16 flex flex-col items-center text-center">
              <Settings size={28} className="text-gray-300 mb-4" />
              <p className="font-semibold text-gray-900 mb-1">Memuat pengaturan...</p>
            </div>
          )}
        </main>
      </div>

      <div className="lg:hidden min-h-screen bg-[#F4F6F8] flex items-center justify-center p-8">
        <Link href="/dashboard" className="inline-flex items-center gap-2 bg-app-blue text-white font-bold px-5 py-3 rounded-xl text-sm">← Dashboard</Link>
      </div>
    </>
  )
}
