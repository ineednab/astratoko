'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Zap, Gift, Share2, MessageCircle, ChevronRight } from 'lucide-react'
import { formatRp } from '@/lib/utils'
import { orderAmount } from '@/lib/metrics'
import { Sidebar } from '@/components/Sidebar'
import type { Seller, Order, Product } from '@/lib/types'

// ── Tier System ────────────────────────────────────────────────────────────────

interface Tier {
  name: string; minPts: number; maxPts: number
  emoji: string; color: string; bg: string; border: string; glow: string
}

const TIERS: Tier[] = [
  { name: 'Bronze',   minPts: 0,   maxPts: 99,         emoji: '🥉', color: 'text-amber-700',  bg: 'bg-amber-50',   border: 'border-amber-200',  glow: 'from-amber-900/30' },
  { name: 'Silver',   minPts: 100, maxPts: 299,        emoji: '🥈', color: 'text-slate-500',  bg: 'bg-slate-50',   border: 'border-slate-200',  glow: 'from-slate-700/30' },
  { name: 'Gold',     minPts: 300, maxPts: 599,        emoji: '🥇', color: 'text-amber-500',  bg: 'bg-amber-50',   border: 'border-amber-100',  glow: 'from-amber-600/30' },
  { name: 'Platinum', minPts: 600, maxPts: Infinity,   emoji: '💎', color: 'text-purple-500', bg: 'bg-purple-50',  border: 'border-purple-200', glow: 'from-purple-900/40' },
]

function getTier(points: number): Tier {
  for (let i = TIERS.length - 1; i >= 0; i--) {
    if (points >= TIERS[i].minPts) return TIERS[i]
  }
  return TIERS[0]
}
function getNextTier(points: number): Tier | null {
  return TIERS.find(t => t.minPts > points) ?? null
}

// ── Derived customer type ──────────────────────────────────────────────────────

interface LoyaltyMember {
  name: string; phone: string; maskedPhone: string
  initial: string; orderCount: number; totalSpend: number
  points: number; lastOrderTime: string
  tier: Tier
}

const AVATAR_COLORS = ['#3B5BDB','#2F9E44','#F08C00','#E03131','#7048E8','#1098AD','#D6336C','#0C8599']

// ── Loyalty Pass Card (the "wah" component) ───────────────────────────────────

function LoyaltyPassCard({ member, sellerName }: { member: LoyaltyMember; sellerName: string }) {
  const nextTier = getNextTier(member.points)
  const progress = nextTier ? Math.min(100, Math.round((member.points / nextTier.minPts) * 100)) : 100

  const gradientClass =
    member.tier.name === 'Platinum' ? 'from-purple-950 via-purple-900 to-gray-900' :
    member.tier.name === 'Gold'     ? 'from-amber-950 via-yellow-900 to-gray-900'  :
    member.tier.name === 'Silver'   ? 'from-gray-800 via-slate-700 to-gray-900'    :
                                      'from-amber-950 via-gray-900 to-gray-950'

  const accentColor =
    member.tier.name === 'Platinum' ? 'text-purple-400'   :
    member.tier.name === 'Gold'     ? 'text-amber-400'     :
    member.tier.name === 'Silver'   ? 'text-slate-300'     : 'text-amber-600'

  const barColor =
    member.tier.name === 'Platinum' ? 'bg-purple-400'  :
    member.tier.name === 'Gold'     ? 'bg-amber-400'   :
    member.tier.name === 'Silver'   ? 'bg-slate-300'   : 'bg-amber-500'

  return (
    <div className={`bg-gradient-to-br ${gradientClass} rounded-2xl p-6 text-white relative overflow-hidden shadow-2xl`}
      style={{ minHeight: 220 }}
    >
      {/* Decorative */}
      <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-white/[0.04]" />
      <div className="absolute -left-6 -bottom-10 w-32 h-32 rounded-full bg-white/[0.03]" />
      <div className="absolute right-16 bottom-4 w-16 h-16 rounded-full bg-white/[0.02]" />

      {/* Header row */}
      <div className="flex items-center justify-between mb-5 relative">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-white/10 rounded-lg flex items-center justify-center">
            <Zap size={12} className="text-astrapay-gold" fill="currentColor" />
          </div>
          <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">AstraToko Loyalty Pass</span>
        </div>
        <span className="text-2xl">{member.tier.emoji}</span>
      </div>

      {/* Store */}
      <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest mb-1 relative">{sellerName}</p>

      {/* Tier badge */}
      <p className={`text-sm font-extrabold uppercase tracking-wide mb-3 relative ${accentColor}`}>
        {member.tier.emoji} {member.tier.name} Member
      </p>

      {/* Member info */}
      <p className="text-xl font-extrabold leading-tight mb-0.5 relative">{member.name}</p>
      <p className="text-xs text-white/30 mb-4 relative">{member.maskedPhone}</p>

      {/* Points + progress */}
      <div className="relative">
        <div className="flex items-end gap-2 mb-2">
          <span className={`text-3xl font-extrabold leading-none ${accentColor}`}>{member.points}</span>
          <span className="text-xs text-white/40 mb-1">AstraPoints</span>
        </div>
        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden mb-1">
          <div className={`h-full ${barColor} rounded-full transition-all duration-700`} style={{ width: `${progress}%` }} />
        </div>
        {nextTier ? (
          <p className="text-[9px] text-white/30">{member.points} / {nextTier.minPts} pts menuju {nextTier.emoji} {nextTier.name}</p>
        ) : (
          <p className="text-[9px] text-white/30">Tier tertinggi — {member.tier.emoji} Platinum Member</p>
        )}
      </div>
    </div>
  )
}

