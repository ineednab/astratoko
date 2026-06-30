import type { Metadata } from "next"
import { Plus_Jakarta_Sans } from "next/font/google"
import "./globals.css"

const font = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
})

export const metadata: Metadata = {
  title: "AstraToko - Toko Digital untuk Seller Indonesia",
  description: "Bangun toko digital kamu sendiri dalam 10 menit. Terima pembayaran via AstraPay. Data customer milikmu sepenuhnya.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="id">
      <body className={`${font.variable} antialiased bg-white`}>{children}</body>
    </html>
  )
}
