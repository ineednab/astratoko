import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AstraToko — Toko Digital untuk Seller Indonesia",
  description: "Bangun toko digital kamu sendiri dalam 10 menit. Terima pembayaran via AstraPay. Data customer milikmu sepenuhnya.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="antialiased bg-white">
        {children}
      </body>
    </html>
  );
}
