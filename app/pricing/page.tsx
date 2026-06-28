import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllPrices } from '@/lib/prices';
import { getCardById, getCardSummaries } from '@/lib/cards';

export const metadata: Metadata = {
  title: 'Pricing Preview',
  robots: { index: false, follow: false },
};

const FEATURED_IDS = ['base1-4', 'base1-1', 'base1-15', 'base1-2', 'base1-10'];

export default function PricingPreviewPage() {
  const prices = getAllPrices();
  const pricedIds = Object.keys(prices);
  const pricedCount = pricedIds.length;
  const totalCards = getCardSummaries().length;

  const sampleIds = [
    ...FEATURED_IDS.filter((id) => prices[id]),
    ...pricedIds.filter((id) => !FEATURED_IDS.includes(id)).slice(0, 5),
  ].slice(0, 8);

  const samples = sampleIds.map((id) => {
    const card = getCardById(id);
    return card ? { id, name: card.name } : null;
  }).filter(Boolean) as { id: string; name: string }[];

  return (
    <div className="min-h-screen bg-[#0f0f23] py-12 px-4">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
          <p className="text-amber-200 text-sm font-semibold">Preview branch — not live on production card pages yet</p>
          <p className="text-amber-200/70 text-sm mt-1">
            Browse priced cards under <code className="text-amber-100">/pricing/card/[id]</code> before merging to master.
          </p>
        </div>

        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Pricing Preview</h1>
          <p className="text-neutral-400">
            Static market estimates sourced from{' '}
            <a href="https://tcgdex.dev/markets-prices" className="text-blue-400 hover:underline" target="_blank" rel="noreferrer">
              TCGdex
            </a>
            . Run <code className="text-neutral-300 bg-white/5 px-1.5 py-0.5 rounded">npm run fetch-prices</code> to refresh all cards,
            or <code className="text-neutral-300 bg-white/5 px-1.5 py-0.5 rounded">npm run fetch-prices:sample</code> for Base Set only.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/5 border border-white/10 rounded-xl p-5">
            <div className="text-neutral-500 text-xs mb-1">Cards with prices</div>
            <div className="text-3xl font-bold text-white">{pricedCount.toLocaleString()}</div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-5">
            <div className="text-neutral-500 text-xs mb-1">Total cards</div>
            <div className="text-3xl font-bold text-white">{totalCards.toLocaleString()}</div>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-bold text-white mb-4">Sample cards</h2>
          <div className="space-y-2">
            {samples.map((sample) => (
              <Link
                key={sample.id}
                href={`/pricing/card/${sample.id}`}
                className="flex items-center justify-between bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl px-5 py-3 transition-colors"
              >
                <span className="text-white font-medium">{sample.name}</span>
                <span className="text-xs text-emerald-400">
                  {prices[sample.id]?.usd
                    ? `$${prices[sample.id].usd!.market.toFixed(2)}`
                    : 'View price'}
                </span>
              </Link>
            ))}
          </div>
        </div>

        <Link href="/card" className="inline-flex text-neutral-400 hover:text-white text-sm transition-colors">
          ← Back to card collection
        </Link>
      </div>
    </div>
  );
}