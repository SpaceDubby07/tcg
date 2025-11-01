'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import type { Card } from '@/types/types';

interface CardFilterProps {
  cards: Card[];
}

export default function CardFilter({ cards }: CardFilterProps) {
  const [query, setQuery] = useState('');
  const [rarity, setRarity] = useState('');

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

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-center gap-4 mb-8">
        <input
          type="text"
          placeholder="Search cards..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="border px-3 py-2 rounded w-full sm:w-64"
        />

        <select
          value={rarity}
          onChange={(e) => setRarity(e.target.value)}
          className="border px-3 py-2 rounded w-full sm:w-48"
        >
          <option value="">All Rarities</option>
          {rarities.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </div>

      {/* Results */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {filtered.map((card) => (
          <div
            key={card.id}
            className="bg-white rounded-xl shadow hover:shadow-lg transition p-2"
          >
            <Image
              src={card.images.large}
              alt={card.name}
              width={250}
              height={350}
              className="rounded-lg object-contain mx-auto"
            />
            <h2 className="mt-2 text-sm font-medium text-center">
              {card.name}
            </h2>
            <p className="text-xs text-gray-500 text-center">
              {card.rarity}
            </p>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-gray-500 mt-8">
          No cards found.
        </p>
      )}
    </div>
  );
}
