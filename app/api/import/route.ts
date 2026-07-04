import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

type ProductRow = { name: string; price: number; stock: number; category: string }

export async function POST(req: Request) {
  const body = await req.json()
  const { seller_slug, products } = body as { seller_slug: string; products: ProductRow[] }

  if (!seller_slug || !Array.isArray(products) || products.length === 0) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const { data: seller } = await supabase
    .from('sellers')
    .select('id')
    .eq('slug', seller_slug)
    .single()

  if (!seller) return NextResponse.json({ error: 'Toko tidak ditemukan' }, { status: 404 })

  // Replace existing products on re-import
  await supabase.from('products').delete().eq('seller_id', seller.id)

  const rows = products
    .filter((p) => p.name?.trim())
    .map((p) => ({
      seller_id: seller.id,
      name: String(p.name).trim(),
      price: Math.round(Number(p.price)) || 0,
      stock: Math.round(Number(p.stock)) || 0,
      category: String(p.category ?? '').trim(),
    }))

  const { data, error } = await supabase.from('products').insert(rows).select()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ count: data?.length ?? 0 })
}
