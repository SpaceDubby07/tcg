import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getAllCardIds, getCardById, getCardsForSet, setIdFromCardId } from '@/lib/cards';

import Image from 'next/image';
import Link from 'next/link';
import CardImagePanel from '@/app/components/CardImagePanel';
import CardPrice from '@/app/components/CardPrice';

const TYPE_COLORS: Record<string, string> = {
  Fire: '#ff6b35',
  Water: '#4fc3f7',
  Grass: '#66bb6a',
  Lightning: '#ffd600',
  Psychic: '#ce93d8',
  Fighting: '#ef9a9a',
  Darkness: '#9575cd',
  Metal: '#b0bec5',
  Colorless: '#cfd8dc',
  Dragon: '#7e57c2',
  Fairy: '#f48fb1',
};

// Fully pre-rendered at build time — no runtime functions for card pages.
export const dynamicParams = false;

export async function generateStaticParams() {
  return getAllCardIds().map((id) => ({ id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const card = getCardById(id);
  if (!card) return {};

  const descParts = [card.supertype];
  if (card.types?.length) descParts.push(card.types.join('/') + ' type');
  if (card.hp) descParts.push(`HP ${card.hp}`);
  if (card.rarity) descParts.push(card.rarity);
  const description = `${card.name} — ${descParts.join(', ')}. View attacks, abilities, and full card details.`;

  return {
    title: card.name,
    description,
    openGraph: {
      title: card.name,
      description,
      images: [{ url: card.images.large, width: 500, height: 700, alt: card.name }],
    },
    twitter: {
      card: 'summary_large_image',
      title: card.name,
      description,
      images: [card.images.large],
    },
    alternates: { canonical: `https://tcg.zaclark.com/card/${id}` },
  };
}

export default async function CardDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const card = getCardById(id);
  if (!card) notFound();

  // Prev/next navigation is scoped to the card's own set, so we only load that
  // one set file instead of the entire ~20k-card dataset.
  const setCards = getCardsForSet(setIdFromCardId(id));
  const currentIndex = setCards.findIndex((c) => c.id === id);
  const prevCard = currentIndex > 0 ? setCards[currentIndex - 1] : null;
  const nextCard =
    currentIndex >= 0 && currentIndex < setCards.length - 1 ? setCards[currentIndex + 1] : null;

  const primaryType = card.types?.[0];
  const typeColor = primaryType ? (TYPE_COLORS[primaryType] ?? '#ef4444') : '#ef4444';

  return (
    <div className="min-h-screen bg-[#0f0f23]">
      {/* Back nav */}
      <header className="sticky top-0 z-40 bg-black/50 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            href="/card"
            className="text-neutral-400 hover:text-white transition-colors flex items-center gap-2 text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Collection
          </Link>
          <div className="flex items-center gap-3">
            {prevCard && (
              <Link
                href={`/card/${prevCard.id}`}
                className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm transition-colors"
              >
                ← Prev
              </Link>
            )}
            {nextCard && (
              <Link
                href={`/card/${nextCard.id}`}
                className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm transition-colors"
              >
                Next →
              </Link>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-5 gap-12">
          {/* Left: Card Image with entrance animation */}
          <div className="lg:col-span-2">
            <div className="sticky top-28">
              <CardImagePanel
                src={card.images.large}
                alt={card.name}
                type={primaryType}
              />

              {/* Metadata grid */}
              <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
                <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                  <div className="text-neutral-500 mb-1 text-xs">Set Number</div>
                  <div className="text-white font-semibold">#{card.number}</div>
                </div>
                {card.nationalPokedexNumbers && (
                  <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                    <div className="text-neutral-500 mb-1 text-xs">Pokédex #</div>
                    <div className="text-white font-semibold">{card.nationalPokedexNumbers[0]}</div>
                  </div>
                )}
                {card.level && (
                  <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                    <div className="text-neutral-500 mb-1 text-xs">Level</div>
                    <div className="text-white font-semibold">{card.level}</div>
                  </div>
                )}
                {card.convertedRetreatCost !== undefined && (
                  <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                    <div className="text-neutral-500 mb-1 text-xs">Retreat Cost</div>
                    <div className="text-white font-semibold">{card.convertedRetreatCost}</div>
                  </div>
                )}
              </div>

              <CardPrice cardId={card.id} />
            </div>
          </div>

          {/* Right: Card Details */}
          <div className="lg:col-span-3 space-y-8">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                {card.types?.map((t) => (
                  <span
                    key={t}
                    className="px-3 py-1 rounded-full text-xs font-semibold text-white"
                    style={{ background: `${TYPE_COLORS[t] ?? '#666'}33`, border: `1px solid ${TYPE_COLORS[t] ?? '#666'}66` }}
                  >
                    {t}
                  </span>
                ))}
                {card.subtypes?.map((sub) => (
                  <span key={sub} className="px-3 py-1 bg-white/10 text-neutral-300 rounded-full text-xs">
                    {sub}
                  </span>
                ))}
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">{card.name}</h1>
              <div className="flex flex-wrap items-center gap-4 text-neutral-400 text-sm">
                {card.hp && (
                  <span className="text-2xl font-bold" style={{ color: typeColor }}>
                    HP {card.hp}
                  </span>
                )}
                {card.rarity && <span>• {card.rarity}</span>}
                {card.artist && <span>• Art by {card.artist}</span>}
              </div>
            </div>

            {card.evolvesFrom && (
              <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                <div className="text-neutral-500 text-xs mb-1">Evolves From</div>
                <div className="text-white font-semibold text-lg">{card.evolvesFrom}</div>
              </div>
            )}

            {card.abilities && card.abilities.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-white">Abilities</h2>
                {card.abilities.map((ability, idx) => (
                  <div key={idx} className="bg-white/5 border border-white/10 rounded-xl p-5">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-bold text-white">{ability.name}</h3>
                      <span className="text-xs px-2 py-0.5 bg-purple-600/50 text-purple-200 rounded-full border border-purple-500/30">
                        {ability.type}
                      </span>
                    </div>
                    <p className="text-neutral-300 leading-relaxed text-sm">{ability.text}</p>
                  </div>
                ))}
              </div>
            )}

            {card.attacks && card.attacks.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-white">Attacks</h2>
                {card.attacks.map((attack, idx) => (
                  <div key={idx} className="bg-white/5 border border-white/10 rounded-xl p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-bold text-white mb-2">{attack.name}</h3>
                        {attack.cost && attack.cost.length > 0 && (
                          <div className="flex gap-1.5 flex-wrap">
                            {attack.cost.map((energy, i) => (
                              <span
                                key={i}
                                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
                                style={{ background: TYPE_COLORS[energy] ?? '#555' }}
                                title={energy}
                              >
                                {energy[0]}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      {attack.damage && (
                        <span className="text-3xl font-bold" style={{ color: typeColor }}>
                          {attack.damage}
                        </span>
                      )}
                    </div>
                    {attack.text && (
                      <p className="text-neutral-300 leading-relaxed text-sm">{attack.text}</p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {card.rules && (
              <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                <h3 className="text-base font-bold text-white mb-2">Rules</h3>
                <p className="text-neutral-300 leading-relaxed text-sm">{card.rules}</p>
              </div>
            )}

            {card.weaknesses && (
              <div className="bg-red-950/30 border border-red-900/40 rounded-xl p-5">
                <h3 className="text-base font-bold text-red-400 mb-2">Weakness</h3>
                {card.weaknesses.map((w, idx) => (
                  <div key={idx} className="text-neutral-300 text-sm">
                    {w.type} {w.value}
                  </div>
                ))}
              </div>
            )}

            {card.flavorText && (
              <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                <p className="text-neutral-400 italic leading-relaxed text-sm">{card.flavorText}</p>
              </div>
            )}

            {card.legalities && (
              <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                <h3 className="text-base font-bold text-white mb-3">Format Legality</h3>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(card.legalities).map(([format, status]) => (
                    <span
                      key={format}
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        status === 'Legal'
                          ? 'bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-500/30'
                          : 'bg-red-500/20 text-red-300 ring-1 ring-red-500/30'
                      }`}
                    >
                      {format}: {status}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom prev/next with thumbnails */}
        {(prevCard || nextCard) && (
          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-6">
            {prevCard ? (
              <Link
                href={`/card/${prevCard.id}`}
                className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-5 transition-colors group flex items-center gap-4"
              >
                <Image
                  src={prevCard.images.small}
                  alt={prevCard.name}
                  width={48}
                  height={67}
                  className="rounded-lg opacity-70 group-hover:opacity-100 transition-opacity"
                />
                <div>
                  <div className="text-xs text-neutral-500 mb-1">Previous Card</div>
                  <div className="text-white font-bold group-hover:text-violet-400 transition-colors">
                    ← {prevCard.name}
                  </div>
                </div>
              </Link>
            ) : (
              <div />
            )}
            {nextCard && (
              <Link
                href={`/card/${nextCard.id}`}
                className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-5 transition-colors group flex items-center justify-end gap-4 text-right"
              >
                <div>
                  <div className="text-xs text-neutral-500 mb-1">Next Card</div>
                  <div className="text-white font-bold group-hover:text-violet-400 transition-colors">
                    {nextCard.name} →
                  </div>
                </div>
                <Image
                  src={nextCard.images.small}
                  alt={nextCard.name}
                  width={48}
                  height={67}
                  className="rounded-lg opacity-70 group-hover:opacity-100 transition-opacity"
                />
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
