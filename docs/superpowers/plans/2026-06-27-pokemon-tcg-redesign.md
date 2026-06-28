# Pokémon TCG Browser — Full Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the Pokémon TCG browser with a dark holographic theme, anime.js v4 animations, era-grouped set browser, infinite scroll on set detail, and a full cinematic pack opening — zero routing or data layer changes.

**Architecture:** Server components call `lib/cards.ts` and pass plain `Card[]` arrays as props to client components. `lib/anime.ts` centralizes anime.js v4 helpers. Old component files are replaced wholesale (not patched) to avoid mixed light/dark state.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS v4, anime.js v4.5.0.

## Global Constraints

- No `npm run build` — verify only in dev server at `http://localhost:3000`
- anime.js v4 uses **named exports**: `import { animate, createTimeline, utils } from 'animejs'`
- `stagger` lives on `utils`: `utils.stagger(40)` — there is no `anime.stagger()`
- Framer Motion stays in package.json — remove all imports but do **not** uninstall the package
- All files that call anime.js must have `'use client'` at the top
- `lib/cards.ts` uses Node `fs` — `getCardsForSet`, `getAllCards`, `getCardById` must only be called in server components
- Base background: `#0a0a0f`; no white surfaces on dark backgrounds
- No changes to `types/types.ts`, `lib/cards.ts`, or any `data/` JSON files
- No new routes added

---

## File Map

| File | Action |
|---|---|
| `app/globals.css` | Add CSS vars, keyframes, base styles |
| `lib/anime.ts` | **Create** — anime.js v4 helper wrappers |
| `app/components/NavBar.tsx` | **Create** — client nav with Pokéball + mobile drawer |
| `app/layout.tsx` | Modify — swap inline nav for `<NavBar />` |
| `app/components/SetCard.tsx` | **Create** — dark glass set card (replaces SetCards.tsx) |
| `app/components/SetGrid.tsx` | **Create** — era-grouped client grid (replaces SetFilter.tsx) |
| `app/components/SetList.tsx` | Modify — swap `SetFilter` import for `SetGrid` |
| `app/components/CardList.tsx` | Rewrite — client component, infinite scroll + anime.js |
| `app/sets/[setId]/page.tsx` | Modify — pass `cards` prop to new `CardList` |
| `app/components/CardFilter.tsx` | Rewrite — dark glass inputs, type filter, anime.js stagger |
| `app/components/CardImagePanel.tsx` | **Create** — client wrapper for card image entrance animation |
| `app/card/[id]/page.tsx` | Modify — use `CardImagePanel`, type-color HP + energy circles |
| `app/components/PackModal.tsx` | Rewrite — remove Framer Motion, full anime.js cinematic |

---

### Task 1: Design Tokens + anime.js Helpers

**Files:**
- Modify: `app/globals.css`
- Create: `lib/anime.ts`

**Interfaces:**
- Produces: CSS custom properties (`--color-fire`, etc.), keyframes (`shimmer`, `pokeball-spin`, `float`), and exported functions `fadeIn`, `staggerIn`, `hoverLift`, `hoverReset`, `particleBurst` used by Tasks 2–9.

- [ ] **Step 1: Replace globals.css**

Full file content:

```css
@import 'tailwindcss';

:root {
  --color-fire: #ff6b35;
  --color-water: #4fc3f7;
  --color-grass: #66bb6a;
  --color-lightning: #ffd600;
  --color-psychic: #ce93d8;
  --color-fighting: #ef9a9a;
  --color-darkness: #9575cd;
  --color-metal: #b0bec5;
  --color-colorless: #cfd8dc;
  --color-dragon: #7e57c2;
  --color-fairy: #f48fb1;
}

@keyframes shimmer {
  0%   { background-position: -200% center; }
  100% { background-position:  200% center; }
}

@keyframes pokeball-spin {
  to { transform: rotate(360deg); }
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50%       { transform: translateY(-8px); }
}

@keyframes glow-pulse {
  0%, 100% { opacity: 0.6; }
  50%       { opacity: 1; }
}

body {
  background-color: #0a0a0f;
}

::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: #0a0a0f; }
::-webkit-scrollbar-thumb { background: #333; border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: #555; }
```

- [ ] **Step 2: Create lib/anime.ts**

```ts
import { animate, utils } from 'animejs';

export function fadeIn(targets: HTMLElement | HTMLElement[], delay = 0) {
  return animate(targets, {
    opacity: [0, 1],
    translateY: [20, 0],
    duration: 500,
    delay,
    ease: 'easeOutExpo',
  });
}

export function staggerIn(targets: HTMLElement[], staggerMs = 40) {
  return animate(targets, {
    opacity: [0, 1],
    translateY: [20, 0],
    duration: 400,
    delay: utils.stagger(staggerMs),
    ease: 'easeOutExpo',
  });
}

export function hoverLift(target: HTMLElement) {
  return animate(target, { translateY: -4, duration: 200, ease: 'easeOutQuad' });
}

export function hoverReset(target: HTMLElement) {
  return animate(target, { translateY: 0, duration: 200, ease: 'easeOutQuad' });
}

export function particleBurst(container: HTMLElement, color = '#ffd700', count = 20) {
  const particles: HTMLDivElement[] = [];
  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.style.cssText = `
      position:absolute;width:6px;height:6px;border-radius:50%;
      background:${color};pointer-events:none;
      top:50%;left:50%;transform:translate(-50%,-50%);
    `;
    container.appendChild(p);
    particles.push(p);
  }
  animate(particles, {
    translateX: () => (Math.cos((Math.random() * 2 * Math.PI)) * (60 + Math.random() * 60)),
    translateY: () => (Math.sin((Math.random() * 2 * Math.PI)) * (60 + Math.random() * 60)),
    opacity: [1, 0],
    duration: 700,
    ease: 'easeOutExpo',
    onComplete: () => particles.forEach((p) => p.remove()),
  });
}
```

- [ ] **Step 3: Verify in dev server**

Run: `npm run dev`
Open http://localhost:3000 — background should now be `#0a0a0f` (very dark navy). No visual regressions yet beyond the background color change.

- [ ] **Step 4: Commit**

```bash
git add app/globals.css lib/anime.ts
git commit -m "feat: add design tokens, keyframes, and anime.js v4 helpers"
```

---

### Task 2: Navigation — Pokéball Logo + Mobile Drawer

**Files:**
- Create: `app/components/NavBar.tsx`
- Modify: `app/layout.tsx`

**Interfaces:**
- Consumes: nothing (standalone client component)
- Produces: `<NavBar />` — used by `app/layout.tsx`

- [ ] **Step 1: Create app/components/NavBar.tsx**

```tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { animate } from 'animejs';

function PokeballSVG({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="20" r="19" stroke="#555" strokeWidth="2" />
      <path d="M1 20 Q1 1 20 1 Q39 1 39 20" fill="#ef4444" />
      <path d="M1 20 Q1 39 20 39 Q39 39 39 20" fill="white" />
      <rect x="1" y="18.5" width="38" height="3" fill="#333" />
      <circle cx="20" cy="20" r="5" fill="white" stroke="#333" strokeWidth="2" />
      <circle cx="20" cy="20" r="2.5" fill="#1a1a2e" />
    </svg>
  );
}

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
```

Note: `PokeballSVG` needs `ref` forwarding. Wrap it:

