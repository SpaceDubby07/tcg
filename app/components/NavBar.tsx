'use client';

import { useState, useRef, useEffect, forwardRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { animate } from 'animejs';

const PokeballSVG = forwardRef<SVGSVGElement, { className?: string }>(({ className }, ref) => (
  <svg ref={ref} viewBox="0 0 40 40" className={className} fill="none">
    <circle cx="20" cy="20" r="19" stroke="#374151" strokeWidth="2" />
    <path d="M1 20 Q1 1 20 1 Q39 1 39 20" fill="#ef4444" />
    <path d="M1 20 Q1 39 20 39 Q39 39 39 20" fill="#111827" />
    <rect x="1" y="18.5" width="38" height="3" fill="#374151" />
    <circle cx="20" cy="20" r="5" fill="#111827" stroke="#6b7280" strokeWidth="2" />
    <circle cx="20" cy="20" r="2.5" fill="#e5e7eb" />
  </svg>
));
PokeballSVG.displayName = 'PokeballSVG';

const NAV_LINKS = [
  { href: '/', label: 'Sets' },
  { href: '/card', label: 'Cards' },
  { href: '/pricing', label: 'Pricing' },
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
      animate(drawerRef.current, { height: [0, drawerRef.current.scrollHeight], opacity: [0, 1], duration: 250, ease: 'outQuad' });
    } else {
      animate(drawerRef.current, {
        height: [drawerRef.current.scrollHeight, 0], opacity: [1, 0], duration: 200, ease: 'inQuad',
        onComplete: () => { if (drawerRef.current) drawerRef.current.style.display = 'none'; },
      });
    }
  }, [mobileOpen]);

  const spinBall = () => {
    if (!ballRef.current) return;
    animate(ballRef.current, { rotate: [0, 360], duration: 600, ease: 'outBack' });
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-white/8 bg-[#0a0a14]/90 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 cursor-pointer" onClick={spinBall}>
          <PokeballSVG ref={ballRef} className="w-8 h-8 flex-shrink-0" />
          <span className="text-white font-bold text-base hidden sm:inline-block tracking-wide">
            TCG<span className="text-blue-400"> Browser</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 cursor-pointer ${
                pathname === link.href
                  ? 'bg-blue-600/20 text-blue-300 ring-1 ring-blue-500/40'
                  : 'text-slate-400 hover:text-white hover:bg-white/8'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <button
          onClick={() => setMobileOpen((v) => !v)}
          className="md:hidden w-10 h-10 flex items-center justify-center rounded-xl text-slate-400 hover:text-white hover:bg-white/8 transition-colors cursor-pointer"
          aria-label="Toggle menu"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {mobileOpen
              ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
          </svg>
        </button>
      </div>

      <div ref={drawerRef} className="md:hidden overflow-hidden" style={{ display: 'none', height: 0, opacity: 0 }}>
        <div className="px-4 pb-4 pt-2 space-y-1 border-t border-white/8">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer ${
                pathname === link.href
                  ? 'bg-blue-600/20 text-blue-300'
                  : 'text-slate-400 hover:text-white hover:bg-white/8'
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
