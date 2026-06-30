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
  Rem:       { color: '#1A3CC4', Icon: Wrench },
  Oli:       { color: '#2F9E44', Icon: Droplets },
  Helm:      { color: '#F08C00', Icon: Shield },
  Filter:    { color: '#7048E8', Icon: Wind },
  Mesin:     { color: '#0C8599', Icon: Settings },
  Transmisi: { color: '#C41A1A', Icon: Circle },
  Aksesoris: { color: '#D6336C', Icon: Gem },
  Elektrik:  { color: '#E67700', Icon: Zap },
  Ban:       { color: '#495057', Icon: Circle },
}

function getCategoryStyle(category: string) {
  return CATEGORY_STYLE[category] ?? { color: '#1A3CC4', Icon: Package }
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
      className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center"
      onClick={onClose}
    >
      {/* Bottom sheet — elevation-2 */}
      <div
        className="bg-brand-card w-full max-w-md rounded-t-xl pb-8 shadow-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-brand-border rounded-pill" />
        </div>

        {step === 'confirm' && (
          <div className="px-5 pb-6 pt-3">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-gray-900 text-h3 font-display">Konfirmasi Pembelian</h3>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-pill bg-brand-surface text-gray-500"
              >
                <X size={18} />
              </button>
            </div>
            <div className="flex gap-4 p-4 bg-brand-surface border-2 border-brand-border rounded-lg mb-5">
              <div
                className="w-14 h-14 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: style.color }}
              >
                <Icon size={24} className="text-white" />
              </div>
              <div>
                <p className="font-bold text-gray-900 text-label leading-snug">{product.name}</p>
                <p className="text-caption text-gray-500 mt-0.5">{product.category}</p>
                <p className="text-h2 font-extrabold text-brand-primary mt-1 tracking-tight font-display font-mono">
                  {formatRp(product.price)}
                </p>
              </div>
            </div>
            <div className="bg-brand-pale border-2 border-brand-primary/20 rounded-lg px-4 py-3 flex items-center justify-between mb-5">
              <span className="text-label text-gray-600">Metode Pembayaran</span>
              <span className="text-label font-bold text-brand-primary">AstraPay + QRIS</span>
            </div>
            <button
              onClick={() => setStep('qris')}
              className="btn-primary w-full"
            >
              <ShoppingBag size={18} /> Bayar Sekarang
            </button>
          </div>
        )}

        {step === 'qris' && (
          <div className="px-5 pb-6 pt-3 text-center">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900 text-h3 font-display">Scan QRIS</h3>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-pill bg-brand-surface text-gray-500"
              >
                <X size={18} />
              </button>
            </div>
            <p className="text-display font-extrabold text-brand-primary tracking-tight mb-4 font-display font-mono">
              {formatRp(product.price)}
            </p>
            <div className="bg-brand-surface border-2 border-brand-border rounded-lg p-3 inline-flex mb-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=astratoko-${SELLER.slug}-${product.id}&bgcolor=F5F2EA&color=1A3CC4&margin=2`}
                alt="QRIS"
                width={180}
                height={180}
                className="rounded-md"
              />
            </div>
            <p className="text-label text-gray-500 mb-1">
              Scan dengan AstraPay atau e-wallet apapun
            </p>
            <p className="text-caption text-gray-400 mb-5">{SELLER.name}</p>
            <button
              onClick={() => setStep('success')}
              className="w-full bg-brand-success hover:opacity-90 text-white font-bold h-btn rounded-lg flex items-center justify-center gap-2 transition-opacity text-label font-display"
            >
              <CheckCircle size={18} /> Konfirmasi Pembayaran
            </button>
          </div>
        )}

        {step === 'success' && (
          <div className="px-5 pb-6 pt-4 text-center">
            <div className="w-16 h-16 bg-brand-success-bg border-2 border-brand-success rounded-pill flex items-center justify-center mx-auto mb-3">
              <CheckCircle size={32} className="text-brand-success" />
            </div>
            <h3 className="text-h2 font-bold text-gray-900 mb-1 font-display">Pembayaran Berhasil!</h3>
            <p className="text-display font-extrabold text-brand-success tracking-tight mb-1 font-display font-mono">
              {formatRp(product.price)}
            </p>
            <p className="text-label text-gray-500 mb-5">diterima oleh {SELLER.name}</p>

            {/* AstraPoints — highlight card */}
            <div className="card-highlight flex items-center justify-between mb-5">
              <div className="text-left">
                <p className="text-brand-pale text-caption mb-0.5">AstraPoints ditambahkan</p>
                <p className="text-display font-extrabold tracking-tight leading-none font-display">+50</p>
                <p className="text-brand-pale text-caption mt-0.5">tukar jadi saldo AstraPay</p>
              </div>
              <Star size={36} className="text-brand-gold flex-shrink-0" fill="currentColor" />
            </div>

            <button onClick={onClose} className="btn-secondary w-full">
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
    <div className="min-h-screen bg-brand-surface max-w-md mx-auto">
      {/* Sticky header */}
      <div className="bg-brand-card border-b-2 border-brand-border sticky top-0 z-40 px-4 pt-4 pb-3">
        <div className="flex items-center gap-3 mb-3">
          <Link
            href="/"
            className="w-9 h-9 flex items-center justify-center rounded-md bg-brand-surface border-2 border-brand-border text-gray-500 flex-shrink-0"
          >
            <ArrowLeft size={18} />
          </Link>
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="w-10 h-10 bg-brand-primary rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-brand-surface font-extrabold leading-none font-display">R</span>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1">
                <p className="font-bold text-gray-900 text-h3 leading-tight font-display">
                  {SELLER.name}
                </p>
                <span className="text-brand-primary text-label">✓</span>
              </div>
              <p className="text-caption text-gray-500 truncate">
                Spare part &amp; aksesori motor · {SELLER.location}
              </p>
            </div>
          </div>
          <button
            onClick={handleShare}
            className="w-9 h-9 flex items-center justify-center rounded-md bg-brand-surface border-2 border-brand-border text-gray-500 flex-shrink-0"
          >
            <Share2 size={16} />
          </button>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 text-caption text-gray-500 mb-3">
          <span className="flex items-center gap-1">
            <Star size={12} className="text-brand-gold" fill="currentColor" />
            <strong className="text-gray-900">4,9</strong> rating
          </span>
          <span><strong className="text-gray-900">312</strong> terjual</span>
          <span><strong className="text-gray-900">98%</strong> respon cepat</span>
        </div>

        {/* AstraPoints banner */}
        <div className="bg-brand-warning-bg border-2 border-brand-gold/30 rounded-lg px-3 py-2.5 flex items-center gap-2.5 mb-3">
          <div className="w-7 h-7 bg-brand-gold rounded-md flex items-center justify-center flex-shrink-0">
            <Star size={14} className="text-white" fill="currentColor" />
          </div>
          <p className="text-caption font-medium text-brand-warning">
            Earn 50 poin tiap transaksi — tukar jadi saldo AstraPay
          </p>
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder="Cari produk..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input"
        />
      </div>

      {/* Products grid */}
      <div className="px-4 py-4">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400 text-label">
            Produk tidak ditemukan
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filtered.map((product) => {
              const { color, Icon } = getCategoryStyle(product.category)
              return (
                <div
                  key={product.id}
                  className="bg-brand-card rounded-lg border-2 border-brand-border overflow-hidden"
                >
                  <div
                    className="relative flex items-center justify-center py-7"
                    style={{ backgroundColor: color }}
                  >
                    <Icon size={40} className="text-white" />
                    <button
                      aria-label="Simpan ke favorit"
                      onClick={(e) => { e.stopPropagation(); toggleWishlist(product.id) }}
                      className="absolute top-2 right-2 w-7 h-7 bg-white/20 rounded-pill flex items-center justify-center"
                    >
                      <Star
                        size={13}
                        className={wishlist.has(product.id) ? 'text-brand-gold' : 'text-white'}
                        fill={wishlist.has(product.id) ? 'currentColor' : 'none'}
                      />
                    </button>
                  </div>
                  <div className="p-3">
                    <p className="text-label font-semibold text-gray-900 leading-snug mb-1 line-clamp-2">
                      {product.name}
                    </p>
                    <p className="text-label font-extrabold text-brand-primary tracking-tight mb-2.5 font-mono">
                      {formatRp(product.price)}
                    </p>
                    <button
                      onClick={() => setSelected(product)}
                      className="w-full bg-brand-primary hover:bg-brand-mid text-brand-surface text-caption font-bold py-2.5 rounded-md transition-colors active:scale-[0.97] font-display"
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

      <div className="px-4 py-8 text-center">
        <p className="text-caption text-gray-400">
          Toko ini dikelola dengan{' '}
          <Link href="/" className="text-brand-primary font-medium">
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