```tsx
import { forwardRef } from 'react';

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
```

- [ ] **Step 2: Update app/layout.tsx**

Replace the entire `<nav>` block and its imports with `<NavBar />`:

```tsx
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
  description: 'Browse every Pokémon Trading Card Game set and card. Search, filter, and explore the complete Pokémon TCG collection.',
  keywords: ['Pokemon TCG', 'Pokemon cards', 'Pokemon card browser', 'Trading card game', 'Pokemon set list'],
  authors: [{ name: 'Zachary Clark', url: BASE_URL }],
  creator: 'Zachary Clark',
  openGraph: {
    type: 'website',
    siteName: 'Pokémon TCG Browser',
    url: BASE_URL,
    title: 'Pokémon TCG Browser',
    description: 'Browse every Pokémon Trading Card Game set and card. Search, filter, and explore the complete Pokémon TCG collection.',
    images: [{ url: '/og-default.png', width: 1200, height: 630, alt: 'Pokémon TCG Browser' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pokémon TCG Browser',
    description: 'Browse every Pokémon Trading Card Game set and card. Search, filter, and explore the complete Pokémon TCG collection.',
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
```

- [ ] **Step 3: Verify nav in dev server**

Open http://localhost:3000. Confirm:
- Frosted glass nav bar at top (dark, blurred)
- Pokéball SVG logo on left, "TCG Browser" text right of it
- Sets / Cards / Decks links on desktop
- Resize to mobile width → hamburger appears; click it → drawer animates open/closed

- [ ] **Step 4: Commit**

```bash
git add app/components/NavBar.tsx app/layout.tsx
git commit -m "feat: new frosted glass nav with Pokéball logo and mobile drawer"
```

---

### Task 3: SetCard — Dark Glass Component

**Files:**
- Create: `app/components/SetCard.tsx`

**Interfaces:**
- Consumes: `Set` from `@/types/types`, `PackOpeningModal` from `./PackModal`, `hoverLift`/`hoverReset` from `@/lib/anime`
- Produces: `SetCard({ set: Set, hasDeck?: boolean })` — used by `SetGrid` (Task 4)

Note: `PackModal.tsx` still has Framer Motion at this stage — that's fine, it will be rewritten in Task 9. `SetCard` just renders it.

- [ ] **Step 1: Create app/components/SetCard.tsx**

```tsx
'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { Set } from '@/types/types';
import PackOpeningModal from './PackModal';
import { hoverLift, hoverReset } from '@/lib/anime';

export default function SetCard({ set, hasDeck = false }: { set: Set; hasDeck?: boolean }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  return (
    <>
      <div
        ref={cardRef}
        onMouseEnter={() => cardRef.current && hoverLift(cardRef.current)}
        onMouseLeave={() => cardRef.current && hoverReset(cardRef.current)}
        className="group relative bg-white/5 backdrop-blur border border-white/10 rounded-2xl overflow-hidden hover:border-white/20 transition-colors duration-300"
      >
        {/* Shimmer sweep on hover */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{
            background:
              'linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.07) 50%, transparent 70%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.8s ease-in-out infinite',
          }}
        />

        <div className="relative p-4">
          {/* Logo + legality */}
          <div className="flex items-start justify-between mb-4">
            <div className="w-20 h-20 bg-white/10 rounded-xl p-2 flex items-center justify-center">
              <Image
                src={set.images.logo}
                alt={`${set.name} logo`}
                width={80}
                height={80}
                className="w-full h-full object-contain"
              />
            </div>
            <span
              className={`px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 ${
                set.legalities.unlimited === 'Legal'
                  ? 'bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/30'
                  : 'bg-red-500/20 text-red-400 ring-1 ring-red-500/30'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  set.legalities.unlimited === 'Legal' ? 'bg-emerald-400' : 'bg-red-400'
                }`}
              />
              {set.legalities.unlimited === 'Legal' ? 'Legal' : 'Banned'}
            </span>
          </div>

          {/* Set info */}
          <h3 className="text-white font-bold text-base mb-1 leading-tight">{set.name}</h3>
          <p className="text-neutral-500 text-xs mb-3">{set.series}</p>

          <div className="flex gap-4 text-xs text-neutral-500 mb-4">
            <span>
              <span className="text-neutral-300 font-semibold">{set.total}</span> cards
            </span>
            <span>{new Date(set.releaseDate).getFullYear()}</span>
          </div>

          {/* Actions */}
          <div className={`grid gap-2 ${hasDeck ? 'grid-cols-3' : 'grid-cols-2'}`}>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-3 py-2 bg-blue-600/80 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition-colors"
            >
              Open Pack 🎴
            </button>
            <Link
              href={`/sets/${set.id}`}
              className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-semibold transition-colors text-center"
            >
              View Cards
            </Link>
            {hasDeck && (
              <Link
                href={`/decks/${set.id}`}
                className="px-3 py-2 bg-emerald-600/80 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition-colors text-center"
              >
                View Decks
              </Link>
            )}
          </div>
        </div>
      </div>

      <PackOpeningModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        setId={set.id}
        setName={set.name}
        setLogo={set.images.logo}
      />
    </>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/components/SetCard.tsx
git commit -m "feat: dark glass SetCard component with shimmer hover"
```

---

### Task 4: SetGrid — Era-Grouped Set Browser

**Files:**
- Create: `app/components/SetGrid.tsx`

**Interfaces:**
- Consumes: `SetCard` from `./SetCard`, `staggerIn` from `@/lib/anime`, `Set` from `@/types/types`
- Produces: `SetGrid({ sets: Set[], deckSetIds: string[] })` — used by `SetList` (Task 5)

- [ ] **Step 1: Create app/components/SetGrid.tsx**

