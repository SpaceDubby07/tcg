import Link from 'next/link';
import Image from 'next/image';
import { getDeckSetIds } from '@/lib/decks';
import setsData from '@/data/sets/en.json';

export default function DecksPage() {
  const deckSetIds = new Set(getDeckSetIds());
  const setsWithDecks = setsData.filter((s) => deckSetIds.has(s.id));

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold text-gray-200 mb-2">Theme Decks</h1>
          <p className="text-gray-400">
            Pre-built decks from {setsWithDecks.length} sets
          </p>
        </div>

        <div className="space-y-3">
          {setsWithDecks.map((set) => (
            <Link
              key={set.id}
              href={`/decks/${set.id}`}
              className="flex items-center gap-4 bg-neutral-800 hover:bg-neutral-700 rounded-xl px-5 py-4 transition-colors group"
            >
              <div className="w-14 h-14 bg-white rounded-lg flex items-center justify-center p-2 shrink-0">
                <Image
                  src={set.images.logo}
                  alt={set.name}
                  width={56}
                  height={56}
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold group-hover:text-emerald-400 transition-colors">
                  {set.name}
                </p>
                <p className="text-neutral-500 text-sm">{set.series} · {new Date(set.releaseDate).getFullYear()}</p>
              </div>
              <svg className="w-5 h-5 text-neutral-500 group-hover:text-emerald-400 transition-colors shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