// ── Demo/Preview Card ──────────────────────────────────────────────────────────

function DemoLoyaltyCard({ sellerName }: { sellerName: string }) {
  const demoMember: LoyaltyMember = {
    name: 'Pelangganmu', phone: '08120000000', maskedPhone: '0812****0000',
    initial: 'P', orderCount: 3, totalSpend: 375_000,
    points: 150, lastOrderTime: new Date().toISOString(),
    tier: TIERS[1], // Silver
  }
  return <LoyaltyPassCard member={demoMember} sellerName={sellerName} />
}

// ── Toast ──────────────────────────────────────────────────────────────────────

function Toast({ message }: { message: string }) {
  return (
    <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-2 bg-gray-900 text-white text-sm font-medium px-4 py-2.5 rounded-full shadow-xl animate-fadein">
      {message}
    </div>
  )
}

function Skeleton() {
  return (
    <div className="flex h-screen bg-[#F4F6F8] overflow-hidden">
      <div className="w-64 bg-white border-r border-gray-100 flex-shrink-0 animate-pulse" />
      <div className="flex-1 p-8 space-y-5">
        <div className="h-10 bg-gray-100 rounded-xl w-48 animate-pulse" />
        <div className="grid grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-28 bg-white rounded-2xl animate-pulse" />)}
        </div>
        <div className="grid grid-cols-2 gap-5">
          <div className="h-64 bg-white rounded-2xl animate-pulse" />
          <div className="h-64 bg-white rounded-2xl animate-pulse" />
        </div>
      </div>
    </div>
  )
}

// ── Main Component ─────────────────────────────────────────────────────────────

