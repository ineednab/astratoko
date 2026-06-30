'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  Share2,
  Star,
  X,
  ShoppingBag,
  CheckCircle,
  Wrench,
  Droplets,
  Shield,
  Package,
  Settings,
  Zap,
  Circle,
  Wind,
  Gem,
  type LucideIcon,
} from 'lucide-react'
import { SELLER, PRODUCTS } from '@/lib/mock-data'

type Product = (typeof PRODUCTS)[0]
type CheckoutStep = 'confirm' | 'qris' | 'success'

const CATEGORY_STYLE: Record<string, { color: string; Icon: LucideIcon }> = {
  Rem:       { color: '#3B5BDB', Icon: Wrench },
  Oli:       { color: '#2F9E44', Icon: Droplets },
  Helm:      { color: '#F08C00', Icon: Shield },
  Filter:    { color: '#7048E8', Icon: Wind },
  Mesin:     { color: '#0C8599', Icon: Settings },
  Transmisi: { color: '#C92A2A', Icon: Circle },
  Aksesoris: { color: '#D6336C', Icon: Gem },
  Elektrik:  { color: '#E67700', Icon: Zap },
  Ban:       { color: '#495057', Icon: Circle },
}

function getCategoryStyle(category: string) {
  return CATEGORY_STYLE[category] ?? { color: '#3B5BDB', Icon: Package }
}

function formatRp(n: number) {
  return 'Rp ' + n.toLocaleString('id-ID')
}

