'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import {
  Share2, Plus, ShoppingBag, ChevronRight, Zap,
  CheckCircle, Wrench, Droplets, Shield, Wind, Settings, Gem, Circle,
  type LucideIcon,
} from 'lucide-react'

const SELLER = {
  name: 'Toko Rizky',
  slug: 'toko-rizky',
  initial: 'R',
  balance: 1_250_000,
  gmv: 18_400_000,
  gmvChange: 23,
  orders: 84,
  savings: 2_300_000,
}

const CATEGORY_ICONS: Record<string, { color: string; Icon: LucideIcon }> = {
  Oli:       { color: '#2F9E44', Icon: Droplets },
  Helm:      { color: '#F08C00', Icon: Shield },
  Rem:       { color: '#3B5BDB', Icon: Wrench },
  Filter:    { color: '#7048E8', Icon: Wind },
  Mesin:     { color: '#0C8599', Icon: Settings },
  Transmisi: { color: '#C92A2A', Icon: Circle },
  Aksesoris: { color: '#D6336C', Icon: Gem },
  Elektrik:  { color: '#E67700', Icon: Zap },
  Ban:       { color: '#495057', Icon: ShoppingBag },
}

function getCategoryStyle(category: string) {
  return CATEGORY_ICONS[category] ?? { color: '#3B5BDB', Icon: ShoppingBag }
}

function formatRp(n: number) {
  return 'Rp ' + n.toLocaleString('id-ID')
}

function formatRpShort(n: number) {
  if (n >= 1_000_000) {
    const val = n / 1_000_000
    return `Rp ${val.toLocaleString('id-ID', { maximumFractionDigits: 1 })} jt`
  }
  if (n >= 1_000) {
    return `Rp ${Math.round(n / 1_000).toLocaleString('id-ID')} rb`
  }
  return formatRp(n)
}

const ALL_ORDERS = [
  { id: '1', product: 'Oli Federal Matic 1L',   buyer: 'Budi Santoso', time: '2 menit lalu',  price: 52_000,  status: 'Baru',    category: 'Oli' },
  { id: '2', product: 'Helm Half Face SNI',      buyer: 'Dewi Lestari', time: '1 jam lalu',    price: 185_000, status: 'Dibayar', category: 'Helm' },
  { id: '3', product: 'Kampas Rem Depan',        buyer: 'Agus P.',      time: '3 jam lalu',    price: 38_000,  status: 'Dibayar', category: 'Rem' },
  { id: '4', product: 'Filter Udara Honda Beat', buyer: 'Siti R.',      time: '5 jam lalu',    price: 45_000,  status: 'Dibayar', category: 'Filter' },
  { id: '5', product: 'Busi NGK Racing',         buyer: 'Hendra W.',    time: 'Kemarin 18:30', price: 28_000,  status: 'Dibayar', category: 'Mesin' },
]

function Toast({ message }: { message: string }) {
  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-gray-900 text-white text-sm font-medium px-4 py-2.5 rounded-full shadow-lg animate-fadein">
      <CheckCircle size={14} className="text-green-400 flex-shrink-0" />
      {message}
    </div>
  )
}

