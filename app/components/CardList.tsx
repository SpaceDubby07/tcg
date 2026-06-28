import Image from 'next/image';
import Link from 'next/link';
import { getCardsForSet } from '@/lib/cards';
import setsData from '@/data/sets/en.json';

interface CardListProps {
  setId: string;
}

export default async function CardList({ setId }: CardListProps) {
  const cards = getCardsForSet(setId);
  const setInfo = setsData.find((s) => s.id === setId);
  const setName = setInfo?.name ?? setId;

  if (!cards.length)
    return <p className="text-center p-4">No cards found.</p>;

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold text-gray-50 mb-6 capitalize text-center">
        {setName} Cards
      </h1>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 space-x-4">
        {cards.map((card) => (
          <div
            key={card.id}
            className="bg-white rounded-xl shadow-md overflow-hidden hover:scale-105 transition-transform"
          >
            <Link href={`/card/${card.id}`}>
              <Image
                src={card.images.large}
                alt={card.name}
                width={200}
                height={0} // Set to 0 and let CSS handle it
                className="w-full h-auto object-contain"
                loading="eager"
              />
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
