export const SELLER = {
  id: '1',
  name: 'Toko Rizky',
  slug: 'toko-rizky',
  location: 'Bandung',
  gmv_bulan_ini: 18400000,
  platform: 'Tokopedia',
  platform_fee_pct: 0.22,
  astratoko_fee_pct: 0.025,
}

export const PRODUCTS = [
  { id: '1', name: 'Brake Pad XYZ Motor', price: 85000, stock: 24, image_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400', category: 'Rem' },
  { id: '2', name: 'Oli Federal Matic 1L', price: 52000, stock: 48, image_url: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=400', category: 'Oli' },
  { id: '3', name: 'Helm Half Face SNI Merah', price: 185000, stock: 12, image_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400', category: 'Helm' },
  { id: '4', name: 'Filter Udara Honda Beat', price: 45000, stock: 36, image_url: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=400', category: 'Filter' },
  { id: '5', name: 'Kampas Rem Depan Yamaha', price: 38000, stock: 30, image_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400', category: 'Rem' },
  { id: '6', name: 'Busi NGK Racing', price: 28000, stock: 60, image_url: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=400', category: 'Mesin' },
  { id: '7', name: 'Rantai Motor RK 428', price: 95000, stock: 18, image_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400', category: 'Transmisi' },
  { id: '8', name: 'Oli Gardan Matic 150ml', price: 22000, stock: 72, image_url: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=400', category: 'Oli' },
  { id: '9', name: 'Spion Bulat Chrome Universal', price: 65000, stock: 20, image_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400', category: 'Aksesoris' },
  { id: '10', name: 'Ban Dalam IRC 80/90-14', price: 48000, stock: 15, image_url: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=400', category: 'Ban' },
  { id: '11', name: 'Kabel Gas Universal', price: 32000, stock: 25, image_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400', category: 'Mesin' },
  { id: '12', name: 'Aki Yuasa YTZ5S', price: 245000, stock: 8, image_url: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=400', category: 'Elektrik' },
]

export const CUSTOMERS = [
  { id: '1', name: 'Budi Santoso', phone: '0812xxxx', points: 350, orders: 7 },
  { id: '2', name: 'Dewi Lestari', phone: '0857xxxx', points: 50, orders: 1 },
  { id: '3', name: 'Agus Prasetyo', phone: '0821xxxx', points: 1250, orders: 25 },
]

export const MARKETPLACE_FEES: Record<string, number> = {
  Tokopedia: 0.22,
  Shopee: 0.20,
  TikTok: 0.25,
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
