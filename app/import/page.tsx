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
  TrendingDown,
  Wrench,
  Droplets,
  Filter,
} from 'lucide-react'

type Step = 'upload' | 'analyzing' | 'results'

const MOCK = {
  filename: 'katalog-toko-rizky.csv',
  totalProducts: 142,
  estimasiMarketplace: 48_576_000,
  penghematan: 43_056_000,
  top: [
    { rank: 1, name: 'Brake Pad XYZ', category: 'Kampas rem', repeat: 38, price: 85_000, color: '#1A3CC4', Icon: Wrench },
    { rank: 2, name: 'Oli Racing ABC', category: 'Oli mesin',  repeat: 31, price: 120_000, color: '#2F9E44', Icon: Droplets },
    { rank: 3, name: 'Filter Udara DEF', category: 'Filter',   repeat: 27, price: 45_000,  color: '#F08C00', Icon: Filter },
  ],
}

function formatRp(n: number) {
  return 'Rp ' + n.toLocaleString('id-ID')
}

function Logo() {
  return (
    <Link href="/" className="font-extrabold text-h2 tracking-tight font-display">
      <span className="text-gray-900">Astra</span>
      <span className="text-brand-primary">Toko</span>
    </Link>
  )
}

function ProgressDots({ active }: { active: 1 | 2 }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className={`w-2 h-2 rounded-full transition-colors ${active >= 1 ? 'bg-brand-primary' : 'bg-brand-border'}`} />
      <span className={`w-2 h-2 rounded-full transition-colors ${active >= 2 ? 'bg-brand-primary' : 'bg-brand-border'}`} />
      <span className="text-caption text-gray-400 ml-0.5">Smart Import</span>
    </div>
  )
}

