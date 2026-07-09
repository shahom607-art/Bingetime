
'use client';

if (typeof window === 'undefined') {
  Object.defineProperty(globalThis, 'localStorage', {
    get() {
      return undefined;
    },
    configurable: true,
  });
}

import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
// import { GeistMono } from 'geist/font/mono'; // Already removed
import './globals.css';
import { AuthProvider } from '@/providers/auth-provider';
import { WatchlistProvider } from '@/providers/watchlist-provider';
import { Toaster } from '@/components/ui/toaster';
import Header from '@/components/layout/header';
import { useEffect, useState } from 'react';

const geistSans = GeistSans;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [currentYear, setCurrentYear] = useState<number | null>(null);

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>BingeTime - Track Your Watch Hours</title>
        <meta name="description" content="Calculate and display your total watch time for movies and TV shows." />
      </head>
      <body className={`${geistSans.variable} font-sans antialiased`}>
        <AuthProvider>
          <WatchlistProvider>
            <div className="flex min-h-screen flex-col">
              <Header />
              <main className="flex-grow container mx-auto px-4 py-8">
                {children}
              </main>
              <footer className="py-6 text-center text-sm text-muted-foreground">
                {currentYear ? `BingeTime © ${currentYear}` : 'BingeTime'}
              </footer>
            </div>
            <Toaster />
          </WatchlistProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
