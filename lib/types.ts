export type Seller = {
  id: string
  name: string
  slug: string
  initial: string
  location: string
  whatsapp: string
  platform: string
  platform_fee_pct: number
  astratoko_fee_pct: number
  created_at: string
}

export type Product = {
  id: string
  seller_id: string
  name: string
  price: number
  stock: number
  category: string
  created_at: string
}

export type Order = {
  id: string
  seller_id: string
  product_id: string | null
  product_name: string
  buyer_name: string
  buyer_phone: string
  price: number
  status: 'pending' | 'paid' | 'cancelled'
  category: string
  created_at: string
}

export type Customer = {
  id: string
  seller_id: string
  name: string
  phone: string
  points: number
  orders_count: number
  created_at: string
}
