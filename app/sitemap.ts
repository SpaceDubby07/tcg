import type { MetadataRoute } from 'next';
import { getAllCardIds } from '@/lib/cards';
import { getDeckSetIds } from '@/lib/decks';
import setsData from '@/data/sets/en.json';

const BASE = 'https://tcg.zaclark.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${BASE}/card`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE}/decks`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
  ];

  const setRoutes: MetadataRoute.Sitemap = setsData.map((set) => ({
    url: `${BASE}/sets/${set.id}`,
    lastModified: new Date(set.updatedAt),
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  const deckSetIds = new Set(getDeckSetIds());
  const deckRoutes: MetadataRoute.Sitemap = setsData
    .filter((s) => deckSetIds.has(s.id))
    .map((set) => ({
      url: `${BASE}/decks/${set.id}`,
      lastModified: new Date(set.updatedAt),
      changeFrequency: 'monthly',
      priority: 0.5,
    }));

  const cardRoutes: MetadataRoute.Sitemap = getAllCardIds().map((id) => ({
    url: `${BASE}/card/${id}`,
    changeFrequency: 'yearly',
    priority: 0.5,
  }));

  return [...staticRoutes, ...setRoutes, ...deckRoutes, ...cardRoutes];
}
