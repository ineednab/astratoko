import type { Metadata } from "next"
import { Space_Grotesk, Hanken_Grotesk, JetBrains_Mono } from "next/font/google"
import "./globals.css"

const fontDisplay = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "500", "600", "700"],
  display: "swap",
})

const fontBody = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
})

const fontMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500"],
  display: "swap",
})

export const metadata: Metadata = {
  title: "AstraToko — Toko Digital untuk Seller Indonesia",
  description: "Bangun toko digital kamu sendiri dalam 10 menit. Terima pembayaran via AstraPay. Data customer milikmu sepenuhnya.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="id">
      <body className={`${fontDisplay.variable} ${fontBody.variable} ${fontMono.variable} antialiased bg-brand-surface`}>
        {children}
      </body>
    </html>
  )
}
