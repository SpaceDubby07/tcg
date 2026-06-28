'use client';

import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { Card } from '@/types/types';
import { staggerIn } from '@/lib/anime';

const CARDS_PER_PAGE = 50;

const TYPE_COLORS: Record<string, string> = {
  Fire: '#ff6b35', Water: '#4fc3f7', Grass: '#66bb6a', Lightning: '#ffd600',
  Psychic: '#ce93d8', Fighting: '#ef9a9a', Darkness: '#9575cd', Metal: '#b0bec5',
  Colorless: '#cfd8dc', Dragon: '#7e57c2', Fairy: '#f48fb1',
};

function PokeballSpinner() {
  return (
    <div style={{ animation: 'pokeball-spin 0.8s linear infinite' }} className="w-10 h-10 text-slate-500">
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

function ChevronDown() {
  return (
    <svg className="w-4 h-4 text-slate-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  );
}

export default function CardFilter({ cards }: { cards: Card[] }) {
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

  const filtered = useMemo(() => cards.filter((card) => {
    const matchesQuery = card.name.toLowerCase().includes(query.toLowerCase());
    const matchesRarity = rarity ? card.rarity === rarity : true;
    const matchesType = type ? (card.types ?? []).includes(type) : true;
    return matchesQuery && matchesRarity && matchesType;
  }), [cards, query, rarity, type]);

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

  const fieldCls = "h-11 bg-[#0a0a14] border border-white/10 rounded-xl text-slate-200 text-sm focus:outline-none focus:border-blue-500/60 transition-colors";

  return (
    <div>
      {/* Filter bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <div className="relative flex-1">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search cards..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className={`${fieldCls} w-full pl-10 pr-4`}
          />
        </div>
        <div className="relative sm:w-44">
          <select
            value={rarity}
            onChange={(e) => setRarity(e.target.value)}
            className={`${fieldCls} w-full appearance-none pl-4 pr-10 cursor-pointer`}
            style={{ background: '#0a0a14' }}
          >
            <option value="" style={{ background: '#111827' }}>All Rarities</option>
            {rarities.map((r) => <option key={r} value={r} style={{ background: '#111827' }}>{r}</option>)}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"><ChevronDown /></div>
        </div>
        <div className="relative sm:w-40">
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className={`${fieldCls} w-full appearance-none pl-4 pr-10 cursor-pointer`}
            style={{ background: '#0a0a14' }}
          >
            <option value="" style={{ background: '#111827' }}>All Types</option>
            {types.map((t) => <option key={t} value={t} style={{ background: '#111827' }}>{t}</option>)}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"><ChevronDown /></div>
        </div>
        <span className="text-slate-500 text-sm self-center whitespace-nowrap">
          {displayedCards.length} / {filtered.length}
        </span>
      </div>

      {/* Card grid */}
      <div ref={gridRef} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
        {displayedCards.map((card) => (
          <div
            key={card.id}
            data-card
            style={{ opacity: 0 }}
            className="group relative rounded-xl overflow-hidden bg-white/4 border border-white/8 hover:border-white/20 hover:bg-white/6 transition-all cursor-pointer"
          >
            <Link href={`/card/${card.id}`} className="block">
              <Image
                src={card.images.large}
                alt={card.name}
                width={250}
                height={350}
                className="w-full h-auto object-contain transition-transform duration-300 group-hover:scale-[1.03]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-end p-3">
                <div>
                  <p className="text-white text-sm font-semibold truncate">{card.name}</p>
                  {card.rarity && <p className="text-yellow-300 text-xs">{card.rarity}</p>}
                  {card.types?.[0] && (
                    <span className="inline-block w-2 h-2 rounded-full mt-1" style={{ background: TYPE_COLORS[card.types[0]] ?? '#fff' }} />
                  )}
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>

      {hasMore && <div ref={observerRef} className="flex justify-center py-12"><PokeballSpinner /></div>}
      {filtered.length === 0 && <p className="text-center text-slate-500 mt-16">No cards found.</p>}
      {!hasMore && displayedCards.length > 0 && (
        <p className="text-center text-slate-600 text-sm mt-10">All {filtered.length} cards shown</p>
      )}
    </div>
  );
}
