import { getAllCards } from '@/lib/cards';
import CardFilter from '../components/CardFilter';

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
