import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import Link from 'next/link';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Zachs TCG Generator',
  description: 'Created by Zachary Clark',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-neutral-900`}
      >
        <nav className="sticky top-0 z-50 bg-black/50 backdrop-blur-md border-b border-neutral-800">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              {/* Logo/Brand */}
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-blue-500 rounded-lg"></div>
                <span className="text-xl font-bold text-white">
                  Pokémon TCG
                </span>
              </div>

              {/* Navigation Links */}
              <div className="flex items-center gap-3">
                <Link href="/">
                  <button className="px-5 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white transition-colors font-medium">
                    Sets
                  </button>
                </Link>
                <Link href="/card">
                  <button className="px-5 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white transition-colors font-medium">
                    Cards
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}