function CheckoutModal({ product, onClose }: { product: Product; onClose: () => void }) {
  const [step, setStep] = useState<CheckoutStep>('confirm')
  const style = getCategoryStyle(product.category)
  const Icon = style.Icon

  return (
    <div
      className="fixed inset-0 bg-black/40 z-50 flex items-end justify-center"
      onClick={onClose}
    >
      <div className="bg-white w-full max-w-md rounded-t-3xl pb-8" onClick={(e) => e.stopPropagation()}>
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-gray-200 rounded-full" />
        </div>

        {step === 'confirm' && (
          <div className="px-5 pb-8 pt-3">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-extrabold text-gray-900 text-lg">Konfirmasi Pembelian</h3>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500"
              >
                <X size={18} />
              </button>
            </div>
            <div className="flex gap-4 p-4 bg-gray-50 rounded-2xl mb-5">
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: style.color }}
              >
                <Icon size={24} className="text-white" />
              </div>
              <div>
                <p className="font-bold text-gray-900 text-sm leading-snug">{product.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">{product.category}</p>
                <p className="text-xl font-extrabold text-app-blue mt-1 tracking-tight">
                  {formatRp(product.price)}
                </p>
              </div>
            </div>
            <div className="bg-app-blue-pale rounded-xl px-4 py-3 flex items-center justify-between mb-5">
              <span className="text-sm text-gray-600">Metode Pembayaran</span>
              <span className="text-sm font-bold text-app-blue">AstraPay + QRIS</span>
            </div>
            <button
              onClick={() => setStep('qris')}
              className="w-full bg-app-blue hover:bg-app-blue-light text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-colors text-base"
            >
              <ShoppingBag size={18} /> Bayar Sekarang
            </button>
          </div>
        )}

        {step === 'qris' && (
          <div className="px-5 pb-8 pt-3 text-center">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-extrabold text-gray-900 text-lg">Scan QRIS</h3>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500"
              >
                <X size={18} />
              </button>
            </div>
            <p className="text-3xl font-extrabold text-app-blue tracking-tight mb-4">
              {formatRp(product.price)}
            </p>
            <div className="bg-gray-50 rounded-2xl p-3 inline-flex mb-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=astratoko-${SELLER.slug}-${product.id}&bgcolor=ffffff&color=3B5BDB&margin=2`}
                alt="QRIS"
                width={180}
                height={180}
                className="rounded-lg"
              />
            </div>
            <p className="text-sm text-gray-500 mb-1">
              Scan dengan AstraPay atau e-wallet apapun
            </p>
            <p className="text-xs text-gray-400 mb-5">{SELLER.name}</p>
            <button
              onClick={() => setStep('success')}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-2xl transition-colors text-sm"
            >
              Konfirmasi Pembayaran
            </button>
          </div>
        )}

        {step === 'success' && (
          <div className="px-5 pb-8 pt-4 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle size={32} className="text-green-600" />
            </div>
            <h3 className="text-xl font-extrabold text-gray-900 mb-1">Pembayaran Berhasil!</h3>
            <p className="text-3xl font-extrabold text-green-600 tracking-tight mb-1">
              {formatRp(product.price)}
            </p>
            <p className="text-sm text-gray-400 mb-5">diterima oleh {SELLER.name}</p>

            {/* AstraPoints */}
            <div className="bg-app-blue rounded-2xl px-4 py-4 text-white flex items-center justify-between mb-5">
              <div className="text-left">
                <p className="text-xs text-blue-200 mb-0.5">AstraPoints ditambahkan</p>
                <p className="text-3xl font-extrabold tracking-tight leading-none">+50</p>
                <p className="text-xs text-blue-200 mt-0.5">tukar jadi saldo AstraPay</p>
              </div>
              <Star size={36} className="text-astrapay-gold flex-shrink-0" fill="currentColor" />
            </div>

            <button
              onClick={onClose}
              className="w-full border-2 border-app-blue text-app-blue font-bold py-3.5 rounded-2xl hover:bg-app-blue-pale transition-colors"
            >
              Lanjut Belanja
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default function StorefrontPage() {
  const [selected, setSelected] = useState<Product | null>(null)
  const [search, setSearch] = useState('')
  const [wishlist, setWishlist] = useState<Set<string>>(new Set())

  const toggleWishlist = (id: string) =>
    setWishlist((prev) => {
      const next = new Set(prev)
      if (next.has(id)) { next.delete(id) } else { next.add(id) }
      return next
    })

  const filtered = PRODUCTS.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase()),
  )

  const handleShare = () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      navigator.share({ title: SELLER.name, url: window.location.href })
    } else if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(window.location.href)
    }
  }

  return (
    <div className="min-h-screen bg-white max-w-md mx-auto">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-40 px-4 pt-4 pb-3">
        <div className="flex items-center gap-3 mb-3">
          <Link
            href="/"
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 flex-shrink-0"
          >
            <ArrowLeft size={18} />
          </Link>
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="w-10 h-10 bg-app-blue rounded-xl flex items-center justify-center flex-shrink-0">
              <span className="text-white font-extrabold leading-none">R</span>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1">
                <p className="font-extrabold text-gray-900 text-base leading-tight">
                  {SELLER.name}
                </p>
                <span className="text-app-blue text-sm">✓</span>
              </div>
              <p className="text-xs text-gray-400 truncate">
                Spare part &amp; aksesori motor · {SELLER.location}
              </p>
            </div>
          </div>
          <button
            onClick={handleShare}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 text-gray-500 flex-shrink-0"
          >
            <Share2 size={16} />
          </button>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
          <span className="flex items-center gap-1">
            <Star size={12} className="text-yellow-400" fill="currentColor" />
            <strong className="text-gray-900">4,9</strong> rating
          </span>
          <span><strong className="text-gray-900">312</strong> terjual</span>
          <span><strong className="text-gray-900">98%</strong> respon cepat</span>
        </div>

        {/* AstraPoints banner */}
        <div className="bg-amber-50 rounded-xl px-3 py-2.5 flex items-center gap-2.5 mb-3">
          <div className="w-7 h-7 bg-astrapay-gold rounded-lg flex items-center justify-center flex-shrink-0">
            <Star size={14} className="text-white" fill="currentColor" />
          </div>
          <p className="text-xs font-medium text-amber-800">
            Earn 50 poin tiap transaksi — tukar jadi saldo AstraPay
          </p>
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder="Cari produk..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-gray-100 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-app-blue/20 focus:bg-white transition-colors"
        />
      </div>

      {/* Products */}
      <div className="px-4 py-4">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400 text-sm">
            Produk tidak ditemukan
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filtered.map((product) => {
              const { color, Icon } = getCategoryStyle(product.category)
              return (
                <div
                  key={product.id}
                  className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm"
                >
                  {/* Colored header */}
                  <div
                    className="relative flex items-center justify-center py-7"
                    style={{ backgroundColor: color }}
                  >
                    <Icon size={40} className="text-white" />
                    <button
                      aria-label="Simpan ke favorit"
                      onClick={(e) => { e.stopPropagation(); toggleWishlist(product.id) }}
                      className="absolute top-2 right-2 w-6 h-6 bg-white/20 rounded-full flex items-center justify-center"
                    >
                      <Star
                        size={12}
                        className={wishlist.has(product.id) ? 'text-yellow-300' : 'text-white'}
                        fill={wishlist.has(product.id) ? 'currentColor' : 'none'}
                      />
                    </button>
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-semibold text-gray-900 leading-snug mb-1 line-clamp-2">
                      {product.name}
                    </p>
                    <p className="text-base font-extrabold text-app-blue tracking-tight mb-2.5">
                      {formatRp(product.price)}
                    </p>
                    <button
                      onClick={() => setSelected(product)}
                      className="w-full bg-app-blue hover:bg-app-blue-light text-white text-xs font-bold py-2.5 rounded-xl transition-colors active:scale-[0.97]"
                    >
                      + Beli
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Powered by */}
      <div className="px-4 py-8 text-center">
        <p className="text-xs text-gray-400">
          Toko ini dikelola dengan{' '}
          <Link href="/" className="text-app-blue font-medium">
            AstraToko
          </Link>{' '}
          · Powered by AstraPay
        </p>
      </div>

      {selected && (
        <CheckoutModal product={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  )
}
