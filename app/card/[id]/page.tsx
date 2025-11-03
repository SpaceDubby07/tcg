// app/card/[id]/page.tsx
import { notFound } from 'next/navigation';
import { getAllCards, getCardById } from '@/lib/cards';
import Image from 'next/image';
import Link from 'next/link';

export default async function CardDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const card = getCardById(id);

  if (!card) {
    notFound();
  }

  const allCards = getAllCards();
  const currentIndex = allCards.findIndex((c) => c.id === id);

  const prevCard =
    currentIndex > 0 ? allCards[currentIndex - 1] : null;
  const nextCard =
    currentIndex < allCards.length - 1
      ? allCards[currentIndex + 1]
      : null;

  return (
    <div className="min-h-screen bg-neutral-900">
      {/* Header Navigation */}
      <header className="sticky top-0 z-50 bg-black/50 backdrop-blur-md border-b border-neutral-800">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            href="/card"
            className="text-neutral-400 hover:text-white transition-colors flex items-center gap-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Collection
          </Link>

          <div className="flex items-center gap-4">
            {prevCard && (
              <Link
                href={`/card/${prevCard.id}`}
                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg transition-colors"
              >
                ← Prev
              </Link>
            )}
            {nextCard && (
              <Link
                href={`/card/${nextCard.id}`}
                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg transition-colors"
              >
                Next →
              </Link>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-5 gap-12">
          {/* Left: Card Image */}
          <div className="lg:col-span-2">
            <div className="sticky top-28">
              <Image
                src={card.images.large}
                alt={card.name}
                width={500}
                height={700}
                className="w-full rounded-2xl shadow-2xl"
                priority
              />

              {/* Card Metadata */}
              <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
                <div className="bg-neutral-800 rounded-lg p-3">
                  <div className="text-neutral-400 mb-1">
                    Set Number
                  </div>
                  <div className="text-white font-semibold">
                    #{card.number}
                  </div>
                </div>
                {card.nationalPokedexNumbers && (
                  <div className="bg-neutral-800 rounded-lg p-3">
                    <div className="text-neutral-400 mb-1">
                      Pokédex #
                    </div>
                    <div className="text-white font-semibold">
                      {card.nationalPokedexNumbers[0]}
                    </div>
                  </div>
                )}
                {card.level && (
                  <div className="bg-neutral-800 rounded-lg p-3">
                    <div className="text-neutral-400 mb-1">Level</div>
                    <div className="text-white font-semibold">
                      {card.level}
                    </div>
                  </div>
                )}
                {card.convertedRetreatCost !== undefined && (
                  <div className="bg-neutral-800 rounded-lg p-3">
                    <div className="text-neutral-400 mb-1">
                      Retreat Cost
                    </div>
                    <div className="text-white font-semibold">
                      {card.convertedRetreatCost}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right: Card Details */}
          <div className="lg:col-span-3 space-y-8">
            {/* Header */}
            <div>
              <div className="flex items-center gap-3 mb-2">
                {card.types?.map((type) => (
                  <span
                    key={type}
                    className="px-3 py-1 bg-neutral-800 text-neutral-300 rounded-full text-sm font-medium"
                  >
                    {type}
                  </span>
                ))}
                {card.subtypes?.map((subtype) => (
                  <span
                    key={subtype}
                    className="px-3 py-1 bg-neutral-800 text-neutral-300 rounded-full text-sm"
                  >
                    {subtype}
                  </span>
                ))}
              </div>
              <h1 className="text-5xl font-bold text-white mb-3">
                {card.name}
              </h1>
              <div className="flex items-center gap-6 text-neutral-400">
                <span className="text-2xl font-bold text-red-500">
                  HP {card.hp}
                </span>
                {card.rarity && <span>• {card.rarity}</span>}
                {card.artist && <span>• Art by {card.artist}</span>}
              </div>
            </div>

            {/* Evolution */}
            {card.evolvesFrom && (
              <div className="bg-neutral-800 rounded-xl p-5 border border-neutral-700">
                <div className="text-neutral-400 text-sm mb-1">
                  Evolves From
                </div>
                <div className="text-white font-semibold text-lg">
                  {card.evolvesFrom}
                </div>
              </div>
            )}

            {/* Abilities */}
            {card.abilities && card.abilities.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-white">
                  Abilities
                </h2>
                {card.abilities.map((ability, idx) => (
                  <div
                    key={idx}
                    className="bg-neutral-800 rounded-xl p-6 border border-neutral-700"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-xl font-bold text-white">
                        {ability.name}
                      </h3>
                      <span className="text-xs px-3 py-1 bg-purple-600 text-white rounded-full">
                        {ability.type}
                      </span>
                    </div>
                    <p className="text-neutral-300 leading-relaxed">
                      {ability.text}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Attacks */}
            {card.attacks && card.attacks.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-white">
                  Attacks
                </h2>
                {card.attacks.map((attack, idx) => (
                  <div
                    key={idx}
                    className="bg-neutral-800 rounded-xl p-6 border border-neutral-700"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-xl font-bold text-white mb-2">
                          {attack.name}
                        </h3>
                        {attack.cost && (
                          <div className="flex gap-1">
                            {attack.cost.map((energy, i) => (
                              <span
                                key={i}
                                className="w-6 h-6 rounded-full bg-neutral-700 flex items-center justify-center text-xs text-neutral-300"
                              >
                                {energy[0]}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      {attack.damage && (
                        <span className="text-3xl font-bold text-red-500">
                          {attack.damage}
                        </span>
                      )}
                    </div>
                    {attack.text && (
                      <p className="text-neutral-300 leading-relaxed">
                        {attack.text}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {card.rules && (
              <div className="">
                {card.rules && (
                  <div className="bg-neutral-800 rounded-xl p-5 border border-neutral-700">
                    <h3 className="text-lg font-bold text-white mb-3">
                      Rules
                    </h3>
                    <p className="text-neutral-300 leading-relaxed text-lg">
                      {card.rules}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Weaknesses & Resistances */}
            {card.weaknesses && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {card.weaknesses && (
                  <div className="bg-red-950/30 border border-red-900/50 rounded-xl p-5">
                    <h3 className="text-lg font-bold text-red-400 mb-3">
                      Weakness
                    </h3>
                    {card.weaknesses.map((weakness, idx) => (
                      <div key={idx} className="text-neutral-300">
                        {weakness.type} {weakness.value}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Flavor Text */}
            {card.flavorText && (
              <div className="bg-neutral-800 rounded-xl p-6 border border-neutral-700">
                <p className="text-neutral-300 italic leading-relaxed text-lg">
                  {card.flavorText}
                </p>
              </div>
            )}

            {/* Legalities */}
            {card.legalities && (
              <div className="bg-neutral-800 rounded-xl p-5 border border-neutral-700">
                <h3 className="text-lg font-bold text-white mb-3">
                  Format Legality
                </h3>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(card.legalities).map(
                    ([format, status]) => (
                      <span
                        key={format}
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          status === 'Legal'
                            ? 'bg-green-600 text-white'
                            : 'bg-red-600 text-white'
                        }`}
                      >
                        {format}: {status}
                      </span>
                    )
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Navigation */}
        {(prevCard || nextCard) && (
          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-6">
            {prevCard ? (
              <Link
                href={`/card/${prevCard.id}`}
                className="bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-xl p-6 transition-colors group"
              >
                <div className="text-sm text-neutral-400 mb-2">
                  Previous Card
                </div>
                <div className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">
                  ← {prevCard.name}
                </div>
              </Link>
            ) : (
              <div></div>
            )}
            {nextCard && (
              <Link
                href={`/card/${nextCard.id}`}
                className="bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-xl p-6 transition-colors group text-right"
              >
                <div className="text-sm text-neutral-400 mb-2">
                  Next Card
                </div>
                <div className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">
                  {nextCard.name} →
                </div>
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
