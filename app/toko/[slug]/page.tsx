'use client'

import { useState, useEffect, useRef, Fragment } from 'react'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, Share2, Star, X, ShoppingBag, CheckCircle, TrendingUp, Bell, MapPin, Truck, ShoppingCart, ChevronDown, Home, LayoutGrid, Package, User, Zap } from 'lucide-react'
import { formatRp } from '@/lib/utils'
import { getCategoryStyle } from '@/lib/categories'
import Confetti from '@/components/Confetti'
import type { Seller, Product } from '@/lib/types'

// ── Types ─────────────────────────────────────────────────────────────────────

type CheckoutStep  = 'cart_review' | 'shipping' | 'buyer_info' | 'payment_method' | 'qris' | 'success' | 'merchant_reveal' | 'payment_failed'
type DemoProgress  = 'browse' | 'select' | 'checkout' | 'success'
type PaymentMethod = 'astrapay' | 'transfer' | 'cod'
type QrisStatus    = 'waiting' | 'detected' | 'verifying' | 'verified'
type MerchantPhase = 'intro' | 'dashboard'
type CartItem      = { product: Product; quantity: number }

const DEMO_STEPS: { id: DemoProgress; label: string }[] = [
  { id: 'browse',   label: 'Browse'   },
  { id: 'select',   label: 'Keranjang' },
  { id: 'checkout', label: 'Checkout' },
  { id: 'success',  label: 'Selesai'  },
]

const SHIPPING_OPTIONS = [
  { id: 'pickup',  name: 'Ambil di Toko', price: 0,     duration: 'Hari ini',  icon: '🏪' },
  { id: 'jne',     name: 'JNE Reguler',   price: 15000, duration: '2–3 hari',  icon: '📦' },
  { id: 'jnt',     name: 'J&T Express',   price: 18000, duration: '1–2 hari',  icon: '⚡' },
  { id: 'sicepat', name: 'SiCepat BEST',  price: 20000, duration: '1–2 hari',  icon: '🚀' },
]

// ── Count-up hook ─────────────────────────────────────────────────────────────

function useCountUp(target: number, duration = 900) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    const start = performance.now()
    const tick = (now: number) => {
      const t    = Math.min((now - start) / duration, 1)
      const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
      setValue(Math.round(ease * target))
      if (t < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [target, duration])
  return value
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function ProductSkeleton() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
      <div className="h-24 bg-gray-100 animate-pulse" />
      <div className="p-3 space-y-2">
        <div className="h-4 bg-gray-100 rounded animate-pulse" />
        <div className="h-5 w-20 bg-gray-100 rounded animate-pulse" />
        <div className="h-9 bg-gray-100 rounded-xl animate-pulse" />
      </div>
    </div>
  )
}

// ── Demo Floating Pill ────────────────────────────────────────────────────────

function DemoFloatingPill({ progress }: { progress: DemoProgress }) {
  const label = DEMO_STEPS.find((s) => s.id === progress)?.label ?? ''
  return (
    <div className="fixed top-4 right-4 z-[60] pointer-events-none">
      <div className="bg-gray-900/90 backdrop-blur-sm text-white rounded-full px-3 py-1.5 flex items-center gap-2 shadow-xl text-xs font-medium whitespace-nowrap">
        <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse flex-shrink-0" />
        <span className="text-gray-400">Demo</span>
        <span className="text-gray-500">·</span>
        <span>{label}</span>
      </div>
    </div>
  )
}

// ── Demo Welcome Toast ────────────────────────────────────────────────────────

function DemoWelcomeToast({ visible }: { visible: boolean }) {
  return (
    <div className={`fixed top-16 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-[320px] bg-white rounded-2xl shadow-2xl px-5 py-4 border border-gray-100 transition-all duration-500 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'}`}>
      <div className="flex items-start gap-3">
        <div className="text-2xl flex-shrink-0">👋</div>
        <div>
          <p className="font-bold text-gray-900 text-sm">Selamat datang di Toko Rizky!</p>
          <p className="text-xs text-gray-400 mt-0.5">Tambahkan beberapa produk ke keranjang, lalu checkout semuanya.</p>
        </div>
      </div>
    </div>
  )
}

// ── Cart Added Toast ──────────────────────────────────────────────────────────

function CartToast({ product, visible }: { product: Product | null; visible: boolean }) {
  const { color, Icon } = product ? getCategoryStyle(product.category) : { color: '#3B5BDB', Icon: ShoppingBag }
  return (
    <div className={`fixed top-16 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-[320px] bg-white rounded-2xl shadow-2xl border border-gray-100 transition-all duration-400 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'}`}>
      <div className="flex items-center gap-3 px-4 py-3.5">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: color }}>
          <Icon size={14} className="text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-gray-900 text-sm truncate">{product?.name}</p>
          <p className="text-xs text-green-600 font-medium">✓ Ditambahkan ke keranjang</p>
        </div>
      </div>
    </div>
  )
}

// ── Product Detail Sheet ──────────────────────────────────────────────────────

function ProductDetailSheet({
  product,
  isDemoMode,
  onClose,
  onAddToCart,
  onBuyNow,
}: {
  product: Product
  isDemoMode: boolean
  onClose: () => void
  onAddToCart: (p: Product) => void
  onBuyNow: (p: Product) => void
}) {
  const { color, Icon } = getCategoryStyle(product.category)
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-end justify-center" onClick={onClose}>
      <div className="bg-white w-full max-w-md rounded-t-3xl pb-8 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-gray-200 rounded-full" />
        </div>
        <div className="px-5 pb-2 pt-2">
          <div className="flex items-center justify-between mb-4">
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500">
              <X size={18} />
            </button>
            <h3 className="font-extrabold text-gray-900 text-base">Detail Produk</h3>
            <div className="w-8" />
          </div>

          {/* Product hero */}
          <div className="relative rounded-2xl overflow-hidden mb-4" style={{ backgroundColor: color }}>
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-48 object-cover"
                onError={(e) => {
                  const target = e.currentTarget
                  target.style.display = 'none'
                  target.nextElementSibling?.classList.remove('hidden')
                }}
              />
            ) : null}
            <div className={`flex items-center justify-center py-12 ${product.image_url ? 'hidden' : ''}`}>
              <Icon size={56} className="text-white" />
            </div>
            {isDemoMode && (
              <div className="absolute top-3 left-3 bg-astrapay-gold text-white text-[9px] font-extrabold px-2 py-1 rounded-full">
                🔥 TERLARIS
              </div>
            )}
          </div>

          <h2 className="font-extrabold text-gray-900 text-xl mb-1">{product.name}</h2>
          <p className="text-xs text-gray-400 mb-3">{product.category}</p>

          <div className="flex items-center gap-3 mb-3">
            <span className="flex items-center gap-1 text-xs text-gray-500">
              <Star size={11} className="text-yellow-400" fill="currentColor" />
              <strong className="text-gray-900">4.9</strong> (248 ulasan)
            </span>
            <span className="text-gray-200">·</span>
            <span className="text-xs text-gray-500">🔥 <strong className="text-gray-900">124</strong> terjual</span>
            {isDemoMode && <span className="text-xs text-green-600 font-medium animate-pulse">· 2 orang melihat ini</span>}
          </div>

          <div className="flex items-end justify-between mb-4">
            <p className="text-3xl font-extrabold text-app-blue tracking-tight">{formatRp(product.price)}</p>
            <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-lg">Stok: 14 unit</span>
          </div>

          <div className="bg-amber-50 border border-amber-100 rounded-xl px-3.5 py-2.5 flex items-center gap-2.5 mb-5">
            <Star size={16} className="text-astrapay-gold flex-shrink-0" fill="currentColor" />
            <p className="text-xs text-amber-800">
              Beli ini = <strong>+50 AstraPoints</strong> yang bisa ditukar jadi saldo AstraPay
            </p>
          </div>

          {/* Two CTAs */}
          <button
            onClick={() => { onAddToCart(product); onClose() }}
            className="w-full bg-app-blue hover:bg-app-blue-light text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-colors text-base mb-2.5"
          >
            <ShoppingCart size={18} /> Tambah ke Keranjang
          </button>
          <button
            onClick={() => { onBuyNow(product); onClose() }}
            className="w-full border-2 border-app-blue text-app-blue font-semibold py-3.5 rounded-2xl flex items-center justify-center gap-2 transition-colors text-sm hover:bg-app-blue-pale"
          >
            Beli Langsung <ArrowRight size={15} />
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Cart Sheet ────────────────────────────────────────────────────────────────

