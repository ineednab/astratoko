import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { ensureDemoSeller } from '@/lib/demo-seed'

// Buyers with consistent phone numbers so repeat purchases are detected in CRM
const BUYERS = [
  { name: 'Dian Pratiwi',  phone: '081212345678' },
  { name: 'Ahmad Fauzi',   phone: '081234567890' },
  { name: 'Siti Rahma',    phone: '081256789012' },
  { name: 'Rizky Maulana', phone: '081278901234' },
  { name: 'Putri Amelia',  phone: '081290123456' },
  { name: 'Dian Pratiwi',  phone: '081212345678' }, // repeat — becomes "Kembali"
  { name: 'Ahmad Fauzi',   phone: '081234567890' }, // repeat — becomes "Kembali"
  { name: 'Budi Santoso',  phone: '081287654321' },
  { name: 'Nur Cahaya',    phone: '081243210987' },
]

export async function POST(req: NextRequest) {
  if (process.env.NEXT_PUBLIC_DEMO_MODE !== 'true') {
    return NextResponse.json({ error: 'Not in demo mode' }, { status: 403 })
  }

  const body = await req.json() as { scenario?: string }
  const scenario = body.scenario ?? 'a'

  // Guarantee demo seller + products exist before doing anything
  const seller = await ensureDemoSeller()

  if (!seller) {
    return NextResponse.json({ error: 'Demo seller not found' }, { status: 404 })
  }

  await supabase.from('orders').delete().eq('seller_id', seller.id)

  if (scenario === 'a') {
    return NextResponse.json({ ok: true, scenario, orders: 0 })
  }

  const { data: products } = await supabase
    .from('products')
    .select('id, name, price, category')
    .eq('seller_id', seller.id)
    .limit(10)

  if (!products || products.length === 0) {
    return NextResponse.json({ ok: true, scenario, orders: 0 })
  }

  const orderCount = scenario === 'b' ? 3 : 9

  const orders = Array.from({ length: orderCount }, (_, i) => {
    const product = products[i % products.length]
    const buyer   = BUYERS[i % BUYERS.length]
    return {
      seller_id:    seller.id,
      product_id:   product.id,
      product_name: product.name,
      price:        product.price,
      category:     product.category ?? '',
      buyer_name:   buyer.name,
      buyer_phone:  buyer.phone,
      status:       'paid',
    }
  })

  const { error } = await supabase.from('orders').insert(orders)
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true, scenario, orders: orderCount })
}
