import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function PATCH(
  req: Request,
  { params }: { params: { slug: string } },
) {
  const body = await req.json()
  const allowed = ['banner_image_url']
  const update: Record<string, unknown> = {}
  for (const key of allowed) {
    if (key in body) update[key] = body[key]
  }
  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: 'No valid fields' }, { status: 400 })
  }
  const { data, error } = await supabase
    .from('sellers')
    .update(update)
    .eq('slug', params.slug)
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ seller: data })
}

export async function GET(
  _req: Request,
  { params }: { params: { slug: string } },
) {
  const { data: seller, error: sellerError } = await supabase
    .from('sellers')
    .select()
    .eq('slug', params.slug)
    .single()

  if (sellerError || !seller) {
    return NextResponse.json({ error: 'Toko tidak ditemukan' }, { status: 404 })
  }

  const { data: products, error: productsError } = await supabase
    .from('products')
    .select()
    .eq('seller_id', seller.id)
    .order('created_at', { ascending: true })

  if (productsError) {
    return NextResponse.json({ error: productsError.message }, { status: 500 })
  }

  return NextResponse.json({ seller, products: products ?? [] })
}
