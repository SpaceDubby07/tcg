'use client';

import { useState, useRef, useEffect, useCallback, forwardRef } from 'react';
import Image from 'next/image';
import { animate } from 'animejs';
import type { Card } from '@/types/types';
import { particleBurst } from '@/lib/anime';

const BACK_IMAGE =
  'https://img2.clipart-library.com/28/pokemon-card-clipart/pokemon-card-clipart-4.gif';

const RARITY_STYLE: Record<string, { shadow: string; border: string }> = {
  common:   { shadow: 'none',                             border: 'rgba(255,255,255,0.1)' },
  uncommon: { shadow: '0 0 12px rgba(192,192,192,0.4)',   border: 'rgba(192,192,192,0.5)' },
  rare:     { shadow: '0 0 20px rgba(255,215,0,0.5)',     border: 'rgba(255,215,0,0.6)' },
  ultra:    { shadow: '0 0 30px rgba(180,130,255,0.7)',   border: 'rgba(180,130,255,0.8)' },
};

function getRarityTier(rarity?: string): keyof typeof RARITY_STYLE {
  if (!rarity) return 'common';
  const r = rarity.toLowerCase();
  if (
    r.includes('ultra') || r.includes('secret') || r.includes('amazing') ||
    r.includes('vmax') || r.includes('ex') || r.includes('gx') ||
    r.includes('shining') || r.includes('star') || r.includes('prism')
  ) return 'ultra';
  if (r.includes('holo') || r === 'rare') return 'rare';
  if (r === 'uncommon') return 'uncommon';
  return 'common';
}

interface PackOpeningModalProps {
  isOpen: boolean;
  onClose: () => void;
  setId: string;
  setName: string;
  setLogo: string;
}

type Phase = 'selection' | 'opening' | 'reveal';

const PokeballSVG = forwardRef<SVGSVGElement, { className?: string; style?: React.CSSProperties }>(
  ({ className, style }, ref) => (
    <svg ref={ref} viewBox="0 0 80 80" className={className} style={style} fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="40" cy="40" r="38" stroke="currentColor" strokeWidth="4" />
      <path d="M2 40 Q2 2 40 2 Q78 2 78 40" fill="#ef4444" />
      <path d="M2 40 Q2 78 40 78 Q78 78 78 40" fill="white" />
      <rect x="2" y="37" width="76" height="6" fill="currentColor" />
      <circle cx="40" cy="40" r="10" fill="white" stroke="currentColor" strokeWidth="4" />
      <circle cx="40" cy="40" r="5" fill="#1a1a2e" />
    </svg>
  )
);
PokeballSVG.displayName = 'PokeballSVG';

