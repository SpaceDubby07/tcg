import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getDecksForSet, getDeckSetIds } from '@/lib/decks';
import { getCardsForSet } from '@/lib/cards';
import { Card } from '@/types/types';
import DeckView from '@/app/components/DeckView';
import setsData from '@/data/sets/en.json';

export async function generateStaticParams() {
  return getDeckSetIds().map((setId) => ({ setId }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ setId: string }>;
}): Promise<Metadata> {
  const { setId } = await params;
  const set = setsData.find((s) => s.id === setId);
  if (!set) return {};

  return {
    title: `${set.name} Theme Decks`,
    description: `View the pre-built theme decks from ${set.name} (${set.series} series). Full deck lists with card counts.`,
    alternates: { canonical: `https://tcg.zaclark.com/decks/${setId}` },
  };
}

interface DeckPageProps {
  params: Promise<{ setId: string }>;
}

export default async function DeckPage({ params }: DeckPageProps) {
  const { setId } = await params;
  const decks = getDecksForSet(setId);

  if (!decks.length) notFound();

  const setInfo = setsData.find((s) => s.id === setId);
  const cards = getCardsForSet(setId);

  const cardMap: Record<string, Card> = {};
  for (const card of cards) {
    cardMap[card.id] = card;
  }

  return (
    <div className="min-h-screen bg-neutral-900">
      <header className="sticky top-0 z-50 bg-black/50 backdrop-blur-md border-b border-neutral-800">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link
            href="/"
            className="text-neutral-400 hover:text-white transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back
          </Link>
          <span className="text-neutral-600">|</span>
          <h1 className="text-white font-bold text-lg">
            {setInfo?.name ?? setId} — Theme Decks
          </h1>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-10">
        <DeckView decks={decks} cardMap={cardMap} />
      </div>
    </div>
  );
}
