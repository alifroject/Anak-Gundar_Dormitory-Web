// app/layout.tsx
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Navbar from '@/components/layout/navbar-app';
import Document, { Html, Head, Main, NextScript } from 'next/document';
import { ReactNode } from 'react';
// app/layout.tsx or pages/_app.tsx
import './globals.css'; // Adjust the path as necessary


interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Roboto&family=Open+Sans&family=Lato&family=Montserrat&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="overflow-hidden h-screen">
        <Navbar />
        <div className="overflow-y-auto h-screen">
          <main className='pt-16 bg-white min-h-screen'>{children}</main>
        </div>

        <Footer />
      </body>
    </html>
  );
}
