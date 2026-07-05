'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, Check, Copy, ExternalLink, MapPin, MessageCircle, Phone } from 'lucide-react'
import Confetti from '@/components/Confetti'
import { PRODUCTS } from '@/lib/mock-data'

// ── Types ─────────────────────────────────────────────────────────────────────

type Step = 'info' | 'import' | 'building' | 'ready'

interface StoreData {
  storeName: string
  whatsapp:  string
  location:  string
  platform:  string
  hasImport: boolean
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function toSlug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim().replace(/\s+/g, '-').slice(0, 30)
}

function buildSteps(hasImport: boolean) {
  if (hasImport) {
    return [
      'Import complete',
      'Store setup',
      'QRIS & AstraPay connected',
      'AstraPoints enabled',
      'Ready to launch',
      'One sec...',
    ]
  }
  return [
    'Store setup',
    'QRIS & AstraPay connected',
    'AstraPoints enabled',
    'Ready to launch',
    'One sec...',
  ]
}

// ── Progress Header ────────────────────────────────────────────────────────────

const HEADER_STEPS: { id: Step; label: string }[] = [
  { id: 'info',   label: 'Info Bisnis' },
  { id: 'import', label: 'Tambah Produk' },
]

function ProgressHeader({ step, onBack }: { step: Step; onBack: () => void }) {
  const visible = HEADER_STEPS.map((s) => s.id) as Step[]
  const idx = visible.indexOf(step)
  if (idx < 0) return null

  return (
    <div className="px-6 pt-5 pb-4 flex-shrink-0">
      {/* Back + Logo */}
      <div className="flex items-center gap-3 mb-5">
        <button onClick={onBack} className="text-gray-400 hover:text-gray-700 transition-colors leading-none">
          {idx === 0 ? '✕' : '← Kembali'}
        </button>
        <div className="flex items-center gap-1.5">
          <div className="w-6 h-6 bg-app-blue rounded-md flex items-center justify-center">
            <span className="text-white font-extrabold text-[10px] leading-none">AT</span>
          </div>
          <span className="font-bold text-app-blue text-sm">AstraToko</span>
        </div>
      </div>

      {/* Step trail — subtle horizontal stepper */}
      <div className="flex items-center">
        {HEADER_STEPS.map((s, i) => {
          const done   = i < idx
          const active = i === idx
          return (
            <div key={s.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center gap-1">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-all duration-300 ${
                  done   ? 'bg-green-500 text-white' :
                  active ? 'bg-app-blue text-white' :
                           'border border-gray-200 text-gray-300'
                }`}>
                  {done ? <Check size={10} strokeWidth={3} /> : i + 1}
                </div>
                <span className={`text-[9px] font-medium leading-none whitespace-nowrap ${
                  active ? 'text-app-blue' : done ? 'text-green-600' : 'text-gray-300'
                }`}>
                  {s.label}
                </span>
              </div>
              <div className={`h-px flex-1 mx-1.5 mb-3.5 transition-colors duration-500 ${
                done ? 'bg-green-300' : 'bg-gray-100'
              }`} />
            </div>
          )
        })}
        {/* Final node */}
        <div className="flex flex-col items-center gap-1">
          <div className="w-5 h-5 rounded-full border border-gray-200 flex items-center justify-center text-[11px]">
            🎉
          </div>
          <span className="text-[9px] font-medium text-gray-300 leading-none">Live</span>
        </div>
      </div>
    </div>
  )
}

// ── Step 1: Info Bisnis ────────────────────────────────────────────────────────

function StepInfo({
  onNext,
  initialName     = '',
  initialWa       = '',
  initialLocation = '',
}: {
  onNext:          (name: string, wa: string, location: string) => void
  initialName?:    string
  initialWa?:      string
  initialLocation?: string
}) {
  const [name,     setName]     = useState(initialName)
  const [wa,       setWa]       = useState(initialWa)
  const [location, setLocation] = useState(initialLocation)
  const [loading,  setLoading]  = useState(false)
  const [touched,  setTouched]  = useState(false)

  const canProceed = name.trim().length >= 2 && wa.trim().length >= 8

  const handleSubmit = () => {
    setTouched(true)
    if (!canProceed) return
    setLoading(true)
    setTimeout(() => onNext(name.trim(), wa.trim(), location.trim()), 400)
  }

  return (
    <div className="px-6 pb-10 animate-fadein">
      {/* Headline */}
      <div className="mb-6">
        <h1 className="text-[26px] font-extrabold text-gray-900 leading-tight mb-2">
          Buat toko online<br />kurang dari 10 menit.
        </h1>
        <p className="text-sm text-gray-500 mb-4 leading-relaxed">
          Kami akan membuat toko online, mengaktifkan QRIS AstraPay, dan menyiapkan link tokomu secara otomatis.
        </p>

        {/* Value props */}
        <div className="space-y-2">
          {[
            'Impor produk dari Shopee, Tokopedia, atau TikTok',
            'Terima pembayaran QRIS AstraPay — langsung aktif',
            'Link toko siap dibagikan ke pelanggan',
            'Gratis tanpa biaya bulanan',
          ].map((v) => (
            <div key={v} className="flex items-center gap-2.5">
              <div className="w-4 h-4 bg-app-blue-pale rounded-full flex items-center justify-center flex-shrink-0">
                <Check size={9} className="text-app-blue" strokeWidth={3} />
              </div>
              <span className="text-sm text-gray-600">{v}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Microcopy */}
      <p className="text-xs text-gray-400 mb-4">Hanya perlu 3 informasi. Sisanya kami siapkan otomatis.</p>

      {/* Form */}
      <div className="space-y-6 mb-8">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nama toko</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)}
            placeholder="Agus Motor, Butik Sari, Toko Bu Dewi"
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-app-blue/20 focus:bg-white focus:border-app-blue transition-all"
            autoFocus
          />
          {touched && name.trim().length < 2 && (
            <p className="text-xs text-red-500 mt-1.5">Nama toko minimal 2 karakter.</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nomor WhatsApp</label>
          <div className="relative">
            <Phone size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="tel" value={wa} onChange={(e) => setWa(e.target.value)}
              placeholder="08123456789"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-4 py-3 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-app-blue/20 focus:bg-white focus:border-app-blue transition-all"
            />
          </div>
          {touched && wa.trim().length < 8 ? (
            <p className="text-xs text-red-500 mt-1.5">Nomor WA diperlukan agar pelanggan bisa menghubungimu.</p>
          ) : (
            <p className="text-xs text-gray-400 mt-1.5">Digunakan pelanggan untuk menghubungi tokomu.</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            Kota / Kabupaten
            <span className="text-gray-400 font-normal ml-1">(opsional)</span>
          </label>
          <div className="relative">
            <MapPin size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" value={location} onChange={(e) => setLocation(e.target.value)}
              placeholder="Cari kota..."
              className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-4 py-3 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-app-blue/20 focus:bg-white focus:border-app-blue transition-all"
            />
          </div>
        </div>
      </div>

      <button onClick={handleSubmit} disabled={loading}
        className="w-full bg-app-blue hover:bg-app-blue-light disabled:opacity-70 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 text-base transition-colors"
      >
        {loading ? (
          <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        ) : (
          <>Lanjut Buat Toko <ArrowRight size={18} /></>
        )}
      </button>

      {/* Trust footer */}
      <p className="text-center text-xs text-gray-400 mt-4">
        🔒 QRIS diproses langsung oleh AstraPay.
      </p>
    </div>
  )
}

// ── Step 2: Import Method ──────────────────────────────────────────────────────

const IMPORT_OPTIONS = [
  { id: 'shopee',    label: 'Import dari Shopee',     sub: 'Sinkronkan produk & stok secara otomatis.',              emoji: '🟠', platform: 'Shopee'    },
  { id: 'tokopedia', label: 'Import dari Tokopedia',  sub: 'Impor katalog tanpa perlu upload ulang.',                  emoji: '🟢', platform: 'Tokopedia' },
  { id: 'tiktok',   label: 'Import dari TikTok Shop', sub: 'Import langsung dari TikTok Shop kamu.',                  emoji: '⚫', platform: 'TikTok'    },
  { id: 'csv',      label: 'Upload CSV',              sub: 'Gunakan file ekspor yang sudah kamu miliki.',              emoji: '📁', platform: 'Tokopedia' },
  { id: 'manual',   label: 'Tambah produk manual',    sub: 'Untuk toko baru atau produk yang belum ada di marketplace.', emoji: '➕', platform: 'Tokopedia' },
] as const

type ImportOption = typeof IMPORT_OPTIONS[number]

function StepImport({ onNext }: { onNext: (platform: string, hasImport: boolean) => void }) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [phase, setPhase]     = useState<'idle' | 'connecting' | 'uploading' | 'done'>('idle')
  const [selected, setSelected] = useState<ImportOption | null>(null)

  const handleSelect = (opt: ImportOption) => {
    if (opt.id === 'manual') {
      onNext('Tokopedia', false)
      return
    }
    if (opt.id === 'csv') {
      setSelected(opt)
      fileRef.current?.click()
      return
    }
    setSelected(opt)
    setPhase('connecting')
    setTimeout(() => setPhase('done'), 1800)
  }

  const handleFile = () => {
    setPhase('uploading')
    setTimeout(() => {
      setPhase('done')
      setTimeout(() => onNext('Tokopedia', true), 700)
    }, 1800)
  }

  // Loading / done states
  if (phase === 'connecting' && selected) {
    return (
      <div className="px-6 pb-10 animate-fadein flex flex-col items-center text-center pt-16">
        <div className="text-5xl mb-5">{selected.emoji}</div>
        <p className="font-bold text-gray-900 text-lg">Menghubungkan ke {selected.platform}...</p>
        <p className="text-sm text-gray-400 mt-1.5 mb-7">Mengambil data produk dari Seller Center</p>
        <svg className="animate-spin h-7 w-7 text-app-blue" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    )
  }

  if (phase === 'uploading') {
    return (
      <div className="px-6 pb-10 animate-fadein flex flex-col items-center text-center pt-16">
        <div className="text-5xl mb-5">📁</div>
        <p className="font-bold text-gray-900 text-lg">Membaca file CSV...</p>
        <p className="text-sm text-gray-400 mt-1.5 mb-7">Menghitung jumlah produk</p>
        <svg className="animate-spin h-7 w-7 text-app-blue" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    )
  }

  if (phase === 'done') {
    // CSV auto-transitions via handleFile timeout — show brief flash
    if (!selected || selected.id === 'csv') {
      return (
        <div className="px-6 pb-10 animate-fadein flex flex-col items-center text-center pt-16">
          <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Check size={28} className="text-white" strokeWidth={2.5} />
          </div>
          <p className="font-bold text-gray-900 text-lg">File berhasil dibaca!</p>
          <p className="text-sm text-gray-400 mt-1">Melanjutkan ke setup toko...</p>
        </div>
      )
    }
    // Marketplace: celebratory confirmation before building
    return (
      <div className="px-6 pb-10 animate-fadein pt-8 flex flex-col items-center text-center">
        <div className="text-6xl mb-5">🎉</div>
        <h2 className="text-[28px] font-extrabold text-gray-900 leading-tight mb-1.5">
          Katalog kamu<br />siap diimpor!
        </h2>
        <p className="text-sm text-gray-500 mb-8">dari {selected.platform}</p>

        <div className="grid grid-cols-2 gap-2 w-full mb-8">
          {['Produk ✓', 'Harga ✓', 'Stok ✓', 'Kategori ✓'].map((item) => (
            <div key={item} className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-semibold text-gray-700 text-center">
              {item}
            </div>
          ))}
        </div>

        <button onClick={() => onNext(selected.platform, true)}
          className="w-full bg-app-blue hover:bg-app-blue-light text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 text-base transition-colors"
        >
          Lanjut Setup Toko <ArrowRight size={18} />
        </button>
      </div>
    )
  }

  return (
    <div className="px-6 pb-10 animate-fadein">
      <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Tambah produkmu</h2>
      <p className="text-sm text-gray-400 mb-8">Pilih cara termudah untuk kamu.</p>

      <div className="space-y-3">
        {IMPORT_OPTIONS.map((opt) => (
          <button key={opt.id} onClick={() => handleSelect(opt)}
            className="w-full flex items-center gap-3.5 px-4 py-4 min-h-[72px] rounded-2xl border-2 border-gray-100 bg-white hover:border-app-blue/30 hover:bg-app-blue-pale transition-all text-left group"
          >
            <span className="text-xl flex-shrink-0 leading-none">{opt.emoji}</span>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 text-sm leading-tight">{opt.label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{opt.sub}</p>
            </div>
            <ArrowRight size={15} className="text-gray-300 flex-shrink-0 group-hover:text-app-blue/40 transition-colors" />
          </button>
        ))}
      </div>

      <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleFile} />

      <div className="mt-4 pt-4 border-t border-gray-100">
        <button onClick={() => onNext('Tokopedia', false)}
          className="w-full text-center text-sm text-gray-400 hover:text-gray-600 py-2 transition-colors"
        >
          Lewati dulu — buat toko sekarang, tambah produk nanti
        </button>
      </div>
    </div>
  )
}

// ── Step 3: Building ───────────────────────────────────────────────────────────

function StepBuilding({
  data,
  onDone,
}: {
  data:   StoreData
  onDone: (slug: string) => void
}) {
  const steps = buildSteps(data.hasImport)
  const [checked,  setChecked]  = useState<number[]>([])
  const [progress, setProgress] = useState(0)

  const onDoneRef = useRef(onDone)
  useEffect(() => { onDoneRef.current = onDone })

  useEffect(() => {
    const ANIM_MS = 5000
    const timers: ReturnType<typeof setTimeout>[] = []
    let rafId: number

    const start = performance.now()
    const tick = (now: number) => {
      const pct = Math.min(((now - start) / ANIM_MS) * 100, 100)
      setProgress(pct)
      if (pct < 100) rafId = requestAnimationFrame(tick)
    }
    rafId = requestAnimationFrame(tick)

    steps.forEach((_, i) => {
      timers.push(setTimeout(
        () => setChecked((p) => [...p, i]),
        Math.round((ANIM_MS / steps.length) * (i + 1)) - 150,
      ))
    })

    const fallbackSlug = toSlug(data.storeName) || 'tokorizky'
    const slugRef = { current: fallbackSlug }
    let cancelled = false

    ;(async () => {
      try {
        const res = await fetch('/api/sellers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: data.storeName, whatsapp: data.whatsapp,
            platform: data.platform, location: data.location,
          }),
        })
        const { seller } = await res.json()
        if (seller?.slug && !cancelled) {
          slugRef.current = seller.slug
          if (typeof localStorage !== 'undefined') localStorage.setItem('seller_slug', seller.slug)
          fetch('/api/import', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              seller_slug: seller.slug,
              products: PRODUCTS.map((p) => ({ name: p.name, price: p.price, stock: p.stock, category: p.category })),
            }),
          }).catch(() => {})
        }
      } catch { /* use fallback slug */ }
      if (!cancelled && typeof localStorage !== 'undefined' && !localStorage.getItem('seller_slug')) {
        localStorage.setItem('seller_slug', slugRef.current)
      }
    })()

    timers.push(setTimeout(() => onDoneRef.current(slugRef.current), ANIM_MS + 300))

    return () => {
      cancelled = true
      cancelAnimationFrame(rafId)
      timers.forEach(clearTimeout)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 animate-fadein">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <div className="text-5xl mb-4 animate-float">🏪</div>
          <h2 className="text-xl font-extrabold text-gray-900 mb-1.5">Menyiapkan tokomu...</h2>
          <p className="text-gray-500 text-sm">Selesai dalam kurang dari 30 detik.</p>
        </div>

        <div className="flex items-center justify-between mb-2">
          <p className="text-xs text-gray-400">Progress</p>
          <p className="text-xs font-bold text-app-blue">{Math.round(progress)}%</p>
        </div>
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mb-8">
          <div className="h-full bg-gradient-to-r from-app-blue to-blue-400 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }} />
        </div>

        <div className="space-y-4">
          {steps.map((s, i) => {
            const done   = checked.includes(i)
            const active = !done && checked.length === i
            return (
              <div key={i} className={`flex items-center gap-3 transition-all duration-300 ${done || active ? 'opacity-100' : 'opacity-25'}`}>
                {done ? (
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 animate-scale-in">
                    <Check size={12} className="text-white" strokeWidth={2.5} />
                  </div>
                ) : active ? (
                  <svg className="animate-spin h-6 w-6 text-app-blue flex-shrink-0" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : (
                  <div className="w-6 h-6 rounded-full border border-gray-200 flex-shrink-0" />
                )}
                <p className={`text-sm font-medium ${done ? 'text-gray-900' : active ? 'text-app-blue' : 'text-gray-300'}`}>{s}</p>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ── Step 4: Ready ─────────────────────────────────────────────────────────────

const CAPABILITIES = [
  'Terima pembayaran via QRIS AstraPay',
  'Produk langsung tersedia di tokomu',
  'Link toko siap dibagikan ke pelanggan',
  'Kelola pesanan dari dashboard',
]

function StepReady({ slug, storeName }: { slug: string; storeName: string }) {
  const router    = useRouter()
  const [copied,   setCopied]   = useState(false)
  const [shared,   setShared]   = useState(false)
  const [visible,  setVisible]  = useState<number[]>([])
  const [countdown, setCountdown] = useState(5)
  const [storeUrl, setStoreUrl] = useState(`/toko/${slug}`)

  useEffect(() => {
    setStoreUrl(`${window.location.origin}/toko/${slug}`)
  }, [slug])

  useEffect(() => {
    CAPABILITIES.forEach((_, i) =>
      setTimeout(() => setVisible((v) => [...v, i]), 200 + i * 150)
    )
  }, [])

  useEffect(() => {
    let cancelled = false
    const id = setInterval(() => {
      setCountdown((n) => {
        if (n <= 1) {
          clearInterval(id)
          if (!cancelled) router.push('/dashboard')
          return 0
        }
        return n - 1
      })
    }, 1000)
    return () => { cancelled = true; clearInterval(id) }
  }, [router])

  const copyLink = () => {
    if (typeof navigator !== 'undefined') navigator.clipboard.writeText(storeUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const shareWa = () => {
    const text = encodeURIComponent(
      `Halo! Sekarang kamu bisa belanja langsung di *${storeName}* — bayar pakai AstraPay, dapat AstraPoints!\n\n👉 ${storeUrl}`
    )
    window.open(`https://wa.me/?text=${text}`, '_blank')
    setShared(true)
    if (typeof localStorage !== 'undefined') localStorage.setItem('has_shared_store', 'true')
  }

  return (
    <div className="min-h-screen bg-white flex flex-col animate-fadein">
      <Confetti active />

      <div className="flex-1 flex flex-col px-6 pt-10 pb-4">
        {/* Hero */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-3xl font-extrabold text-gray-900 mb-1.5">You&apos;re live.</h2>
          <p className="text-gray-500 text-sm">Toko kamu sudah online dan siap terima pesanan.</p>
        </div>

        {/* Capabilities */}
        <div className="bg-green-50 border border-green-100 rounded-2xl p-5 mb-4">
          <p className="text-[10px] font-bold text-green-700 uppercase tracking-widest mb-3.5">Kamu sekarang bisa</p>
          <div className="space-y-3">
            {CAPABILITIES.map((c, i) => (
              <div key={i}
                className={`flex items-center gap-3 transition-all duration-500 ${visible.includes(i) ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-3'}`}
              >
                <div className="w-5 h-5 bg-green-100 border border-green-200 rounded-full flex items-center justify-center flex-shrink-0">
                  <Check size={10} className="text-green-600" strokeWidth={3} />
                </div>
                <p className="text-gray-900 text-sm">{c}</p>
              </div>
            ))}
          </div>
        </div>

        {/* URL Toko */}
        <div className="bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3.5 mb-2">
          <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-1.5">URL Toko</p>
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-gray-900 truncate">{storeUrl}</p>
            <button onClick={copyLink}
              className="flex items-center gap-1.5 text-xs font-semibold text-app-blue bg-app-blue/10 hover:bg-app-blue/20 px-3 py-1.5 rounded-lg transition-colors flex-shrink-0"
            >
              {copied ? <Check size={11} className="text-green-500" /> : <Copy size={11} />}
              {copied ? 'Tersalin!' : 'Salin'}
            </button>
          </div>
          <div className="flex items-center gap-1.5 mt-2">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
            <span className="text-[10px] text-green-600 font-semibold">Live</span>
          </div>
        </div>
      </div>

      {/* CTAs — one screen, one action */}
      <div className="px-6 pb-10 space-y-2.5 flex-shrink-0">
        {/* Primary */}
        <a href={`/toko/${slug}`} target="_blank" rel="noopener noreferrer"
          className="w-full bg-app-blue hover:bg-app-blue-light text-white font-extrabold py-4 rounded-2xl flex items-center justify-center gap-2.5 text-base transition-colors"
        >
          <ExternalLink size={18} /> Buka Toko
        </a>

        {/* Secondary — WhatsApp */}
        <button onClick={shareWa}
          className="w-full bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/30 text-[#16a34a] font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 text-sm transition-colors"
        >
          <MessageCircle size={16} />
          {shared ? 'Dibagikan ✓' : 'Bagikan via WhatsApp'}
        </button>

        {/* Ghost row — salin + auto-redirect countdown */}
        <div className="flex items-center justify-center gap-4 pt-0.5">
          <button onClick={copyLink}
            className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
          >
            {copied ? '✓ Link tersalin' : 'Salin link'}
          </button>
          <span className="text-gray-200 select-none">·</span>
          <button onClick={() => router.push('/dashboard')}
            className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
          >
            {countdown > 0 ? `Dashboard dalam ${countdown}s` : 'Masuk Dashboard →'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function MulaiPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('info')
  const [data, setData] = useState<StoreData>({
    storeName: '', whatsapp: '', location: '', platform: 'Tokopedia', hasImport: true,
  })
  const [slug, setSlug] = useState('')

  const handleBack = useCallback(() => {
    const backMap: Partial<Record<Step, Step | 'home'>> = {
      info:   'home',
      import: 'info',
    }
    const dest = backMap[step]
    if (!dest) return
    if (dest === 'home') router.push('/')
    else setStep(dest as Step)
  }, [step, router])

  return (
    <div className="min-h-screen bg-white max-w-[480px] mx-auto">
      <ProgressHeader step={step} onBack={handleBack} />

      {step === 'info' && (
        <StepInfo
          initialName={data.storeName}
          initialWa={data.whatsapp}
          initialLocation={data.location}
          onNext={(name, wa, location) => {
            setData((d) => ({ ...d, storeName: name, whatsapp: wa, location }))
            setStep('import')
          }}
        />
      )}
      {step === 'import' && (
        <StepImport onNext={(platform, hasImport) => {
          setData((d) => ({ ...d, platform, hasImport }))
          setStep('building')
        }} />
      )}
      {step === 'building' && (
        <StepBuilding data={data} onDone={(s) => { setSlug(s); setStep('ready') }} />
      )}
      {step === 'ready' && (
        <StepReady slug={slug} storeName={data.storeName} />
      )}
    </div>
  )
}
