'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { Card } from '@/types/types';

interface PackOpeningModalProps {
  isOpen: boolean;
  onClose: () => void;
  setId: string;
  setName: string;
  setLogo: string;
}

export default function PackOpeningModal({
  isOpen,
  onClose,
  setId,
  setName,
  setLogo,
}: PackOpeningModalProps) {
  const [packSize, setPackSize] = useState(5);
  const [isOpening, setIsOpening] = useState(false);
  const [pulledCards, setPulledCards] = useState<Card[]>([]);
  const [revealedCards, setRevealedCards] = useState<Set<number>>(
    new Set()
  );
  const [showCards, setShowCards] = useState(false);

  const openPack = async () => {
    setIsOpening(true);
    setShowCards(false);
    setRevealedCards(new Set());

    try {
      const cardsData = await import(`@/data/cards/en/${setId}.json`);
      const allCards = cardsData.default; // It's directly an array!

      // Randomly select cards from the set
      const shuffled = [...allCards].sort(() => Math.random() - 0.5);
      const selectedCards = shuffled.slice(0, packSize);

      // Simulate pack opening delay
      setTimeout(() => {
        setPulledCards(selectedCards);
        setShowCards(true);
        setIsOpening(false);
      }, 2000);
    } catch (error) {
      console.error('Error loading cards:', error);
      setIsOpening(false);
    }
  };

  const revealCard = (index: number) => {
    setRevealedCards((prev) => new Set(prev).add(index));
  };

  const resetModal = () => {
    setPulledCards([]);
    setRevealedCards(new Set());
    setShowCards(false);
  };

  const closeModal = () => {
    resetModal();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="bg-linear-to-br from-slate-900 via-purple-900 to-slate-900 rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto pointer-events-auto">
              {/* Header */}
              <div className="relative p-6 border-b border-white/10">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-white rounded-xl shadow-lg flex items-center justify-center p-2">
                    <Image
                      src={setLogo}
                      alt={setName}
                      width={64}
                      height={64}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-white mb-1">
                      Open a Pack
                    </h2>
                    <p className="text-gray-300 text-sm">{setName}</p>
                  </div>
                  <button
                    onClick={closeModal}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                {!showCards ? (
                  <div className="text-center py-12">
                    {/* Pack Size Selection */}
                    {!isOpening && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                      >
                        <div>
                          <label className="md:block text-white text-lg font-semibold mb-4">
                            Choose Pack Size
                          </label>
                          <div className="md:flex flex flex-wrap justify-center gap-3">
                            {[3, 4, 5, 6, 7, 8].map((size) => (
                              <button
                                key={size}
                                onClick={() => setPackSize(size)}
                                className={`px-6 py-3 rounded-xl font-bold transition-all transform hover:scale-105 ${
                                  packSize === size
                                    ? 'bg-linear-to-r from-yellow-400 to-orange-500 text-gray-900 shadow-lg'
                                    : 'bg-white/10 text-white hover:bg-white/20'
                                }`}
                              >
                                {size}
                              </button>
                            ))}
                          </div>
                        </div>

                        <button
                          onClick={openPack}
                          className="px-8 py-4 bg-linear-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl font-bold text-lg shadow-xl transform hover:scale-105 transition-all"
                        >
                          Open Pack! ✨
                        </button>
                      </motion.div>
                    )}

                    {/* Opening Animation */}
                    {isOpening && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-6"
                      >
                        <motion.div
                          animate={{
                            rotate: [0, 10, -10, 10, 0],
                            scale: [1, 1.1, 1, 1.1, 1],
                          }}
                          transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            ease: 'easeInOut',
                          }}
                          className="text-6xl"
                        >
                          🎴
                        </motion.div>
                        <p className="text-white text-xl font-semibold">
                          Opening your pack...
                        </p>
                        <div className="flex justify-center gap-2">
                          {[0, 1, 2].map((i) => (
                            <motion.div
                              key={i}
                              animate={{ y: [0, -20, 0] }}
                              transition={{
                                duration: 0.6,
                                repeat: Infinity,
                                delay: i * 0.2,
                              }}
                              className="w-3 h-3 bg-white rounded-full"
                            />
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </div>
                ) : (
                  <div>
                    {/* Cards Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
                      {pulledCards.map((card, index) => (
                        <motion.div
                          key={card.id}
                          initial={{
                            opacity: 0,
                            scale: 0,
                            rotateY: 180,
                          }}
                          animate={{
                            opacity: 1,
                            scale: 1,
                            rotateY: 0,
                          }}
                          transition={{
                            delay: index * 0.15,
                            duration: 0.5,
                            type: 'spring',
                            stiffness: 200,
                          }}
                          className="relative"
                        >
                          <button
                            onClick={() => revealCard(index)}
                            className="w-full aspect-[2.5/3.5] relative group"
                            disabled={revealedCards.has(index)}
                          >
                            <AnimatePresence mode="wait">
                              {!revealedCards.has(index) ? (
                                <motion.div
                                  key="back"
                                  initial={{ rotateY: 0 }}
                                  exit={{ rotateY: 90 }}
                                  transition={{ duration: 0.3 }}
                                  className="absolute inset-0 bg-linear-to-br from-red-600 via-red-700 to-red-900 rounded-lg shadow-xl flex items-center justify-center border-4 border-yellow-400 group-hover:scale-105 transition-transform"
                                >
                                  <div className="text-center">
                                    <div className="text-4xl mb-2">
                                      ⚡
                                    </div>
                                    <p className="text-white font-bold text-xs">
                                      Click to Reveal
                                    </p>
                                  </div>
                                </motion.div>
                              ) : (
                                <motion.div
                                  key="front"
                                  initial={{ rotateY: -90 }}
                                  animate={{ rotateY: 0 }}
                                  transition={{ duration: 0.3 }}
                                  className="absolute inset-0 bg-white rounded-lg shadow-2xl overflow-hidden"
                                >
                                  <Image
                                    src={card.images.small}
                                    alt={card.name}
                                    fill
                                    className="object-cover"
                                  />
                                  <div className="absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-transparent" />
                                  <div className="absolute bottom-0 left-0 right-0 p-2 text-white">
                                    <p className="text-xs font-bold truncate">
                                      {card.name}
                                    </p>
                                    {card.rarity && (
                                      <p className="text-xs text-yellow-300">
                                        {card.rarity}
                                      </p>
                                    )}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </button>
                        </motion.div>
                      ))}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 justify-center">
                      <button
                        onClick={resetModal}
                        className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-semibold transition-all"
                      >
                        Open Another Pack
                      </button>
                      <button
                        onClick={closeModal}
                        className="px-6 py-3 bg-linear-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl font-semibold transition-all"
                      >
                        Done
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
