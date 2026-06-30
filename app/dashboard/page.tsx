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
  Rem:       { color: '#1A3CC4', Icon: Wrench },
  Filter:    { color: '#7048E8', Icon: Wind },
  Mesin:     { color: '#0C8599', Icon: Settings },
  Transmisi: { color: '#C41A1A', Icon: Circle },
  Aksesoris: { color: '#D6336C', Icon: Gem },
  Elektrik:  { color: '#E67700', Icon: Zap },
  Ban:       { color: '#495057', Icon: ShoppingBag },
}

function getCategoryStyle(category: string) {
  return CATEGORY_ICONS[category] ?? { color: '#1A3CC4', Icon: ShoppingBag }
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
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-gray-900 text-brand-surface text-sm font-medium px-4 py-2.5 rounded-pill shadow-modal animate-fadein">
      <CheckCircle size={14} className="text-brand-success flex-shrink-0" />
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
    <div className="min-h-screen bg-brand-surface max-w-md mx-auto">
      {toast && <Toast message={toast} />}

      {/* Header */}
      <div className="bg-brand-card border-b-2 border-brand-border px-5 pt-6 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-brand-primary rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-brand-surface font-extrabold text-lg leading-none font-display">
                {SELLER.initial}
              </span>
            </div>
            <div>
              <p className="text-caption text-gray-500">Halo!</p>
              <p className="font-bold text-gray-900 text-h3 leading-tight font-display">{SELLER.name}</p>
            </div>
          </div>
          {/* AstraPay balance */}
          <div className="bg-brand-surface border-2 border-brand-border rounded-lg px-3 py-2 text-right">
            <div className="flex items-center gap-1 justify-end mb-0.5">
              <Zap size={11} className="text-brand-gold" fill="currentColor" />
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                AstraPay
              </span>
            </div>
            <p className="font-extrabold text-brand-primary text-label leading-none font-mono">
              {formatRp(SELLER.balance)}
            </p>
          </div>
        </div>
      </div>

      <div className="px-4 py-4 space-y-3">
        {/* GMV card — highlight card: blue bg */}
        <div className="bg-brand-primary rounded-lg p-5 border-2 border-brand-primary">
          <p className="text-brand-pale text-label mb-1">GMV bulan ini</p>
          <p className="text-display font-extrabold text-brand-surface tracking-tight leading-none mb-2 font-display">
            {formatRpShort(SELLER.gmv)}
          </p>
          <p className="text-brand-pale text-label mb-4">
            ↑{SELLER.gmvChange}% dari bulan lalu · {SELLER.orders} pesanan
          </p>

          <div className="bg-white/15 rounded-md px-4 py-2.5 flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-brand-gold flex items-center justify-center flex-shrink-0">
              <span className="text-[10px] font-bold text-white">Rp</span>
            </div>
            <div>
              <span className="text-brand-surface font-bold text-label">
                Hemat {formatRpShort(SELLER.savings)} bulan ini
              </span>
              <p className="text-brand-pale text-caption">vs jualan lewat marketplace</p>
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Share Link', icon: Share2, color: '#1A3CC4', onClick: handleShare, href: null },
            { label: 'Buka Toko', icon: Plus,    color: '#1A7A4A', onClick: null,        href: `/toko/${SELLER.slug}` },
            { label: 'Pesanan',   icon: ShoppingBag, color: '#A05A00', onClick: null,   href: '#pesanan' },
          ].map((action) => {
            const Icon = action.icon
            const content = (
              <>
                <div className="w-11 h-11 rounded-md flex items-center justify-center" style={{ backgroundColor: action.color }}>
                  <Icon size={20} className="text-white" />
                </div>
                <span className="text-caption font-semibold text-gray-700 text-center leading-tight">
                  {action.label}
                </span>
              </>
            )

            if (action.onClick) {
              return (
                <button
                  key={action.label}
                  onClick={action.onClick}
                  className="bg-brand-card border-2 border-brand-border rounded-lg p-3 flex flex-col items-center gap-2 hover:border-brand-primary transition-colors active:scale-[0.97]"
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
                className="bg-brand-card border-2 border-brand-border rounded-lg p-3 flex flex-col items-center gap-2 hover:border-brand-primary transition-colors active:scale-[0.97]"
              >
                {content}
              </Link>
            )
          })}
        </div>

        {/* Recent orders */}
        <div id="pesanan" className="bg-brand-card rounded-lg border-2 border-brand-border overflow-hidden">
          <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-brand-border">
            <h2 className="font-bold text-gray-900 text-h3 font-display">Pesanan Terbaru</h2>
            <button
              onClick={() => setShowAll((v) => !v)}
              className="text-brand-primary text-label font-semibold"
            >
              {showAll ? 'Ringkas' : 'Lihat semua'}
            </button>
          </div>
          <div className="divide-y divide-brand-border">
            {visibleOrders.map((order) => {
              const { color, Icon } = getCategoryStyle(order.category)
              return (
                <div key={order.id} className="flex items-center gap-3 px-4 py-3">
                  <div
                    className="w-9 h-9 rounded-md flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: color }}
                  >
                    <Icon size={15} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-label font-semibold text-gray-900 truncate">{order.product}</p>
                    <p className="text-caption text-gray-500">
                      {order.buyer} · {order.time}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-label font-bold text-gray-900 font-mono">{formatRp(order.price)}</p>
                    <span
                      className={`text-caption font-semibold px-2 py-0.5 rounded-pill ${
                        order.status === 'Baru'
                          ? 'bg-brand-pale text-brand-primary'
                          : 'bg-brand-success-bg text-brand-success'
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
            <div className="px-4 py-3 border-t border-brand-border">
              <button
                onClick={() => setShowAll(false)}
                className="w-full flex items-center justify-center gap-1.5 text-caption text-gray-400 hover:text-gray-600 transition-colors"
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
