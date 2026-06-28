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
