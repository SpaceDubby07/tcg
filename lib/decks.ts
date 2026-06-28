import { cache } from 'react';
import fs from 'fs';
import path from 'path';
import { Deck } from '@/types/types';

export const getDecksForSet = cache((setId: string): Deck[] => {
  const filePath = path.join(process.cwd(), 'data', 'decks', 'en', `${setId}.json`);
  if (!fs.existsSync(filePath)) return [];
  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
});

export const getDeckSetIds = cache((): string[] => {
  const dir = path.join(process.cwd(), 'data', 'decks', 'en');
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.json'))
    .map((f) => f.replace('.json', ''));
});