export default function LoyaltyPage() {
  const [seller,   setSeller]   = useState<Seller | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [orders,   setOrders]   = useState<Order[]>([])
  const [loading,  setLoading]  = useState(true)
  const [toast,    setToast]    = useState('')

  const showToast = useCallback((msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(''), 2500)
  }, [])

  useEffect(() => {
    const slug = (typeof localStorage !== 'undefined' && localStorage.getItem('seller_slug')) || '__no_seller__'
    Promise.all([
      fetch(`/api/sellers/${slug}`).then(r => r.json()),
      fetch(`/api/orders?slug=${slug}`).then(r => r.json()),
    ]).then(([s, o]) => {
      if (s.seller)   setSeller(s.seller)
      if (s.products) setProducts(s.products)
      setOrders(o.orders ?? [])
    }).finally(() => setLoading(false))
  }, [])

  if (loading) return <Skeleton />

  // Derive loyalty members (paid orders only, consistent with dashboard/CRM)
  const memberMap = new Map<string, LoyaltyMember>()
  orders.filter(o => o.status === 'paid').forEach(o => {
    const m = memberMap.get(o.buyer_phone)
    if (m) {
      m.orderCount++; m.totalSpend += orderAmount(o)
      if (new Date(o.created_at) > new Date(m.lastOrderTime)) m.lastOrderTime = o.created_at
      m.points = m.orderCount * 50
      m.tier   = getTier(m.points)
    } else {
      const name = o.buyer_name || 'Pembeli'
      const ph   = o.buyer_phone
      memberMap.set(ph, {
        name, phone: ph,
        maskedPhone: ph.length >= 8 ? ph.slice(0, 4) + '****' + ph.slice(-4) : ph,
        initial: name.charAt(0).toUpperCase(),
        orderCount: 1, totalSpend: orderAmount(o),
        points: 50, lastOrderTime: o.created_at,
        tier: getTier(50),
      })
    }
  })
  const members = Array.from(memberMap.values()).sort((a, b) => b.points - a.points)

  const totalPoints   = members.reduce((s, m) => s + m.points, 0)
  const tierCounts    = TIERS.map(t => ({ ...t, count: members.filter(m => m.tier.name === t.name).length }))
  const uniqueCustomers = new Set(orders.filter(o => o.status === 'paid').map(o => o.buyer_phone)).size

  const hasMembers = members.length > 0

  return (
    <>
      <div className="hidden lg:flex h-screen bg-[#F4F6F8] overflow-hidden">
        {toast && <Toast message={toast} />}

        <Sidebar
          seller={seller}
          counts={{ products: products.length, orders: orders.length, customers: uniqueCustomers }}
        />

        <main className="flex-1 overflow-y-auto">
          <header className="sticky top-0 z-10 bg-white/90 backdrop-blur-md border-b border-gray-100 px-8 py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-base font-extrabold text-gray-900 leading-tight">Loyalty & AstraPoints</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {hasMembers ? `${members.length} anggota · ${totalPoints} poin terdistribusi` : 'Program loyalitas pelangganmu'}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => showToast('Loyalty Campaign segera hadir 🚀')}
                  className="flex items-center gap-2 bg-app-blue hover:bg-app-blue-light text-white font-semibold px-4 py-2 rounded-xl text-sm transition-colors"
                >
                  <Gift size={14} /> Buat Campaign
                </button>
              </div>
            </div>
          </header>

          <div className="px-8 py-6 space-y-6 pb-16">

            {/* ── Tier stats ── */}
            <div className="grid grid-cols-4 gap-4">
              {TIERS.map(t => {
                const count = hasMembers ? tierCounts.find(tc => tc.name === t.name)?.count ?? 0 : 0
                return (
                  <div key={t.name} className={`bg-white rounded-2xl border ${t.border} p-5 shadow-sm`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl">{t.emoji}</span>
                      {count > 0 && <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${t.bg} ${t.color} border ${t.border}`}>{count} anggota</span>}
                    </div>
                    <p className={`text-sm font-extrabold ${t.color}`}>{t.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {t.maxPts === Infinity ? `${t.minPts}+ pts` : `${t.minPts}–${t.maxPts} pts`}
                    </p>
                    {!hasMembers && <p className="text-lg font-extrabold text-gray-200 mt-1">—</p>}
                    {hasMembers && <p className="text-2xl font-extrabold text-gray-900 mt-1">{count}</p>}
                  </div>
                )
              })}
            </div>

            {/* ── Digital Loyalty Pass + Member List ── */}
            <div className="grid grid-cols-[1fr_2fr] gap-6">
              {/* Left: Pass preview */}
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-extrabold text-gray-900 mb-1">Digital Loyalty Pass</p>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    {hasMembers
                      ? `Ini tampilan loyalty pass ${members[0].name} — pelanggan terbaik tokomu saat ini.`
                      : 'Pelanggan pertamamu akan mendapat loyalty pass digital ini setelah checkout.'}
                  </p>
                </div>

                {hasMembers ? (
                  <LoyaltyPassCard member={members[0]} sellerName={seller?.name ?? ''} />
                ) : (
                  <DemoLoyaltyCard sellerName={seller?.name ?? 'Toko Kamu'} />
                )}

                {!hasMembers && (
                  <div className="bg-app-blue/5 border border-app-blue/10 rounded-xl p-4">
                    <p className="text-xs font-bold text-app-blue mb-1">Preview Mode</p>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      Ini contoh tampilan. Saat pelanggan pertama melakukan checkout, loyalty pass mereka otomatis dibuat.
                    </p>
                  </div>
                )}

                {/* Points rules */}
                <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                  <p className="text-xs font-extrabold text-gray-900 mb-3">Aturan AstraPoints</p>
                  <div className="space-y-2.5">
                    {[
                      { rule: 'Setiap transaksi',     pts: '+50 pts' },
                      { rule: 'Referral teman baru',  pts: '+100 pts', soon: true },
                      { rule: 'Ulang tahun member',   pts: '+200 pts', soon: true },
                      { rule: 'Review produk',        pts: '+25 pts',  soon: true },
                    ].map(r => (
                      <div key={r.rule} className="flex items-center justify-between">
                        <p className={`text-xs ${r.soon ? 'text-gray-300' : 'text-gray-600'}`}>{r.rule}</p>
                        <div className="flex items-center gap-1.5">
                          <span className={`text-xs font-bold ${r.soon ? 'text-gray-300' : 'text-astrapay-gold'}`}>{r.pts}</span>
                          {r.soon && <span className="text-[9px] bg-gray-100 text-gray-400 px-1 rounded font-medium">soon</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right: Member list */}
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                <div className="px-6 pt-5 pb-3 border-b border-gray-50 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-extrabold text-gray-900">Loyalty Members</h3>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {hasMembers ? `Diurutkan berdasarkan AstraPoints` : 'Belum ada member'}
                    </p>
                  </div>
                  {hasMembers && (
                    <button
                      onClick={() => showToast(`⭐ Bonus points dikirim ke ${members.length} member!`)}
                      className="text-xs font-semibold text-app-blue hover:text-app-blue-light flex items-center gap-1 transition-colors"
                    >
                      <Gift size={12} /> Kirim Bonus
                    </button>
                  )}
                </div>

                {!hasMembers ? (
                  <div className="px-6 py-12 flex flex-col items-center text-center">
                    <span className="text-4xl mb-4">⭐</span>
                    <p className="font-semibold text-gray-900 mb-2">Loyalty Program Siap</p>
                    <p className="text-sm text-gray-400 mb-2 max-w-xs leading-relaxed">
                      Setiap pelanggan yang berbelanja otomatis masuk program loyalty dan mendapat 50 AstraPoints per transaksi.
                    </p>
                    <p className="text-xs text-gray-400 mb-6">Tidak perlu registrasi, tidak perlu kartu fisik.</p>
                    <Link href="/dashboard"
                      className="flex items-center gap-1.5 text-sm font-semibold text-app-blue hover:text-app-blue-light transition-colors"
                    >
                      Bagikan toko untuk mulai <ChevronRight size={13} />
                    </Link>
                  </div>
                ) : (
                  <>
                    {/* Table header */}
                    <div className="grid grid-cols-[36px_1fr_90px_70px_90px_100px_80px] gap-3 px-6 py-2.5 bg-gray-50/60 border-b border-gray-50">
                      {['', 'Member', 'Tier', 'Pesanan', 'AstraPoints', 'Total Belanja', ''].map((h, i) => (
                        <p key={i} className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">{h}</p>
                      ))}
                    </div>
                    <div className="divide-y divide-gray-50">
                      {members.map((m, i) => {
                        const nextTier = getNextTier(m.points)
                        const progress = nextTier ? Math.min(100, Math.round((m.points / nextTier.minPts) * 100)) : 100
                        const waPhone  = m.phone.startsWith('0') ? '62' + m.phone.slice(1) : m.phone
                        const rewardMsg = encodeURIComponent(`Halo ${m.name}! Kamu punya ${m.points} AstraPoints di ${seller?.name ?? 'toko kami'}. Belanja lagi dan naik ke tier ${nextTier?.name ?? 'Platinum'}! 🎉`)
                        return (
                          <div key={m.phone} className="grid grid-cols-[36px_1fr_90px_70px_90px_100px_80px] gap-3 items-center px-6 py-4 hover:bg-gray-50/50 transition-colors group">
                            <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-white font-extrabold text-xs"
                              style={{ backgroundColor: AVATAR_COLORS[i % AVATAR_COLORS.length] }}>
                              {m.initial}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-gray-900 truncate leading-tight">{m.name}</p>
                              <div className="mt-1 h-1 bg-gray-100 rounded-full overflow-hidden w-full max-w-[120px]">
                                <div className={`h-full rounded-full transition-all ${
                                  m.tier.name === 'Platinum' ? 'bg-purple-400' :
                                  m.tier.name === 'Gold'     ? 'bg-amber-400'  :
                                  m.tier.name === 'Silver'   ? 'bg-slate-400'  : 'bg-amber-600'
                                }`} style={{ width: `${progress}%` }} />
                              </div>
                            </div>
                            <span className={`text-[10px] font-bold px-2 py-1 rounded-lg leading-none ${m.tier.bg} ${m.tier.color} border ${m.tier.border} w-fit`}>
                              {m.tier.emoji} {m.tier.name}
                            </span>
                            <p className="text-sm font-bold text-gray-900">{m.orderCount}×</p>
                            <p className={`text-sm font-extrabold ${m.tier.color}`}>⚡ {m.points}</p>
                            <p className="text-sm font-bold text-gray-900">{formatRp(m.totalSpend)}</p>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <a href={`https://wa.me/${waPhone}?text=${rewardMsg}`} target="_blank" rel="noopener noreferrer"
                                title="Kirim reward via WA"
                                className="w-7 h-7 bg-[#25D366] hover:bg-[#1db954] rounded-lg flex items-center justify-center transition-colors"
                              >
                                <MessageCircle size={12} className="text-white" />
                              </a>
                              <button title="Beri bonus points"
                                onClick={() => showToast(`⭐ 100 AstraPoints bonus dikirim ke ${m.name}!`)}
                                className="w-7 h-7 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg flex items-center justify-center transition-colors"
                              >
                                <Gift size={11} className="text-amber-600" />
                              </button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* ── Reward Campaigns (roadmap) ── */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-sm font-extrabold text-gray-900">Reward Campaigns</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Segera hadir — buat campaign loyalty otomatis</p>
                </div>
                <span className="text-[9px] font-bold bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full border border-amber-200">🚧 Coming Soon</span>
              </div>
              <div className="grid grid-cols-4 gap-4">
                {[
                  { icon: '📣', title: 'Broadcast Promo',   desc: 'Kirim pesan promo ke semua member sekaligus via WhatsApp.' },
                  { icon: '🎂', title: 'Birthday Reward',   desc: 'Kirim bonus points otomatis saat ulang tahun member.' },
                  { icon: '👥', title: 'Referral Program',  desc: 'Member dapat poin saat ajak teman baru berbelanja.' },
                  { icon: '🏆', title: 'Tier Challenge',    desc: 'Tantangan bulanan — naik tier dan dapat hadiah eksklusif.' },
                ].map(c => (
                  <div key={c.title} className="bg-gray-50 rounded-xl p-4 border border-gray-100 opacity-60">
                    <span className="text-2xl mb-3 block">{c.icon}</span>
                    <p className="text-sm font-bold text-gray-700 mb-1">{c.title}</p>
                    <p className="text-xs text-gray-400 leading-relaxed">{c.desc}</p>
                  </div>
                ))}
              </div>
              <div className="mt-5 flex items-center gap-3 bg-app-blue/5 border border-app-blue/10 rounded-xl px-5 py-3.5">
                <Share2 size={15} className="text-app-blue flex-shrink-0" />
                <p className="text-xs text-gray-600 leading-relaxed">
                  <span className="font-semibold text-app-blue">Sementara itu</span>, kamu sudah bisa kirim promo manual ke pelanggan via WhatsApp langsung dari halaman{' '}
                  <Link href="/customers" className="font-bold text-app-blue hover:underline">Customers</Link>.
                </p>
              </div>
            </div>

          </div>
        </main>
      </div>

      <div className="lg:hidden min-h-screen bg-[#F4F6F8] flex items-center justify-center p-8">
        <div className="text-center max-w-xs">
          <p className="text-4xl mb-4">💻</p>
          <p className="font-extrabold text-gray-900 text-lg mb-2">Buka di Desktop</p>
          <Link href="/dashboard" className="inline-flex items-center gap-2 bg-app-blue text-white font-bold px-5 py-3 rounded-xl text-sm">
            ← Dashboard
          </Link>
        </div>
      </div>
    </>
  )
}
