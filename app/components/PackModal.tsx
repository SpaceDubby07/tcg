'use client';

import { useState, useRef, useEffect, useCallback, forwardRef } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { animate } from 'animejs';
import type { Card } from '@/types/types';
import { particleBurst } from '@/lib/anime';

const BACK_IMAGE =
  'https://img2.clipart-library.com/28/pokemon-card-clipart/pokemon-card-clipart-4.gif';

const RARITY_STYLE = {
  common:   { shadow: 'none',                              border: 'rgba(255,255,255,0.15)', glow: 'transparent' },
  uncommon: { shadow: '0 0 16px rgba(192,192,192,0.5)',    border: 'rgba(192,192,192,0.6)',  glow: 'rgba(192,192,192,0.12)' },
  rare:     { shadow: '0 0 24px rgba(255,215,0,0.6)',      border: 'rgba(255,215,0,0.7)',    glow: 'rgba(255,215,0,0.10)' },
  ultra:    { shadow: '0 0 36px rgba(180,130,255,0.8)',    border: 'rgba(180,130,255,0.9)',  glow: 'rgba(180,130,255,0.16)' },
} as const;

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

function useBodyScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [active]);
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
    <svg ref={ref} viewBox="0 0 80 80" className={className} style={style} fill="none">
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
  const [mounted, setMounted] = useState(false);
  const [packSize, setPackSize] = useState(5);
  const [phase, setPhase] = useState<Phase>('selection');
  const [pulledCards, setPulledCards] = useState<Card[]>([]);
  const [revealedCards, setRevealedCards] = useState<globalThis.Set<number>>(new Set());

  const backdropRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const pokeballRef = useRef<SVGSVGElement>(null);
  const cardContainerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const cardBackRefs = useRef<(HTMLDivElement | null)[]>([]);
  const cardFrontRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => { setMounted(true); }, []);

  useBodyScrollLock(isOpen);

  useEffect(() => {
    if (!isOpen || !backdropRef.current || !panelRef.current) return;
    animate(backdropRef.current, { opacity: [0, 1], duration: 300, ease: 'outQuad' });
    animate(panelRef.current, { translateY: ['100%', '0%'], opacity: [0, 1], duration: 450, ease: 'outBack' });
  }, [isOpen]);

  useEffect(() => {
    if (phase !== 'reveal') return;
    const cards = cardContainerRefs.current.filter(Boolean) as HTMLElement[];
    if (!cards.length) return;
    setTimeout(() => {
      animate(cards, {
        translateY: [40, 0],
        opacity: [0, 1],
        delay: (_, i) => i * 70,
        duration: 450,
        ease: 'outBack',
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
        animate(pokeballRef.current, { rotate: [0, 720], duration: 900, ease: 'inOutQuad' });
      }

      setTimeout(() => {
        setPulledCards(selected);
        setRevealedCards(new Set());
        cardContainerRefs.current = new Array(selected.length).fill(null);
        cardBackRefs.current = new Array(selected.length).fill(null);
        cardFrontRefs.current = new Array(selected.length).fill(null);

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
        duration: 180,
        ease: 'inQuad',
        onComplete: () => {
          back.style.display = 'none';
          front.style.display = 'block';
          setRevealedCards((prev) => new Set(prev).add(index));
          animate(front, { rotateY: [-90, 0], duration: 220, ease: 'outQuad' });
          if (tier === 'rare' || tier === 'ultra') {
            particleBurst(
              container,
              tier === 'ultra' ? '#b48aff' : '#ffd700',
              tier === 'ultra' ? 24 : 16
            );
          }
        },
      });
    },
    [revealedCards, pulledCards]
  );

  const revealAll = useCallback(() => {
    pulledCards.forEach((_, i) => {
      if (!revealedCards.has(i)) {
        setTimeout(() => revealCard(i), i * 120);
      }
    });
  }, [pulledCards, revealedCards, revealCard]);

  const reset = () => {
    setPulledCards([]);
    setRevealedCards(new Set());
    setPhase('selection');
  };

  const closeModal = () => {
    reset();
    onClose();
  };

  if (!mounted || !isOpen) return null;

  const allRevealed = pulledCards.length > 0 && revealedCards.size === pulledCards.length;

  return createPortal(
    <div className="fixed inset-0 z-[9999]">
      {/* Backdrop */}
      <div
        ref={backdropRef}
        onClick={closeModal}
        className="absolute inset-0 bg-black/85 backdrop-blur-md"
        style={{ opacity: 0 }}
      />

      {/* Sheet: full-screen slide-up on mobile, centered dialog on desktop */}
      <div className="absolute inset-0 flex items-end sm:items-center justify-center pointer-events-none sm:p-6">
        <div
          ref={panelRef}
          className="
            w-full pointer-events-auto
            sm:max-w-2xl
            flex flex-col
            h-[92dvh] sm:h-auto sm:max-h-[88vh]
            rounded-t-3xl sm:rounded-2xl
            border border-white/10
            shadow-2xl shadow-black/60
            overflow-hidden
          "
          style={{
            opacity: 0,
            background: 'linear-gradient(160deg, #1e1040 0%, #0f0820 50%, #080618 100%)',
          }}
        >
          {/* Drag handle — mobile only */}
          <div className="sm:hidden flex justify-center pt-3 pb-1 flex-shrink-0">
            <div className="w-10 h-1 rounded-full bg-white/20" />
          </div>

          {/* Header */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-white/10 flex-shrink-0">
            <div className="w-10 h-10 rounded-xl bg-white/10 p-1.5 flex items-center justify-center flex-shrink-0">
              <Image
                src={setLogo}
                alt={setName}
                width={40}
                height={40}
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-white font-bold text-base leading-tight">Open a Pack</h2>
              <p className="text-neutral-400 text-xs truncate">{setName}</p>
            </div>
            <button
              onClick={closeModal}
              aria-label="Close"
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/15 text-neutral-400 hover:text-white transition-colors cursor-pointer flex-shrink-0"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Scrollable body */}
          <div className="flex-1 overflow-y-auto overscroll-contain">

            {/* Phase: Selection */}
            {phase === 'selection' && (
              <div className="flex flex-col items-center justify-center min-h-[55vh] sm:min-h-0 p-6 gap-8">
                <div className="text-center space-y-1.5">
                  <h3 className="text-white text-2xl font-bold">Choose Pack Size</h3>
                  <p className="text-neutral-500 text-sm">How many cards to draw?</p>
                </div>

                <div className="grid grid-cols-3 gap-3 w-full max-w-xs">
                  {[3, 4, 5, 6, 7, 8].map((size) => (
                    <button
                      key={size}
                      onClick={() => setPackSize(size)}
                      className={`w-16 h-16 rounded-2xl font-bold text-xl transition-all cursor-pointer select-none ${
                        packSize === size
                          ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-gray-900 shadow-lg shadow-orange-500/40 scale-105'
                          : 'bg-white/10 border border-white/10 text-white hover:bg-white/20 hover:border-white/25 active:scale-95'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>

                <button
                  onClick={openPack}
                  className="w-full max-w-xs h-14 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-400 hover:to-purple-500 text-white font-bold text-lg shadow-xl shadow-purple-900/50 transition-all active:scale-95 cursor-pointer"
                >
                  Open Pack
                </button>
              </div>
            )}

            {/* Phase: Opening */}
            {phase === 'opening' && (
              <div className="flex flex-col items-center justify-center min-h-[55vh] sm:min-h-0 gap-6 p-6 sm:py-16">
                <PokeballSVG ref={pokeballRef} className="w-28 h-28 text-neutral-500" />
                <p className="text-white text-xl font-semibold">Opening your pack...</p>
              </div>
            )}

            {/* Phase: Reveal */}
            {phase === 'reveal' && (
              <div className="p-4 pb-2 space-y-3">
                <div className="flex items-center justify-between px-1">
                  <p className="text-neutral-400 text-sm">
                    {allRevealed
                      ? `${pulledCards.length} cards pulled!`
                      : `Tap to reveal · ${revealedCards.size} / ${pulledCards.length}`}
                  </p>
                  {!allRevealed && (
                    <button
                      onClick={revealAll}
                      className="text-xs text-purple-400 hover:text-purple-300 font-semibold transition-colors cursor-pointer px-3 py-1.5"
                    >
                      Reveal All
                    </button>
                  )}
                </div>

                <div
                  className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3"
                  style={{ perspective: '1200px' }}
                >
                  {pulledCards.map((card, i) => {
                    const tier = getRarityTier(card.rarity);
                    const s = RARITY_STYLE[tier];
                    return (
                      <div
                        key={card.id}
                        ref={(el) => { cardContainerRefs.current[i] = el; }}
                        style={{ opacity: 0, position: 'relative', perspective: '800px' }}
                        className="aspect-[2.5/3.5]"
                      >
                        <button
                          onClick={() => revealCard(i)}
                          disabled={revealedCards.has(i)}
                          aria-label={revealedCards.has(i) ? card.name : 'Tap to reveal'}
                          className="w-full h-full cursor-pointer disabled:cursor-default block"
                        >
                          {/* Card back */}
                          <div
                            ref={(el) => { cardBackRefs.current[i] = el; }}
                            className="absolute inset-0 rounded-xl overflow-hidden"
                            style={{ boxShadow: s.shadow, border: `2px solid ${s.border}` }}
                          >
                            <Image src={BACK_IMAGE} alt="card back" fill className="object-cover" />
                            {s.glow !== 'transparent' && (
                              <div
                                className="absolute inset-0"
                                style={{
                                  background: `radial-gradient(ellipse at center, ${s.glow} 0%, transparent 70%)`,
                                }}
                              />
                            )}
                          </div>

                          {/* Card front */}
                          <div
                            ref={(el) => { cardFrontRefs.current[i] = el; }}
                            className="absolute inset-0 rounded-xl overflow-hidden"
                            style={{ display: 'none', boxShadow: s.shadow, border: `2px solid ${s.border}` }}
                          >
                            <Image src={card.images.small} alt={card.name} fill className="object-cover" />
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                              <p className="text-white text-xs font-bold leading-tight truncate">{card.name}</p>
                              {card.rarity && (
                                <p
                                  className={`text-[10px] mt-0.5 font-medium ${
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
              </div>
            )}
          </div>

          {/* Footer — pinned, only shown during reveal */}
          {phase === 'reveal' && (
            <div className="flex gap-3 p-4 border-t border-white/10 flex-shrink-0">
              <button
                onClick={reset}
                className="flex-1 h-12 rounded-xl bg-white/10 border border-white/10 hover:bg-white/20 text-white font-semibold text-sm transition-colors cursor-pointer"
              >
                Open Another
              </button>
              <button
                onClick={closeModal}
                className="flex-1 h-12 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white font-bold text-sm transition-all cursor-pointer"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
