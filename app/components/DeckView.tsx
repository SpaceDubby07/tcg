'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Deck, Card } from '@/types/types';

interface DeckViewProps {
  decks: Deck[];
  cardMap: Record<string, Card>;
}

export default function DeckView({ decks, cardMap }: DeckViewProps) {
  const [selectedDeck, setSelectedDeck] = useState<Deck>(decks[0]);

  return (
    <div>
      {/* Deck Selector */}
      {decks.length > 1 && (
        <div className="flex flex-wrap gap-2 mb-8">
          {decks.map((deck) => (
            <button
              key={deck.id}
              onClick={() => setSelectedDeck(deck)}
              className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all ${
                selectedDeck.id === deck.id
                  ? 'bg-emerald-600 text-white shadow-lg'
                  : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
              }`}
            >
              {deck.name}
            </button>
          ))}
        </div>
      )}

      {/* Deck Info */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">{selectedDeck.name}</h2>
        <div className="flex flex-wrap gap-2">
          {selectedDeck.types.map((type) => (
            <span
              key={type}
              className="px-3 py-1 bg-neutral-800 text-neutral-300 rounded-full text-sm"
            >
              {type}
            </span>
          ))}
          <span className="px-3 py-1 bg-neutral-800 text-neutral-400 rounded-full text-sm">
            {selectedDeck.cards.reduce((sum, c) => sum + c.count, 0)} cards
          </span>
        </div>
      </div>

      {/* Card Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {selectedDeck.cards.map((deckCard, i) => {
          const card = cardMap[deckCard.id];
          return (
            <div key={`${deckCard.id}-${i}`} className="relative group">
              {card ? (
                <Link href={`/card/${card.id}`}>
                  <div className="relative">
                    <Image
                      src={card.images.small}
                      alt={card.name}
                      width={200}
                      height={280}
                      className="w-full h-auto rounded-xl shadow-md hover:scale-105 transition-transform"
                    />
                    {deckCard.count > 1 && (
                      <span className="absolute top-2 right-2 bg-black/80 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                        x{deckCard.count}
                      </span>
                    )}
                  </div>
                  <p className="text-neutral-300 text-xs mt-1 truncate">{card.name}</p>
                </Link>
              ) : (
                <div className="bg-neutral-800 rounded-xl p-3 text-center">
                  <p className="text-neutral-400 text-xs font-semibold">{deckCard.name}</p>
                  {deckCard.count > 1 && (
                    <p className="text-neutral-500 text-xs">x{deckCard.count}</p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
