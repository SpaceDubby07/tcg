'use client';

import { useState, useRef, useEffect, forwardRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { animate } from 'animejs';

const PokeballSVG = forwardRef<SVGSVGElement, { className?: string }>(({ className }, ref) => (
  <svg ref={ref} viewBox="0 0 40 40" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="20" cy="20" r="19" stroke="#555" strokeWidth="2" />
    <path d="M1 20 Q1 1 20 1 Q39 1 39 20" fill="#ef4444" />
    <path d="M1 20 Q1 39 20 39 Q39 39 39 20" fill="white" />
    <rect x="1" y="18.5" width="38" height="3" fill="#333" />
    <circle cx="20" cy="20" r="5" fill="white" stroke="#333" strokeWidth="2" />
    <circle cx="20" cy="20" r="2.5" fill="#1a1a2e" />
  </svg>
));
PokeballSVG.displayName = 'PokeballSVG';

const NAV_LINKS = [
  { href: '/', label: 'Sets' },
  { href: '/card', label: 'Cards' },
  { href: '/decks', label: 'Decks' },
];

export default function NavBar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const drawerRef = useRef<HTMLDivElement>(null);
  const ballRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!drawerRef.current) return;
    if (mobileOpen) {
      drawerRef.current.style.display = 'block';
      animate(drawerRef.current, {
        height: [0, drawerRef.current.scrollHeight],
        opacity: [0, 1],
        duration: 250,
        ease: 'easeOutQuad',
      });
    } else {
      animate(drawerRef.current, {
        height: [drawerRef.current.scrollHeight, 0],
        opacity: [1, 0],
        duration: 200,
        ease: 'easeInQuad',
        onComplete: () => {
          if (drawerRef.current) drawerRef.current.style.display = 'none';
        },
      });
    }
  }, [mobileOpen]);

  const spinBall = () => {
    if (!ballRef.current) return;
    animate(ballRef.current, { rotate: [0, 360], duration: 600, ease: 'easeOutBack' });
  };

  return (
    <nav className="sticky top-0 z-50 bg-black/40 backdrop-blur-xl border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5" onClick={spinBall}>
          <PokeballSVG ref={ballRef} className="w-8 h-8" />
          <span className="text-white font-bold text-lg hidden sm:inline-block tracking-tight">
            TCG Browser
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-2">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                pathname === link.href
                  ? 'bg-white/15 text-white ring-1 ring-white/20'
                  : 'text-neutral-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Hamburger */}
        <button
          onClick={() => setMobileOpen((v) => !v)}
          className="md:hidden p-2 text-neutral-400 hover:text-white transition-colors"
          aria-label="Toggle menu"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {mobileOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile drawer */}
      <div ref={drawerRef} className="md:hidden overflow-hidden" style={{ display: 'none', height: 0, opacity: 0 }}>
        <div className="px-4 pb-4 pt-3 space-y-1 border-t border-white/10">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className={`block px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                pathname === link.href
                  ? 'bg-white/15 text-white'
                  : 'text-neutral-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
