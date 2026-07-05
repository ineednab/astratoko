'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Papa from 'papaparse'
import { UploadCloud, Download, CheckCircle, ArrowRight, ShieldCheck, X } from 'lucide-react'
import { formatRp } from '@/lib/utils'
import { getCategoryStyle } from '@/lib/categories'
import { PRODUCTS } from '@/lib/mock-data'

type Step = 'upload' | 'analyzing' | 'results' | 'review'
type ParsedProduct = { name: string; price: number; stock: number; category: string }

const DEMO_FALLBACK: ParsedProduct[] = PRODUCTS.map((p) => ({
  name: p.name, price: p.price, stock: p.stock, category: p.category,
}))

const ANALYZING_STEPS = [
  'Membaca produk...',
  'Menghitung biaya marketplace...',
  'Menyiapkan analisis...',
]

const STEP_IDX: Record<Step, number> = { upload: 0, analyzing: 1, results: 1, review: 2 }

function useCountUp(target: number, duration = 1200) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (target === 0) return
    let animId: number
    const start = Date.now()
    const tick = () => {
      const elapsed = Date.now() - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.round(target * eased))
      if (progress < 1) animId = requestAnimationFrame(tick)
    }
    animId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(animId)
  }, [target, duration])
  return count
}

function computeSavings(products: ParsedProduct[], platformFee = 0.22) {
  const prices = products.filter((p) => p.price > 0)
  const avgPrice =
    prices.length > 0 ? prices.reduce((s, p) => s + p.price, 0) / prices.length : 75_000
  const monthlyGMV = Math.round(products.length * avgPrice * 2)
  const marketplace = Math.round(monthlyGMV * platformFee * 12)
  const astratoko = Math.round(monthlyGMV * 0.025 * 12)
  return { marketplace, astratoko, savings: marketplace - astratoko }
}

function Logo() {
  return (
    <Link href="/dashboard" className="font-extrabold text-xl tracking-tight">
      <span className="text-gray-900">Astra</span>
      <span className="text-app-blue">Toko</span>
    </Link>
  )
}

function ProgressDots({ step }: { step: Step }) {
  const active = STEP_IDX[step]
  return (
    <div className="flex items-center gap-1.5">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className={`w-2 h-2 rounded-full transition-colors ${
            i <= active ? 'bg-app-blue' : 'bg-gray-200'
          }`}
        />
      ))}
      <span className="text-sm text-gray-400 ml-0.5">Import</span>
    </div>
  )
}

function AnalyzingScreen({ filename }: { filename: string }) {
  const [msgIdx, setMsgIdx] = useState(0)
  useEffect(() => {
    const timers = ANALYZING_STEPS.map((_, i) => setTimeout(() => setMsgIdx(i), i * 730))
    return () => timers.forEach(clearTimeout)
  }, [])
  return (
    <div className="mt-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-app-blue-pale rounded-xl flex items-center justify-center flex-shrink-0">
          <div className="w-5 h-5 border-2 border-app-blue border-t-transparent rounded-full animate-spin" />
        </div>
        <div>
          <p className="font-semibold text-gray-900 text-sm">Menganalisis {filename}</p>
          <p className="text-xs text-gray-400 mt-0.5">{ANALYZING_STEPS[msgIdx]}</p>
        </div>
      </div>
      <div className="space-y-3">
        <div className="h-32 bg-gray-100 rounded-2xl animate-pulse" />
        <div className="h-20 bg-gray-100 rounded-2xl animate-pulse" />
        <div className="h-40 bg-gray-100 rounded-2xl animate-pulse" style={{ animationDelay: '0.15s' }} />
      </div>
    </div>
  )
}

