'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { Set } from '@/types/types';
import PackOpeningModal from './PackModal';
import { hoverLift, hoverReset } from '@/lib/anime';

export default function SetCard({ set }: { set: Set }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  return (
    <>
      <div
        ref={cardRef}
        onMouseEnter={() => cardRef.current && hoverLift(cardRef.current)}
        onMouseLeave={() => cardRef.current && hoverReset(cardRef.current)}
        className="group relative rounded-2xl overflow-hidden bg-white/4 border border-white/8 hover:border-white/20 hover:bg-white/6 transition-all duration-300 cursor-pointer"
      >
        {/* Shimmer on hover */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{
            background: 'linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.04) 50%, transparent 70%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 2s ease-in-out infinite',
          }}
        />

        <div className="relative p-4">
          <div className="flex items-start justify-between mb-4 gap-2">
            <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-xl bg-white/8 p-2 flex items-center justify-center flex-shrink-0">
              <Image
                src={set.images.logo}
                alt={`${set.name} logo`}
                width={72}
                height={72}
                className="w-full h-full object-contain"
              />
            </div>
            <span
              className={`px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 flex-shrink-0 ${
                set.legalities.unlimited === 'Legal'
                  ? 'bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/25'
                  : 'bg-red-500/15 text-red-400 ring-1 ring-red-500/25'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${set.legalities.unlimited === 'Legal' ? 'bg-emerald-400' : 'bg-red-400'}`} />
              {set.legalities.unlimited === 'Legal' ? 'Legal' : 'Banned'}
            </span>
          </div>

          <h3 className="text-slate-100 font-bold text-sm sm:text-base mb-0.5 leading-tight">{set.name}</h3>
          <p className="text-slate-500 text-xs mb-3">{set.series}</p>

          <div className="flex gap-4 text-xs text-slate-500 mb-4">
            <span><span className="text-slate-300 font-semibold">{set.total}</span> cards</span>
            <span>{new Date(set.releaseDate).getFullYear()}</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setIsModalOpen(true)}
              className="h-10 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors cursor-pointer touch-manipulation"
            >
              Open Pack
            </button>
            <Link
              href={`/sets/${set.id}`}
              className="h-10 flex items-center justify-center rounded-xl text-slate-300 text-xs font-semibold transition-all cursor-pointer touch-manipulation bg-white/6 border border-white/10 hover:bg-white/12 hover:text-white"
            >
              View Cards
            </Link>
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
