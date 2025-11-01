'use client';

import {
  useState,
  useMemo,
  useEffect,
  useRef,
  useCallback,
} from 'react';
import Image from 'next/image';
import type { Card } from '@/types/types';
import Link from 'next/link';

interface CardFilterProps {
  cards: Card[];
}

const CARDS_PER_PAGE = 50;

export default function CardFilter({ cards }: CardFilterProps) {
  const [query, setQuery] = useState('');
  const [rarity, setRarity] = useState('');
  const [displayCount, setDisplayCount] = useState(CARDS_PER_PAGE);
  const observerTarget = useRef<HTMLDivElement>(null);

  const rarities = useMemo(() => {
    const all = cards.map((c) => c.rarity).filter(Boolean);
    return Array.from(new Set(all)).sort();
  }, [cards]);

  const filtered = useMemo(() => {
    return cards.filter((card) => {
      const matchesQuery = card.name
        .toLowerCase()
        .includes(query.toLowerCase());
      const matchesRarity = rarity ? card.rarity === rarity : true;
      return matchesQuery && matchesRarity;
    });
  }, [cards, query, rarity]);

  // Reset display count when filters change
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDisplayCount(CARDS_PER_PAGE);
  }, [query, rarity]);

  const displayedCards = useMemo(() => {
    return filtered.slice(0, displayCount);
  }, [filtered, displayCount]);

  const hasMore = displayCount < filtered.length;

  const loadMore = useCallback(() => {
    if (hasMore) {
      setDisplayCount((prev) =>
        Math.min(prev + CARDS_PER_PAGE, filtered.length)
      );
    }
  }, [hasMore, filtered.length]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          loadMore();
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore, loadMore]);

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-center gap-4 mb-8 text-white">
        <input
          type="text"
          placeholder="Search cards..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="border px-3 py-2 rounded w-full sm:w-64 text-white"
        />

        <select
          value={rarity}
          onChange={(e) => setRarity(e.target.value)}
          className="border px-3 py-2 rounded w-full sm:w-48 text-white"
        >
          <option value="" className="text-slate-950">
            All Rarities
          </option>
          {rarities.map((r) => (
            <option key={r} value={r} className="text-slate-950">
              {r}
            </option>
          ))}
        </select>

        <div className="text-sm text-gray-50">
          Showing {displayedCards.length} of {filtered.length}
        </div>
      </div>

      {/* Results */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {displayedCards.map((card) => (
          <div
            key={card.id}
            className="bg-white rounded-xl shadow hover:shadow-lg transition p-2"
          >
            <Link href={`/card/${card.id}`}>
              <Image
                src={card.images.large}
                alt={card.name}
                width={250}
                height={350}
                className="rounded-lg object-contain mx-auto"
              />
            </Link>
            <h2 className="mt-2 text-sm font-medium text-center">
              {card.name}
            </h2>
            <p className="text-xs text-slate-950 text-center">
              {card.rarity}
            </p>
          </div>
        ))}
      </div>

      {/* Loading trigger */}
      {hasMore && (
        <div
          ref={observerTarget}
          className="flex justify-center py-8"
        >
          <div className="text-gray-50">Loading more cards...</div>
        </div>
      )}

      {/* No results */}
      {filtered.length === 0 && (
        <p className="text-center text-gray-50 mt-8">
          No cards found.
        </p>
      )}

      {/* End of results */}
      {!hasMore && displayedCards.length > 0 && (
        <p className="text-center text-gray-50 mt-8">
          All cards loaded ({filtered.length} total)
        </p>
      )}
    </div>
  );
}
