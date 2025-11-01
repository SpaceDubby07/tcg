'use client';

import { useState, useMemo } from 'react';
import SetCard from './SetCards';
import type { Set } from '@/types/types';

interface SetFilterProps {
  sets: Set[];
}

export default function SetFilter({ sets }: SetFilterProps) {
  const [query, setQuery] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const years = useMemo(() => {
    const allYears = sets
      .map((set) => new Date(set.releaseDate).getFullYear())
      .filter((year) => !isNaN(year));
    return Array.from(new Set(allYears)).sort((a, b) => b - a);
  }, [sets]);

  const filteredSets = useMemo(() => {
    const filtered = sets.filter((set) => {
      const year = new Date(set.releaseDate).getFullYear();
      const matchesYear = selectedYear
        ? year === Number(selectedYear)
        : true;
      const matchesQuery = set.name
        .toLowerCase()
        .includes(query.toLowerCase());
      return matchesYear && matchesQuery;
    });

    // Sort by release date based on toggle
    return filtered.sort((a, b) => {
      const yearA = new Date(a.releaseDate).getFullYear();
      const yearB = new Date(b.releaseDate).getFullYear();
      return sortOrder === 'asc' ? yearA - yearB : yearB - yearA;
    });
  }, [sets, query, selectedYear, sortOrder]);

  return (
    <div>
      <div className="mb-8 flex flex-col sm:flex-row items-center justify-center gap-4">
        {/* Search */}
        <input
          type="text"
          placeholder="Search sets..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="border px-3 py-2 rounded w-full sm:w-64"
        />

        {/* Year Select */}
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
          className="border px-3 py-2 rounded w-full sm:w-40"
        >
          <option value="">All Years</option>
          {years.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>

        {/* Sort Toggle */}
        <button
          onClick={() =>
            setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))
          }
          className="border px-3 py-2 rounded w-full sm:w-40 hover:bg-gray-100 transition"
        >
          {sortOrder === 'asc' ? '↑ Ascending' : '↓ Descending'}
        </button>
      </div>

      {/* ✅ Only render filtered sets */}
      <div className="space-y-4">
        {filteredSets.length > 0 ? (
          filteredSets.map((set) => (
            <SetCard key={set.id} set={set} />
          ))
        ) : (
          <p className="text-center text-gray-500">No sets found.</p>
        )}
      </div>
    </div>
  );
}