function ResultsScreen({
  products,
  filename,
  onNext,
}: {
  products: ParsedProduct[]
  filename: string
  onNext: () => void
}) {
  const count = useCountUp(products.length)
  const categories = new Set(products.map((p) => p.category).filter(Boolean))
  const top6 = [...products].sort((a, b) => b.price * b.stock - a.price * a.stock).slice(0, 6)

  return (
    <div className="mt-3">
      <div className="flex items-center gap-2 text-green-600 text-sm font-medium mb-4">
        <CheckCircle size={15} />
        <span>Analisis selesai · {filename}</span>
      </div>

      {/* Hero 1 — Count-up */}
      <div className="bg-app-blue rounded-2xl p-6 text-center mb-4">
        <p className="text-blue-200 text-sm mb-1">Produk berhasil dibaca</p>
        <p className="text-7xl font-extrabold text-white tracking-tight leading-none mb-2">
          {count.toLocaleString('id-ID')}
        </p>
        <p className="text-blue-200 text-sm">
          dari {categories.size} kategori · {filename}
        </p>
      </div>

      {/* Real product grid */}
      {top6.length > 0 && (
        <div className="mb-5">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
            Produk teratas
          </p>
          <div className="grid grid-cols-3 gap-2">
            {top6.map((p, i) => {
              const { color, Icon } = getCategoryStyle(p.category)
              return (
                <div
                  key={i}
                  className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm"
                >
                  <div
                    className="py-3 flex items-center justify-center"
                    style={{ backgroundColor: color }}
                  >
                    <Icon size={20} className="text-white" />
                  </div>
                  <div className="p-2">
                    <p className="text-[10px] font-semibold text-gray-800 leading-tight line-clamp-2 mb-1">
                      {p.name}
                    </p>
                    <p className="text-xs font-bold text-app-blue">{formatRp(p.price)}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <button
        onClick={onNext}
        className="w-full bg-app-blue hover:bg-app-blue-light text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-colors text-base"
      >
        Lihat Analisis Biaya <ArrowRight size={18} />
      </button>
    </div>
  )
}

function ReviewScreen({ products, onNext, submitting }: { products: ParsedProduct[]; onNext: () => void; submitting: boolean }) {
  const { marketplace, astratoko, savings } = computeSavings(products)
  const categories = new Set(products.map((p) => p.category).filter(Boolean))
  const hasPrices = products.some((p) => p.price > 0)
  const hasStock = products.some((p) => p.stock > 0)
  const animatedSavings = useCountUp(savings, 1500)

  const checklist = [
    { label: `${products.length} produk siap dimigrasi`, done: products.length > 0 },
    { label: `${categories.size} kategori teridentifikasi`, done: categories.size > 0 },
    { label: 'Data harga lengkap', done: hasPrices },
    { label: 'Data stok tersedia', done: hasStock },
    { label: 'Toko siap dibuat', done: true },
  ]

  return (
    <div className="mt-3">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-extrabold text-gray-900 text-lg">Ringkasan Migrasi</h2>
        <span className="text-xs text-gray-400">{products.length} produk</span>
      </div>

      {/* Hero 2 — Savings reveal */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between bg-red-50 rounded-xl px-4 py-3">
          <div>
            <p className="text-xs text-gray-500">Fee marketplace / tahun</p>
            <p className="text-base font-bold text-gray-800">{formatRp(marketplace)}</p>
          </div>
          <span className="text-xs font-semibold text-red-600 bg-red-100 px-2 py-0.5 rounded-full">
            22%
          </span>
        </div>
        <div className="flex items-center justify-between bg-blue-50 rounded-xl px-4 py-3">
          <div>
            <p className="text-xs text-gray-500">Fee AstraToko / tahun</p>
            <p className="text-base font-bold text-gray-800">{formatRp(astratoko)}</p>
          </div>
          <span className="text-xs font-semibold text-app-blue bg-app-blue-pale px-2 py-0.5 rounded-full">
            2.5%
          </span>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-4">
          <p className="text-xs text-green-600 font-medium mb-1">💰 Potensi penghematan per tahun</p>
          <p className="text-3xl font-extrabold text-green-700 tracking-tight">
            {formatRp(animatedSavings)}
          </p>
          <p className="text-xs text-green-600 mt-1">
            Estimasi berdasarkan {products.length} produk di katalog kamu
          </p>
        </div>
      </div>

      {/* Migration checklist */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-5">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
          Status Migrasi
        </p>
        <div className="space-y-2.5">
          {checklist.map((item, i) => (
            <div key={i} className="flex items-center gap-2.5">
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                  item.done ? 'bg-green-500' : 'bg-gray-200'
                }`}
              >
                {item.done && (
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                    <path
                      d="M1 4l3 3 5-6"
                      stroke="white"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </div>
              <span className={`text-sm ${item.done ? 'text-gray-700' : 'text-gray-400'}`}>
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={onNext}
        disabled={submitting}
        className="w-full bg-app-blue hover:bg-app-blue-light text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-colors text-base mb-3 disabled:opacity-60"
      >
        {submitting ? (
          <>
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Menyimpan produk...
          </>
        ) : (
          <>Lanjut Migrasi <ArrowRight size={18} /></>
        )}
      </button>

      <div className="flex items-center justify-center gap-1.5 text-xs text-gray-400">
        <ShieldCheck size={13} />
        <span>Data kamu aman · tanpa biaya setup · Powered by AstraPay</span>
      </div>
    </div>
  )
}

export default function ImportPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('upload')
  const [uploadedFile, setUploadedFile] = useState<{ name: string; size: string } | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [parsedProducts, setParsedProducts] = useState<ParsedProduct[]>([])
  const [submitting, setSubmitting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback((file: File) => {
    const kb = Math.round(file.size / 1024)
    const sizeStr = kb > 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${kb} KB`
    setUploadedFile({ name: file.name, size: sizeStr })
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const products: ParsedProduct[] = results.data
          .map((row) => ({
            name: row.nama_produk || row.product_name || row['Nama Produk'] || '',
            price: Number(row.harga || row.price || row['Harga'] || 0),
            stock: Number(row.stok || row.stock || row['Stok'] || 0),
            category: row.kategori || row.category || row['Kategori'] || '',
          }))
          .filter((p) => p.name.trim().length > 0)
        const finalProducts = products.length > 0 ? products : DEMO_FALLBACK
        setParsedProducts(finalProducts)
        if (typeof sessionStorage !== 'undefined') {
          sessionStorage.setItem('pending_products', JSON.stringify(finalProducts))
        }
      },
    })
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      const file = e.dataTransfer.files[0]
      if (file) handleFile(file)
    },
    [handleFile],
  )

  const handleAnalyze = () => {
    setStep('analyzing')
    setTimeout(() => setStep('results'), 2200)
  }

  const displayProducts = parsedProducts.length > 0 ? parsedProducts : DEMO_FALLBACK

  const handleMigrate = useCallback(async () => {
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem('pending_products', JSON.stringify(displayProducts))
    }
    const slug =
      typeof localStorage !== 'undefined' ? localStorage.getItem('seller_slug') : null

    // No store yet: hand off to onboarding, which consumes pending_products.
    if (!slug) {
      router.push('/mulai')
      return
    }

    setSubmitting(true)
    try {
      await fetch('/api/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seller_slug: slug, products: displayProducts }),
      })
      if (typeof sessionStorage !== 'undefined') sessionStorage.removeItem('pending_products')
    } catch {
      /* still navigate; products stay in sessionStorage for retry via onboarding */
    }
    router.push('/products')
  }, [displayProducts, router])

  return (
    <div className="min-h-screen bg-white max-w-md mx-auto">
      <div className="px-5 pt-6 pb-4 flex items-center justify-between">
        <Logo />
        <ProgressDots step={step} />
      </div>

      <div className="px-5 pb-12">
        {step === 'upload' && (
          <>
            <h1 className="text-[1.75rem] font-extrabold text-gray-900 leading-tight mt-3 mb-2">
              Berapa yang kamu bayar ke Tokopedia tiap bulan?
            </h1>
            <p className="text-gray-500 text-base leading-relaxed mb-4">
              Upload CSV dari Seller Center kamu. Kami hitung otomatis berapa yang hilang ke komisi
              dan berapa yang bisa kamu pertahankan.
            </p>

            {/* Value prop stats */}
            <div className="grid grid-cols-3 gap-2 mb-6">
              {[
                { value: '22%', label: 'Komisi Tokopedia per transaksi' },
                { value: '2.5%', label: 'Fee AstraToko flat' },
                { value: '10 mnt', label: 'Waktu setup toko live' },
              ].map((s) => (
                <div key={s.value} className="bg-gray-50 rounded-xl p-3 text-center">
                  <p className="text-lg font-extrabold text-app-blue leading-none mb-1">{s.value}</p>
                  <p className="text-[10px] text-gray-500 leading-snug">{s.label}</p>
                </div>
              ))}
            </div>

            {!uploadedFile ? (
              <div
                className={`border-2 border-dashed rounded-2xl p-8 text-center transition-colors cursor-pointer ${
                  isDragging
                    ? 'border-app-blue bg-app-blue-pale'
                    : 'border-gray-200 bg-gray-50 hover:border-app-blue'
                }`}
                onDrop={handleDrop}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
                onDragLeave={() => setIsDragging(false)}
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="w-16 h-16 bg-app-blue rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <UploadCloud size={28} className="text-white" />
                </div>
                <p className="font-bold text-gray-900 text-base mb-1">
                  Upload CSV dari <span className="text-app-blue">Seller Center</span> kamu
                </p>
                <p className="text-gray-400 text-sm mb-5">
                  Shopee · Tokopedia · TikTok Shop · maks 10MB
                </p>
                <div className="flex items-center gap-3 mb-5">
                  <div className="flex-1 h-px bg-gray-200" />
                  <span className="text-xs text-gray-400 font-medium">ATAU</span>
                  <div className="flex-1 h-px bg-gray-200" />
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click() }}
                  className="border-2 border-app-blue text-app-blue font-semibold px-6 py-2.5 rounded-xl inline-flex items-center gap-2 hover:bg-app-blue-pale transition-colors mx-auto"
                >
                  <Download size={16} /> Browse File
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
                />
                <div className="flex justify-center gap-2 mt-5 flex-wrap">
                  {[
                    { name: 'Shopee', bg: '#EE4D2D', letter: 'S' },
                    { name: 'Tokopedia', bg: '#03AC0E', letter: 'T' },
                    { name: 'TikTok', bg: '#010101', letter: 'K' },
                  ].map((m) => (
                    <div
                      key={m.name}
                      className="flex items-center gap-1.5 bg-white border border-gray-100 rounded-full px-3 py-1 shadow-sm"
                    >
                      <span
                        className="w-4 h-4 rounded-full flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0"
                        style={{ backgroundColor: m.bg }}
                      >
                        {m.letter}
                      </span>
                      <span className="text-xs text-gray-600">{m.name}</span>
                    </div>
                  ))}
                </div>
                <a
                  href="/sample-products.csv"
                  download
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center gap-1.5 text-xs text-app-blue hover:underline mt-4"
                >
                  <Download size={12} /> Download contoh CSV
                </a>
              </div>
            ) : (
              <div className="rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="flex items-center gap-3 p-4">
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <CheckCircle size={20} className="text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm truncate">{uploadedFile.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {uploadedFile.size} ·{' '}
                      <span className="text-green-600 font-medium">File siap dianalisis</span>
                    </p>
                  </div>
                  <button
                    onClick={() => { setUploadedFile(null); setParsedProducts([]) }}
                    aria-label="Hapus file"
                    className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-100 text-gray-400 hover:bg-gray-200 flex-shrink-0"
                  >
                    <X size={14} />
                  </button>
                </div>
                <div className="px-4 pb-4">
                  <button
                    onClick={handleAnalyze}
                    className="w-full bg-app-blue hover:bg-app-blue-light text-white font-semibold py-3.5 rounded-xl transition-colors text-base"
                  >
                    Lihat Hasil Analisis
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {step === 'analyzing' && (
          <AnalyzingScreen filename={uploadedFile?.name ?? 'katalog.csv'} />
        )}

        {step === 'results' && (
          <ResultsScreen
            products={displayProducts}
            filename={uploadedFile?.name ?? 'katalog.csv'}
            onNext={() => setStep('review')}
          />
        )}

        {step === 'review' && (
          <ReviewScreen
            products={displayProducts}
            onNext={handleMigrate}
            submitting={submitting}
          />
        )}
      </div>
    </div>
  )
}
