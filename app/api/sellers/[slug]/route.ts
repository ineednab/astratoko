import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

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
