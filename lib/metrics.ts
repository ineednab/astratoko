import type { Order } from './types'

/** Revenue for a single order: prefer the full line total, fall back to unit price. */
export function orderAmount(o: Pick<Order, 'price' | 'total_price'>): number {
  return o.total_price ?? o.price
}

/** Sum revenue across the given orders (caller decides which orders to include). */
export function sumRevenue(orders: Pick<Order, 'price' | 'total_price'>[]): number {
  return orders.reduce((s, o) => s + orderAmount(o), 0)
}

export type CustomerTierLabel = 'VIP' | 'Loyal' | 'Kembali' | 'Tidak Aktif' | 'Baru'

export type CustomerTier = {
  label: CustomerTierLabel
  cls: string
  icon: string
}

/**
 * Single source of truth for customer tiering across every page
 * (customer list, customer detail, dashboard, analytics).
 */
export function customerTier({
  orderCount,
  totalSpend,
  lastOrderTime,
}: {
  orderCount: number
  totalSpend: number
  lastOrderTime?: string | number | Date | null
}): CustomerTier {
  const daysSince = lastOrderTime
    ? (Date.now() - new Date(lastOrderTime).getTime()) / 86_400_000
    : 0
  if (orderCount >= 5 || totalSpend >= 500_000)
    return { label: 'VIP', cls: 'bg-amber-50 text-amber-700 border border-amber-200', icon: '⭐' }
  if (lastOrderTime && daysSince > 30 && orderCount >= 2)
    return { label: 'Tidak Aktif', cls: 'bg-gray-100 text-gray-500 border border-gray-200', icon: '💤' }
  if (orderCount >= 3)
    return { label: 'Loyal', cls: 'bg-purple-50 text-purple-700 border border-purple-200', icon: '💜' }
  if (orderCount >= 2)
    return { label: 'Kembali', cls: 'bg-blue-50 text-blue-700 border border-blue-200', icon: '🔁' }
  return { label: 'Baru', cls: 'bg-green-50 text-green-700 border border-green-200', icon: '✨' }
}
