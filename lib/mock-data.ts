export const SELLER = {
  id: '1',
  name: 'Toko Rizky',
  slug: 'tokorizky',
  initial: 'R',
  location: 'Bandung',
  platform: 'Tokopedia',
  platform_fee_pct: 0.22,
  astratoko_fee_pct: 0.025,
  // dashboard stats
  balance: 1_250_000,
  gmv: 18_400_000,
  gmvChange: 23,
  orders: 84,
  savings: 2_300_000,
}

export const PRODUCTS = [
  { id: '1',  name: 'Brake Pad XYZ Motor',        price: 85_000,  stock: 24, category: 'Rem' },
  { id: '2',  name: 'Oli Federal Matic 1L',        price: 52_000,  stock: 48, category: 'Oli' },
  { id: '3',  name: 'Helm Half Face SNI Merah',    price: 185_000, stock: 12, category: 'Helm' },
  { id: '4',  name: 'Filter Udara Honda Beat',     price: 45_000,  stock: 36, category: 'Filter' },
  { id: '5',  name: 'Kampas Rem Depan Yamaha',     price: 38_000,  stock: 30, category: 'Rem' },
  { id: '6',  name: 'Busi NGK Racing',             price: 28_000,  stock: 60, category: 'Mesin' },
  { id: '7',  name: 'Rantai Motor RK 428',         price: 95_000,  stock: 18, category: 'Transmisi' },
  { id: '8',  name: 'Oli Gardan Matic 150ml',      price: 22_000,  stock: 72, category: 'Oli' },
  { id: '9',  name: 'Spion Bulat Chrome Universal', price: 65_000, stock: 20, category: 'Aksesoris' },
  { id: '10', name: 'Ban Dalam IRC 80/90-14',      price: 48_000,  stock: 15, category: 'Ban' },
  { id: '11', name: 'Kabel Gas Universal',         price: 32_000,  stock: 25, category: 'Mesin' },
  { id: '12', name: 'Aki Yuasa YTZ5S',             price: 245_000, stock: 8,  category: 'Elektrik' },
]

export const RECENT_ORDERS = [
  { id: '1', product: 'Oli Federal Matic 1L',   buyer: 'Budi Santoso', time: '2 menit lalu',  price: 52_000,  status: 'Baru',    category: 'Oli' },
  { id: '2', product: 'Helm Half Face SNI',      buyer: 'Dewi Lestari', time: '1 jam lalu',    price: 185_000, status: 'Dibayar', category: 'Helm' },
  { id: '3', product: 'Kampas Rem Depan',        buyer: 'Agus P.',      time: '3 jam lalu',    price: 38_000,  status: 'Dibayar', category: 'Rem' },
  { id: '4', product: 'Filter Udara Honda Beat', buyer: 'Siti R.',      time: '5 jam lalu',    price: 45_000,  status: 'Dibayar', category: 'Filter' },
  { id: '5', product: 'Busi NGK Racing',         buyer: 'Hendra W.',    time: 'Kemarin 18:30', price: 28_000,  status: 'Dibayar', category: 'Mesin' },
]

export const CUSTOMERS = [
  { id: '1', name: 'Budi Santoso',  phone: '0812xxxx', points: 350,  orders: 7  },
  { id: '2', name: 'Dewi Lestari',  phone: '0857xxxx', points: 50,   orders: 1  },
  { id: '3', name: 'Agus Prasetyo', phone: '0821xxxx', points: 1250, orders: 25 },
]

export const MARKETPLACE_FEES: Record<string, number> = {
  Tokopedia: 0.22,
  Shopee:    0.20,
  TikTok:    0.25,
}

export function hitungPenghematan(gmv: number, platform: string) {
  const feeMarketplace = gmv * (MARKETPLACE_FEES[platform] ?? 0.22)
  const feeAstraToko = gmv * 0.025
  return {
    feeMarketplace,
    feeAstraToko,
    penghematan: feeMarketplace - feeAstraToko,
    penghematanPertahun: (feeMarketplace - feeAstraToko) * 12,
  }
}
