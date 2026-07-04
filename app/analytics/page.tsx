'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ChevronRight, BarChart3 } from 'lucide-react'
import { Sidebar } from '@/components/Sidebar'
import type { Seller, Product, Order } from '@/lib/types'

export default function AnalyticsPage() {
  const [seller,   setSeller]   = useState<Seller | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [orders,   setOrders]   = useState<Order[]>([])
  useEffect(() => {
    const slug = (typeof localStorage !== 'undefined' && localStorage.getItem('seller_slug')) || 'toko-rizky'
    Promise.all([
      fetch(`/api/sellers/${slug}`).then(r => r.json()),
      fetch(`/api/orders?slug=${slug}`).then(r => r.json()),
    ]).then(([s, o]) => {
      if (s.seller)   setSeller(s.seller)
      if (s.products) setProducts(s.products)
      setOrders(o.orders ?? [])
    })
  }, [])

  const uniqueCustomers = new Set(orders.filter(o => o.status === 'paid').map(o => o.buyer_phone)).size

  return (
    <>
      <div className="hidden lg:flex h-screen bg-[#F4F6F8] overflow-hidden">
        <Sidebar seller={seller} counts={{ products: products.length, orders: orders.length, customers: uniqueCustomers }} />
        <main className="flex-1 overflow-y-auto">
          <header className="sticky top-0 z-10 bg-white/90 backdrop-blur-md border-b border-gray-100 px-8 py-4">
            <div className="flex items-center gap-2 text-sm text-gray-400 mb-0.5">
              <Link href="/dashboard" className="hover:text-gray-600">Overview</Link>
              <ChevronRight size={12} />
              <span className="text-gray-700 font-medium">Analytics</span>
            </div>
            <p className="text-base font-extrabold text-gray-900">Analytics</p>
          </header>
          <div className="px-8 py-16 flex flex-col items-center text-center max-w-md mx-auto">
            <div className="w-16 h-16 bg-app-blue/10 rounded-2xl flex items-center justify-center mb-6 border border-app-blue/10">
              <BarChart3 size={28} className="text-app-blue" />
            </div>
            <div className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-700 text-xs font-bold px-3 py-1 rounded-full mb-4 border border-amber-200">
              🚧 Dalam Pengembangan
            </div>
            <h2 className="text-xl font-extrabold text-gray-900 mb-3">Business Analytics</h2>
            <p className="text-sm text-gray-500 leading-relaxed mb-6">
              Segera hadir: tren penjualan, analisis produk terlaris, perbandingan biaya marketplace, dan insight otomatis berbasis AI.
            </p>
            <Link href="/dashboard"
              className="flex items-center gap-2 text-sm font-semibold text-app-blue hover:text-app-blue-light transition-colors"
            >
              Lihat ringkasan di Overview <ChevronRight size={13} />
            </Link>
          </div>
        </main>
      </div>
      <div className="lg:hidden min-h-screen bg-[#F4F6F8] flex items-center justify-center p-8">
        <Link href="/dashboard" className="inline-flex items-center gap-2 bg-app-blue text-white font-bold px-5 py-3 rounded-xl text-sm">← Dashboard</Link>
      </div>
    </>
  )
}
