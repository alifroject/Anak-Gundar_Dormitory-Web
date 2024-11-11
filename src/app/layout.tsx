"use client";
import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { ReactNode } from 'react';
import './globals.css';
import Navbar from '@/app/navbar-app';
import Login from '@/app/Login';

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  const pathname = usePathname();
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  const handleLoginClick = () => {
    setIsLoginOpen(true);
  };

  const handleCloseLogin = () => {
    setIsLoginOpen(false);
  };
  const handleLoginSuccess = () => {
    // Optional logic after successful login, e.g., refresh user data, etc.
    console.log("Login successful");
};


  const isRegisterPage = pathname === '/register';

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
        {!isRegisterPage && <Header />}
        <Navbar onLoginClick={handleLoginClick} />
        {isLoginOpen && (
          <Login
            onClose={handleCloseLogin}
            onLoginSuccess={handleLoginSuccess} // Define this function if it isn't already
            originPath="/" // Or use any path you want as default
          />
        )}



        <div className={`h-screen overflow-y-auto transition-all duration-300 ease-in-out`}>
          <main className={`pt-${!isRegisterPage ? '16' : '0'} bg-white w-full`}>
            {children}
          </main>
        </div>

        <Footer />
      </body>
    </html>
  );
}
