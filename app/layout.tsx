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
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-linear-to-r from-violet-400 via-sky-100 to-indigo-400`}
      >
        <nav className="flex flex-row items-center space-x-6 p-4">
          <Link href="/" className="cursor-pointer">
            <button className="p-2 rounded-md bg-gray-700 hover:bg-gray-900 text-white cursor-pointer">
              Sets
            </button>
          </Link>
          <Link href="/card" className="cursor-pointer">
            <button className="p-2 rounded-md bg-gray-700 hover:bg-gray-900 text-white cursor-pointer">
              Cards
            </button>
          </Link>
        </nav>
        {children}
      </body>
    </html>
  );
}
