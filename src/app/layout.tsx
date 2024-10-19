"use client"

import { usePathname } from 'next/navigation'; // Import usePathname
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { ReactNode } from 'react';
import './globals.css'; // Sesuaikan path jika perlu

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  const pathname = usePathname(); // Menggunakan usePathname untuk mendapatkan rute saat ini

  // Menentukan apakah kita berada di halaman registrasi
  const isRegisterPage = pathname === '/register'; // Ubah '/register' sesuai rute Anda

  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Roboto&family=Open+Sans&family=Lato&family=Montserrat&display=swap"
          rel="stylesheet"
        />
        <meta httpEquiv="Cross-Origin-Opener-Policy" content="same-origin-allow-popups" />
      </head>
      <body className="overflow-hidden min-h-screen">
        {/* Hanya tampilkan navbar jika bukan di halaman registrasi */}
        {!isRegisterPage && <Header />}

        <div className="h-screen overflow-y-auto">
          <main className={`pt-${!isRegisterPage ? '16' : '0'} bg-white w-full`}>{children}</main>
        </div>

        {/* Footer tetap muncul di semua halaman */}
        <Footer />
      </body>
    </html>
  );
}
