"use client";
import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { ReactNode } from 'react';
import './globals.css';
import Navbar from '@/app/navbar-app';
import Login from '@/app/Login';
import Spinner from '@/components/spinner/Spinner'; // Import the Spinner component


interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  const pathname = usePathname();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Track loading state

  const handleLoginClick = () => {
    setIsLoginOpen(true);
  };

  const handleCloseLogin = () => {
    setIsLoginOpen(false);
  };

  const handleLoginSuccess = () => {
    setIsLoading(false); // Stop loading when login is successful
    console.log("Login successful");
  };

  const handleLoginSubmit = () => {
    setIsLoading(true); // Set loading to true when login is being processed
  };

  const isRegisterPage = pathname === '/register';

  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Roboto&family=Open+Sans&family=Lato&family=Montserrat&display=swap"
          rel="stylesheet"
        />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&display=swap" rel="stylesheet" />

        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css"
        />
        <link href="https://fonts.googleapis.com/css2?family=Lato:wght@400;700&display=swap" rel="stylesheet" />

        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600&display=swap" rel="stylesheet"/>




          <meta httpEquiv="Cross-Origin-Opener-Policy" content="same-origin-allow-popups" />
      </head>
      <body className="overflow-hidden min-h-screen">
        {!isRegisterPage && <Header />}
        <Navbar onLoginClick={handleLoginClick} />

        {isLoginOpen && (
          <Login
            onClose={handleCloseLogin}
            onLoginSuccess={handleLoginSuccess}
            onLoginSubmit={handleLoginSubmit}
            originPath="/"
          />
        )}


        {isLoading && <Spinner />}

        <div className={`h-screen overflow-y-auto transition-all duration-300 ease-in-out mt-10`}>
          <main className={`pt-${!isRegisterPage ? '16' : '0'} bg-white w-full mt-10`}>
            {children}
          </main>
        </div>

        <Footer />
      </body>
    </html>
  );
}
