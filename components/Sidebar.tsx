'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Package, ShoppingBag, Users,
  BarChart3, Settings, Megaphone, Star,
} from 'lucide-react'

export interface SidebarCounts {
  products?: number
  orders?: number
  customers?: number
}

const NAV_ITEMS = [
  { id: 'dashboard',  label: 'Overview',    Icon: LayoutDashboard, href: '/dashboard',  soon: false },
  { id: 'products',   label: 'Products',    Icon: Package,          href: '/products',   soon: false },
  { id: 'orders',     label: 'Orders',      Icon: ShoppingBag,      href: '/orders',     soon: false },
  { id: 'customers',  label: 'Customers',   Icon: Users,            href: '/customers',  soon: false },
  { id: 'loyalty',    label: 'Loyalty',     Icon: Star,             href: '/loyalty',    soon: false },
  { id: 'marketing',  label: 'Marketing',   Icon: Megaphone,        href: '/marketing',  soon: true  },
  { id: 'analytics',  label: 'Analytics',   Icon: BarChart3,        href: '/analytics',  soon: true  },
  { id: 'settings',   label: 'Settings',    Icon: Settings,         href: '/settings',   soon: true  },
] as const

export function Sidebar({
  seller,
  counts = {},
}: {
  seller: { name: string; initial: string } | null
  counts?: SidebarCounts
}) {
  const pathname = usePathname()

  return (
    <aside className="w-64 bg-white border-r border-gray-100 flex flex-col flex-shrink-0 h-full">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-gray-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-app-blue rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-white font-extrabold text-xs leading-none">AT</span>
          </div>
          <div>
            <p className="font-extrabold text-gray-900 text-sm leading-none">AstraToko</p>
            <p className="text-[10px] text-gray-400 mt-0.5">Merchant Dashboard</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(({ id, label, Icon, href, soon }) => {
          const active = pathname === href
          const count  = counts[id as keyof SidebarCounts]

          if (soon) {
            return (
              <div key={id}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-300 cursor-not-allowed select-none"
              >
                <Icon size={16} className="text-gray-200" />
                <span className="text-sm font-medium leading-none flex-1">{label}</span>
                <span className="text-[9px] font-bold bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded-full leading-none border border-gray-150">
                  Soon
                </span>
              </div>
            )
          }

          return (
            <Link key={id} href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group ${
                active
                  ? 'bg-app-blue text-white shadow-sm'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
              }`}
            >
              <Icon size={16} className={active ? 'text-white' : 'text-gray-400 group-hover:text-gray-600'} />
              <span className="text-sm font-medium leading-none flex-1">{label}</span>
              {count !== undefined && count > 0 && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none ${
                  active ? 'bg-white/20 text-white' : 'bg-app-blue/10 text-app-blue'
                }`}>{count}</span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Seller card */}
      {seller && (
        <div className="px-4 py-4 border-t border-gray-50">
          <div className="flex items-center gap-3 px-3 py-3 bg-gray-50 rounded-xl">
            <div className="w-8 h-8 bg-app-blue rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-white font-extrabold text-xs leading-none">{seller.initial}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-gray-900 truncate leading-tight">{seller.name}</p>
              <div className="flex items-center gap-1 mt-0.5">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse flex-shrink-0" />
                <p className="text-[10px] text-gray-400">Toko Online</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </aside>
  )
}
