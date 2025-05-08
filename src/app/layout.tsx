import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import './globals.css';
import { AuthProvider } from '@/providers/auth-provider';
import { WatchlistProvider } from '@/providers/watchlist-provider';
import { Toaster } from '@/components/ui/toaster';
import Header from '@/components/layout/header';

const geistSans = GeistSans;
const geistMono = GeistMono;

export const metadata: Metadata = {
  title: 'BingeTime - Track Your Watch Hours',
  description: 'Calculate and display your total watch time for movies and TV shows.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}>
        <AuthProvider>
          <WatchlistProvider>
            <div className="flex min-h-screen flex-col">
              <Header />
              <main className="flex-grow container mx-auto px-4 py-8">
                {children}
              </main>
              <footer className="py-6 text-center text-sm text-muted-foreground">
                BingeTime &copy; {new Date().getFullYear()}
              </footer>
            </div>
            <Toaster />
          </WatchlistProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