function CartSheet({
  cart,
  onClose,
  onRemove,
  onUpdateQty,
  onCheckout,
}: {
  cart: CartItem[]
  onClose: () => void
  onRemove: (productId: string) => void
  onUpdateQty: (productId: string, qty: number) => void
  onCheckout: () => void
}) {
  const totalQty = cart.reduce((s, item) => s + item.quantity, 0)
  const subtotal = cart.reduce((s, item) => s + item.product.price * item.quantity, 0)
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-end justify-center" onClick={onClose}>
      <div className="bg-white w-full max-w-md rounded-t-3xl pb-8 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-center pt-3 pb-1"><div className="w-10 h-1 bg-gray-200 rounded-full" /></div>
        <div className="px-5 pt-3">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-extrabold text-gray-900 text-lg">Keranjang ({totalQty})</h3>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500">
              <X size={18} />
            </button>
          </div>

          <div className="space-y-2.5 mb-5">
            {cart.map((item) => {
              const { color, Icon } = getCategoryStyle(item.product.category)
              return (
                <div key={item.product.id} className="flex items-center gap-3 bg-gray-50 rounded-xl px-3 py-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: color }}>
                    <Icon size={16} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm truncate">{item.product.name}</p>
                    <p className="text-app-blue font-bold text-sm">{formatRp(item.product.price * item.quantity)}</p>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button
                      onClick={() => item.quantity === 1 ? onRemove(item.product.id) : onUpdateQty(item.product.id, item.quantity - 1)}
                      className="w-6 h-6 flex items-center justify-center rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors text-base leading-none font-bold"
                    >
                      −
                    </button>
                    <span className="text-sm font-bold text-gray-900 w-5 text-center">{item.quantity}</span>
                    <button
                      onClick={() => onUpdateQty(item.product.id, item.quantity + 1)}
                      className="w-6 h-6 flex items-center justify-center rounded-full bg-app-blue text-white hover:bg-app-blue-light transition-colors text-base leading-none font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Subtotal */}
          <div className="bg-gray-50 rounded-xl px-4 py-3 flex items-center justify-between mb-5">
            <span className="text-sm text-gray-600">Subtotal ({totalQty} item)</span>
            <span className="font-extrabold text-gray-900">{formatRp(subtotal)}</span>
          </div>

          <button
            onClick={onCheckout}
            className="w-full bg-app-blue hover:bg-app-blue-light text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-colors text-base"
          >
            <ShoppingCart size={18} /> Checkout Semuanya
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Merchant Dashboard Reveal ─────────────────────────────────────────────────

function MerchantDashboard({ cart, buyerName, shippingName }: { cart: CartItem[]; buyerName: string; shippingName: string }) {
  const total    = cart.reduce((s, item) => s + item.product.price * item.quantity, 0)
  const totalQty = cart.reduce((s, item) => s + item.quantity, 0)
  const revenue  = useCountUp(total, 1200)
  const orders   = useCountUp(totalQty, 800)
  const primary  = cart[0].product

  const notifDetail = cart.length > 1
    ? `${primary.name} +${cart.length - 1} lainnya`
    : cart[0].quantity > 1
    ? `${primary.name} ×${cart[0].quantity}`
    : primary.name

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2.5 bg-green-500/10 border border-green-500/20 rounded-2xl px-4 py-3 animate-notification">
        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
          <Bell size={14} className="text-white" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-bold text-green-300 leading-snug">
            {totalQty > 1 ? `${totalQty} produk terjual!` : 'Order baru masuk!'}
          </p>
          <p className="text-[10px] text-green-500 truncate">
            {notifDetail} · {buyerName || 'Pembeli'}
          </p>
        </div>
        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse flex-shrink-0 ml-auto" />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="bg-white/5 border border-white/10 rounded-2xl px-3.5 py-3.5 animate-fadein" style={{ animationDelay: '0.15s' }}>
          <p className="text-[9px] text-gray-500 font-medium mb-1 uppercase tracking-wide">Pendapatan</p>
          <p className="text-sm font-extrabold text-white tracking-tight">{formatRp(revenue)}</p>
          <p className="text-[9px] text-green-400 mt-1 flex items-center gap-1"><TrendingUp size={8} /> real-time</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-2xl px-3.5 py-3.5 animate-fadein" style={{ animationDelay: '0.2s' }}>
          <p className="text-[9px] text-gray-500 font-medium mb-1 uppercase tracking-wide">Produk Terjual</p>
          <p className="text-3xl font-extrabold text-white">{orders}</p>
          <p className="text-[9px] text-green-400 mt-1">↑ hari ini</p>
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3.5 animate-fadein" style={{ animationDelay: '0.3s' }}>
        <div className="flex items-center justify-between mb-2.5">
          <p className="text-[10px] font-bold text-gray-300 uppercase tracking-wide">Ringkasan Order</p>
          <span className="text-[9px] bg-green-500/20 text-green-400 font-bold px-2 py-0.5 rounded-full">LUNAS</span>
        </div>
        {[
          { label: 'Pembeli',    value: buyerName || 'Pembeli',           style: 'text-gray-300' },
          { label: 'Produk',     value: `${totalQty} item`,               style: 'text-gray-300' },
          { label: 'Pengiriman', value: shippingName,             style: 'text-gray-300' },
          { label: 'Pembayaran', value: 'AstraPay ✓',             style: 'text-green-400 font-semibold' },
          { label: 'Total',      value: formatRp(total),          style: 'text-white font-bold' },
        ].map((row) => (
          <div key={row.label} className="flex items-center justify-between py-0.5">
            <span className="text-[10px] text-gray-500">{row.label}</span>
            <span className={`text-[10px] text-right ${row.style}`}>{row.value}</span>
          </div>
        ))}
      </div>

      <p className="text-xs text-gray-500 leading-relaxed animate-fadein" style={{ animationDelay: '0.45s' }}>
        Setiap transaksi langsung masuk ke dashboardmu — tanpa bergantung sepenuhnya pada marketplace.
      </p>
    </div>
  )
}

// ── Hero Banner ───────────────────────────────────────────────────────────────

const BANNER_TAGLINES: Record<string, string> = {
  Rem:        'Rem & kampas motor\noriginal terpercaya',
  Oli:        'Oli & pelumas motor\nkualitas premium',
  Helm:       'Helm SNI tersertifikasi\nuntuk keselamatanmu',
  Filter:     'Filter udara & oli\nmotor berkualitas',
  Mesin:      'Spare part mesin\ntahan lama & terjamin',
  Transmisi:  'Rantai & transmisi\nmotor awet & panjang',
  Aksesoris:  'Aksesoris motor\nlengkap & terjangkau',
  Ban:        'Ban motor berkualitas\nharga terjangkau',
  Elektrik:   'Komponen elektrik\nmotor pilihan terbaik',
}

function HeroBanner({
  products,
  seller,
  onViewCatalog,
}: {
  products: Product[]
  seller: Seller
  onViewCatalog: () => void
}) {
  const categoryCount = products.reduce<Record<string, number>>((acc, p) => {
    acc[p.category] = (acc[p.category] ?? 0) + 1
    return acc
  }, {})
  const topCategory = Object.entries(categoryCount).sort((a, b) => b[1] - a[1])[0]?.[0] ?? ''
  const { color, Icon } = getCategoryStyle(topCategory)
  const tagline = BANNER_TAGLINES[topCategory] ?? `Produk terpercaya\ndari ${seller.name}`
  const heroImage = seller.banner_image_url ?? products.find(p => p.image_url)?.image_url

  return (
    <div
      className="mx-4 mt-3 rounded-2xl overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #0f1c40 0%, #1E3A8A 100%)' }}
    >
      <div className="flex min-h-[128px]">
        <div className="flex-1 px-5 py-5 flex flex-col justify-between min-w-0">
          <div>
            <p className="text-white font-extrabold text-[17px] leading-snug whitespace-pre-line">{tagline}</p>
            <p className="text-blue-300 text-[11px] mt-1.5">{products.length} produk</p>
          </div>
          <button
            onClick={onViewCatalog}
            className="mt-3 bg-white text-[#1E3A8A] text-xs font-extrabold px-4 py-2 rounded-xl w-fit hover:bg-blue-50 transition-colors"
          >
            Lihat Katalog
          </button>
        </div>
        <div className="w-36 flex-shrink-0 relative overflow-hidden"
          style={{ background: heroImage ? 'transparent' : `linear-gradient(135deg, transparent 30%, ${color}55 100%)` }}
        >
          {heroImage ? (
            <img
              src={heroImage}
              alt=""
              className="absolute inset-0 w-full h-full object-cover object-center"
              style={{ maskImage: 'linear-gradient(to right, transparent 0%, black 40%)', WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 40%)' }}
            />
          ) : (
            <div className="absolute -right-3 top-1/2 -translate-y-1/2 opacity-20">
              <Icon size={104} className="text-white" />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Checkout constants ────────────────────────────────────────────────────────

const CITIES = ['Jakarta', 'Bandung', 'Bogor', 'Bekasi', 'Depok', 'Tangerang', 'Surabaya', 'Yogyakarta', 'Semarang', 'Medan', 'Makassar', 'Palembang']

const CHECKOUT_STEP_LABELS = ['Keranjang', 'Pengiriman', 'Data', 'Pembayaran', 'Selesai']
const CHECKOUT_STEP_INDEX: Record<CheckoutStep, number> = {
  cart_review: 0, shipping: 1, buyer_info: 2, payment_method: 3,
  qris: 4, success: 4, merchant_reveal: 4, payment_failed: 3,
}

// ── Checkout Modal ────────────────────────────────────────────────────────────

function CheckoutModal({
  cart,
  seller,
  onClose,
  onRemove,
  onUpdateQty,
  isDemoMode,
  isLinked,
  onLink,
  onDemoProgress,
}: {
  cart: CartItem[]
  seller: Seller
  onClose: () => void
  onRemove: (productId: string) => void
  onUpdateQty: (productId: string, qty: number) => void
  isDemoMode?: boolean
  isLinked?: boolean
  onLink?: () => void
  onDemoProgress?: (p: DemoProgress) => void
}) {
  const DEMO_BUYERS = ['Justin Bieber', 'Dua Lipa', 'Sabrina Carpenter', 'Taylor Swift', 'Ariana Grande', 'Billie Eilish']

  const [step,             setStep]             = useState<CheckoutStep>('cart_review')
  const [buyerName,        setBuyerName]        = useState(() => {
    if (isLinked) return DEMO_BUYER_DATA.name
    if (isDemoMode) return DEMO_BUYERS[Math.floor(Math.random() * DEMO_BUYERS.length)]
    return ''
  })
  const [buyerPhone,       setBuyerPhone]       = useState(() => isLinked ? DEMO_BUYER_DATA.phone : '')
  const [buyerAddress,     setBuyerAddress]     = useState('')
  const [kota,             setKota]             = useState('')
  const [kodePos,          setKodePos]          = useState('')
  const [formErrors,       setFormErrors]       = useState<Record<string, string>>({})
  const [selectedShipping, setSelectedShipping] = useState('pickup')
  const [selectedPayment,  setSelectedPayment]  = useState<PaymentMethod>('astrapay')
  const [orderId,          setOrderId]          = useState<string | null>(null)
  const [confirming,       setConfirming]       = useState(false)
  const [qrisStatus,       setQrisStatus]       = useState<QrisStatus>('waiting')
  const [merchantPhase,    setMerchantPhase]    = useState<MerchantPhase>('intro')
  const [summaryOpen,      setSummaryOpen]      = useState(false)
  const [astraPayUrl,        setAstraPayUrl]        = useState<string | null>(null)
  const [astraPayTxId,       setAstraPayTxId]       = useState<string | null>(null)
  const [astraPayError,      setAstraPayError]      = useState<string | null>(null)
  const [astraPayBindingUrl, setAstraPayBindingUrl] = useState<string | null>(null)
  const [bindingTabOpened,   setBindingTabOpened]   = useState(false)
  const fallbackRef       = useRef<ReturnType<typeof setTimeout> | null>(null)
  const startPaymentRef   = useRef<((token?: string) => void) | null>(null)
  const confirmingRef = useRef(false)
  const pollRef       = useRef<ReturnType<typeof setInterval> | null>(null)

  const isDemo         = process.env.NEXT_PUBLIC_PAYMENT_PROVIDER === 'demo'
  const shipping       = SHIPPING_OPTIONS.find((s) => s.id === selectedShipping) ?? SHIPPING_OPTIONS[0]
  const subtotal       = cart.reduce((s, item) => s + item.product.price * item.quantity, 0)
  const totalQty       = cart.reduce((s, item) => s + item.quantity, 0)
  const total          = subtotal + shipping.price
  const isDark         = step === 'merchant_reveal'
  const primary        = cart[0].product
  const currentStepIdx = CHECKOUT_STEP_INDEX[step]

  function validateBuyerInfo() {
    const errs: Record<string, string> = {}
    if (!buyerName.trim()) errs.nama = 'Nama wajib diisi'
    const cleanPhone = buyerPhone.replace(/[\s\-]/g, '')
    if (!cleanPhone) errs.wa = 'Nomor WhatsApp wajib diisi'
    else if (!/^\d{10,}$/.test(cleanPhone)) errs.wa = 'Minimal 10 digit, hanya angka'
    if (selectedShipping !== 'pickup') {
      if (!buyerAddress.trim()) errs.alamat = 'Alamat wajib diisi'
      if (!kota) errs.kota = 'Kota wajib dipilih'
      if (!kodePos) errs.kodePos = 'Kode pos wajib diisi'
      else if (!/^\d{5}$/.test(kodePos)) errs.kodePos = 'Kode pos harus 5 digit angka'
    }
    setFormErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function handleConfirm() {
    if (confirmingRef.current) return
    confirmingRef.current = true
    setConfirming(true)
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          seller_id:       seller.id,
          product_id:      primary.id,
          product_name:    cart.length > 1 ? `${primary.name} +${cart.length - 1} lainnya` : cart[0].quantity > 1 ? `${primary.name} ×${cart[0].quantity}` : primary.name,
          price:           subtotal,
          quantity:        totalQty,
          shipping_cost:   shipping.price,
          shipping_method: shipping.id,
          buyer_address:   buyerAddress,
          buyer_city:      kota,
          category:        primary.category,
          buyer_name:      buyerName,
          buyer_phone:     buyerPhone,
        }),
      })
      const json = await res.json()
      setOrderId(json.order?.id ?? null)
      setStep('success')
      onDemoProgress?.('success')
    } catch {
      confirmingRef.current = false
      setConfirming(false)
      setStep('payment_failed')
    }
  }

  // Cinematic QRIS — ~8 seconds total (demo mode only)
  useEffect(() => {
    if (!isDemo || step !== 'qris') return
    const t1 = setTimeout(() => setQrisStatus('detected'),  3000)
    const t2 = setTimeout(() => setQrisStatus('verifying'), 5000)
    const t3 = setTimeout(() => setQrisStatus('verified'),  7000)
    const t4 = setTimeout(() => handleConfirm(),            8500)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, isDemo])

  // Real AstraPay payment — account binding first, then create payment + poll status
  useEffect(() => {
    if (isDemo || step !== 'qris' || selectedPayment !== 'astrapay') return
    if (astraPayTxId) return // already initiated
    if (total === 0) { handleConfirm(); return } // free item, skip payment

    const primaryProduct = cart[0].product
    const description = cart.length > 1
      ? `${primaryProduct.name} +${cart.length - 1} lainnya`
      : cart.length === 1 && cart[0].quantity > 1
        ? `${primaryProduct.name} ×${cart[0].quantity}`
        : primaryProduct.name

    const startPayment = (bankCardToken?: string) => {
      const txId = `AT-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`
      setAstraPayTxId(txId)
      setAstraPayError(null)

      fetch('/api/astrapay/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          merchantTransactionId: txId,
          amount: total,
          description,
          phoneNo: buyerPhone,
          bankCardToken,
        }),
      })
        .then(r => r.json())
        .then(data => {
          if (data.error || !data.urlRedirect) {
            if (isDemoMode) {
              setAstraPayTxId(null)
              setQrisStatus('waiting')
              const t1 = setTimeout(() => setQrisStatus('detected'),  3000)
              const t2 = setTimeout(() => setQrisStatus('verifying'), 5000)
              const t3 = setTimeout(() => setQrisStatus('verified'),  7000)
              const t4 = setTimeout(() => handleConfirm(),            8500)
              pollRef.current = t4 as unknown as ReturnType<typeof setInterval>
              setTimeout(() => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }, 9000)
              return
            }
            setAstraPayError(data.error ?? 'Gagal membuat pembayaran')
            return
          }
          setAstraPayUrl(data.urlRedirect)
          window.open(data.urlRedirect, '_blank', 'noopener,noreferrer')

          pollRef.current = setInterval(async () => {
            try {
              const res = await fetch(`/api/astrapay/status?id=${txId}&amount=${total}`)
              const { status } = await res.json()
              if (status === '00') {
                if (pollRef.current) clearInterval(pollRef.current)
                handleConfirm()
              } else if (status === '05' || status === '06') {
                if (pollRef.current) clearInterval(pollRef.current)
                setStep('payment_failed')
              }
            } catch { /* keep polling */ }
          }, 3000)
        })
        .catch(() => {
          if (isDemoMode) {
            setAstraPayTxId(null)
            setQrisStatus('waiting')
          } else {
            setAstraPayError('Tidak dapat terhubung ke AstraPay')
          }
        })
    }
    startPaymentRef.current = startPayment

    const pollBindingUntilLinked = (phone: string) => {
      // Poll DB for token (works if server callback is configured)
      pollRef.current = setInterval(async () => {
        try {
          const res = await fetch(`/api/astrapay/check-binding?phone=${encodeURIComponent(phone)}`)
          const data = await res.json()
          if (data.bound && data.token) {
            if (pollRef.current) clearInterval(pollRef.current)
            if (fallbackRef.current) clearTimeout(fallbackRef.current)
            setAstraPayBindingUrl(null)
            startPayment(data.token)
          }
        } catch { /* keep polling */ }
      }, 3000)

      // After 30s, fall back to direct H2H with phoneNo (works once user is registered on AstraPay)
      fallbackRef.current = setTimeout(() => {
        if (pollRef.current) clearInterval(pollRef.current)
        setAstraPayBindingUrl(null)
        startPayment()
      }, 30_000)
    }

    // Check if already bound, otherwise initiate binding first
    fetch(`/api/astrapay/check-binding?phone=${encodeURIComponent(buyerPhone)}`)
      .then(r => r.json())
      .then(data => {
        if (data.bound && data.token) {
          startPayment(data.token)
        } else {
          // Initiate account binding
          fetch('/api/astrapay/bind', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phoneNo: buyerPhone }),
          })
            .then(r => r.json())
            .then(bindData => {
              if (bindData.redirectUrl) {
                setAstraPayBindingUrl(bindData.redirectUrl)
                window.open(bindData.redirectUrl, '_blank', 'noopener,noreferrer')
                pollBindingUntilLinked(buyerPhone)
              } else {
                // Binding not available — try direct H2H (works if phone already registered)
                startPayment()
              }
            })
            .catch(() => setAstraPayError('Tidak dapat terhubung ke AstraPay'))
        }
      })
      .catch(() => {
        // Fallback: try payment directly without binding token
        startPayment()
      })

    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
      if (fallbackRef.current) clearTimeout(fallbackRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, isDemo, selectedPayment])

  useEffect(() => {
    if (step !== 'merchant_reveal') return
    const t = setTimeout(() => setMerchantPhase('dashboard'), 5500)
    return () => clearTimeout(t)
  }, [step])

  const qrisConfig = {
    waiting:   { text: 'Menunggu pembayaran via AstraPay...', color: 'text-gray-400' },
    detected:  { text: 'Pembayaran terdeteksi ✓',             color: 'text-blue-500'  },
    verifying: { text: 'Memverifikasi transaksi...',           color: 'text-amber-500' },
    verified:  { text: 'Pembayaran diterima ✓',               color: 'text-green-500' },
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center" onClick={isDark ? undefined : onClose}>
      <div
        className={`w-full max-w-md rounded-t-3xl pb-8 overflow-y-auto max-h-[92vh] transition-colors duration-500 ${isDark ? 'bg-gray-950' : 'bg-white'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-center pt-3 pb-1">
          <div className={`w-10 h-1 rounded-full ${isDark ? 'bg-white/10' : 'bg-gray-200'}`} />
        </div>

        {/* ── Progress bar ── */}
        {!['success', 'merchant_reveal'].includes(step) && (
          <div className="flex items-start px-5 pt-2 pb-1">
            {CHECKOUT_STEP_LABELS.map((label, idx) => (
              <Fragment key={label}>
                <div className="flex flex-col items-center gap-0.5 flex-shrink-0">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-extrabold transition-all duration-300 ${
                    idx < currentStepIdx ? 'bg-green-500 text-white' :
                    idx === currentStepIdx ? 'bg-app-blue text-white' :
                    'bg-gray-100 text-gray-400'
                  }`}>
                    {idx < currentStepIdx ? '✓' : idx + 1}
                  </div>
                  <span className={`text-[8px] font-medium ${
                    idx === currentStepIdx ? 'text-app-blue' :
                    idx < currentStepIdx ? 'text-green-500' : 'text-gray-300'
                  }`}>{label}</span>
                </div>
                {idx < CHECKOUT_STEP_LABELS.length - 1 && (
                  <div className={`flex-1 h-0.5 mt-2.5 mx-1 transition-colors duration-300 ${idx < currentStepIdx ? 'bg-green-400' : 'bg-gray-100'}`} />
                )}
              </Fragment>
            ))}
          </div>
        )}

        {/* ── Cart Review ── */}
        {step === 'cart_review' && (
          <div className="px-5 pb-8 pt-3">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-extrabold text-gray-900 text-lg">Keranjang ({totalQty})</h3>
              <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-2.5 mb-4">
              {cart.map((item) => {
                const { color, Icon } = getCategoryStyle(item.product.category)
                return (
                  <div key={item.product.id} className="flex items-center gap-3 bg-gray-50 rounded-xl px-3 py-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: color }}>
                      <Icon size={16} className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm truncate">{item.product.name}</p>
                      <p className="text-app-blue font-bold text-sm">{formatRp(item.product.price * item.quantity)}</p>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button
                        onClick={() => item.quantity === 1 ? onRemove(item.product.id) : onUpdateQty(item.product.id, item.quantity - 1)}
                        className="w-6 h-6 flex items-center justify-center rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors text-base leading-none font-bold"
                      >
                        −
                      </button>
                      <span className="text-sm font-bold text-gray-900 w-5 text-center">{item.quantity}</span>
                      <button
                        onClick={() => onUpdateQty(item.product.id, item.quantity + 1)}
                        className="w-6 h-6 flex items-center justify-center rounded-full bg-app-blue text-white hover:bg-app-blue-light transition-colors text-base leading-none font-bold"
                      >
                        +
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="bg-gray-50 rounded-xl px-4 py-3 flex justify-between items-center mb-5">
              <span className="text-sm text-gray-600">Subtotal ({totalQty} item)</span>
              <span className="font-extrabold text-gray-900 text-base">{formatRp(subtotal)}</span>
            </div>

            <button
              onClick={() => { setStep('shipping'); onDemoProgress?.('checkout') }}
              className="w-full bg-app-blue hover:bg-app-blue-light text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-colors text-base"
            >
              <ShoppingCart size={18} /> Checkout Semuanya <ArrowRight size={18} />
            </button>
          </div>
        )}

        {/* ── Shipping ── */}
        {step === 'shipping' && (
          <div className="px-5 pb-8 pt-3">
            <div className="flex items-center gap-3 mb-5">
              <button onClick={() => setStep('cart_review')} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 flex-shrink-0">
                <ArrowLeft size={16} />
              </button>
              <h3 className="font-extrabold text-gray-900 text-lg">Metode Pengiriman</h3>
            </div>

            <div className="space-y-2.5 mb-4">
              {SHIPPING_OPTIONS.map((opt) => (
                <button key={opt.id} onClick={() => setSelectedShipping(opt.id)}
                  className={`w-full flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all text-left ${selectedShipping === opt.id ? 'border-app-blue bg-app-blue-pale' : 'border-gray-100 bg-white hover:border-gray-200'}`}
                >
                  <span className="text-lg flex-shrink-0">{opt.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm">{opt.name}</p>
                    <p className="text-xs text-gray-400">{opt.duration}</p>
                  </div>
                  <p className={`text-sm font-bold flex-shrink-0 ${opt.price === 0 ? 'text-green-600' : 'text-gray-700'}`}>
                    {opt.price === 0 ? 'Gratis' : formatRp(opt.price)}
                  </p>
                  <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${selectedShipping === opt.id ? 'border-app-blue bg-app-blue' : 'border-gray-300'}`}>
                    {selectedShipping === opt.id && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                  </div>
                </button>
              ))}
            </div>

            {/* Mini order summary */}
            <div className="bg-gray-50 rounded-xl mb-5 overflow-hidden">
              <button onClick={() => setSummaryOpen(!summaryOpen)} className="w-full flex items-center justify-between px-4 py-3">
                <span className="text-sm font-semibold text-gray-700">Ringkasan Pesanan</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-extrabold text-app-blue">{formatRp(total)}</span>
                  <ChevronDown size={14} className={`text-gray-400 transition-transform duration-200 ${summaryOpen ? 'rotate-180' : ''}`} />
                </div>
              </button>
              {summaryOpen && (
                <div className="px-4 pb-3 border-t border-gray-100">
                  <div className="space-y-1.5 pt-2.5 mb-2">
                    {cart.map((item) => (
                      <div key={item.product.id} className="flex justify-between">
                        <span className="text-xs text-gray-600">{item.quantity > 1 ? `${item.quantity}× ` : ''}{item.product.name}</span>
                        <span className="text-xs font-medium text-gray-800">{formatRp(item.product.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-gray-200 pt-2 space-y-1">
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-500">Subtotal</span>
                      <span className="text-xs text-gray-700">{formatRp(subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-500">{shipping.name}</span>
                      <span className="text-xs text-gray-700">{shipping.price === 0 ? 'Gratis' : formatRp(shipping.price)}</span>
                    </div>
                    <div className="flex justify-between border-t border-gray-200 pt-1.5">
                      <span className="text-sm font-bold text-gray-900">Total</span>
                      <span className="text-sm font-extrabold text-app-blue">{formatRp(total)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <button onClick={() => setStep('buyer_info')}
              className="w-full bg-app-blue hover:bg-app-blue-light text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-colors text-base"
            >
              Lanjut <ArrowRight size={18} />
            </button>
          </div>
        )}

        {/* ── Buyer Info ── */}
        {step === 'buyer_info' && (
          <div className="px-5 pb-8 pt-3">
            <div className="flex items-center gap-3 mb-4">
              <button onClick={() => setStep('shipping')} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 flex-shrink-0">
                <ArrowLeft size={16} />
              </button>
              <h3 className="font-extrabold text-gray-900 text-lg">Info Pembeli</h3>
            </div>

            {isLinked ? (
              <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-xl px-3 py-2 mb-3">
                <CheckCircle size={13} className="text-app-blue flex-shrink-0" />
                <p className="text-xs text-app-blue font-medium">Terisi otomatis dari akun AstraPay kamu</p>
              </div>
            ) : (
              <button
                onClick={() => {
                  setBuyerName(DEMO_BUYER_DATA.name)
                  setBuyerPhone(DEMO_BUYER_DATA.phone)
                  setFormErrors({})
                  onLink?.()
                }}
                className="w-full flex items-center justify-center gap-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl px-3 py-2.5 mb-3 transition-colors"
              >
                <Zap size={13} className="text-astrapay-gold" fill="currentColor" />
                <p className="text-xs text-app-blue font-semibold">Gunakan data dari AstraPay</p>
              </button>
            )}

            <div className="space-y-3 mb-4">
              {/* Nama */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nama Lengkap</label>
                <input type="text" value={buyerName} onChange={(e) => { setBuyerName(e.target.value); setFormErrors((p) => ({ ...p, nama: '' })) }}
                  placeholder="contoh: Justin Bieber" autoFocus
                  className={`w-full border rounded-xl px-4 py-3 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-app-blue/20 transition-colors ${formErrors.nama ? 'border-red-300 bg-red-50' : isLinked ? 'bg-blue-50/50 border-blue-100 focus:bg-white' : 'bg-gray-50 border-gray-200 focus:bg-white'}`}
                />
                {formErrors.nama && <p className="text-xs text-red-500 mt-1">{formErrors.nama}</p>}
              </div>

              {/* WhatsApp */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nomor WhatsApp</label>
                <input type="tel" value={buyerPhone} onChange={(e) => { setBuyerPhone(e.target.value); setFormErrors((p) => ({ ...p, wa: '' })) }}
                  placeholder="08123456789"
                  className={`w-full border rounded-xl px-4 py-3 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-app-blue/20 transition-colors ${formErrors.wa ? 'border-red-300 bg-red-50' : isLinked ? 'bg-blue-50/50 border-blue-100 focus:bg-white' : 'bg-gray-50 border-gray-200 focus:bg-white'}`}
                />
                {formErrors.wa && <p className="text-xs text-red-500 mt-1">{formErrors.wa}</p>}
              </div>

              {/* Shipping address fields */}
              {selectedShipping !== 'pickup' && (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
                      <MapPin size={13} className="text-gray-400" /> Alamat Lengkap
                    </label>
                    <textarea value={buyerAddress} onChange={(e) => { setBuyerAddress(e.target.value); setFormErrors((p) => ({ ...p, alamat: '' })) }}
                      placeholder={'Jl. Contoh No. 123\nRT 01/RW 02\nKelurahan Contoh'} rows={3}
                      className={`w-full bg-gray-50 border rounded-xl px-4 py-3 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-app-blue/20 focus:bg-white transition-colors resize-none ${formErrors.alamat ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
                    />
                    {formErrors.alamat && <p className="text-xs text-red-500 mt-1">{formErrors.alamat}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Kota</label>
                      <select value={kota} onChange={(e) => { setKota(e.target.value); setFormErrors((p) => ({ ...p, kota: '' })) }}
                        className={`w-full bg-gray-50 border rounded-xl px-4 py-3 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-app-blue/20 focus:bg-white transition-colors appearance-none ${formErrors.kota ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
                      >
                        <option value="">Pilih kota</option>
                        {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                      {formErrors.kota && <p className="text-xs text-red-500 mt-1">{formErrors.kota}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Kode Pos</label>
                      <input type="text" value={kodePos} onChange={(e) => { setKodePos(e.target.value.replace(/\D/g, '').slice(0, 5)); setFormErrors((p) => ({ ...p, kodePos: '' })) }}
                        placeholder="12345" maxLength={5}
                        className={`w-full bg-gray-50 border rounded-xl px-4 py-3 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-app-blue/20 focus:bg-white transition-colors ${formErrors.kodePos ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
                      />
                      {formErrors.kodePos && <p className="text-xs text-red-500 mt-1">{formErrors.kodePos}</p>}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Mini order summary */}
            <div className="bg-gray-50 rounded-xl mb-4 overflow-hidden">
              <button onClick={() => setSummaryOpen(!summaryOpen)} className="w-full flex items-center justify-between px-4 py-3">
                <span className="text-sm font-semibold text-gray-700">Ringkasan Pesanan</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-extrabold text-app-blue">{formatRp(total)}</span>
                  <ChevronDown size={14} className={`text-gray-400 transition-transform duration-200 ${summaryOpen ? 'rotate-180' : ''}`} />
                </div>
              </button>
              {summaryOpen && (
                <div className="px-4 pb-3 border-t border-gray-100">
                  <div className="space-y-1.5 pt-2.5 mb-2">
                    {cart.map((item) => (
                      <div key={item.product.id} className="flex justify-between">
                        <span className="text-xs text-gray-600">{item.quantity > 1 ? `${item.quantity}× ` : ''}{item.product.name}</span>
                        <span className="text-xs font-medium text-gray-800">{formatRp(item.product.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-gray-200 pt-2 space-y-1">
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-500">Subtotal</span>
                      <span className="text-xs text-gray-700">{formatRp(subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-500">{shipping.name}</span>
                      <span className="text-xs text-gray-700">{shipping.price === 0 ? 'Gratis' : formatRp(shipping.price)}</span>
                    </div>
                    <div className="flex justify-between border-t border-gray-200 pt-1.5">
                      <span className="text-sm font-bold text-gray-900">Total</span>
                      <span className="text-sm font-extrabold text-app-blue">{formatRp(total)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <button onClick={() => { if (validateBuyerInfo()) setStep('payment_method') }}
              className="w-full bg-app-blue hover:bg-app-blue-light text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-colors text-base"
            >
              Lanjut <ArrowRight size={18} />
            </button>
          </div>
        )}

        {/* ── Payment Method ── */}
        {step === 'payment_method' && (
          <div className="px-5 pb-8 pt-3">
            <div className="flex items-center gap-3 mb-5">
              <button onClick={() => setStep('buyer_info')} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 flex-shrink-0">
                <ArrowLeft size={16} />
              </button>
              <h3 className="font-extrabold text-gray-900 text-lg">Metode Pembayaran</h3>
            </div>

            <div className="bg-gray-50 rounded-2xl px-4 py-3.5 mb-4 space-y-2">
              {cart.map((item) => {
                const { color, Icon } = getCategoryStyle(item.product.category)
                return (
                  <div key={item.product.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: color }}>
                        <Icon size={9} className="text-white" />
                      </div>
                      <span className="text-xs text-gray-600 truncate max-w-[150px]">
                        {item.product.name}{item.quantity > 1 ? ` ×${item.quantity}` : ''}
                      </span>
                    </div>
                    <span className="text-xs font-medium text-gray-800">{formatRp(item.product.price * item.quantity)}</span>
                  </div>
                )
              })}
              <div className="border-t border-gray-200 pt-2 flex items-center justify-between">
                <span className="text-xs text-gray-500 flex items-center gap-1"><Truck size={10} />{shipping.name}</span>
                <span className="text-xs text-gray-700">{shipping.price === 0 ? 'Gratis' : formatRp(shipping.price)}</span>
              </div>
              <div className="border-t border-gray-200 pt-2 flex items-center justify-between">
                <span className="text-sm font-bold text-gray-900">Total</span>
                <span className="text-base font-extrabold text-app-blue">{formatRp(total)}</span>
              </div>
            </div>

            <div className="space-y-2.5 mb-5">
              {[
                { id: 'astrapay' as PaymentMethod, name: 'AstraPay + QRIS', desc: '+50 AstraPoints per transaksi', badge: '⭐ Rekomendasi', color: 'text-app-blue' },
                { id: 'transfer' as PaymentMethod, name: 'Transfer Bank',    desc: 'BCA, Mandiri, BNI',             badge: null,            color: 'text-gray-700' },
                { id: 'cod'      as PaymentMethod, name: 'Bayar di Tempat',  desc: 'Bayar saat diterima',           badge: null,            color: 'text-gray-700' },
              ].map((method) => (
                <button key={method.id} onClick={() => setSelectedPayment(method.id)}
                  className={`w-full flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all text-left ${selectedPayment === method.id ? 'border-app-blue bg-app-blue-pale' : 'border-gray-100 bg-white hover:border-gray-200'}`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={`font-semibold text-sm ${method.color}`}>{method.name}</p>
                      {method.badge && <span className="text-[9px] bg-amber-100 text-amber-700 font-bold px-1.5 py-0.5 rounded-full">{method.badge}</span>}
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">{method.desc}</p>
                  </div>
                  <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${selectedPayment === method.id ? 'border-app-blue bg-app-blue' : 'border-gray-300'}`}>
                    {selectedPayment === method.id && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                  </div>
                </button>
              ))}
            </div>

            <button onClick={() => setStep('qris')}
              className="w-full bg-app-blue hover:bg-app-blue-light text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-colors text-base"
            >
              <ShoppingBag size={18} /> Bayar {formatRp(total)}
            </button>
          </div>
        )}

        {/* ── QRIS / AstraPay ── */}
        {step === 'qris' && (
          <div className="px-5 pb-8 pt-3 text-center">
            <div className="flex items-center gap-3 mb-4">
              <button onClick={() => { if (pollRef.current) clearInterval(pollRef.current); setAstraPayTxId(null); setAstraPayUrl(null); setAstraPayBindingUrl(null); setAstraPayError(null); setStep('payment_method') }}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 flex-shrink-0">
                <ArrowLeft size={16} />
              </button>
              <h3 className="font-extrabold text-gray-900 text-lg">
                {!isDemo && selectedPayment === 'astrapay' ? 'AstraPay' : 'Scan QRIS'}
              </h3>
            </div>

            <p className="text-3xl font-extrabold text-app-blue tracking-tight mb-5">{formatRp(total)}</p>

            {/* Real AstraPay UI */}
            {!isDemo && selectedPayment === 'astrapay' ? (
              <div className="space-y-4">
                {astraPayError ? (
                  <div className="bg-red-50 border border-red-100 rounded-2xl px-4 py-5">
                    <p className="text-sm font-semibold text-red-700 mb-1">Gagal terhubung ke AstraPay</p>
                    <p className="text-xs text-red-500 font-mono break-all mb-3">{astraPayError}</p>
                    <button onClick={() => { setAstraPayTxId(null); setAstraPayError(null); setAstraPayBindingUrl(null) }}
                      className="text-xs font-bold text-red-600 underline">Coba Lagi</button>
                  </div>
                ) : (
                  <>
                    {/* AstraPay logo / status card */}
                    <div className="bg-gradient-to-br from-app-blue to-blue-700 rounded-2xl px-5 py-6 text-white">
                      <div className="flex items-center justify-center gap-2 mb-4">
                        <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                          <span className="text-white font-extrabold text-xs">AP</span>
                        </div>
                        <span className="font-extrabold text-lg">AstraPay</span>
                      </div>
                      {astraPayBindingUrl ? (
                        <>
                          <div className="flex items-center justify-center gap-2 mb-2">
                            <div className="w-2 h-2 bg-yellow-300 rounded-full animate-pulse" />
                            <p className="text-sm text-blue-100 font-medium">
                              {bindingTabOpened ? 'Menunggu konfirmasi AstraPay...' : 'Hubungkan akun AstraPay dulu'}
                            </p>
                          </div>
                          <p className="text-[10px] text-blue-200 text-center">
                            {bindingTabOpened
                              ? 'Selesaikan di tab AstraPay, lalu tekan tombol di bawah.'
                              : 'Selesaikan registrasi di tab AstraPay. Pembayaran otomatis dilanjutkan setelah terhubung.'}
                          </p>
                        </>
                      ) : astraPayUrl ? (
                        <>
                          <div className="flex items-center justify-center gap-2 mb-2">
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                            <p className="text-sm text-blue-100 font-medium">Menunggu pembayaran...</p>
                          </div>
                          <p className="text-[10px] text-blue-200 text-center">
                            Selesaikan pembayaran di tab AstraPay yang terbuka
                          </p>
                        </>
                      ) : (
                        <div className="flex items-center justify-center gap-2">
                          <svg className="animate-spin h-4 w-4 text-blue-200 flex-shrink-0" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                          </svg>
                          <p className="text-sm text-blue-100">Memeriksa akun AstraPay...</p>
                        </div>
                      )}
                    </div>

                    {astraPayBindingUrl && !bindingTabOpened && (
                      <a href={astraPayBindingUrl} target="_blank" rel="noopener noreferrer"
                        onClick={() => setBindingTabOpened(true)}
                        className="w-full bg-yellow-500 hover:bg-yellow-400 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-colors text-sm"
                      >
                        Buka AstraPay — Daftar / Hubungkan <ArrowRight size={16} />
                      </a>
                    )}
                    {astraPayBindingUrl && bindingTabOpened && (
                      <button
                        onClick={() => {
                          if (pollRef.current) clearInterval(pollRef.current)
                          if (fallbackRef.current) clearTimeout(fallbackRef.current)
                          setAstraPayBindingUrl(null)
                          startPaymentRef.current?.()
                        }}
                        className="w-full bg-green-500 hover:bg-green-400 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-colors text-sm"
                      >
                        Sudah selesai di AstraPay — Lanjut Bayar <ArrowRight size={16} />
                      </button>
                    )}
                    {astraPayUrl && !astraPayBindingUrl && (
                      <>
                        <a href={astraPayUrl} target="_blank" rel="noopener noreferrer"
                          className="w-full bg-app-blue hover:bg-app-blue-light text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-colors text-sm"
                        >
                          Buka AstraPay <ArrowRight size={16} />
                        </a>
                        {astraPayTxId && (
                          <p className="text-[10px] text-gray-300 font-mono">
                            TX: {astraPayTxId}
                          </p>
                        )}
                      </>
                    )}
                  </>
                )}

                <button onClick={() => { if (pollRef.current) clearInterval(pollRef.current); setStep('payment_failed') }}
                  className="text-[10px] text-gray-300 hover:text-gray-400 transition-colors">
                  Simulasi timeout →
                </button>
              </div>
            ) : (
              /* Demo QRIS UI */
              <>
                <div className="relative bg-gray-50 rounded-2xl p-3 inline-flex mb-2 mx-auto">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=astratoko-${seller.slug}-demo&bgcolor=ffffff&color=1a1a2e&margin=2`}
                    alt="QRIS" width={180} height={180} className="rounded-lg"
                  />
                  {qrisStatus === 'waiting' && (
                    <div className="absolute inset-3 overflow-hidden rounded-lg pointer-events-none">
                      <div className="w-full h-0.5 bg-blue-500/70 shadow-[0_0_8px_rgba(59,130,246,0.8)] animate-shimmer-scan" />
                    </div>
                  )}
                  {qrisStatus === 'detected' && (
                    <div className="absolute inset-0 bg-green-500/10 rounded-2xl flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center animate-scale-in">
                        <div className="text-2xl">✓</div>
                      </div>
                    </div>
                  )}
                  {(qrisStatus === 'verifying' || qrisStatus === 'verified') && (
                    <div className={`absolute inset-0 rounded-2xl flex items-center justify-center ${qrisStatus === 'verified' ? 'bg-green-500/15' : 'bg-blue-500/10'}`}>
                      {qrisStatus === 'verifying' ? (
                        <svg className="animate-spin h-10 w-10 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                      ) : (
                        <div className="text-5xl animate-bounce-in">✓</div>
                      )}
                    </div>
                  )}
                </div>

                <div className="h-6 flex items-center justify-center mb-1">
                  <p className={`text-sm font-medium transition-all duration-500 ${qrisConfig[qrisStatus].color}`}>
                    {qrisConfig[qrisStatus].text}
                  </p>
                </div>
                <p className="text-xs text-gray-400 mb-4">{seller.name} · AstraPay</p>
                {isDemo && qrisStatus === 'waiting' && (
                  <p className="text-xs text-gray-300 mb-3">Demo · simulasi otomatis ~8 detik</p>
                )}
                {!isDemo && (
                  <button onClick={handleConfirm} disabled={confirming}
                    className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-70 text-white font-bold py-4 rounded-2xl transition-colors text-sm flex items-center justify-center gap-2"
                  >
                    {confirming ? <><svg className="animate-spin h-4 w-4 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Memproses...</> : 'Konfirmasi Pembayaran'}
                  </button>
                )}
                <button onClick={() => setStep('payment_failed')} className="text-[10px] text-gray-300 hover:text-gray-400 mt-3 transition-colors">
                  Simulasi gagal →
                </button>
              </>
            )}
          </div>
        )}

        {/* ── Payment Failed ── */}
        {step === 'payment_failed' && (
          <div className="px-5 pb-8 pt-4 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce-in">
              <X size={30} className="text-red-500" />
            </div>
            <h3 className="text-xl font-extrabold text-gray-900 mb-1">Pembayaran Gagal</h3>
            <p className="text-sm text-gray-500 mb-1">Transaksi tidak dapat diproses</p>
            <p className="text-xs text-gray-400 mb-8 leading-relaxed">
              Koneksi terputus atau saldo tidak mencukupi.<br />Silakan coba lagi.
            </p>

            <button onClick={() => { setStep('qris'); setQrisStatus('waiting') }}
              className="w-full bg-app-blue hover:bg-app-blue-light text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-colors text-base mb-3"
            >
              Coba Lagi
            </button>
            <button onClick={() => setStep('payment_method')}
              className="w-full border-2 border-gray-200 text-gray-600 font-semibold py-3.5 rounded-2xl hover:bg-gray-50 transition-colors text-sm mb-2"
            >
              Ganti Metode Pembayaran
            </button>
            <button onClick={onClose} className="text-xs text-gray-400 hover:text-gray-600 py-2 transition-colors">
              Batalkan pesanan
            </button>
          </div>
        )}

        {/* ── Success ── */}
        {step === 'success' && (
          <div className="px-5 pb-8 pt-4 text-center">
            <Confetti active />
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3 animate-bounce-in">
              <CheckCircle size={32} className="text-green-600" />
            </div>
            <h3 className="text-xl font-extrabold text-gray-900 mb-0.5">Pembayaran Berhasil!</h3>
            <p className="text-3xl font-extrabold text-green-600 tracking-tight leading-none mb-1">{formatRp(total)}</p>
            <p className="text-sm text-gray-400 mb-0.5">via AstraPay · {seller.name}</p>
            {orderId && <p className="text-xs text-gray-300 font-mono mb-5">#{orderId.slice(0, 8).toUpperCase()}</p>}

            <div className="bg-app-blue rounded-2xl px-4 py-4 text-white flex items-center justify-between mb-5 animate-fadein" style={{ animationDelay: '0.2s' }}>
              <div className="text-left">
                <p className="text-xs text-blue-200 mb-0.5">AstraPoints kamu</p>
                <p className="text-3xl font-extrabold tracking-tight leading-none">+{totalQty * 50}</p>
                <p className="text-[10px] text-blue-200 mt-1">tukar jadi saldo AstraPay</p>
              </div>
              <Star size={36} className="text-astrapay-gold flex-shrink-0" fill="currentColor" />
            </div>

            {isDemoMode ? (
              <div className="animate-fadein" style={{ animationDelay: '0.5s' }}>
                <button onClick={() => setStep('merchant_reveal')}
                  className="w-full bg-gray-900 hover:bg-gray-800 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-colors text-sm mb-2"
                >
                  Lihat yang terjadi di merchant →
                </button>
                <button onClick={onClose} className="w-full text-xs text-gray-400 hover:text-gray-600 py-2 transition-colors">
                  Lanjut jelajahi toko
                </button>
              </div>
            ) : (
              <button onClick={onClose} className="w-full border-2 border-app-blue text-app-blue font-bold py-3.5 rounded-2xl hover:bg-app-blue-pale transition-colors">
                Lanjut Belanja
              </button>
            )}
          </div>
        )}

        {/* ── Merchant Reveal ── */}
        {step === 'merchant_reveal' && (
          <div className="px-5 pb-8 pt-4 min-h-[520px]">
            {merchantPhase === 'intro' ? (
              <div className="flex flex-col justify-center min-h-[440px] animate-fade-blur-in">
                <div className="text-4xl mb-8 text-center">✨</div>

                <div className="space-y-5 mb-10">
                  {[
                    { delay: '0s',    label: 'Pembayaran berhasil.',                                              style: 'text-green-400 font-extrabold text-lg' },
                    { delay: '0.6s',  label: 'Pelanggan kini tersimpan di database tokomu.',                     style: 'text-gray-300 text-sm leading-relaxed' },
                    { delay: '1.2s',  label: 'Transaksi masuk langsung ke dashboard AstraToko.',                  style: 'text-gray-300 text-sm leading-relaxed' },
                    { delay: '1.8s',  label: 'Tidak ada komisi marketplace untuk repeat order berikutnya.',       style: 'text-astrapay-gold text-sm font-semibold leading-relaxed' },
                  ].map((line) => (
                    <p key={line.label} className={`animate-fadein ${line.style}`} style={{ animationDelay: line.delay, opacity: 0, animationFillMode: 'forwards' }}>
                      {line.label}
                    </p>
                  ))}
                </div>

                <button onClick={() => setMerchantPhase('dashboard')}
                  className="w-full bg-white/10 hover:bg-white/15 border border-white/20 text-white text-sm font-semibold py-3 rounded-xl transition-colors animate-fadein"
                  style={{ animationDelay: '2.5s', opacity: 0, animationFillMode: 'forwards' }}
                >
                  Lihat Dashboard →
                </button>
                <p className="text-gray-600 text-[10px] mt-3 text-center animate-fadein" style={{ animationDelay: '2.5s', opacity: 0, animationFillMode: 'forwards' }}>
                  otomatis dalam beberapa detik
                </p>
              </div>
            ) : (
              <div className="animate-fadein">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Dashboard · Toko Rizky</p>
                  <div className="flex items-center gap-1.5 text-[10px] text-green-400 font-medium">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />Live
                  </div>
                </div>
                <MerchantDashboard cart={cart} buyerName={buyerName} shippingName={shipping.name} />
                <div className="mt-5 animate-fadein" style={{ animationDelay: '0.6s' }}>
                  <Link href="/mulai" className="w-full bg-white text-gray-900 font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 text-sm hover:bg-gray-100 transition-colors mb-2">
                    Buat Toko Saya Gratis <ArrowRight size={15} />
                  </Link>
                  <button onClick={onClose} className="w-full text-xs text-gray-600 hover:text-gray-400 py-2 transition-colors">
                    Lanjut jelajahi toko
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Tab types & demo data ─────────────────────────────────────────────────────

type ActiveTab = 'beranda' | 'kategori' | 'pesanan' | 'akun'

const DEMO_ORDERS_DATA = [
  { id: 'ORD-3F2A', store: 'Toko Rizky',     storeInitial: 'R', product: 'Brake Pad XYZ Motor',      category: 'Rem',     price: 85_000,  date: '2 hari lalu'    },
  { id: 'ORD-7B1C', store: 'Toko Rizky',     storeInitial: 'R', product: 'Oli Federal Matic 1L',      category: 'Oli',     price: 52_000,  date: '1 minggu lalu'  },
  { id: 'ORD-2E9D', store: 'Toko Rizky',     storeInitial: 'R', product: 'Helm Half Face SNI Merah',  category: 'Helm',    price: 185_000, date: '2 minggu lalu'  },
  { id: 'ORD-5A4F', store: 'Warung Bu Sari', storeInitial: 'W', product: 'Beras Premium 5kg',         category: 'Sembako', price: 75_000,  date: '3 minggu lalu'  },
]

const DEMO_BUYER_DATA = {
  name: 'Nabila Rahmadani',
  phone: '085117323662',
  astraPoints: 350,
  loyaltyCards: [
    { store: 'Toko Rizky',     storeInitial: 'R', color: '#3B5BDB', stamps: 3, maxStamps: 10, reward: 'Gratis ongkir pembelian berikutnya' },
    { store: 'Warung Bu Sari', storeInitial: 'W', color: '#2f9e44', stamps: 1, maxStamps: 10, reward: 'Diskon 10% di pembelian ke-10'      },
  ],
}

// ── Loyalty Stamp Card ────────────────────────────────────────────────────────

function LoyaltyStampCard({ store, storeInitial, color, stamps, maxStamps, reward }: {
  store: string; storeInitial: string; color: string; stamps: number; maxStamps: number; reward: string
}) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
      <div className="flex items-center gap-2.5 mb-3">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-white font-extrabold text-sm" style={{ backgroundColor: color }}>
          {storeInitial}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-gray-900 text-sm">{store}</p>
          <p className="text-[10px] text-gray-400">{stamps} dari {maxStamps} stamp terkumpul</p>
        </div>
      </div>
      <div className="flex gap-1.5 flex-wrap mb-3">
        {Array.from({ length: maxStamps }).map((_, i) => (
          <div key={i} className={`w-[26px] h-[26px] rounded-full flex items-center justify-center ${i < stamps ? 'bg-app-blue' : 'bg-gray-100'}`}>
            {i < stamps && <Star size={11} className="text-white" fill="currentColor" />}
          </div>
        ))}
      </div>
      <div className="bg-amber-50 rounded-xl px-3 py-2 flex items-center gap-2">
        <Star size={11} className="text-astrapay-gold flex-shrink-0" fill="currentColor" />
        <p className="text-[10px] text-amber-800">{reward}</p>
      </div>
    </div>
  )
}

// ── Kategori Tab Panel ────────────────────────────────────────────────────────

function KategoriPanel({ categories, categoryFilter, products, onSelect }: {
  categories: string[]
  categoryFilter: string
  products: Product[]
  onSelect: (cat: string) => void
}) {
  return (
    <div className="px-4 pt-4 pb-24">
      <p className="font-extrabold text-gray-900 text-base mb-4">Kategori Produk</p>
      <div className="grid grid-cols-2 gap-3">
        {['all', ...categories].map((cat) => {
          const { color, Icon } = getCategoryStyle(cat === 'all' ? '' : cat)
          const count = cat === 'all' ? products.length : products.filter((p) => p.category === cat).length
          const isActive = categoryFilter === cat
          return (
            <button
              key={cat}
              onClick={() => onSelect(cat)}
              className={`flex items-center gap-3 p-3.5 rounded-2xl border-2 text-left transition-all ${isActive ? 'border-app-blue bg-app-blue-pale' : 'border-gray-100 bg-white hover:border-gray-200'}`}
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: cat === 'all' ? '#6366f1' : color }}>
                {cat === 'all' ? <LayoutGrid size={16} className="text-white" /> : <Icon size={16} className="text-white" />}
              </div>
              <div className="min-w-0">
                <p className={`text-sm font-semibold truncate ${isActive ? 'text-app-blue' : 'text-gray-900'}`}>{cat === 'all' ? 'Semua' : cat}</p>
                <p className="text-[10px] text-gray-400">{count} produk</p>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ── Pesanan Tab Panel ─────────────────────────────────────────────────────────

function PesananPanel({ isDemoMode }: { isDemoMode: boolean }) {
  const orders = isDemoMode ? DEMO_ORDERS_DATA : []
  return (
    <div className="px-4 pt-4 pb-24">
      <p className="font-extrabold text-gray-900 text-base mb-4">Pesanan Saya</p>
      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
            <Package size={28} className="text-gray-400" />
          </div>
          <p className="font-semibold text-gray-700 mb-1">Belum ada pesanan</p>
          <p className="text-gray-400 text-sm">Mulai belanja dan pesananmu akan muncul di sini.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => {
            const { color, Icon } = getCategoryStyle(order.category)
            return (
              <div key={order.id} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: color }}>
                    <Icon size={16} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm truncate">{order.product}</p>
                    <p className="text-[11px] text-gray-400">{order.store} · {order.date}</p>
                    <div className="flex items-center justify-between mt-1.5">
                      <p className="font-bold text-app-blue text-sm">{formatRp(order.price)}</p>
                      <span className="text-[10px] bg-green-100 text-green-700 font-bold px-2 py-0.5 rounded-full">Lunas</span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ── Akun Tab Panel ────────────────────────────────────────────────────────────

function AkunPanel({ isDemoMode, isLinked, onLink }: { isDemoMode: boolean; isLinked: boolean; onLink: () => void }) {
  const buyer = (isDemoMode || isLinked) ? DEMO_BUYER_DATA : null
  if (!buyer) {
    return (
      <div className="px-4 pt-4 pb-24 flex flex-col items-center justify-center min-h-[400px] text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <User size={28} className="text-gray-400" />
        </div>
        <p className="font-bold text-gray-900 mb-2">Hubungkan AstraPay</p>
        <p className="text-sm text-gray-500 mb-6 max-w-[240px]">Login dengan AstraPay untuk melihat profil dan loyalty card kamu.</p>
        <button onClick={onLink} className="w-full bg-app-blue text-white font-bold py-4 rounded-2xl text-sm">
          Hubungkan AstraPay
        </button>
      </div>
    )
  }
  return (
    <div className="px-4 pt-4 pb-24">
      {/* Profile card */}
      <div className="rounded-2xl overflow-hidden mb-4" style={{ background: 'linear-gradient(135deg, #0f1c40 0%, #1E3A8A 100%)' }}>
        <div className="px-5 pt-5 pb-3 flex items-center gap-3">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-white font-extrabold text-lg flex-shrink-0">
            {buyer.name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-extrabold text-white text-base">{buyer.name}</p>
            <p className="text-blue-300 text-xs">{buyer.phone}</p>
          </div>
          <div className="bg-white/15 rounded-lg px-2 py-1 flex items-center gap-1 flex-shrink-0">
            <span className="text-[10px] text-blue-200 font-medium">AstraPay</span>
            <span className="text-green-400 text-[10px] font-bold">✓</span>
          </div>
        </div>
        <div className="mx-4 mb-4 bg-white/10 rounded-xl px-4 py-3 flex items-center justify-between">
          <div>
            <p className="text-blue-300 text-[10px] mb-0.5">AstraPoints</p>
            <p className="text-2xl font-extrabold text-white">{buyer.astraPoints}</p>
            <p className="text-[10px] text-blue-300 mt-0.5">≈ {formatRp(buyer.astraPoints * 10)} saldo</p>
          </div>
          <Star size={32} className="text-astrapay-gold" fill="currentColor" />
        </div>
      </div>

      {/* Loyalty cards */}
      <p className="font-extrabold text-gray-900 text-sm mb-3">Loyalty Card</p>
      <div className="space-y-3">
        {buyer.loyaltyCards.map((card) => (
          <LoyaltyStampCard key={card.store} {...card} />
        ))}
      </div>
    </div>
  )
}

// ── Bottom Nav ────────────────────────────────────────────────────────────────

function BottomNav({ activeTab, cartCount, onTabChange, onCartOpen }: {
  activeTab: ActiveTab
  cartCount: number
  onTabChange: (tab: ActiveTab) => void
  onCartOpen: () => void
}) {
  const tabs = [
    { id: 'beranda'  as ActiveTab, label: 'Beranda',   Icon: Home,        isCart: false },
    { id: 'kategori' as ActiveTab, label: 'Kategori',  Icon: LayoutGrid,  isCart: false },
    { id: 'cart'     as ActiveTab, label: 'Keranjang', Icon: ShoppingCart, isCart: true  },
    { id: 'pesanan'  as ActiveTab, label: 'Pesanan',   Icon: Package,     isCart: false },
    { id: 'akun'     as ActiveTab, label: 'Akun',      Icon: User,        isCart: false },
  ]
  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-t border-gray-100 z-40 flex items-stretch shadow-[0_-4px_20px_rgba(0,0,0,0.06)]" style={{ height: '60px' }}>
      {tabs.map(({ id, label, Icon: TabIcon, isCart }) => {
        const isActive = !isCart && activeTab === id
        return (
          <button
            key={id}
            onClick={() => isCart ? onCartOpen() : onTabChange(id)}
            className="flex flex-col items-center justify-center gap-0.5 flex-1 relative"
          >
            <div className="relative">
              <TabIcon size={20} className={isActive ? 'text-app-blue' : isCart && cartCount > 0 ? 'text-gray-700' : 'text-gray-400'} />
              {isCart && cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 rounded-full text-[9px] font-bold text-white flex items-center justify-center leading-none">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </div>
            <span className={`text-[9px] font-semibold ${isActive ? 'text-app-blue' : 'text-gray-400'}`}>{label}</span>
            {isActive && <div className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-app-blue rounded-full" />}
          </button>
        )
      })}
    </div>
  )
}

// ── Seller Preview Banner ─────────────────────────────────────────────────────

function SellerPreviewBanner({ slug }: { slug: string }) {
  const [isOwner, setIsOwner] = useState(false)
  useEffect(() => {
    if (typeof localStorage !== 'undefined') setIsOwner(localStorage.getItem('seller_slug') === slug)
  }, [slug])
  if (!isOwner) return null
  return (
    <div className="bg-app-blue px-4 py-3 flex items-center gap-3">
      <div className="flex-1 min-w-0">
        <p className="text-white text-xs font-bold">Ini tampilan tokomu di mata pembeli</p>
        <p className="text-blue-200 text-[10px] mt-0.5">Bagikan link ini ke repeat buyer lewat WhatsApp</p>
      </div>
      <Link href="/dashboard" className="text-white text-xs font-bold bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg flex-shrink-0 transition-colors">Dashboard</Link>
    </div>
  )
}

// ── Storefront Page ───────────────────────────────────────────────────────────

export default function StorefrontPage({ params }: { params: { slug: string } }) {
  const [seller,           setSeller]           = useState<Seller | null>(null)
  const [products,         setProducts]         = useState<Product[]>([])
  const [loading,          setLoading]          = useState(true)
  const [notFound,         setNotFound]         = useState(false)
  const [search,           setSearch]           = useState('')
  const [categoryFilter,   setCategoryFilter]   = useState('all')
  const [sortMode,         setSortMode]         = useState<'popular'|'newest'|'price_asc'|'price_desc'>('popular')
  const [wishlist,         setWishlist]         = useState<Set<string>>(new Set())
  const [isDemoMode,       setIsDemoMode]       = useState(false)
  const [isLinked,         setIsLinked]         = useState(false)
  const [demoProgress,     setDemoProgress]     = useState<DemoProgress>('browse')
  const [toastVisible,     setToastVisible]     = useState(false)
  const [pointsBannerOpen, setPointsBannerOpen] = useState(true)

  // Cart state
  const [cart,             setCart]             = useState<CartItem[]>([])
  const [previewProduct,   setPreviewProduct]   = useState<Product | null>(null)
  const [isCheckoutOpen,   setIsCheckoutOpen]   = useState(false)
  const [isCartSheetOpen,  setIsCartSheetOpen]  = useState(false)
  const [cartToastProduct, setCartToastProduct] = useState<Product | null>(null)
  const [cartToastVisible, setCartToastVisible] = useState(false)
  const [activeTab,        setActiveTab]        = useState<ActiveTab>('beranda')
  const productsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search)
    const demo = searchParams.get('demo') === 'true'
    setIsDemoMode(demo)
    if (demo) {
      setTimeout(() => setToastVisible(true), 600)
      setTimeout(() => setToastVisible(false), 5500)
    }
  }, [])

  useEffect(() => {
    fetch(`/api/sellers/${params.slug}`)
      .then((r) => { if (r.status === 404) { setNotFound(true); return null } return r.json() })
      .then((json) => { if (!json) return; setSeller(json.seller); setProducts(json.products) })
      .finally(() => setLoading(false))
  }, [params.slug])

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id)
      if (existing) return prev.map((item) => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item)
      return [...prev, { product, quantity: 1 }]
    })
    setCartToastProduct(product)
    setCartToastVisible(true)
    setTimeout(() => setCartToastVisible(false), 2500)
    if (isDemoMode && demoProgress === 'browse') setDemoProgress('select')
  }

  const removeFromCart = (productId: string) => setCart((prev) => prev.filter((item) => item.product.id !== productId))

  const updateQuantity = (productId: string, qty: number) => {
    if (qty <= 0) { removeFromCart(productId); return }
    setCart((prev) => prev.map((item) => item.product.id === productId ? { ...item, quantity: qty } : item))
  }

  const handleBuyNow = (product: Product) => {
    setCart([{ product, quantity: 1 }])
    setIsCheckoutOpen(true)
    if (isDemoMode && demoProgress === 'browse') setDemoProgress('select')
  }

  const handleCheckoutFromCart = () => {
    setIsCartSheetOpen(false)
    setIsCheckoutOpen(true)
  }

  const toggleWishlist = (id: string) =>
    setWishlist((prev) => { const next = new Set(prev); if (next.has(id)) { next.delete(id) } else { next.add(id) } return next })

  const handleShare = () => {
    const url = `${window.location.origin}/toko/${params.slug}`
    if (typeof navigator !== 'undefined' && navigator.share) navigator.share({ title: seller?.name ?? '', url })
    else if (typeof navigator !== 'undefined') navigator.clipboard.writeText(url)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white max-w-md mx-auto">
        <div className="bg-white border-b border-gray-100 px-4 pt-4 pb-3">
          <div className="h-10 bg-gray-100 rounded-xl animate-pulse mb-3" />
          <div className="h-4 w-48 bg-gray-100 rounded animate-pulse mb-3" />
          <div className="h-9 bg-gray-100 rounded-xl animate-pulse" />
        </div>
        <div className="px-4 py-4 grid grid-cols-2 gap-3">
          {Array.from({ length: 6 }).map((_, i) => <ProductSkeleton key={i} />)}
        </div>
      </div>
    )
  }

  if (notFound || !seller) {
    return (
      <div className="min-h-screen bg-white max-w-md mx-auto flex flex-col items-center justify-center px-6 text-center">
        <div className="w-20 h-20 bg-gray-50 border border-gray-100 rounded-3xl flex items-center justify-center mb-5">
          <span className="text-4xl">🔍</span>
        </div>
        <h1 className="font-extrabold text-gray-900 text-xl mb-2">Toko tidak ditemukan</h1>
        <p className="text-gray-500 text-sm mb-1">
          <span className="font-mono bg-gray-100 px-2 py-0.5 rounded text-gray-700 text-xs">astratoko.com/{params.slug}</span>
        </p>
        <p className="text-gray-400 text-sm mb-8 mt-2">URL ini belum terdaftar atau sudah tidak aktif.</p>
        <Link href="/mulai"
          className="w-full bg-app-blue hover:bg-app-blue-light text-white font-bold py-3.5 rounded-2xl text-sm flex items-center justify-center gap-2 transition-colors mb-3"
        >
          Buat Toko Gratis →
        </Link>
        <Link href="/" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
          Kembali ke Beranda
        </Link>
      </div>
    )
  }

  const categories = ['all', ...Array.from(new Set(products.map((p) => p.category).filter(Boolean)))]
  const DEMO_SOLD: Record<string, number> = {}
  products.forEach((p, i) => { DEMO_SOLD[p.id] = [124, 89, 67, 52, 43, 38, 31, 28, 22, 18, 12, 8][i] ?? 5 })
  const filtered = products
    .filter((p) =>
      (categoryFilter === 'all' || p.category === categoryFilter) &&
      (p.name.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase()))
    )
    .sort((a, b) => {
      if (sortMode === 'newest') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      if (sortMode === 'price_asc') return a.price - b.price
      if (sortMode === 'price_desc') return b.price - a.price
      return (DEMO_SOLD[b.id] ?? 0) - (DEMO_SOLD[a.id] ?? 0) // popular
    })
  const cartTotalQty = cart.reduce((s, item) => s + item.quantity, 0)

  return (
    <div className="min-h-screen bg-white max-w-md mx-auto">
      {isDemoMode && <DemoFloatingPill progress={demoProgress} />}
      {isDemoMode && <DemoWelcomeToast visible={toastVisible} />}
      <CartToast product={cartToastProduct} visible={cartToastVisible} />
      <SellerPreviewBanner slug={params.slug} />

      {/* Sticky header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-40 px-4 pt-4 pb-3">
        <div className="flex items-center gap-3 mb-3">
          <Link href={isDemoMode ? '/demo' : '/'} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 flex-shrink-0">
            <ArrowLeft size={18} />
          </Link>
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="w-10 h-10 bg-app-blue rounded-xl flex items-center justify-center flex-shrink-0">
              <span className="text-white font-extrabold leading-none">{seller.initial}</span>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1">
                <p className="font-extrabold text-gray-900 text-base leading-tight">{seller.name}</p>
                <span className="text-app-blue text-sm">✓</span>
              </div>
              <p className="text-xs text-gray-400 truncate">Toko online · {seller.location?.match(/^\d+$/) ? seller.platform : (seller.location || seller.platform)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Cart icon in header */}
            {cart.length > 0 && (
              <button onClick={() => setIsCartSheetOpen(true)} className="relative w-9 h-9 flex items-center justify-center rounded-xl bg-app-blue text-white">
                <ShoppingCart size={16} />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[9px] font-bold text-white flex items-center justify-center">{cartTotalQty}</span>
              </button>
            )}
            <button onClick={handleShare} className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 text-gray-500">
              <Share2 size={16} />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
          <span className="flex items-center gap-1"><Star size={12} className="text-yellow-400" fill="currentColor" /><strong className="text-gray-900">4,9</strong> rating</span>
          <span><strong className="text-gray-900">{products.length}</strong> produk</span>
          <span><strong className="text-gray-900">98%</strong> respon cepat</span>
        </div>

        {pointsBannerOpen && activeTab === 'beranda' && (
          <div className="bg-amber-50 rounded-xl px-3 py-2.5 flex items-center gap-2.5 mb-3">
            <div className="w-7 h-7 bg-astrapay-gold rounded-lg flex items-center justify-center flex-shrink-0">
              <Star size={14} className="text-white" fill="currentColor" />
            </div>
            <p className="text-xs font-medium text-amber-800 flex-1">Dapatkan 50 poin tiap transaksi — tukar jadi saldo AstraPay</p>
            <button onClick={() => setPointsBannerOpen(false)} className="w-5 h-5 flex items-center justify-center rounded-full bg-amber-200/60 text-amber-600 hover:bg-amber-200 transition-colors flex-shrink-0">
              <X size={11} />
            </button>
          </div>
        )}

        <input type="text" placeholder="Cari produk..." value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-gray-100 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-app-blue/20 focus:bg-white transition-colors"
        />
      </div>

      {/* ── Beranda tab ── */}
      {activeTab === 'beranda' && (
        <>
          {products.length > 0 && (
            <HeroBanner
              products={products}
              seller={seller}
              onViewCatalog={() => productsRef.current?.scrollIntoView({ behavior: 'smooth' })}
            />
          )}

          <div className="px-4 pt-3">
            <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
              {([
                { key: 'popular',    label: 'Produk Populer' },
                { key: 'newest',     label: 'Baru Ditambahkan' },
                { key: sortMode === 'price_asc' ? 'price_desc' : 'price_asc', label: sortMode === 'price_asc' ? 'Harga: Tinggi ↓' : sortMode === 'price_desc' ? 'Harga: Rendah ↑' : 'Sorting Harga' },
              ] as { key: typeof sortMode; label: string }[]).map(({ key, label }) => {
                const isActive = key === 'price_asc' || key === 'price_desc'
                  ? sortMode === 'price_asc' || sortMode === 'price_desc'
                  : sortMode === key
                return (
                  <button key={key} onClick={() => setSortMode(key)}
                    className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-colors ${isActive ? 'bg-app-blue text-white border-app-blue' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'}`}
                  >
                    {label}
                  </button>
                )
              })}
            </div>
          </div>

          <div ref={productsRef} className="px-4 pt-4 pb-2 flex items-center justify-between">
            <p className="font-extrabold text-gray-900 text-base">
              {search ? 'Hasil Pencarian' : sortMode === 'newest' ? 'Baru Ditambahkan' : sortMode === 'price_asc' ? 'Harga Terendah' : sortMode === 'price_desc' ? 'Harga Tertinggi' : 'Produk Terlaris'}
            </p>
            <span className="text-xs text-gray-400">{filtered.length} produk</span>
          </div>

          <div className="px-4 pb-24">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center px-4">
                {search || categoryFilter !== 'all' ? (
                  <>
                    <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
                      <span className="text-3xl">🔍</span>
                    </div>
                    <p className="font-semibold text-gray-700 mb-1">Produk tidak ditemukan</p>
                    <p className="text-gray-400 text-sm mb-5">Coba kata kunci lain atau hapus filter.</p>
                    <button onClick={() => { setSearch(''); setSortMode('popular') }}
                      className="text-app-blue text-sm font-semibold border border-app-blue/30 px-4 py-2 rounded-xl hover:bg-app-blue-pale transition-colors"
                    >
                      Hapus filter
                    </button>
                  </>
                ) : (
                  <>
                    <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
                      <span className="text-3xl">📦</span>
                    </div>
                    <p className="font-semibold text-gray-700 mb-1">Toko sedang disiapkan</p>
                    <p className="text-gray-400 text-sm">Produk akan muncul di sini setelah seller menambahkannya.</p>
                  </>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {filtered.map((product, index) => {
                  const { color, Icon } = getCategoryStyle(product.category)
                  const isBestSeller = isDemoMode && index === 0
                  const soldCount = DEMO_SOLD[product.id] ?? 5
                  return (
                    <div key={product.id}
                      className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm animate-fadein cursor-pointer group"
                      style={{ animationDelay: `${index * 50}ms` }}
                      onClick={() => setPreviewProduct(product)}
                    >
                      <div className="relative overflow-hidden transition-opacity group-hover:opacity-90" style={{ backgroundColor: color }}>
                        {product.image_url ? (
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="w-full h-36 object-cover transition-transform group-hover:scale-105 duration-300"
                            onError={(e) => {
                              const target = e.currentTarget
                              target.style.display = 'none'
                              target.nextElementSibling?.classList.remove('hidden')
                            }}
                          />
                        ) : null}
                        <div className={`flex items-center justify-center py-7 ${product.image_url ? 'hidden' : ''}`}>
                          <Icon size={40} className="text-white transition-transform group-hover:scale-110 duration-200" />
                        </div>
                        {isBestSeller && (
                          <div className="absolute top-2 left-2 bg-astrapay-gold text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-full">🔥 TERLARIS</div>
                        )}
                        <button aria-label="Favorit" onClick={(e) => { e.stopPropagation(); toggleWishlist(product.id) }}
                          className="absolute top-2 right-2 w-6 h-6 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center"
                        >
                          <Star size={12} className={wishlist.has(product.id) ? 'text-yellow-300' : 'text-white'} fill={wishlist.has(product.id) ? 'currentColor' : 'none'} />
                        </button>
                      </div>
                      <div className="p-3">
                        <p className="text-sm font-semibold text-gray-900 leading-snug mb-0.5 line-clamp-2">{product.name}</p>
                        <p className="text-[10px] text-gray-400 mb-1">{soldCount}x terjual</p>
                        <p className="text-base font-extrabold text-app-blue tracking-tight mb-2.5">{formatRp(product.price)}</p>
                        <button onClick={(e) => { e.stopPropagation(); addToCart(product) }}
                          className="w-full bg-app-blue hover:bg-app-blue-light text-white text-xs font-bold py-2.5 rounded-xl transition-colors active:scale-[0.97] flex items-center justify-center gap-1"
                        >
                          <ShoppingCart size={11} /> + Keranjang
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>


          <div className="px-4 py-6 text-center pb-24">
            <p className="text-xs text-gray-400">Toko ini dikelola dengan <Link href="/" className="text-app-blue font-medium">AstraToko</Link> · Powered by AstraPay</p>
          </div>
        </>
      )}

      {/* ── Kategori tab ── */}
      {activeTab === 'kategori' && (
        <KategoriPanel
          categories={categories.filter((c) => c !== 'all')}
          categoryFilter={categoryFilter}
          products={products}
          onSelect={(cat) => { setCategoryFilter(cat); setActiveTab('beranda') }}
        />
      )}

      {/* ── Pesanan tab ── */}
      {activeTab === 'pesanan' && <PesananPanel isDemoMode={isDemoMode} />}

      {/* ── Akun tab ── */}
      {activeTab === 'akun' && <AkunPanel isDemoMode={isDemoMode} isLinked={isLinked} onLink={() => setIsLinked(true)} />}

      {/* Bottom nav */}
      <BottomNav
        activeTab={activeTab}
        cartCount={cartTotalQty}
        onTabChange={setActiveTab}
        onCartOpen={() => setIsCartSheetOpen(true)}
      />

      {/* Product detail sheet */}
      {previewProduct && seller && (
        <ProductDetailSheet
          product={previewProduct}
          isDemoMode={isDemoMode}
          onClose={() => setPreviewProduct(null)}
          onAddToCart={(p) => { addToCart(p); setPreviewProduct(null) }}
          onBuyNow={(p) => { setPreviewProduct(null); handleBuyNow(p) }}
        />
      )}

      {/* Cart sheet */}
      {isCartSheetOpen && (
        <CartSheet
          cart={cart}
          onClose={() => setIsCartSheetOpen(false)}
          onRemove={removeFromCart}
          onUpdateQty={updateQuantity}
          onCheckout={handleCheckoutFromCart}
        />
      )}

      {/* Checkout modal */}
      {isCheckoutOpen && seller && cart.length > 0 && (
        <CheckoutModal
          cart={cart}
          seller={seller}
          onClose={() => { setIsCheckoutOpen(false); setCart([]) }}
          onRemove={removeFromCart}
          onUpdateQty={updateQuantity}
          isDemoMode={isDemoMode}
          isLinked={isLinked}
          onLink={() => setIsLinked(true)}
          onDemoProgress={setDemoProgress}
        />
      )}
    </div>
  )
}
