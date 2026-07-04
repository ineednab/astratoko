import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(req: Request) {
  const slug = new URL(req.url).searchParams.get('slug')
  if (!slug) return NextResponse.json({ error: 'Missing slug' }, { status: 400 })

  const { data: seller } = await supabase
    .from('sellers')
    .select('id')
    .eq('slug', slug)
    .single()

  if (!seller) return NextResponse.json({ error: 'Toko tidak ditemukan' }, { status: 404 })

  const { data: orders, error } = await supabase
    .from('orders')
    .select()
    .eq('seller_id', seller.id)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ orders: orders ?? [] })
}

export async function POST(req: Request) {
  const body = await req.json()
  const { seller_id, product_id, product_name, price, category, buyer_name, buyer_phone } =
    body as Record<string, string>

  if (!seller_id || !product_name || !price) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('orders')
    .insert({
      seller_id,
      product_id: product_id ?? null,
      product_name,
      price: Number(price),
      category: category ?? '',
      buyer_name: buyer_name ?? '',
      buyer_phone: buyer_phone ?? '',
      status: 'paid',
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ order: data })
}
