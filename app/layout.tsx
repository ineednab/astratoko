import type { Metadata } from "next"
import localFont from "next/font/local"
import "./globals.css"

const font = localFont({
  src: [
    { path: "./fonts/PlusJakartaSans.ttf",        weight: "100 900", style: "normal" },
    { path: "./fonts/PlusJakartaSans-Italic.ttf", weight: "100 900", style: "italic" },
  ],
  variable: "--font-sans",
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
