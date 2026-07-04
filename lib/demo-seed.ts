import { supabase } from './supabase'
import { PRODUCTS } from './mock-data'

export async function ensureDemoSeller() {
  const { data: seller, error } = await supabase
    .from('sellers')
    .upsert(
      {
        name: 'Toko Rizky',
        slug: 'toko-rizky',
        initial: 'R',
        location: 'Bandung',
        whatsapp: '081234567890',
        platform: 'Tokopedia',
        platform_fee_pct: 0.22,
        astratoko_fee_pct: 0.025,
      },
      { onConflict: 'slug' },
    )
    .select()
    .single()

  if (error || !seller) return null

  const { data: existing } = await supabase
    .from('products')
    .select('id')
    .eq('seller_id', seller.id)
    .limit(1)

  if (!existing || existing.length === 0) {
    await supabase.from('products').insert(
      PRODUCTS.map((p) => ({
        seller_id: seller.id,
        name: p.name,
        price: p.price,
        stock: p.stock,
        category: p.category,
      })),
    )
  }

  return seller
}