function AnalyzingScreen({ filename }: { filename: string }) {
  return (
    <div className="mt-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-brand-pale rounded-lg flex items-center justify-center flex-shrink-0">
          <div className="w-5 h-5 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
        </div>
        <div>
          <p className="font-semibold text-gray-900 text-label">Menganalisis {filename}</p>
          <p className="text-caption text-gray-500 mt-0.5">Menghitung estimasi fee dan potensi penghematan...</p>
        </div>
      </div>
      <div className="space-y-3">
        <div className="h-32 bg-brand-border rounded-lg animate-pulse" />
        <div className="h-20 bg-brand-border rounded-lg animate-pulse" />
        <div className="h-40 bg-brand-border rounded-lg animate-pulse" style={{ animationDelay: '0.15s' }} />
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
    <div className="min-h-screen bg-brand-surface max-w-md mx-auto">
      {/* Header */}
      <div className="bg-brand-card border-b-2 border-brand-border px-5 pt-6 pb-4 flex items-center justify-between">
        <Logo />
        <ProgressDots active={step === 'upload' ? 1 : 2} />
      </div>

      <div className="px-5 pb-12 pt-5">
        {step === 'upload' && (
          <>
            <h1 className="text-h1 font-bold text-gray-900 leading-tight mb-3 font-display">
              Impor katalogmu &amp; lihat potensi penghematan
            </h1>
            <p className="text-body text-gray-500 leading-relaxed mb-6">
              Upload satu file CSV, AstraToko hitung otomatis berapa yang kamu bayar ke
              marketplace dan berapa yang bisa kamu hemat.
            </p>

            {!uploadedFile ? (
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
                  isDragging
                    ? 'border-brand-primary bg-brand-pale'
                    : 'border-brand-border bg-brand-card hover:border-brand-primary'
                }`}
                onDrop={handleDrop}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
                onDragLeave={() => setIsDragging(false)}
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="w-16 h-16 bg-brand-primary rounded-lg flex items-center justify-center mx-auto mb-4">
                  <UploadCloud size={28} className="text-brand-surface" />
                </div>
                <p className="font-bold text-gray-900 text-body mb-1">
                  Upload CSV dari{' '}
                  <span className="text-brand-primary">Seller Center</span> kamu
                </p>
                <p className="text-caption text-gray-500 mb-5">
                  Shopee · Tokopedia · TikTok Shop · maks 10MB
                </p>
                <div className="flex items-center gap-3 mb-5">
                  <div className="flex-1 h-px bg-brand-border" />
                  <span className="text-caption text-gray-400 font-medium">ATAU</span>
                  <div className="flex-1 h-px bg-brand-border" />
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click() }}
                  className="btn-secondary py-2.5 mx-auto"
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
                    { name: 'Shopee',    bg: '#EE4D2D', letter: 'S' },
                    { name: 'Tokopedia', bg: '#03AC0E', letter: 'T' },
                    { name: 'TikTok',    bg: '#010101', letter: 'K' },
                  ].map((m) => (
                    <div
                      key={m.name}
                      className="flex items-center gap-1.5 bg-brand-card border-2 border-brand-border rounded-pill px-3 py-1"
                    >
                      <span
                        className="w-4 h-4 rounded-full flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0"
                        style={{ backgroundColor: m.bg }}
                      >
                        {m.letter}
                      </span>
                      <span className="text-caption text-gray-600">{m.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="rounded-lg border-2 border-brand-border bg-brand-card overflow-hidden">
                <div className="flex items-center gap-3 p-4">
                  <div className="w-10 h-10 bg-brand-success-bg rounded-lg flex items-center justify-center flex-shrink-0">
                    <CheckCircle size={20} className="text-brand-success" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-label truncate">{uploadedFile.name}</p>
                    <p className="text-caption text-gray-500 mt-0.5">
                      {uploadedFile.size} ·{' '}
                      <span className="text-brand-success font-medium">File siap dianalisis</span>
                    </p>
                  </div>
                  <button
                    onClick={() => setUploadedFile(null)}
                    aria-label="Hapus file"
                    className="w-8 h-8 flex items-center justify-center rounded-pill bg-brand-surface text-gray-400 hover:bg-brand-border flex-shrink-0"
                  >
                    <X size={14} />
                  </button>
                </div>
                <div className="px-4 pb-4">
                  <button
                    onClick={handleAnalyze}
                    className="btn-primary w-full"
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
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-brand-success text-label font-medium">
                <CheckCircle size={15} />
                <span>Analisis selesai</span>
              </div>
              <span className="text-caption text-gray-400">
                {MOCK.totalProducts} produk · {uploadedFile?.name ?? MOCK.filename}
              </span>
            </div>

            {/* Highlight card — blue bg (1 per screen max) */}
            <div className="card-highlight mb-3">
              <p className="text-brand-pale text-label mb-2">
                Estimasi yang kamu bayar ke marketplace tahun ini
              </p>
              <p className="text-display font-extrabold text-brand-surface tracking-tight leading-none mb-2 font-display font-mono">
                {formatRp(MOCK.estimasiMarketplace)}
              </p>
              <p className="text-brand-pale text-caption">
                Berdasarkan komisi + iklan + admin dari histori {MOCK.totalProducts} produk
              </p>
            </div>

            {/* Savings card */}
            <div className="bg-brand-success-bg border-2 border-brand-success rounded-lg p-4 mb-3 flex items-center gap-4">
              <div className="w-11 h-11 bg-brand-success rounded-lg flex items-center justify-center flex-shrink-0">
                <TrendingDown size={20} className="text-white" />
              </div>
              <div>
                <p className="text-h2 font-extrabold text-brand-success tracking-tight leading-none mb-1 font-display font-mono">
                  {formatRp(MOCK.penghematan)}
                </p>
                <p className="text-label text-gray-600">
                  yang bisa kamu hemat per tahun untuk{' '}
                  <strong className="text-gray-900">repeat buyer</strong> via AstraToko
                </p>
              </div>
            </div>

            {/* Top 3 recommendations */}
            <div className="card mb-5">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-bold text-gray-900 text-h3 font-display">Rekomendasi migrasi pertama</h3>
                <span className="text-caption font-semibold bg-brand-pale text-brand-primary px-2.5 py-1 rounded-pill">
                  Top 3
                </span>
              </div>
              <p className="text-caption text-gray-500 mb-4">
                Produk repeat-order tertinggi, paling untung dipindah duluan.
              </p>
              <div className="divide-y divide-brand-border">
                {MOCK.top.map((p) => (
                  <div key={p.rank} className="flex items-center gap-3 py-3">
                    <span className="w-6 h-6 rounded-pill bg-brand-pale text-brand-primary text-caption font-bold flex items-center justify-center flex-shrink-0">
                      {p.rank}
                    </span>
                    <div
                      className="w-9 h-9 rounded-md flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: p.color }}
                    >
                      <p.Icon size={16} className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-label font-semibold text-gray-900 truncate">{p.name}</p>
                      <p className="text-caption text-gray-500">
                        {p.category} · {p.repeat}x repeat / bln
                      </p>
                    </div>
                    <p className="text-label font-bold text-gray-900 flex-shrink-0 font-mono">
                      {formatRp(p.price)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <Link href="/dashboard" className="btn-primary w-full mb-4">
              Mulai Migrasi ke AstraToko <ArrowRight size={18} />
            </Link>

            <div className="flex items-center justify-center gap-1.5 text-caption text-gray-400 text-center">
              <ShieldCheck size={13} className="flex-shrink-0" />
              <span>Data kamu aman · tanpa biaya setup · Powered by AstraPay</span>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
