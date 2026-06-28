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
