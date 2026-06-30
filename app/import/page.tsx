'use client'

import { useState, useRef, useCallback } from 'react'
import Link from 'next/link'
import Papa from 'papaparse'
import {
  UploadCloud,
  Download,
  CheckCircle,
  ArrowRight,
  ShieldCheck,
  X,
  DollarSign,
  Wrench,
  Droplets,
  Filter,
} from 'lucide-react'

type Step = 'upload' | 'analyzing' | 'results'

// Konsisten dengan hitungPenghematan(18_400_000, 'Tokopedia') × 12
const MOCK = {
  filename: 'katalog-toko-rizky.csv',
  filesize: '248 KB',
  totalProducts: 142,
  estimasiMarketplace: 48_576_000,  // 18.4jt × 22% × 12 bln
  penghematan: 43_056_000,           // 18.4jt × 19.5% × 12 bln
  top: [
    { rank: 1, name: 'Brake Pad XYZ', category: 'Kampas rem', repeat: 38, price: 85_000, color: '#3B5BDB', Icon: Wrench },
    { rank: 2, name: 'Oli Racing ABC', category: 'Oli mesin', repeat: 31, price: 120_000, color: '#2F9E44', Icon: Droplets },
    { rank: 3, name: 'Filter Udara DEF', category: 'Filter', repeat: 27, price: 45_000, color: '#F08C00', Icon: Filter },
  ],
}

function formatRp(n: number) {
  return 'Rp ' + n.toLocaleString('id-ID')
}

function Logo() {
  return (
    <Link href="/" className="font-extrabold text-xl tracking-tight">
      <span className="text-gray-900">Astra</span>
      <span className="text-app-blue">Toko</span>
    </Link>
  )
}

function ProgressDots({ active }: { active: 1 | 2 }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className={`w-2 h-2 rounded-full transition-colors ${active >= 1 ? 'bg-app-blue' : 'bg-gray-200'}`} />
      <span className={`w-2 h-2 rounded-full transition-colors ${active >= 2 ? 'bg-app-blue' : 'bg-gray-200'}`} />
      <span className="text-sm text-gray-400 ml-0.5">Smart Import</span>
    </div>
  )
}

function AnalyzingScreen({ filename }: { filename: string }) {
  return (
    <div className="mt-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-app-blue-pale rounded-xl flex items-center justify-center flex-shrink-0">
          <div className="w-5 h-5 border-2 border-app-blue border-t-transparent rounded-full animate-spin" />
        </div>
        <div>
          <p className="font-semibold text-gray-900 text-sm">Menganalisis {filename}</p>
          <p className="text-xs text-gray-400 mt-0.5">Menghitung estimasi fee dan potensi penghematan...</p>
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

export default function ImportPage() {
  const [step, setStep] = useState<Step>('upload')
  const [uploadedFile, setUploadedFile] = useState<{ name: string; size: string } | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback((file: File) => {
    const kb = Math.round(file.size / 1024)
    const sizeStr = kb > 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${kb} KB`
    setUploadedFile({ name: file.name, size: sizeStr })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(Papa as any).parse(file, { header: true, skipEmptyLines: true })
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

  return (
    <div className="min-h-screen bg-white max-w-md mx-auto">
      {/* Header */}
      <div className="px-5 pt-6 pb-4 flex items-center justify-between">
        <Logo />
        <ProgressDots active={step === 'upload' ? 1 : 2} />
      </div>

      <div className="px-5 pb-12">
        {step === 'upload' && (
          <>
            <h1 className="text-[1.75rem] font-extrabold text-gray-900 leading-tight mt-3 mb-3">
              Impor katalogmu &amp; lihat potensi penghematan
            </h1>
            <p className="text-gray-500 text-base leading-relaxed mb-6">
              Upload satu file CSV, AstraToko hitung otomatis berapa yang kamu bayar ke
              marketplace dan berapa yang bisa kamu hemat.
            </p>

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
                  Upload CSV dari{' '}
                  <span className="text-app-blue">Seller Center</span> kamu
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
                    onClick={() => setUploadedFile(null)}
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
          <AnalyzingScreen filename={uploadedFile?.name ?? MOCK.filename} />
        )}

        {step === 'results' && (
          <>
            <div className="flex items-center justify-between mt-3 mb-4">
              <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
                <CheckCircle size={15} />
                <span>Analisis selesai</span>
              </div>
              <span className="text-xs text-gray-400">
                {MOCK.totalProducts} produk · {uploadedFile?.name ?? MOCK.filename}
              </span>
            </div>

            <div className="bg-app-blue rounded-2xl p-5 mb-3">
              <p className="text-blue-200 text-sm mb-2">
                Estimasi yang kamu bayar ke marketplace tahun ini
              </p>
              <p className="text-4xl font-extrabold text-white tracking-tight leading-none mb-2">
                {formatRp(MOCK.estimasiMarketplace)}
              </p>
              <p className="text-blue-300 text-xs">
                Berdasarkan komisi + iklan + admin dari histori {MOCK.totalProducts} produk
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-3 flex items-center gap-4">
              <div className="w-11 h-11 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <DollarSign size={20} className="text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-extrabold text-green-600 tracking-tight leading-none mb-1">
                  {formatRp(MOCK.penghematan)}
                </p>
                <p className="text-sm text-gray-600">
                  yang bisa kamu hemat per tahun untuk{' '}
                  <strong className="text-gray-900">repeat buyer</strong> via AstraToko
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-5">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-bold text-gray-900 text-base">Rekomendasi migrasi pertama</h3>
                <span className="text-xs font-semibold bg-app-blue-pale text-app-blue px-2.5 py-1 rounded-full">
                  Top 3
                </span>
              </div>
              <p className="text-xs text-gray-400 mb-4">
                Produk repeat-order tertinggi, paling untung dipindah duluan.
              </p>
              <div className="divide-y divide-gray-50">
                {MOCK.top.map((p) => (
                  <div key={p.rank} className="flex items-center gap-3 py-3">
                    <span className="w-6 h-6 rounded-full bg-blue-50 text-app-blue text-xs font-bold flex items-center justify-center flex-shrink-0">
                      {p.rank}
                    </span>
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: p.color }}
                    >
                      <p.Icon size={16} className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{p.name}</p>
                      <p className="text-xs text-gray-400">
                        {p.category} · {p.repeat}x repeat / bln
                      </p>
                    </div>
                    <p className="text-sm font-bold text-gray-900 flex-shrink-0">
                      {formatRp(p.price)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <Link
              href="/dashboard"
              className="w-full bg-app-blue hover:bg-app-blue-light text-white font-semibold py-4 rounded-xl flex items-center justify-center gap-2 transition-colors text-base mb-4"
            >
              Mulai Migrasi ke AstraToko <ArrowRight size={18} />
            </Link>

            <div className="flex items-center justify-center gap-1.5 text-xs text-gray-400 text-center">
              <ShieldCheck size={13} className="flex-shrink-0" />
              <span>Data kamu aman · tanpa biaya setup · Powered by AstraPay</span>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
