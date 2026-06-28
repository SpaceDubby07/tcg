import { cache } from 'react';
import fs from 'fs';
import path from 'path';
import type { CardPriceData } from '@/types/types';

export const getAllPrices = cache((): Record<string, CardPriceData> => {
  const filePath = path.join(process.cwd(), 'data', 'prices.json');
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8')) as Record<string, CardPriceData>;
  } catch {
    return {};
  }
});

export const getPriceByCardId = cache((id: string): CardPriceData | null => {
  return getAllPrices()[id] ?? null;
});