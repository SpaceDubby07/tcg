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
  const animatedEras = useRef<globalThis.Set<string>>(new Set());

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
