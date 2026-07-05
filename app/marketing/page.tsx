'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ChevronRight, Megaphone, Star, Gift } from 'lucide-react'
import { Sidebar } from '@/components/Sidebar'
import type { Seller, Product, Order } from '@/lib/types'

export default function MarketingPage() {
  const [seller,   setSeller]   = useState<Seller | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [orders,   setOrders]   = useState<Order[]>([])
  useEffect(() => {
    const slug = (typeof localStorage !== 'undefined' && localStorage.getItem('seller_slug')) || '__no_seller__'
    Promise.all([
      fetch(`/api/sellers/${slug}`).then(r => r.json()),
      fetch(`/api/orders?slug=${slug}`).then(r => r.json()),
    ]).then(([sellerJson, ordersJson]) => {
      if (sellerJson.seller)   setSeller(sellerJson.seller)
      if (sellerJson.products) setProducts(sellerJson.products)
      setOrders(ordersJson.orders ?? [])
    })
  }, [])

  const uniqueCustomers = new Set(orders.filter(o => o.status === 'paid').map(o => o.buyer_phone)).size

  return (
    <>
      <div className="hidden lg:flex h-screen bg-[#F4F6F8] overflow-hidden">
        <Sidebar
          seller={seller}
          counts={{ products: products.length, orders: orders.length, customers: uniqueCustomers }}
        />

        <main className="flex-1 overflow-y-auto">
          <header className="sticky top-0 z-10 bg-white/90 backdrop-blur-md border-b border-gray-100 px-8 py-4">
            <div className="flex items-center gap-2 text-sm text-gray-400 mb-0.5">
              <Link href="/dashboard" className="hover:text-gray-600 transition-colors">Overview</Link>
              <ChevronRight size={12} />
              <span className="text-gray-700 font-medium">Marketing</span>
            </div>
            <p className="text-base font-extrabold text-gray-900 leading-tight">Marketing</p>
          </header>

          <div className="px-8 py-16 flex flex-col items-center text-center max-w-lg mx-auto">
            <div className="w-16 h-16 bg-app-blue/10 rounded-2xl flex items-center justify-center mb-6 border border-app-blue/10">
              <Megaphone size={28} className="text-app-blue" />
            </div>
            <div className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-700 text-xs font-bold px-3 py-1 rounded-full mb-4 border border-amber-200">
              🚧 Dalam Pengembangan
            </div>
            <h2 className="text-xl font-extrabold text-gray-900 mb-3">Marketing Center</h2>
            <p className="text-sm text-gray-500 leading-relaxed mb-8">
              Fitur marketing sedang dalam pengembangan. Segera hadir: broadcast WhatsApp ke semua pelanggan, loyalty card, reward campaign, dan promosi produk otomatis.
            </p>
            <div className="grid grid-cols-3 gap-4 w-full mb-8">
              {[
                { icon: Megaphone, label: 'Broadcast WA', sub: 'Kirim pesan ke semua pelanggan' },
                { icon: Star,      label: 'Loyalty Card', sub: 'AstraPoints & tier rewards' },
                { icon: Gift,      label: 'Campaign',     sub: 'Diskon & promosi terjadwal' },
              ].map(({ icon: Icon, label, sub }) => (
                <div key={label} className="bg-white rounded-2xl border border-gray-100 p-5 text-center opacity-50">
                  <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Icon size={18} className="text-gray-400" />
                  </div>
                  <p className="text-sm font-bold text-gray-700 mb-1">{label}</p>
                  <p className="text-xs text-gray-400">{sub}</p>
                </div>
              ))}
            </div>
            <Link href="/customers"
              className="flex items-center gap-2 text-sm font-semibold text-app-blue hover:text-app-blue-light transition-colors"
            >
              Kelola pelanggan sekarang <ChevronRight size={13} />
            </Link>
          </div>
        </main>
      </div>

      <div className="lg:hidden min-h-screen bg-[#F4F6F8] flex items-center justify-center p-8">
        <div className="text-center">
          <p className="text-4xl mb-4">💻</p>
          <Link href="/dashboard" className="inline-flex items-center gap-2 bg-app-blue text-white font-bold px-5 py-3 rounded-xl text-sm">
            ← Dashboard
          </Link>
        </div>
      </div>
    </>
  )
}