export default function DashboardPage() {
  const [showAll, setShowAll] = useState(false)
  const [toast, setToast] = useState('')

  const showToast = useCallback((msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(''), 2500)
  }, [])

  const handleShare = useCallback(() => {
    const url = `astratoko.com/${SELLER.slug}`
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => showToast('Link toko disalin!'))
    } else {
      showToast('Link: ' + url)
    }
  }, [showToast])

  const visibleOrders = showAll ? ALL_ORDERS : ALL_ORDERS.slice(0, 3)

  return (
    <div className="min-h-screen bg-[#F4F6F8] max-w-md mx-auto">
      {toast && <Toast message={toast} />}

      {/* Header */}
      <div className="bg-white px-5 pt-6 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-app-blue rounded-xl flex items-center justify-center flex-shrink-0">
              <span className="text-white font-extrabold text-lg leading-none">
                {SELLER.initial}
              </span>
            </div>
            <div>
              <p className="text-xs text-gray-400">Halo!</p>
              <p className="font-extrabold text-gray-900 text-base leading-tight">{SELLER.name}</p>
            </div>
          </div>
          {/* AstraPay balance */}
          <div className="bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-right">
            <div className="flex items-center gap-1 justify-end mb-0.5">
              <Zap size={11} className="text-astrapay-gold" fill="currentColor" />
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                AstraPay
              </span>
            </div>
            <p className="font-extrabold text-app-blue text-sm leading-none">
              {formatRp(SELLER.balance)}
            </p>
          </div>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* GMV card */}
        <div className="bg-app-blue rounded-2xl p-5 relative overflow-hidden">
          <div className="absolute -right-6 -top-6 w-28 h-28 rounded-full bg-white/5" />
          <div className="absolute -right-2 -bottom-8 w-40 h-40 rounded-full bg-white/5" />

          <p className="text-blue-200 text-sm mb-1 relative">GMV bulan ini</p>
          <p className="text-5xl font-extrabold text-white tracking-tight leading-none mb-2 relative">
            {formatRpShort(SELLER.gmv)}
          </p>
          <p className="text-blue-200 text-sm mb-4 relative">
            &uarr;{SELLER.gmvChange}% dari bulan lalu · {SELLER.orders} pesanan
          </p>

          <div className="bg-white/15 rounded-xl px-4 py-2.5 flex items-center gap-2 relative">
            <span className="text-base">💰</span>
            <div>
              <span className="text-white font-bold text-sm">
                Hemat {formatRpShort(SELLER.savings)} bulan ini
              </span>
              <p className="text-blue-200 text-xs">vs jualan lewat marketplace</p>
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-3 gap-3">
          {[
            {
              label: 'Share Link Toko',
              icon: Share2,
              bg: '#3B5BDB',
              onClick: handleShare,
              href: null,
            },
            {
              label: 'Buka Toko',
              icon: Plus,
              bg: '#2F9E44',
              onClick: null,
              href: `/toko/${SELLER.slug}`,
            },
            {
              label: 'Lihat Pesanan',
              icon: ShoppingBag,
              bg: '#F08C00',
              onClick: null,
              href: '#pesanan',
            },
          ].map((action) => {
            const Icon = action.icon
            const content = (
              <>
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: action.bg }}
                >
                  <Icon size={22} className="text-white" />
                </div>
                <span className="text-xs font-semibold text-gray-700 text-center leading-tight">
                  {action.label}
                </span>
              </>
            )

            if (action.onClick) {
              return (
                <button
                  key={action.label}
                  onClick={action.onClick}
                  className="bg-white rounded-2xl p-4 flex flex-col items-center gap-2 shadow-sm border border-gray-100 hover:shadow-md transition-shadow active:scale-[0.97]"
                >
                  {content}
                </button>
              )
            }

            return (
              <Link
                key={action.label}
                href={action.href!}
                target={action.href?.startsWith('/toko') ? '_blank' : undefined}
                className="bg-white rounded-2xl p-4 flex flex-col items-center gap-2 shadow-sm border border-gray-100 hover:shadow-md transition-shadow active:scale-[0.97]"
              >
                {content}
              </Link>
            )
          })}
        </div>

        {/* Recent orders */}
        <div id="pesanan" className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-5 pt-5 pb-3">
            <h2 className="font-extrabold text-gray-900">Pesanan Terbaru</h2>
            <button
              onClick={() => setShowAll((v) => !v)}
              className="text-app-blue text-sm font-semibold"
            >
              {showAll ? 'Ringkas' : 'Lihat semua'}
            </button>
          </div>
          <div className="divide-y divide-gray-50">
            {visibleOrders.map((order) => {
              const { color, Icon } = getCategoryStyle(order.category)
              return (
                <div key={order.id} className="flex items-center gap-3 px-5 py-3.5">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: color }}
                  >
                    <Icon size={16} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{order.product}</p>
                    <p className="text-xs text-gray-400">
                      {order.buyer} · {order.time}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-gray-900">{formatRp(order.price)}</p>
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        order.status === 'Baru'
                          ? 'bg-blue-100 text-app-blue'
                          : 'bg-green-100 text-green-700'
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
          {showAll && (
            <div className="px-5 py-3 border-t border-gray-50">
              <button
                onClick={() => setShowAll(false)}
                className="w-full flex items-center justify-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 transition-colors"
              >
                Ringkas <ChevronRight size={14} className="rotate-90" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