```tsx
'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import type { Set } from '@/types/types';
import SetCard from './SetCard';
import { staggerIn } from '@/lib/anime';

const ERA_MAP: Record<string, string> = {
  'Scarlet & Violet': 'Scarlet & Violet',
  'Sword & Shield': 'Sword & Shield',
  'Sun & Moon': 'Sun & Moon',
  'XY': 'XY',
  'Black & White': 'Black & White',
  'HeartGold SoulSilver': 'HeartGold SoulSilver',
  'Platinum': 'Platinum',
  'Diamond & Pearl': 'Diamond & Pearl',
  'EX': 'EX',
  'Neo': 'Neo',
  'Base': 'Base',
};

const ERA_EMOJI: Record<string, string> = {
  'Scarlet & Violet': '🔴',
  'Sword & Shield': '⚔️',
  'Sun & Moon': '🌙',
  'XY': '🦋',
  'Black & White': '🖤',
  'HeartGold SoulSilver': '✨',
  'Platinum': '💎',
  'Diamond & Pearl': '💠',
  'EX': '⚡',
  'Neo': '🌿',
  'Base': '🏆',
};

const ERA_ORDER = [
  'Scarlet & Violet',
  'Sword & Shield',
  'Sun & Moon',
  'XY',
  'Black & White',
  'HeartGold SoulSilver',
  'Platinum',
  'Diamond & Pearl',
  'EX',
  'Neo',
  'Base',
  'Other',
];

function getEra(series: string): string {
  return ERA_MAP[series] ?? 'Other';
}

function getYearRange(sets: Set[]): string {
  const years = sets
    .map((s) => new Date(s.releaseDate).getFullYear())
    .filter((y) => !isNaN(y));
  if (!years.length) return '';
  const min = Math.min(...years);
  const max = Math.max(...years);
  return min === max ? String(min) : `${min}–${max}`;
}

interface SetGridProps {
  sets: Set[];
  deckSetIds: string[];
}

export default function SetGrid({ sets, deckSetIds }: SetGridProps) {
  const [query, setQuery] = useState('');
  const [selectedEra, setSelectedEra] = useState('');
  const gridRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const animatedEras = useRef<Set<string>>(new Set());

  const availableEras = useMemo(
    () => ERA_ORDER.filter((era) => sets.some((s) => getEra(s.series) === era)),
    [sets]
  );

  const isFiltering = query.trim() !== '' || selectedEra !== '';

  const filteredSets = useMemo(() => {
    return sets.filter((set) => {
      const matchesQuery = set.name.toLowerCase().includes(query.toLowerCase());
      const matchesEra = selectedEra ? getEra(set.series) === selectedEra : true;
      return matchesQuery && matchesEra;
    });
  }, [sets, query, selectedEra]);

  const groupedByEra = useMemo(() => {
    const map = new Map<string, Set[]>();
    for (const set of sets) {
      const era = getEra(set.series);
      if (!map.has(era)) map.set(era, []);
      map.get(era)!.push(set);
    }
    return map;
  }, [sets]);

  // Animate each era grid on first mount
  useEffect(() => {
    gridRefs.current.forEach((el, era) => {
      if (animatedEras.current.has(era)) return;
      animatedEras.current.add(era);
      const cards = Array.from(el.querySelectorAll('[data-set-card]')) as HTMLElement[];
      if (cards.length) staggerIn(cards, 30);
    });
  });

  return (
    <div>
      {/* Filter bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-10">
        <input
          type="text"
          placeholder="Search sets..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 bg-white/5 border border-white/10 rounded-full px-5 py-2.5 text-white placeholder-neutral-500 focus:outline-none focus:border-white/30 text-sm"
        />
        <select
          value={selectedEra}
          onChange={(e) => setSelectedEra(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-full px-5 py-2.5 text-white focus:outline-none focus:border-white/30 text-sm"
        >
          <option value="" className="bg-neutral-900">All Eras</option>
          {availableEras.map((era) => (
            <option key={era} value={era} className="bg-neutral-900">
              {ERA_EMOJI[era] ?? '🃏'} {era}
            </option>
          ))}
        </select>
      </div>

      {/* Flat filtered grid when searching */}
      {isFiltering && (
        <div>
          {filteredSets.length === 0 ? (
            <p className="text-center text-neutral-500 py-12">No sets found.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredSets.map((set) => (
                <div key={set.id}>
                  <SetCard set={set} hasDeck={deckSetIds.includes(set.id)} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Era-grouped layout */}
      {!isFiltering && (
        <div className="space-y-12">
          {ERA_ORDER.filter((era) => groupedByEra.has(era)).map((era) => {
            const eraSets = groupedByEra.get(era)!;
            return (
              <section key={era}>
                <div className="flex items-center justify-between mb-5 pb-3 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl" role="img" aria-label={era}>
                      {ERA_EMOJI[era] ?? '🃏'}
                    </span>
                    <h2 className="text-white font-bold text-xl">{era}</h2>
                    <span className="px-2 py-0.5 bg-white/10 text-neutral-400 rounded-full text-xs">
                      {getYearRange(eraSets)}
                    </span>
                  </div>
                  <span className="text-neutral-500 text-sm">{eraSets.length} sets</span>
                </div>

                <div
                  ref={(el) => {
                    if (el) gridRefs.current.set(era, el);
                  }}
                  className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
                >
                  {eraSets.map((set) => (
                    <div key={set.id} data-set-card style={{ opacity: 0 }}>
                      <SetCard set={set} hasDeck={deckSetIds.includes(set.id)} />
                    </div>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/components/SetGrid.tsx
git commit -m "feat: era-grouped SetGrid with search filter and stagger animations"
```

---

### Task 5: Wire SetGrid into SetList

**Files:**
- Modify: `app/components/SetList.tsx`

**Interfaces:**
- Consumes: `SetGrid` from `./SetGrid` (replaces `SetFilter`)
- `getDeckSetIds` from `@/lib/decks` — stays the same

- [ ] **Step 1: Update app/components/SetList.tsx**

```tsx
import setsData from '@/data/sets/en.json';
import { getDeckSetIds } from '@/lib/decks';
import SetGrid from './SetGrid';

export default function SetsList() {
  const deckSetIds = getDeckSetIds();

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold text-white mb-2">Pokémon Card Sets</h1>
          <p className="text-neutral-400">Explore every era of the Pokémon TCG</p>
        </div>
        <SetGrid sets={setsData} deckSetIds={deckSetIds} />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify homepage in dev server**

Open http://localhost:3000. Confirm:
- Era headers (🏆 Base, ⚡ EX, 🌙 Sun & Moon, etc.) with year ranges
- Set cards in dark glass style, no white surfaces
- Search input and era dropdown filter the grid
- Cards stagger-animate in on load

- [ ] **Step 3: Commit**

```bash
git add app/components/SetList.tsx
git commit -m "feat: wire SetGrid into home page, replace SetFilter"
```

---

### Task 6: CardList — Client Infinite Scroll for Set Detail

**Files:**
- Modify: `app/components/CardList.tsx` (full rewrite to client component)
- Modify: `app/sets/[setId]/page.tsx` (pass `cards` prop)

**Interfaces:**
- Consumes: `cards: Card[]` + `setName: string` props (data fetched by server page)
- Consumes: `staggerIn` from `@/lib/anime`
- Produces: `CardList({ cards: Card[], setName: string })` used by `/sets/[setId]/page.tsx`

- [ ] **Step 1: Rewrite app/components/CardList.tsx**

```tsx
'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { Card } from '@/types/types';
import { staggerIn } from '@/lib/anime';

const CARDS_PER_PAGE = 40;

interface CardListProps {
  cards: Card[];
  setName: string;
}

function PokeballSpinner() {
  return (
    <div style={{ animation: 'pokeball-spin 0.8s linear infinite' }} className="w-10 h-10 text-neutral-500">
      <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="20" cy="20" r="19" stroke="currentColor" strokeWidth="2" />
        <path d="M1 20 Q1 1 20 1 Q39 1 39 20" fill="currentColor" opacity="0.5" />
        <rect x="1" y="18.5" width="38" height="3" fill="currentColor" />
        <circle cx="20" cy="20" r="5" fill="none" stroke="currentColor" strokeWidth="2" />
        <circle cx="20" cy="20" r="2.5" fill="currentColor" />
      </svg>
    </div>
  );
}

