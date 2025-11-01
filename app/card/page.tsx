import { cache } from 'react';
import fs from 'fs';
import path from 'path';
import { Card } from '@/types/types';
import CardFilter from '../components/CardFilter';

// ✅ This will be cached across the request
const getAllCards = cache(() => {
  const dir = path.join(process.cwd(), 'data/cards/en');
  const files = fs.readdirSync(dir);

  const allCards: Card[] = files.flatMap((file) => {
    const filePath = path.join(dir, file);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    return Array.isArray(data) ? data : [];
  });

  return allCards;
});

export const getCardById = cache((id: string) => {
  const cards = getAllCards();
  return cards.find((card) => card.id === id);
});

export default async function CardsPage() {
  const allCards = getAllCards();

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
