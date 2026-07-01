// lib/cards.ts
import { cache } from 'react';
import fs from 'fs';
import path from 'path';
import { Card, CardSummary } from '@/types/types';

export const getAllCards = cache(() => {
  const dir = path.join(process.cwd(), 'data/cards/en');
  const files = fs.readdirSync(dir);

  const allCards: Card[] = files.flatMap((file) => {
    const filePath = path.join(dir, file);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    return Array.isArray(data) ? data : [];
  });

  return allCards;
});

export const getCardSummaries = cache((): CardSummary[] => {
  return getAllCards().map((card) => ({
    id: card.id,
    name: card.name,
    rarity: card.rarity,
    types: card.types,
    images: card.images,
  }));
});

// Card ids are `<setId>-<number>` and set ids never contain a dash, so the
// substring before the first dash is always the set id.
export function setIdFromCardId(id: string): string {
  const dash = id.indexOf('-');
  return dash === -1 ? id : id.slice(0, dash);
}

// Loads only the card's own set file rather than the entire dataset, so a
// single card page never pulls all ~20k cards into memory.
export const getCardById = cache((id: string) => {
  const setCards = getCardsForSet(setIdFromCardId(id));
  return setCards.find((card) => card.id === id) || null;
});

// Ids only — used by generateStaticParams. Avoids materializing full card
// objects for all sets during the build.
export const getAllCardIds = cache((): string[] => {
  const dir = path.join(process.cwd(), 'data/cards/en');
  return fs.readdirSync(dir).flatMap((file) => {
    const data = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf-8'));
    return Array.isArray(data) ? data.map((c: Card) => c.id) : [];
  });
});

export const getCardsForSet = cache((setId: string): Card[] => {
  const filePath = path.join(process.cwd(), 'data', 'cards', 'en', `${setId}.json`);
  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
});
