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
