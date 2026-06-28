import type { Metadata } from 'next';
import { getCardSummaries } from '@/lib/cards';
import CardFilter from '../components/CardFilter';

export const metadata: Metadata = {
  title: 'Cards',
  description:
    'Search and filter every Pokémon TCG card by name and rarity. Browse the complete card collection.',
  alternates: { canonical: 'https://tcg.zaclark.com/card' },
};

export default async function CardsPage() {
  const allCards = getCardSummaries();

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-50">
          Pokémon Cards
        </h1>
        <CardFilter cards={allCards} />
      </div>
    </div>
  );
}
