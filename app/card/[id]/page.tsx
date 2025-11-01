// app/card/[id]/page.tsx
import { notFound } from 'next/navigation';
import { getAllCards, getCardById } from '@/lib/cards';
import Image from 'next/image';
import Link from 'next/link';

export default async function CardDetailPage({
  params,
}: {
  params: Promise<{ id: string }>; // ← params is now a Promise
}) {
  const { id } = await params; // ← await it first
  const card = getCardById(id);

  if (!card) {
    notFound();
  }

  // Get all cards and find current index
  const allCards = getAllCards();
  const currentIndex = allCards.findIndex((c) => c.id === id);

  const prevCard =
    currentIndex > 0 ? allCards[currentIndex - 1] : null;
  const nextCard =
    currentIndex < allCards.length - 1
      ? allCards[currentIndex + 1]
      : null;

  return (
    <div className="max-w-4xl mx-auto p-8">
      {/* Navigation buttons */}
      <div className="flex justify-between mb-6">
        {prevCard ? (
          <Link
            href={`/card/${prevCard.id}`}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            ← Previous
          </Link>
        ) : (
          <div></div> // Empty div for spacing
        )}

        <Link
          href="/card"
          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
        >
          Back to List
        </Link>

        {nextCard ? (
          <Link
            href={`/card/${nextCard.id}`}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Next →
          </Link>
        ) : (
          <div></div> // Empty div for spacing
        )}
      </div>

      <h1 className="text-4xl font-bold mb-4">{card.name}</h1>
      <Image
        src={card.images.large}
        alt={card.name}
        width={500}
        height={700}
        className="rounded-lg"
      />
      <div className="mt-4 space-y-2">
        <p>
          <strong>HP:</strong> {card.hp}
        </p>
        <p>
          <strong>Types:</strong> {card.types?.join(', ')}
        </p>
        <p>
          <strong>Rarity:</strong> {card.rarity}
        </p>
        {card.artist && (
          <p>
            <strong>Artist:</strong> {card.artist}
          </p>
        )}
        {card.flavorText && (
          <p className="italic mt-2">{card.flavorText}</p>
        )}

        {/* Attacks */}
        {card.attacks && card.attacks.length > 0 && (
          <div className="mt-4">
            <h2 className="text-xl font-semibold mb-2">Attacks</h2>
            {card.attacks.map((attack, idx) => (
              <div key={idx} className="mb-2">
                <p>
                  <strong>{attack.name}</strong> - {attack.damage}
                </p>
                {attack.text && (
                  <p className="text-sm text-gray-600">
                    {attack.text}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom navigation (optional) */}
      <div className="flex justify-between mt-8 pt-4 border-t">
        {prevCard && (
          <Link
            href={`/card/${prevCard.id}`}
            className="text-blue-600 hover:underline"
          >
            ← {prevCard.name}
          </Link>
        )}
        {nextCard && (
          <Link
            href={`/card/${nextCard.id}`}
            className="text-blue-600 hover:underline ml-auto"
          >
            {nextCard.name} →
          </Link>
        )}
      </div>
    </div>
  );
}