export default function CardList({ cards, setName }: CardListProps) {
  const [displayCount, setDisplayCount] = useState(CARDS_PER_PAGE);
  const observerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const prevCountRef = useRef(0);

  const displayedCards = cards.slice(0, displayCount);
  const hasMore = displayCount < cards.length;

  const loadMore = useCallback(() => {
    if (hasMore) setDisplayCount((prev) => Math.min(prev + CARDS_PER_PAGE, cards.length));
  }, [hasMore, cards.length]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting && hasMore) loadMore(); },
      { threshold: 0.1, rootMargin: '100px' }
    );
    const target = observerRef.current;
    if (target) observer.observe(target);
    return () => { if (target) observer.unobserve(target); };
  }, [hasMore, loadMore]);

  useEffect(() => {
    if (!gridRef.current) return;
    const allCards = Array.from(gridRef.current.querySelectorAll('[data-card-item]')) as HTMLElement[];
    const newCards = allCards.slice(prevCountRef.current);
    if (newCards.length > 0) {
      newCards.forEach((c) => { (c as HTMLElement).style.opacity = '0'; });
      staggerIn(newCards, 25);
    }
    prevCountRef.current = allCards.length;
  }, [displayCount]);

  return (
    <div className="p-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-1">{setName}</h1>
        <p className="text-neutral-500 text-sm">{cards.length} cards</p>
      </div>

      <div
        ref={gridRef}
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3"
      >
        {displayedCards.map((card) => (
          <div
            key={card.id}
            data-card-item
            style={{ opacity: 0 }}
            className="group relative bg-white/5 border border-white/10 rounded-xl overflow-hidden hover:border-white/25 transition-colors"
          >
            <Link href={`/card/${card.id}`}>
              <Image
                src={card.images.large}
                alt={card.name}
                width={200}
                height={280}
                className="w-full h-auto object-contain transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-2">
                <div>
                  <p className="text-white text-xs font-semibold truncate">{card.name}</p>
                  {card.rarity && <p className="text-yellow-400 text-xs">{card.rarity}</p>}
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>

      {hasMore && (
        <div ref={observerRef} className="flex justify-center py-10">
          <PokeballSpinner />
        </div>
      )}

      {!hasMore && displayedCards.length > 0 && (
        <p className="text-center text-neutral-600 text-sm mt-8">
          All {cards.length} cards loaded
        </p>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Update app/sets/[setId]/page.tsx**

```tsx
import type { Metadata } from 'next';
import CardList from '@/app/components/CardList';
import { getCardsForSet } from '@/lib/cards';
import setsData from '@/data/sets/en.json';

export async function generateStaticParams() {
  return setsData.map((set) => ({ setId: set.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ setId: string }>;
}): Promise<Metadata> {
  const { setId } = await params;
  const set = setsData.find((s) => s.id === setId);
  if (!set) return {};

  const description = `Browse all ${set.total} cards from ${set.name} (${set.series} series), released ${set.releaseDate}.`;

  return {
    title: set.name,
    description,
    openGraph: {
      title: set.name,
      description,
      images: [{ url: set.images.logo, alt: set.name }],
    },
    twitter: {
      card: 'summary_large_image',
      title: set.name,
      description,
      images: [set.images.logo],
    },
    alternates: { canonical: `https://tcg.zaclark.com/sets/${setId}` },
  };
}

interface SetPageProps {
  params: Promise<{ setId: string }>;
}

export default async function SetPage({ params }: SetPageProps) {
  const { setId } = await params;
  const cards = getCardsForSet(setId);
  const set = setsData.find((s) => s.id === setId);

  return (
    <main className="min-h-screen py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <CardList cards={cards} setName={set?.name ?? setId} />
      </div>
    </main>
  );
}
```

- [ ] **Step 3: Verify set detail page**

Open http://localhost:3000/sets/base1 (or any valid set). Confirm:
- First 40 cards load with stagger animation
- Scroll to bottom → Pokéball spinner appears → more cards load and animate in
- "All X cards loaded" message at end

- [ ] **Step 4: Commit**

```bash
git add app/components/CardList.tsx app/sets/[setId]/page.tsx
git commit -m "feat: CardList client component with infinite scroll and anime.js stagger"
```

---

### Task 7: CardFilter — Dark Glass + Type Filter + anime.js

**Files:**
- Modify: `app/components/CardFilter.tsx` (full rewrite)

**Interfaces:**
- Consumes: `cards: Card[]` prop (unchanged), `staggerIn` from `@/lib/anime`
- Produces: same `CardFilter({ cards: Card[] })` signature — used by `app/card/page.tsx`

- [ ] **Step 1: Rewrite app/components/CardFilter.tsx**

```tsx
'use client';

import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { Card } from '@/types/types';
import { staggerIn } from '@/lib/anime';

const CARDS_PER_PAGE = 50;

const TYPE_COLORS: Record<string, string> = {
  Fire: '#ff6b35',
  Water: '#4fc3f7',
  Grass: '#66bb6a',
  Lightning: '#ffd600',
  Psychic: '#ce93d8',
  Fighting: '#ef9a9a',
  Darkness: '#9575cd',
  Metal: '#b0bec5',
  Colorless: '#cfd8dc',
  Dragon: '#7e57c2',
  Fairy: '#f48fb1',
};

interface CardFilterProps {
  cards: Card[];
}

function PokeballSpinner() {
  return (
    <div style={{ animation: 'pokeball-spin 0.8s linear infinite' }} className="w-10 h-10 text-neutral-500">
      <svg viewBox="0 0 40 40" fill="none">
        <circle cx="20" cy="20" r="19" stroke="currentColor" strokeWidth="2" />
        <path d="M1 20 Q1 1 20 1 Q39 1 39 20" fill="currentColor" opacity="0.5" />
        <rect x="1" y="18.5" width="38" height="3" fill="currentColor" />
        <circle cx="20" cy="20" r="5" fill="none" stroke="currentColor" strokeWidth="2" />
        <circle cx="20" cy="20" r="2.5" fill="currentColor" />
      </svg>
    </div>
  );
}

export default function CardFilter({ cards }: CardFilterProps) {
  const [query, setQuery] = useState('');
  const [rarity, setRarity] = useState('');
  const [type, setType] = useState('');
  const [displayCount, setDisplayCount] = useState(CARDS_PER_PAGE);
  const observerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const prevCountRef = useRef(0);

  const rarities = useMemo(
    () => Array.from(new Set(cards.map((c) => c.rarity).filter(Boolean))).sort() as string[],
    [cards]
  );

  const types = useMemo(
    () => Array.from(new Set(cards.flatMap((c) => c.types ?? []))).sort(),
    [cards]
  );

  const filtered = useMemo(() => {
    return cards.filter((card) => {
      const matchesQuery = card.name.toLowerCase().includes(query.toLowerCase());
      const matchesRarity = rarity ? card.rarity === rarity : true;
      const matchesType = type ? (card.types ?? []).includes(type) : true;
      return matchesQuery && matchesRarity && matchesType;
    });
  }, [cards, query, rarity, type]);

  useEffect(() => { setDisplayCount(CARDS_PER_PAGE); }, [query, rarity, type]);

  const displayedCards = useMemo(() => filtered.slice(0, displayCount), [filtered, displayCount]);
  const hasMore = displayCount < filtered.length;

  const loadMore = useCallback(() => {
    if (hasMore) setDisplayCount((prev) => Math.min(prev + CARDS_PER_PAGE, filtered.length));
  }, [hasMore, filtered.length]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting && hasMore) loadMore(); },
      { threshold: 0.1, rootMargin: '100px' }
    );
    const target = observerRef.current;
    if (target) observer.observe(target);
    return () => { if (target) observer.unobserve(target); };
  }, [hasMore, loadMore]);

  useEffect(() => {
    if (!gridRef.current) return;
    const allEls = Array.from(gridRef.current.querySelectorAll('[data-card]')) as HTMLElement[];
    const newEls = allEls.slice(prevCountRef.current);
    if (newEls.length) {
      newEls.forEach((c) => { c.style.opacity = '0'; });
      staggerIn(newEls, 20);
    }
    prevCountRef.current = allEls.length;
  }, [displayedCards.length]);

  return (
    <div>
      {/* Filter bar */}
      <div className="flex flex-wrap gap-3 mb-8">
        <input
          type="text"
          placeholder="Search cards..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 min-w-[160px] bg-white/5 border border-white/10 rounded-full px-5 py-2.5 text-white placeholder-neutral-500 focus:outline-none focus:border-white/30 text-sm"
        />
        <select
          value={rarity}
          onChange={(e) => setRarity(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-full px-4 py-2.5 text-white focus:outline-none focus:border-white/30 text-sm"
        >
          <option value="" className="bg-neutral-900">All Rarities</option>
          {rarities.map((r) => (
            <option key={r} value={r} className="bg-neutral-900">{r}</option>
          ))}
        </select>
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-full px-4 py-2.5 text-white focus:outline-none focus:border-white/30 text-sm"
        >
          <option value="" className="bg-neutral-900">All Types</option>
          {types.map((t) => (
            <option key={t} value={t} className="bg-neutral-900">{t}</option>
          ))}
        </select>
        <span className="text-neutral-500 text-sm self-center">
          {displayedCards.length} / {filtered.length}
        </span>
      </div>

      {/* Card grid */}
      <div ref={gridRef} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {displayedCards.map((card) => (
          <div
            key={card.id}
            data-card
            style={{ opacity: 0 }}
            className="group relative bg-white/5 border border-white/10 rounded-xl overflow-hidden hover:border-white/25 transition-colors"
          >
            <Link href={`/card/${card.id}`}>
              <Image
                src={card.images.large}
                alt={card.name}
                width={250}
                height={350}
                className="w-full h-auto object-contain transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                <div>
                  <p className="text-white text-sm font-semibold truncate">{card.name}</p>
                  {card.rarity && <p className="text-yellow-400 text-xs">{card.rarity}</p>}
                  {card.types?.[0] && (
                    <span
                      className="inline-block w-2 h-2 rounded-full mt-1"
                      style={{ background: TYPE_COLORS[card.types[0]] ?? '#fff' }}
                    />
                  )}
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>

      {hasMore && (
        <div ref={observerRef} className="flex justify-center py-10">
          <PokeballSpinner />
        </div>
      )}

      {filtered.length === 0 && (
        <p className="text-center text-neutral-500 mt-8">No cards found.</p>
      )}

      {!hasMore && displayedCards.length > 0 && (
        <p className="text-center text-neutral-600 text-sm mt-8">
          All {filtered.length} cards shown
        </p>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verify /card page**

Open http://localhost:3000/card. Confirm:
- All filter inputs have dark glass pill styling (no plain browser borders)
- Type dropdown appears and filters by type
- Cards animate in with stagger on each batch load
- Pokéball spinner shows while loading

- [ ] **Step 3: Commit**

```bash
git add app/components/CardFilter.tsx
git commit -m "feat: CardFilter dark glass restyle, type filter, pokeball spinner"
```

---

### Task 8: Card Detail — Type-Color Background + anime.js Entrance

**Files:**
- Create: `app/components/CardImagePanel.tsx`
- Modify: `app/card/[id]/page.tsx`

**Interfaces:**
- Produces: `CardImagePanel({ src: string, alt: string, type?: string })` — client component that runs entrance animation on mount
- `TYPE_COLORS` map lives in `CardImagePanel.tsx` (not exported — only used there and in page.tsx inline styles)

- [ ] **Step 1: Create app/components/CardImagePanel.tsx**

```tsx
'use client';

import { useRef, useEffect } from 'react';
import Image from 'next/image';
import { animate } from 'animejs';

const TYPE_COLORS: Record<string, string> = {
  Fire: '#ff6b35',
  Water: '#4fc3f7',
  Grass: '#66bb6a',
  Lightning: '#ffd600',
  Psychic: '#ce93d8',
  Fighting: '#ef9a9a',
  Darkness: '#9575cd',
  Metal: '#b0bec5',
  Colorless: '#cfd8dc',
  Dragon: '#7e57c2',
  Fairy: '#f48fb1',
};

interface CardImagePanelProps {
  src: string;
  alt: string;
  type?: string;
}

export default function CardImagePanel({ src, alt, type }: CardImagePanelProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const color = type ? (TYPE_COLORS[type] ?? '#ffffff') : '#ffffff';

  useEffect(() => {
    if (!wrapperRef.current) return;
    animate(wrapperRef.current, {
      translateY: [-30, 0],
      opacity: [0, 1],
      scale: [0.92, 1],
      duration: 600,
      ease: 'easeOutExpo',
    });
  }, []);

  return (
    <div className="relative">
      {/* Type-color radial glow */}
      <div
        className="absolute -inset-6 rounded-3xl pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at center, ${color}22 0%, transparent 70%)`,
        }}
      />
      <div ref={wrapperRef} style={{ opacity: 0 }}>
        <Image
          src={src}
          alt={alt}
          width={500}
          height={700}
          className="w-full rounded-2xl shadow-2xl relative z-10"
          priority
        />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Update app/card/[id]/page.tsx**

Replace the card image `<Image>` block and update HP + energy display. Full updated file:

```tsx
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getAllCards, getCardById } from '@/lib/cards';
import Image from 'next/image';
import Link from 'next/link';
import CardImagePanel from '@/app/components/CardImagePanel';

const TYPE_COLORS: Record<string, string> = {
  Fire: '#ff6b35',
  Water: '#4fc3f7',
  Grass: '#66bb6a',
  Lightning: '#ffd600',
  Psychic: '#ce93d8',
  Fighting: '#ef9a9a',
  Darkness: '#9575cd',
  Metal: '#b0bec5',
  Colorless: '#cfd8dc',
  Dragon: '#7e57c2',
  Fairy: '#f48fb1',
};

export async function generateStaticParams() {
  return getAllCards().map((card) => ({ id: card.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const card = getCardById(id);
  if (!card) return {};

  const descParts = [card.supertype];
  if (card.types?.length) descParts.push(card.types.join('/') + ' type');
  if (card.hp) descParts.push(`HP ${card.hp}`);
  if (card.rarity) descParts.push(card.rarity);
  const description = `${card.name} — ${descParts.join(', ')}. View attacks, abilities, and full card details.`;

  return {
    title: card.name,
    description,
    openGraph: {
      title: card.name,
      description,
      images: [{ url: card.images.large, width: 500, height: 700, alt: card.name }],
    },
    twitter: {
      card: 'summary_large_image',
      title: card.name,
      description,
      images: [card.images.large],
    },
    alternates: { canonical: `https://tcg.zaclark.com/card/${id}` },
  };
}

export default async function CardDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const card = getCardById(id);
  if (!card) notFound();

  const allCards = getAllCards();
  const currentIndex = allCards.findIndex((c) => c.id === id);
  const prevCard = currentIndex > 0 ? allCards[currentIndex - 1] : null;
  const nextCard = currentIndex < allCards.length - 1 ? allCards[currentIndex + 1] : null;

  const primaryType = card.types?.[0];
  const typeColor = primaryType ? (TYPE_COLORS[primaryType] ?? '#ef4444') : '#ef4444';

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Back nav */}
      <header className="sticky top-0 z-40 bg-black/50 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            href="/card"
            className="text-neutral-400 hover:text-white transition-colors flex items-center gap-2 text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Collection
          </Link>
          <div className="flex items-center gap-3">
            {prevCard && (
              <Link
                href={`/card/${prevCard.id}`}
                className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm transition-colors"
              >
                ← Prev
              </Link>
            )}
            {nextCard && (
              <Link
                href={`/card/${nextCard.id}`}
                className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm transition-colors"
              >
                Next →
              </Link>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-5 gap-12">
          {/* Left: Card Image with entrance animation */}
          <div className="lg:col-span-2">
            <div className="sticky top-28">
              <CardImagePanel
                src={card.images.large}
                alt={card.name}
                type={primaryType}
              />

              {/* Metadata grid */}
              <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
                <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                  <div className="text-neutral-500 mb-1 text-xs">Set Number</div>
                  <div className="text-white font-semibold">#{card.number}</div>
                </div>
                {card.nationalPokedexNumbers && (
                  <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                    <div className="text-neutral-500 mb-1 text-xs">Pokédex #</div>
                    <div className="text-white font-semibold">{card.nationalPokedexNumbers[0]}</div>
                  </div>
                )}
                {card.level && (
                  <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                    <div className="text-neutral-500 mb-1 text-xs">Level</div>
                    <div className="text-white font-semibold">{card.level}</div>
                  </div>
                )}
                {card.convertedRetreatCost !== undefined && (
                  <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                    <div className="text-neutral-500 mb-1 text-xs">Retreat Cost</div>
                    <div className="text-white font-semibold">{card.convertedRetreatCost}</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right: Card Details */}
          <div className="lg:col-span-3 space-y-8">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                {card.types?.map((t) => (
                  <span
                    key={t}
                    className="px-3 py-1 rounded-full text-xs font-semibold text-white"
                    style={{ background: `${TYPE_COLORS[t] ?? '#666'}33`, border: `1px solid ${TYPE_COLORS[t] ?? '#666'}66` }}
                  >
                    {t}
                  </span>
                ))}
                {card.subtypes?.map((sub) => (
                  <span key={sub} className="px-3 py-1 bg-white/10 text-neutral-300 rounded-full text-xs">
                    {sub}
                  </span>
                ))}
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">{card.name}</h1>
              <div className="flex flex-wrap items-center gap-4 text-neutral-400 text-sm">
                {card.hp && (
                  <span className="text-2xl font-bold" style={{ color: typeColor }}>
                    HP {card.hp}
                  </span>
                )}
                {card.rarity && <span>• {card.rarity}</span>}
                {card.artist && <span>• Art by {card.artist}</span>}
              </div>
            </div>

            {card.evolvesFrom && (
              <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                <div className="text-neutral-500 text-xs mb-1">Evolves From</div>
                <div className="text-white font-semibold text-lg">{card.evolvesFrom}</div>
              </div>
            )}

            {card.abilities && card.abilities.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-white">Abilities</h2>
                {card.abilities.map((ability, idx) => (
                  <div key={idx} className="bg-white/5 border border-white/10 rounded-xl p-5">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-bold text-white">{ability.name}</h3>
                      <span className="text-xs px-2 py-0.5 bg-purple-600/50 text-purple-200 rounded-full border border-purple-500/30">
                        {ability.type}
                      </span>
                    </div>
                    <p className="text-neutral-300 leading-relaxed text-sm">{ability.text}</p>
                  </div>
                ))}
              </div>
            )}

            {card.attacks && card.attacks.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-white">Attacks</h2>
                {card.attacks.map((attack, idx) => (
                  <div key={idx} className="bg-white/5 border border-white/10 rounded-xl p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-bold text-white mb-2">{attack.name}</h3>
                        {attack.cost && attack.cost.length > 0 && (
                          <div className="flex gap-1.5 flex-wrap">
                            {attack.cost.map((energy, i) => (
                              <span
                                key={i}
                                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
                                style={{ background: TYPE_COLORS[energy] ?? '#555' }}
                                title={energy}
                              >
                                {energy[0]}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      {attack.damage && (
                        <span className="text-3xl font-bold" style={{ color: typeColor }}>
                          {attack.damage}
                        </span>
                      )}
                    </div>
                    {attack.text && (
                      <p className="text-neutral-300 leading-relaxed text-sm">{attack.text}</p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {card.rules && (
              <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                <h3 className="text-base font-bold text-white mb-2">Rules</h3>
                <p className="text-neutral-300 leading-relaxed text-sm">{card.rules}</p>
              </div>
            )}

            {card.weaknesses && (
              <div className="bg-red-950/30 border border-red-900/40 rounded-xl p-5">
                <h3 className="text-base font-bold text-red-400 mb-2">Weakness</h3>
                {card.weaknesses.map((w, idx) => (
                  <div key={idx} className="text-neutral-300 text-sm">
                    {w.type} {w.value}
                  </div>
                ))}
              </div>
            )}

            {card.flavorText && (
              <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                <p className="text-neutral-400 italic leading-relaxed text-sm">{card.flavorText}</p>
              </div>
            )}

            {card.legalities && (
              <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                <h3 className="text-base font-bold text-white mb-3">Format Legality</h3>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(card.legalities).map(([format, status]) => (
                    <span
                      key={format}
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        status === 'Legal'
                          ? 'bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-500/30'
                          : 'bg-red-500/20 text-red-300 ring-1 ring-red-500/30'
                      }`}
                    >
                      {format}: {status}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom prev/next */}
        {(prevCard || nextCard) && (
          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-6">
            {prevCard ? (
              <Link
                href={`/card/${prevCard.id}`}
                className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-5 transition-colors group flex items-center gap-4"
              >
                <Image
                  src={prevCard.images.small}
                  alt={prevCard.name}
                  width={48}
                  height={67}
                  className="rounded-lg opacity-70 group-hover:opacity-100 transition-opacity"
                />
                <div>
                  <div className="text-xs text-neutral-500 mb-1">Previous Card</div>
                  <div className="text-white font-bold group-hover:text-blue-400 transition-colors">
                    ← {prevCard.name}
                  </div>
                </div>
              </Link>
            ) : (
              <div />
            )}
            {nextCard && (
              <Link
                href={`/card/${nextCard.id}`}
                className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-5 transition-colors group flex items-center justify-end gap-4 text-right"
              >
                <div>
                  <div className="text-xs text-neutral-500 mb-1">Next Card</div>
                  <div className="text-white font-bold group-hover:text-blue-400 transition-colors">
                    {nextCard.name} →
                  </div>
                </div>
                <Image
                  src={nextCard.images.small}
                  alt={nextCard.name}
                  width={48}
                  height={67}
                  className="rounded-lg opacity-70 group-hover:opacity-100 transition-opacity"
                />
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Verify card detail page**

Open any card detail e.g. http://localhost:3000/card/base1-4. Confirm:
- Card image animates in (slides down from top, fades + scales up)
- Type-colored radial glow behind the card image
- HP text color matches the card's type color
- Energy cost circles are colored (e.g. Fire = orange circles)
- Type badges have type-color tinted background
- Prev/Next nav shows card thumbnail images
- No white surfaces

- [ ] **Step 4: Commit**

```bash
git add app/components/CardImagePanel.tsx app/card/[id]/page.tsx
git commit -m "feat: card detail type-color glow, anime.js entrance, colored energy circles"
```

---

### Task 9: PackModal — Full Cinematic Rewrite (Remove Framer Motion)

**Files:**
- Modify: `app/components/PackModal.tsx` (full rewrite)

**Interfaces:**
- Consumes: `particleBurst` from `@/lib/anime`, `animate` from `animejs`
- Props interface unchanged: `{ isOpen, onClose, setId, setName, setLogo }`

- [ ] **Step 1: Rewrite app/components/PackModal.tsx**

Remove all `framer-motion` imports. Full file:

```tsx
'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { animate } from 'animejs';
import type { Card } from '@/types/types';
import { particleBurst } from '@/lib/anime';

const BACK_IMAGE =
  'https://img2.clipart-library.com/28/pokemon-card-clipart/pokemon-card-clipart-4.gif';

const RARITY_STYLE: Record<string, { shadow: string; border: string }> = {
  common:   { shadow: 'none',                             border: 'rgba(255,255,255,0.1)' },
  uncommon: { shadow: '0 0 12px rgba(192,192,192,0.4)',   border: 'rgba(192,192,192,0.5)' },
  rare:     { shadow: '0 0 20px rgba(255,215,0,0.5)',     border: 'rgba(255,215,0,0.6)' },
  ultra:    { shadow: '0 0 30px rgba(180,130,255,0.7)',   border: 'rgba(180,130,255,0.8)' },
};

function getRarityTier(rarity?: string): keyof typeof RARITY_STYLE {
  if (!rarity) return 'common';
  const r = rarity.toLowerCase();
  if (
    r.includes('ultra') || r.includes('secret') || r.includes('amazing') ||
    r.includes('vmax') || r.includes('ex') || r.includes('gx') ||
    r.includes('shining') || r.includes('star') || r.includes('prism')
  ) return 'ultra';
  if (r.includes('holo') || r === 'rare') return 'rare';
  if (r === 'uncommon') return 'uncommon';
  return 'common';
}

interface PackOpeningModalProps {
  isOpen: boolean;
  onClose: () => void;
  setId: string;
  setName: string;
  setLogo: string;
}

type Phase = 'selection' | 'opening' | 'reveal';

function PokeballSVG({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 80 80" className={className} style={style} fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="40" cy="40" r="38" stroke="currentColor" strokeWidth="4" />
      <path d="M2 40 Q2 2 40 2 Q78 2 78 40" fill="#ef4444" />
      <path d="M2 40 Q2 78 40 78 Q78 78 78 40" fill="white" />
      <rect x="2" y="37" width="76" height="6" fill="currentColor" />
      <circle cx="40" cy="40" r="10" fill="white" stroke="currentColor" strokeWidth="4" />
      <circle cx="40" cy="40" r="5" fill="#1a1a2e" />
    </svg>
  );
}

export default function PackOpeningModal({
  isOpen,
  onClose,
  setId,
  setName,
  setLogo,
}: PackOpeningModalProps) {
  const [packSize, setPackSize] = useState(5);
  const [phase, setPhase] = useState<Phase>('selection');
  const [pulledCards, setPulledCards] = useState<Card[]>([]);
  const [revealedCards, setRevealedCards] = useState<Set<number>>(new Set());

  const backdropRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const flashRef = useRef<HTMLDivElement>(null);
  const pokeballRef = useRef<SVGSVGElement>(null);
  const cardContainerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const cardBackRefs = useRef<(HTMLDivElement | null)[]>([]);
  const cardFrontRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Animate panel open each time isOpen goes true
  useEffect(() => {
    if (!isOpen || !backdropRef.current || !panelRef.current) return;
    animate(backdropRef.current, { opacity: [0, 1], duration: 300, ease: 'easeOutQuad' });
    animate(panelRef.current, { scale: [0.85, 1], opacity: [0, 1], duration: 400, ease: 'easeOutBack' });
  }, [isOpen]);

  // Fan cards in when phase switches to 'reveal'
  useEffect(() => {
    if (phase !== 'reveal') return;
    const cards = cardContainerRefs.current.filter(Boolean) as HTMLElement[];
    if (!cards.length) return;
    setTimeout(() => {
      animate(cards, {
        translateY: [60, 0],
        opacity: [0, 1],
        delay: (_, i) => i * 80,
        duration: 500,
        ease: 'easeOutBack',
      });
    }, 100);
  }, [phase]);

  const openPack = async () => {
    setPhase('opening');
    try {
      const cardsData = await import(`@/data/cards/en/${setId}.json`);
      const allCards: Card[] = cardsData.default;
      const shuffled = [...allCards].sort(() => Math.random() - 0.5);
      const selected = shuffled.slice(0, packSize);

      // Spin Pokéball
      if (pokeballRef.current) {
        animate(pokeballRef.current, { rotate: [0, 720], duration: 900, ease: 'easeInOutQuad' });
      }

      setTimeout(() => {
        setPulledCards(selected);
        setRevealedCards(new Set());
        cardContainerRefs.current = new Array(selected.length).fill(null);
        cardBackRefs.current = new Array(selected.length).fill(null);
        cardFrontRefs.current = new Array(selected.length).fill(null);

        // Flash
        if (flashRef.current) {
          animate(flashRef.current, { opacity: [0, 0.85, 0], duration: 350, ease: 'easeInOutQuad' });
        }

        setPhase('reveal');
      }, 950);
    } catch (e) {
      console.error('Error loading cards:', e);
      setPhase('selection');
    }
  };

  const revealCard = useCallback(
    (index: number) => {
      if (revealedCards.has(index)) return;
      const back = cardBackRefs.current[index];
      const front = cardFrontRefs.current[index];
      const container = cardContainerRefs.current[index];
      if (!back || !front || !container) return;

      const card = pulledCards[index];
      const tier = getRarityTier(card.rarity);

      animate(back, {
        rotateY: [0, 90],
        duration: 200,
        ease: 'easeInQuad',
        onComplete: () => {
          back.style.display = 'none';
          front.style.display = 'block';
          setRevealedCards((prev) => new Set(prev).add(index));
          animate(front, { rotateY: [-90, 0], duration: 200, ease: 'easeOutQuad' });
          if (tier === 'rare' || tier === 'ultra') {
            particleBurst(container, tier === 'ultra' ? '#b48aff' : '#ffd700', tier === 'ultra' ? 24 : 16);
          }
        },
      });
    },
    [revealedCards, pulledCards]
  );

  const reset = () => {
    setPulledCards([]);
    setRevealedCards(new Set());
    setPhase('selection');
  };

  const closeModal = () => {
    reset();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* White flash overlay */}
      <div
        ref={flashRef}
        className="fixed inset-0 bg-white z-[60] pointer-events-none"
        style={{ opacity: 0 }}
      />

      {/* Backdrop */}
      <div
        ref={backdropRef}
        onClick={closeModal}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        style={{ opacity: 0 }}
      />

      {/* Panel */}
      <div className="absolute inset-0 flex items-center justify-center p-4 pointer-events-none">
        <div
          ref={panelRef}
          className="bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto pointer-events-auto border border-white/10"
          style={{ opacity: 0 }}
        >
          {/* Header */}
          <div className="p-5 border-b border-white/10 flex items-center gap-4">
            <div className="w-12 h-12 bg-white/10 rounded-xl p-2 flex-shrink-0">
              <Image src={setLogo} alt={setName} width={48} height={48} className="w-full h-full object-contain" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-white font-bold text-xl">Open a Pack</h2>
              <p className="text-neutral-400 text-sm truncate">{setName}</p>
            </div>
            <button
              onClick={closeModal}
              className="text-neutral-400 hover:text-white p-2 transition-colors flex-shrink-0"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Phase: selection */}
            {phase === 'selection' && (
              <div className="text-center py-8 space-y-6">
                <div>
                  <p className="text-white text-lg font-semibold mb-5">Choose Pack Size</p>
                  <div className="flex flex-wrap justify-center gap-3">
                    {[3, 4, 5, 6, 7, 8].map((size) => (
                      <button
                        key={size}
                        onClick={() => setPackSize(size)}
                        className={`w-14 h-14 rounded-xl font-bold text-lg transition-all ${
                          packSize === size
                            ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-gray-900 shadow-lg shadow-orange-500/30 scale-110'
                            : 'bg-white/10 text-white hover:bg-white/20 hover:scale-105'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
                <button
                  onClick={openPack}
                  className="px-10 py-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl font-bold text-lg shadow-xl transition-all hover:scale-105 active:scale-95"
                >
                  Open Pack! ✨
                </button>
              </div>
            )}

            {/* Phase: opening */}
            {phase === 'opening' && (
              <div className="text-center py-12 space-y-6">
                <div className="inline-block">
                  <PokeballSVG
                    ref={pokeballRef}
                    className="w-20 h-20 text-neutral-400"
                  />
                </div>
                <p className="text-white text-xl font-semibold">Opening your pack...</p>
              </div>
            )}

            {/* Phase: reveal */}
            {phase === 'reveal' && (
              <div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-6">
                  {pulledCards.map((card, i) => {
                    const tier = getRarityTier(card.rarity);
                    const style = RARITY_STYLE[tier];
                    return (
                      <div
                        key={card.id}
                        ref={(el) => { cardContainerRefs.current[i] = el; }}
                        style={{ opacity: 0, position: 'relative' }}
                        className="aspect-[2.5/3.5]"
                      >
                        <button
                          onClick={() => revealCard(i)}
                          className="w-full h-full"
                          disabled={revealedCards.has(i)}
                        >
                          {/* Card back */}
                          <div
                            ref={(el) => { cardBackRefs.current[i] = el; }}
                            className="absolute inset-0 rounded-xl overflow-hidden cursor-pointer"
                            style={{ boxShadow: style.shadow, border: `2px solid ${style.border}` }}
                          >
                            <Image
                              src={BACK_IMAGE}
                              alt="card back"
                              fill
                              className="object-cover"
                            />
                          </div>
                          {/* Card front (hidden until flipped) */}
                          <div
                            ref={(el) => { cardFrontRefs.current[i] = el; }}
                            className="absolute inset-0 rounded-xl overflow-hidden"
                            style={{ display: 'none' }}
                          >
                            <Image src={card.images.small} alt={card.name} fill className="object-cover" />
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                              <p className="text-white text-xs font-bold truncate">{card.name}</p>
                              {card.rarity && (
                                <p
                                  className={`text-xs ${
                                    tier === 'ultra'
                                      ? 'text-purple-300'
                                      : tier === 'rare'
                                      ? 'text-yellow-300'
                                      : 'text-neutral-400'
                                  }`}
                                >
                                  {card.rarity}
                                </p>
                              )}
                            </div>
                          </div>
                        </button>
                      </div>
                    );
                  })}
                </div>

                <div className="flex gap-3 justify-center">
                  <button
                    onClick={reset}
                    className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-semibold transition-all"
                  >
                    Open Another
                  </button>
                  <button
                    onClick={closeModal}
                    className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl font-semibold transition-all"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
```

Note: `PokeballSVG` needs `forwardRef` for the `ref` prop to work with anime.js. Add this to the component:

```tsx
import { forwardRef } from 'react';

const PokeballSVG = forwardRef<SVGSVGElement, { className?: string; style?: React.CSSProperties }>(
  ({ className, style }, ref) => (
    <svg ref={ref} viewBox="0 0 80 80" className={className} style={style} fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="40" cy="40" r="38" stroke="currentColor" strokeWidth="4" />
      <path d="M2 40 Q2 2 40 2 Q78 2 78 40" fill="#ef4444" />
      <path d="M2 40 Q2 78 40 78 Q78 78 78 40" fill="white" />
      <rect x="2" y="37" width="76" height="6" fill="currentColor" />
      <circle cx="40" cy="40" r="10" fill="white" stroke="currentColor" strokeWidth="4" />
      <circle cx="40" cy="40" r="5" fill="#1a1a2e" />
    </svg>
  )
);
PokeballSVG.displayName = 'PokeballSVG';
```

- [ ] **Step 2: Confirm zero Framer Motion imports remain**

Run in project root:
```bash
grep -r "framer-motion" app/
```
Expected output: empty (no matches). If any remain, remove them.

- [ ] **Step 3: Verify pack opening in dev server**

Open http://localhost:3000, click "Open Pack 🎴" on any set. Confirm:
1. Modal panel scales in from small
2. Pack size buttons are visible; selecting one highlights it in gold/orange
3. Click "Open Pack!" → Pokéball spins → white flash → cards fan in with stagger
4. Card backs glow based on rarity (gold for rare, purple for ultra)
5. Click a card back → flip animation → front appears
6. For rare/ultra pulls: particles burst outward from the card
7. "Open Another" resets to size selection; "Done" closes modal

- [ ] **Step 4: Commit**

```bash
git add app/components/PackModal.tsx
git commit -m "feat: full cinematic PackModal with anime.js, remove Framer Motion"
```

---

## Self-Review Checklist (completed by plan author)

**Spec coverage:**
- [x] Design system tokens — Task 1
- [x] anime.js helper lib — Task 1
- [x] Nav with Pokéball + mobile drawer — Task 2
- [x] Era-grouped set browser — Tasks 3, 4, 5
- [x] Dark glass set cards — Task 3
- [x] Infinite scroll on set detail — Task 6
- [x] All-cards page type filter + dark glass — Task 7
- [x] Card detail type-color glow + anime.js entrance + energy circles — Task 8
- [x] Pack opening full cinematic, no Framer Motion — Task 9
- [x] Mobile-first grid (2 → 3 → 4/5 cols) — Tasks 3, 4, 6, 7

**Placeholder scan:** No TBDs, all code blocks are complete.

**Type consistency:**
- `staggerIn(targets: HTMLElement[], staggerMs = 40)` — called with `HTMLElement[]` in Tasks 4, 6, 7 ✓
- `particleBurst(container: HTMLElement, color, count)` — called in Task 9 ✓
- `animate` from animejs — used directly in Tasks 2, 8, 9 ✓
- `CardList({ cards: Card[], setName: string })` — produced in Task 6, consumed in Task 6's page update ✓
- `SetGrid({ sets: Set[], deckSetIds: string[] })` — produced in Task 4, consumed in Task 5 ✓
