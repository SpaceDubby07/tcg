// lib/cards.ts
import { cache } from 'react';
import fs from 'fs';
import path from 'path';
import { Card } from '@/types/types';

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

export const getCardById = cache((id: string) => {
  const cards = getAllCards();
  return cards.find((card) => card.id === id) || null;
});
