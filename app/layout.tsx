import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import NavBar from './components/NavBar';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });

const BASE_URL = 'https://tcg.zaclark.com';

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: { default: 'Pokémon TCG Browser', template: '%s | Pokémon TCG Browser' },
  description:
    'Browse every Pokémon Trading Card Game set and card. Search, filter, and explore the complete Pokémon TCG collection.',
  keywords: ['Pokemon TCG', 'Pokemon cards', 'Pokemon card browser', 'Trading card game', 'Pokemon set list'],
  authors: [{ name: 'Zachary Clark', url: BASE_URL }],
  creator: 'Zachary Clark',
  openGraph: {
    type: 'website',
    siteName: 'Pokémon TCG Browser',
    url: BASE_URL,
    title: 'Pokémon TCG Browser',
    description:
      'Browse every Pokémon Trading Card Game set and card. Search, filter, and explore the complete Pokémon TCG collection.',
    images: [{ url: '/og-default.png', width: 1200, height: 630, alt: 'Pokémon TCG Browser' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pokémon TCG Browser',
    description:
      'Browse every Pokémon Trading Card Game set and card. Search, filter, and explore the complete Pokémon TCG collection.',
    images: ['/og-default.png'],
  },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
  alternates: { canonical: BASE_URL },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#0a0a0f]`}>
        <NavBar />
        {children}
      </body>
    </html>
  );
}