export default function PackOpeningModal({
  isOpen,
  onClose,
  setId,
  setName,
  setLogo,
}: PackOpeningModalProps) {
  const [packSize, setPackSize] = useState(5);
  const [phase, setPhase] = useState<Phase>('selection');
  const [pulledCards, setPulledCards] = useState<Card[]>([]);
  const [revealedCards, setRevealedCards] = useState<globalThis.Set<number>>(new Set());

  const backdropRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const flashRef = useRef<HTMLDivElement>(null);
  const pokeballRef = useRef<SVGSVGElement>(null);
  const cardContainerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const cardBackRefs = useRef<(HTMLDivElement | null)[]>([]);
  const cardFrontRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (!isOpen || !backdropRef.current || !panelRef.current) return;
    animate(backdropRef.current, { opacity: [0, 1], duration: 300, ease: 'easeOutQuad' });
    animate(panelRef.current, { scale: [0.85, 1], opacity: [0, 1], duration: 400, ease: 'easeOutBack' });
  }, [isOpen]);

  useEffect(() => {
    if (phase !== 'reveal') return;
    const cards = cardContainerRefs.current.filter(Boolean) as HTMLElement[];
    if (!cards.length) return;
    setTimeout(() => {
      animate(cards, {
        translateY: [60, 0],
        opacity: [0, 1],
        delay: (_, i) => i * 80,
        duration: 500,
        ease: 'easeOutBack',
      });
    }, 100);
  }, [phase]);

  const openPack = async () => {
    setPhase('opening');
    try {
      const cardsData = await import(`@/data/cards/en/${setId}.json`);
      const allCards: Card[] = cardsData.default;
      const shuffled = [...allCards].sort(() => Math.random() - 0.5);
      const selected = shuffled.slice(0, packSize);

      if (pokeballRef.current) {
        animate(pokeballRef.current, { rotate: [0, 720], duration: 900, ease: 'easeInOutQuad' });
      }

      setTimeout(() => {
        setPulledCards(selected);
        setRevealedCards(new Set());
        cardContainerRefs.current = new Array(selected.length).fill(null);
        cardBackRefs.current = new Array(selected.length).fill(null);
        cardFrontRefs.current = new Array(selected.length).fill(null);

        if (flashRef.current) {
          animate(flashRef.current, { opacity: [0, 0.85, 0], duration: 350, ease: 'easeInOutQuad' });
        }

        setPhase('reveal');
      }, 950);
    } catch (e) {
      console.error('Error loading cards:', e);
      setPhase('selection');
    }
  };

  const revealCard = useCallback(
    (index: number) => {
      if (revealedCards.has(index)) return;
      const back = cardBackRefs.current[index];
      const front = cardFrontRefs.current[index];
      const container = cardContainerRefs.current[index];
      if (!back || !front || !container) return;

      const card = pulledCards[index];
      const tier = getRarityTier(card.rarity);

      animate(back, {
        rotateY: [0, 90],
        duration: 200,
        ease: 'easeInQuad',
        onComplete: () => {
          back.style.display = 'none';
          front.style.display = 'block';
          setRevealedCards((prev) => new Set(prev).add(index));
          animate(front, { rotateY: [-90, 0], duration: 200, ease: 'easeOutQuad' });
          if (tier === 'rare' || tier === 'ultra') {
            particleBurst(container, tier === 'ultra' ? '#b48aff' : '#ffd700', tier === 'ultra' ? 24 : 16);
          }
        },
      });
    },
    [revealedCards, pulledCards]
  );

  const reset = () => {
    setPulledCards([]);
    setRevealedCards(new Set());
    setPhase('selection');
  };

  const closeModal = () => {
    reset();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* White flash overlay */}
      <div
        ref={flashRef}
        className="fixed inset-0 bg-white z-[60] pointer-events-none"
        style={{ opacity: 0 }}
      />

      {/* Backdrop */}
      <div
        ref={backdropRef}
        onClick={closeModal}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        style={{ opacity: 0 }}
      />

      {/* Panel */}
      <div className="absolute inset-0 flex items-center justify-center p-4 pointer-events-none">
        <div
          ref={panelRef}
          className="bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto pointer-events-auto border border-white/10"
          style={{ opacity: 0 }}
        >
          {/* Header */}
          <div className="p-5 border-b border-white/10 flex items-center gap-4">
            <div className="w-12 h-12 bg-white/10 rounded-xl p-2 flex-shrink-0">
              <Image src={setLogo} alt={setName} width={48} height={48} className="w-full h-full object-contain" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-white font-bold text-xl">Open a Pack</h2>
              <p className="text-neutral-400 text-sm truncate">{setName}</p>
            </div>
            <button
              onClick={closeModal}
              className="text-neutral-400 hover:text-white p-2 transition-colors flex-shrink-0"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {phase === 'selection' && (
              <div className="text-center py-8 space-y-6">
                <div>
                  <p className="text-white text-lg font-semibold mb-5">Choose Pack Size</p>
                  <div className="flex flex-wrap justify-center gap-3">
                    {[3, 4, 5, 6, 7, 8].map((size) => (
                      <button
                        key={size}
                        onClick={() => setPackSize(size)}
                        className={`w-14 h-14 rounded-xl font-bold text-lg transition-all ${
                          packSize === size
                            ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-gray-900 shadow-lg shadow-orange-500/30 scale-110'
                            : 'bg-white/10 text-white hover:bg-white/20 hover:scale-105'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
                <button
                  onClick={openPack}
                  className="px-10 py-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl font-bold text-lg shadow-xl transition-all hover:scale-105 active:scale-95"
                >
                  Open Pack! ✨
                </button>
              </div>
            )}

            {phase === 'opening' && (
              <div className="text-center py-12 space-y-6">
                <div className="inline-block">
                  <PokeballSVG
                    ref={pokeballRef}
                    className="w-20 h-20 text-neutral-400"
                  />
                </div>
                <p className="text-white text-xl font-semibold">Opening your pack...</p>
              </div>
            )}

            {phase === 'reveal' && (
              <div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-6">
                  {pulledCards.map((card, i) => {
                    const tier = getRarityTier(card.rarity);
                    const style = RARITY_STYLE[tier];
                    return (
                      <div
                        key={card.id}
                        ref={(el) => { cardContainerRefs.current[i] = el; }}
                        style={{ opacity: 0, position: 'relative' }}
                        className="aspect-[2.5/3.5]"
                      >
                        <button
                          onClick={() => revealCard(i)}
                          className="w-full h-full"
                          disabled={revealedCards.has(i)}
                        >
                          <div
                            ref={(el) => { cardBackRefs.current[i] = el; }}
                            className="absolute inset-0 rounded-xl overflow-hidden cursor-pointer"
                            style={{ boxShadow: style.shadow, border: `2px solid ${style.border}` }}
                          >
                            <Image
                              src={BACK_IMAGE}
                              alt="card back"
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div
                            ref={(el) => { cardFrontRefs.current[i] = el; }}
                            className="absolute inset-0 rounded-xl overflow-hidden"
                            style={{ display: 'none' }}
                          >
                            <Image src={card.images.small} alt={card.name} fill className="object-cover" />
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                              <p className="text-white text-xs font-bold truncate">{card.name}</p>
                              {card.rarity && (
                                <p
                                  className={`text-xs ${
                                    tier === 'ultra'
                                      ? 'text-purple-300'
                                      : tier === 'rare'
                                      ? 'text-yellow-300'
                                      : 'text-neutral-400'
                                  }`}
                                >
                                  {card.rarity}
                                </p>
                              )}
                            </div>
                          </div>
                        </button>
                      </div>
                    );
                  })}
                </div>

                <div className="flex gap-3 justify-center">
                  <button
                    onClick={reset}
                    className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-semibold transition-all"
                  >
                    Open Another
                  </button>
                  <button
                    onClick={closeModal}
                    className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl font-semibold transition-all"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
