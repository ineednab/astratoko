'use client'

import { useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'

export default function DashboardSlugPage() {
  const router = useRouter()
  const params = useParams()
  const slug   = params.slug as string

  useEffect(() => {
    if (slug && typeof localStorage !== 'undefined') {
      localStorage.setItem('seller_slug', slug)
    }
    router.replace('/dashboard')
  }, [slug, router])

  return (
    <div className="min-h-screen bg-[#F4F6F8] flex items-center justify-center">
      <p className="text-sm text-gray-400">Memuat dashboard...</p>
    </div>
  )
}
