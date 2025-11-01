import fs from 'fs';
import path from 'path';
import Image from 'next/image';
import { Card, Set } from '@/types/types';

interface CardListProps {
  setId: string;
}

export default async function CardList({ setId }: CardListProps) {
  let cards: Card[] = [];
  let setName = setId;
  let error: string | null = null;

  try {
    // Load cards for this set
    const cardsPath = path.join(
      process.cwd(),
      'data',
      'cards',
      'en',
      `${setId}.json`
    );
    const cardsFile = fs.readFileSync(cardsPath, 'utf8');
    cards = JSON.parse(cardsFile);

    // Load all sets and find matching set name
    const setsPath = path.join(
      process.cwd(),
      'data',
      'sets',
      'en.json'
    );
    const setsFile = fs.readFileSync(setsPath, 'utf8');
    const allSets = JSON.parse(setsFile);
    const currentSet = allSets.find((set: Set) => set.id === setId);
    if (currentSet) setName = currentSet.name;
  } catch (err) {
    console.error('Error loading cards for', setId, err);
    error = 'Failed to load card data.';
  }

  if (error)
    return <p className="text-center text-red-500 p-4">{error}</p>;
  if (!cards.length)
    return <p className="text-center p-4">No cards found.</p>;

  console.log(cards);
  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold text-gray-900 mb-6 capitalize text-center">
        {setName} Cards
      </h1>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 space-x-4">
        {cards.map((card) => (
          <div
            key={card.id}
            className="bg-white rounded-xl shadow-md overflow-hidden hover:scale-105 transition-transform"
          >
            <Image
              src={card.images.large}
              alt={card.name}
              width={200}
              height={0} // Set to 0 and let CSS handle it
              className="w-full h-auto object-contain"
              loading="eager"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
