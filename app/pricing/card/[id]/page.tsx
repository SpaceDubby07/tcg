import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getCardById } from '@/lib/cards';
import CardImagePanel from '@/app/components/CardImagePanel';
import CardPrice from '@/app/components/CardPrice';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const card = getCardById(id);
  if (!card) return { robots: { index: false, follow: false } };
  return {
    title: `${card.name} — Pricing Preview`,
    robots: { index: false, follow: false },
  };
}

export default async function PricingCardPreviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const card = getCardById(id);
  if (!card) notFound();

  const primaryType = card.types?.[0];

  return (
    <div className="min-h-screen bg-[#0f0f23]">
      <header className="sticky top-0 z-40 bg-black/50 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <Link
            href="/pricing"
            className="text-neutral-400 hover:text-white transition-colors flex items-center gap-2 text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Pricing Preview
          </Link>
          <span className="text-amber-400/80 text-xs font-medium px-2 py-1 rounded-full bg-amber-500/10 border border-amber-500/20">
            Preview only
          </span>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-5 gap-12">
          <div className="lg:col-span-2 space-y-6">
            <div className="sticky top-28 space-y-6">
              <CardImagePanel
                src={card.images.large}
                alt={card.name}
                type={primaryType}
              />
              <CardPrice cardId={card.id} />
            </div>
          </div>

          <div className="lg:col-span-3 space-y-6">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">{card.name}</h1>
              <div className="flex flex-wrap items-center gap-3 text-neutral-400 text-sm">
                {card.rarity && <span>{card.rarity}</span>}
                {card.number && <span>#{card.number}</span>}
                {card.hp && <span>HP {card.hp}</span>}
              </div>
            </div>

            {card.flavorText && (
              <p className="text-neutral-400 italic text-sm leading-relaxed">{card.flavorText}</p>
            )}

            <div className="flex flex-wrap gap-3 pt-4">
              <Link
                href={`/card/${card.id}`}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm transition-colors"
              >
                View live card page (no prices)
              </Link>
              <Link
                href="/pricing"
                className="px-4 py-2 text-neutral-400 hover:text-white text-sm transition-colors"
              >
                All preview samples
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}