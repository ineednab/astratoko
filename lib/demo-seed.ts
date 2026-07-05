import { supabase } from './supabase'
import { PRODUCTS } from './mock-data'

const DEMO_SELLER = {
  name: 'Toko Rizky',
  slug: 'tokorizky',
  initial: 'R',
  location: 'Bandung',
  whatsapp: '081234567890',
  platform: 'Tokopedia',
  platform_fee_pct: 0.22,
  astratoko_fee_pct: 0.025,
}

export async function ensureDemoSeller() {
  // Select-or-insert, never upsert. Anon-key UPDATE is blocked by RLS, so an
  // upsert on an already-existing row throws 42501. The demo seller usually
  // already exists, so read it first and only insert when it is missing.
  const { data: existing } = await supabase
    .from('sellers')
    .select()
    .eq('slug', DEMO_SELLER.slug)
    .maybeSingle()

  let seller = existing

  if (!seller) {
    const { data: created, error } = await supabase
      .from('sellers')
      .insert(DEMO_SELLER)
      .select()
      .single()
    if (error || !created) return null
    seller = created
  }

  const { data: existingProducts } = await supabase
    .from('products')
    .select('id')
    .eq('seller_id', seller.id)
    .limit(1)

  if (!existingProducts || existingProducts.length === 0) {
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
