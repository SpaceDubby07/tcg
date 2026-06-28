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

const BASE_URL = 'https://tcg.zaclark.com';

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'Pokémon TCG Browser',
    template: '%s | Pokémon TCG Browser',
  },
  description:
    'Browse every Pokémon Trading Card Game set and card. Search, filter, and explore the complete Pokémon TCG collection.',
  keywords: [
    'Pokemon TCG',
    'Pokemon cards',
    'Pokemon card browser',
    'Trading card game',
    'Pokemon set list',
  ],
  authors: [{ name: 'Zachary Clark', url: BASE_URL }],
  creator: 'Zachary Clark',
  openGraph: {
    type: 'website',
    siteName: 'Pokémon TCG Browser',
    url: BASE_URL,
    title: 'Pokémon TCG Browser',
    description:
      'Browse every Pokémon Trading Card Game set and card. Search, filter, and explore the complete Pokémon TCG collection.',
    images: [
      {
        url: '/og-default.png',
        width: 1200,
        height: 630,
        alt: 'Pokémon TCG Browser',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pokémon TCG Browser',
    description:
      'Browse every Pokémon Trading Card Game set and card. Search, filter, and explore the complete Pokémon TCG collection.',
    images: ['/og-default.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  alternates: {
    canonical: BASE_URL,
  },
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
                <div className="w-8 h-8 bg-linear-to-br from-red-500 to-blue-500 rounded-full text-center items-center flex justify-center text-white font-bold">
                  P
                </div>
                <span className="text-xl font-bold text-white hidden md:inline-block">
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
                <Link href="/decks">
                  <button className="px-5 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white transition-colors font-medium">
                    Decks
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
