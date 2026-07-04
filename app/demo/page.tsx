'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowRight, Star, ShoppingBag } from 'lucide-react'

// ── Phone scenes ──────────────────────────────────────────────────────────────

function StoreScene() {
  return (
    <div className="h-full bg-gray-50 px-2.5 pt-2">
      <div className="bg-white rounded-lg px-2 py-1.5 mb-2 flex items-center gap-1.5 shadow-sm">
        <div className="w-5 h-5 bg-blue-600 rounded flex-shrink-0 flex items-center justify-center">
          <span className="text-white font-bold text-[7px]">R</span>
        </div>
        <div>
          <div className="text-[7px] font-bold text-gray-900 leading-tight">Toko Rizky ✓</div>
          <div className="text-[5.5px] text-gray-400">⭐ 4.9 · 98% respon cepat</div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-1.5">
        {[
          { color: '#3B82F6', label: 'Kampas Rem', badge: '🔥' },
          { color: '#10B981', label: 'Oli Motor', badge: null },
          { color: '#F59E0B', label: 'Ban Dalam', badge: null },
          { color: '#8B5CF6', label: 'Lampu LED', badge: null },
        ].map((p, i) => (
          <div key={i} className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-100">
            <div className="h-10 flex items-center justify-center relative" style={{ backgroundColor: p.color }}>
              <ShoppingBag size={11} className="text-white" />
              {p.badge && <span className="absolute top-0.5 left-0.5 text-[7px]">{p.badge}</span>}
            </div>
            <div className="p-1">
              <div className="text-[5.5px] font-semibold text-gray-800 truncate">{p.label}</div>
              <div className="text-[6.5px] font-bold text-blue-600">Rp 38k</div>
              <div className="mt-0.5 bg-blue-600 rounded-[4px] py-0.5 text-center">
                <span className="text-white text-[5px] font-bold">+ Keranjang</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-2 bg-amber-50 rounded-md px-1.5 py-1 flex items-center gap-1">
        <Star size={7} className="text-amber-500 flex-shrink-0" fill="currentColor" />
        <div className="text-[5.5px] text-amber-700 font-medium">+50 AstraPoints tiap transaksi</div>
      </div>
    </div>
  )
}

function BuyScene() {
  return (
    <div className="h-full flex flex-col">
      <div className="bg-gray-50 flex-1 flex items-center justify-center px-3">
        <div className="text-center w-full">
          <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-2">
            <ShoppingBag size={20} className="text-white" />
          </div>
          <div className="text-[8px] font-bold text-gray-900 mb-0.5">Kampas Rem Premium</div>
          <div className="text-[10px] font-extrabold text-blue-600 mb-0.5">Rp 38.000</div>
          <div className="text-[5.5px] text-gray-400 mb-2">⭐ 4.9 · 124 terjual · Stok 14</div>
          <div className="bg-amber-50 rounded-md px-2 py-1 text-[5.5px] text-amber-700 font-medium">
            ⭐ +50 AstraPoints
          </div>
        </div>
      </div>
      <div className="bg-white px-2.5 py-2 shadow-[0_-4px_12px_rgba(0,0,0,0.08)] space-y-1">
        <div className="bg-blue-600 rounded-xl py-1.5 text-center">
          <div className="text-white text-[7px] font-bold">🛒 + Keranjang</div>
        </div>
        <div className="border border-blue-600 rounded-xl py-1 text-center">
          <div className="text-blue-600 text-[6.5px] font-semibold">Beli Langsung</div>
        </div>
      </div>
    </div>
  )
}

function QRScene() {
  const [step, setStep] = useState(0)
  useEffect(() => {
    const t1 = setTimeout(() => setStep(1), 900)
    const t2 = setTimeout(() => setStep(2), 2100)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  return (
    <div className="h-full bg-white px-2.5 py-3 flex flex-col">
      <div className="text-[7px] font-bold text-gray-900 mb-0.5 text-center">Scan QRIS</div>
      <div className="text-[11px] font-extrabold text-blue-600 text-center mb-2">Rp 38.000</div>
      <div className="relative bg-gray-50 rounded-xl p-2 flex-1 flex items-center justify-center">
        <div className="w-full aspect-square bg-gray-200 rounded-lg flex items-center justify-center relative overflow-hidden max-w-[100px] mx-auto">
          <div className="text-[8px] text-gray-500 font-mono">QR</div>
          {step >= 1 && (
            <div className="absolute inset-0">
              <div className="w-full h-0.5 bg-blue-500/70 animate-shimmer-scan" />
            </div>
          )}
          {step === 2 && (
            <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center">
              <div className="text-xl animate-scale-in">✓</div>
            </div>
          )}
        </div>
      </div>
      <div className={`text-center mt-2 text-[6px] font-semibold transition-all duration-500 ${
        step === 0 ? 'text-gray-400' : step === 1 ? 'text-blue-500' : 'text-green-600'
      }`}>
        {step === 0 ? 'Menunggu pembayaran via AstraPay...' : step === 1 ? 'Pembayaran terdeteksi...' : '✓ Berhasil!'}
      </div>
    </div>
  )
}

function PointsScene() {
  return (
    <div className="h-full bg-white flex flex-col items-center justify-center px-3 text-center">
      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-2.5 animate-scale-in">
        <div className="text-green-600 text-xl">✓</div>
      </div>
      <div className="text-[8px] font-extrabold text-gray-900 mb-0.5">Pembayaran Berhasil!</div>
      <div className="text-[10px] font-extrabold text-green-600 mb-3">Rp 38.000</div>
      <div className="bg-blue-600 rounded-xl px-3 py-2 w-full animate-bounce-in">
        <div className="text-[6px] text-blue-200 mb-0.5">AstraPoints kamu</div>
        <div className="text-white font-extrabold text-sm leading-none">+50 ⭐</div>
        <div className="text-[5.5px] text-blue-300 mt-0.5">tukar jadi saldo AstraPay</div>
      </div>
    </div>
  )
}

function MerchantScene() {
  return (
    <div className="h-full bg-gray-950 px-2.5 pt-3">
      <div className="flex items-center justify-between mb-3">
        <div className="text-[6px] text-gray-500 uppercase tracking-wide">Dashboard · Toko Rizky</div>
        <div className="flex items-center gap-1 text-[5.5px] text-green-400">
          <div className="w-1 h-1 rounded-full bg-green-400 animate-pulse" />
          Live
        </div>
      </div>
      {/* Notification */}
      <div className="bg-green-500/10 border border-green-500/20 rounded-xl px-2 py-2 mb-2.5 flex items-center gap-1.5 animate-notification">
        <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 text-[9px]">🔔</div>
        <div>
          <div className="text-[6.5px] font-bold text-green-400">Order baru masuk!</div>
          <div className="text-[5.5px] text-green-600">Kampas Rem Premium</div>
        </div>
      </div>
      {/* Stats */}
      <div className="grid grid-cols-2 gap-1.5">
        <div className="bg-white/5 border border-white/10 rounded-xl px-2 py-2">
          <div className="text-[5px] text-gray-500 mb-1 uppercase tracking-wide">Pendapatan</div>
          <div className="text-[8px] font-extrabold text-white">Rp 38rb</div>
          <div className="text-[5px] text-green-400 mt-0.5">↑ real-time</div>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl px-2 py-2">
          <div className="text-[5px] text-gray-500 mb-1 uppercase tracking-wide">Pesanan</div>
          <div className="text-[18px] font-extrabold text-white leading-none">1</div>
          <div className="text-[5px] text-green-400 mt-0.5">↑ hari ini</div>
        </div>
      </div>
    </div>
  )
}

// ── Animated Phone ────────────────────────────────────────────────────────────

type PhoneScene = 'store' | 'buy' | 'qr' | 'points' | 'merchant'

const SCENE_META: Record<PhoneScene, { emoji: string; label: string; sub: string; who: 'buyer' | 'merchant' }> = {
  store:    { emoji: '🛍️', label: 'Browse toko',         sub: 'Pelanggan lihat produk',     who: 'buyer'    },
  buy:      { emoji: '🛒', label: 'Tambah ke keranjang', sub: 'Pilih beberapa produk',      who: 'buyer'    },
  qr:       { emoji: '💳', label: 'Bayar via AstraPay',  sub: 'Scan QRIS · otomatis 8 dtk', who: 'buyer'    },
  points:   { emoji: '⭐', label: 'Dapat AstraPoints',   sub: '+50 poin langsung masuk',    who: 'buyer'    },
  merchant: { emoji: '📊', label: 'Dashboard merchant',  sub: 'Real-time · tanpa refresh',  who: 'merchant' },
}

function ScenePopup({ scene, visible }: { scene: PhoneScene; visible: boolean }) {
  const meta = SCENE_META[scene]
  return (
    <div className={`transition-all duration-300 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1 pointer-events-none'}`}>
      <div className={`rounded-2xl px-4 py-3 flex items-center gap-3 shadow-sm border ${meta.who === 'merchant' ? 'bg-gray-950 border-white/10' : 'bg-white border-gray-100'}`}>
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-base flex-shrink-0 ${meta.who === 'merchant' ? 'bg-white/10' : 'bg-gray-50'}`}>
          {meta.emoji}
        </div>
        <div>
          <p className={`text-xs font-bold leading-snug ${meta.who === 'merchant' ? 'text-white' : 'text-gray-900'}`}>{meta.label}</p>
          <p className={`text-[10px] ${meta.who === 'merchant' ? 'text-gray-400' : 'text-gray-400'}`}>{meta.sub}</p>
        </div>
        <div className={`ml-auto text-[9px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${meta.who === 'merchant' ? 'bg-green-500/20 text-green-400' : 'bg-app-blue/10 text-app-blue'}`}>
          {meta.who === 'merchant' ? 'Merchant' : 'Buyer'}
        </div>
      </div>
    </div>
  )
}

function AnimatedPhone() {
  const scenes: PhoneScene[] = ['store', 'buy', 'qr', 'points', 'merchant']
  const [idx,    setIdx]    = useState(0)
  const [fading, setFading] = useState(false)
  const [popupVisible, setPopupVisible] = useState(true)

  useEffect(() => {
    const timer = setInterval(() => {
      setPopupVisible(false)
      setFading(true)
      setTimeout(() => {
        setIdx((i) => (i + 1) % scenes.length)
        setFading(false)
      }, 250)
      setTimeout(() => setPopupVisible(true), 350)
    }, 3000)
    return () => clearInterval(timer)
  }, [])

  const scene = scenes[idx]

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Scene context popup — above the phone */}
      <div className="w-[200px]">
        <ScenePopup scene={scene} visible={popupVisible} />
      </div>

      <div className="relative">
        {/* Floating AstraPoints badge */}
        <div className="absolute -left-14 top-1/3 z-10 bg-amber-400 text-white text-[9px] font-bold px-2.5 py-1.5 rounded-full shadow-lg animate-float whitespace-nowrap pointer-events-none">
          ⭐ +50 poin
        </div>
        {/* Floating order notification */}
        <div className="absolute -right-20 bottom-1/3 z-10 bg-white border border-gray-100 px-2.5 py-2 rounded-xl shadow-xl whitespace-nowrap pointer-events-none animate-float" style={{ animationDelay: '1.2s' }}>
          <div className="text-[8px] font-bold text-gray-900">🔔 Order baru!</div>
          <div className="text-[7px] text-gray-400">Rp 38.000 masuk</div>
        </div>

        <div className="flex items-center gap-3">
          {/* Phone */}
          <div className="w-[200px] h-[365px] bg-gray-900 rounded-[36px] border-[5px] border-gray-800 shadow-2xl overflow-hidden relative flex-shrink-0">
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-14 h-1.5 bg-gray-800 rounded-full z-10" />
            <div className={`h-full pt-6 transition-opacity duration-200 ${fading ? 'opacity-0' : 'opacity-100'}`}>
              {scene === 'store'    && <StoreScene />}
              {scene === 'buy'      && <BuyScene />}
              {scene === 'qr'       && <QRScene key={idx} />}
              {scene === 'points'   && <PointsScene key={idx} />}
              {scene === 'merchant' && <MerchantScene key={idx} />}
            </div>
          </div>

          {/* Vertical dots */}
          <div className="flex flex-col gap-2">
            {scenes.map((_, i) => (
              <div
                key={i}
                className={`w-1 rounded-full transition-all duration-400 ${i === idx ? 'h-7 bg-app-blue' : 'h-2 bg-gray-200'}`}
              />
            ))}
          </div>
        </div>

        <div className="absolute -bottom-3 left-4 right-14 h-8 bg-gray-900/15 rounded-full blur-xl pointer-events-none" />
      </div>

    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Nav */}
      <div className="px-6 py-4 flex items-center gap-4">
        <Link href="/" className="text-sm text-gray-400 hover:text-gray-700 transition-colors flex items-center gap-1">
          ← Kembali
        </Link>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-app-blue rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-white font-extrabold text-sm leading-none">AT</span>
          </div>
          <span className="font-bold text-app-blue">AstraToko</span>
        </div>
      </div>

      {/* Main — mobile: stacked, desktop: side by side */}
      <div className="flex-1 flex flex-col md:flex-row items-center justify-center gap-14 px-8 pb-12 max-w-5xl mx-auto w-full">

        {/* Left: copy */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left max-w-sm w-full">

          {/* Rizky's voice */}
          <p className="text-sm text-gray-400 mb-2">👋 Halo, saya Rizky.</p>
          <p className="text-sm text-gray-400 mb-6">Pemilik toko ini.</p>

          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 leading-[1.1] tracking-tight mb-5">
            Ikuti satu transaksi<br />dari awal hingga akhir.
          </h1>

          <p className="text-gray-500 text-sm leading-relaxed mb-8">
            Dalam 90 detik, kamu akan melihat bagaimana pelanggan menemukan produk, membayar
            dengan AstraPay, mendapatkan AstraPoints — lalu bagaimana transaksi itu langsung
            muncul di dashboard tokomu.
          </p>

          {/* Journey teaser */}
          <div className="flex items-center gap-3 mb-8 w-full">
            {[
              { icon: '🛍️', label: 'Belanja' },
              { icon: '💳', label: 'AstraPay' },
              { icon: '⭐', label: 'Poin'    },
              { icon: '📊', label: 'Dashboard' },
            ].map((step, i) => (
              <div key={i} className="flex flex-col items-center gap-1 flex-1">
                <div className="text-lg">{step.icon}</div>
                <div className="text-[9px] text-gray-400 font-medium whitespace-nowrap">{step.label}</div>
                {i < 3 && (
                  <div className="absolute" style={{ display: 'none' }} />
                )}
              </div>
            ))}
          </div>

          {/* CTA */}
          <Link
            href="/toko/toko-rizky?demo=true"
            className="btn-primary inline-flex items-center gap-3 text-base px-8 py-4"
          >
            ▶ Rasakan Sekarang <ArrowRight size={18} />
          </Link>
        </div>

        {/* Right: phone */}
        <div className="flex-shrink-0 mt-8 md:mt-0">
          <AnimatedPhone />
        </div>

      </div>
    </div>
  )
}
