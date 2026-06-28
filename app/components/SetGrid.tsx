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

const ERA_COLOR: Record<string, string> = {
  'Scarlet & Violet':     '#f43f5e',
  'Sword & Shield':       '#6366f1',
  'Sun & Moon':           '#f59e0b',
  'XY':                   '#3b82f6',
  'Black & White':        '#e5e7eb',
  'HeartGold SoulSilver': '#eab308',
  'Platinum':             '#22d3ee',
  'Diamond & Pearl':      '#818cf8',
  'EX':                   '#ef4444',
  'Neo':                  '#22c55e',
  'Base':                 '#f97316',
  'Other':                '#6b7280',
};

const ERA_ORDER = [
  'Scarlet & Violet', 'Sword & Shield', 'Sun & Moon', 'XY',
  'Black & White', 'HeartGold SoulSilver', 'Platinum', 'Diamond & Pearl',
  'EX', 'Neo', 'Base', 'Other',
];

function getEra(series: string): string {
  return ERA_MAP[series] ?? 'Other';
}

function getYearRange(sets: Set[]): string {
  const years = sets.map((s) => new Date(s.releaseDate).getFullYear()).filter((y) => !isNaN(y));
  if (!years.length) return '';
  const min = Math.min(...years);
  const max = Math.max(...years);
  return min === max ? String(min) : `${min}–${max}`;
}

function ChevronDown() {
  return (
    <svg className="w-4 h-4 text-slate-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  );
}

export default function SetGrid({ sets }: { sets: Set[] }) {
  const [query, setQuery] = useState('');
  const [selectedEra, setSelectedEra] = useState('');
  const gridRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const animatedEras = useRef<globalThis.Set<string>>(new Set());

  const availableEras = useMemo(
    () => ERA_ORDER.filter((era) => sets.some((s) => getEra(s.series) === era)),
    [sets]
  );

  const isFiltering = query.trim() !== '' || selectedEra !== '';

  const filteredSets = useMemo(() => sets.filter((set) => {
    const matchesQuery = set.name.toLowerCase().includes(query.toLowerCase());
    const matchesEra = selectedEra ? getEra(set.series) === selectedEra : true;
    return matchesQuery && matchesEra;
  }), [sets, query, selectedEra]);

  const groupedByEra = useMemo(() => {
    const map = new Map<string, Set[]>();
    for (const set of sets) {
      const era = getEra(set.series);
      if (!map.has(era)) map.set(era, []);
      map.get(era)!.push(set);
    }
    return map;
  }, [sets]);

  useEffect(() => {
    gridRefs.current.forEach((el, era) => {
      if (animatedEras.current.has(era)) return;
      animatedEras.current.add(era);
      const cards = Array.from(el.querySelectorAll('[data-set-card]')) as HTMLElement[];
      if (cards.length) staggerIn(cards, 30);
    });
  });

  const fieldCls = "h-11 bg-[#0a0a14] border border-white/10 rounded-xl text-slate-200 text-sm focus:outline-none focus:border-blue-500/60 transition-colors";

  return (
    <div>
      {/* Filter bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-10">
        {/* Search */}
        <div className="relative flex-1">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search sets..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className={`${fieldCls} w-full pl-10 pr-4`}
          />
        </div>
        {/* Era select */}
        <div className="relative sm:w-48">
          <select
            value={selectedEra}
            onChange={(e) => setSelectedEra(e.target.value)}
            className={`${fieldCls} w-full appearance-none pl-4 pr-10 cursor-pointer`}
            style={{ background: '#0a0a14' }}
          >
            <option value="" style={{ background: '#111827' }}>All Eras</option>
            {availableEras.map((era) => (
              <option key={era} value={era} style={{ background: '#111827' }}>{era}</option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <ChevronDown />
          </div>
        </div>
      </div>

      {/* Flat filtered grid */}
      {isFiltering && (
        filteredSets.length === 0
          ? <p className="text-center text-slate-500 py-16">No sets found.</p>
          : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredSets.map((set) => <div key={set.id}><SetCard set={set} /></div>)}
            </div>
          )
      )}

      {/* Era-grouped layout */}
      {!isFiltering && (
        <div className="space-y-14">
          {ERA_ORDER.filter((era) => groupedByEra.has(era)).map((era) => {
            const eraSets = groupedByEra.get(era)!;
            const color = ERA_COLOR[era] ?? '#6b7280';
            return (
              <section key={era}>
                <div className="flex items-center justify-between mb-5 pb-3 border-b border-white/8">
                  <div className="flex items-center gap-3">
                    <div className="w-1 h-6 rounded-full flex-shrink-0" style={{ background: color }} />
                    <h2 className="text-slate-100 font-bold text-lg">{era}</h2>
                    <span className="px-2 py-0.5 rounded-full text-xs text-slate-400 bg-white/6 border border-white/8">
                      {getYearRange(eraSets)}
                    </span>
                  </div>
                  <span className="text-slate-500 text-xs">{eraSets.length} sets</span>
                </div>

                <div
                  ref={(el) => { if (el) gridRefs.current.set(era, el); }}
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                >
                  {eraSets.map((set) => (
                    <div key={set.id} data-set-card style={{ opacity: 0 }}>
                      <SetCard set={set} />
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
