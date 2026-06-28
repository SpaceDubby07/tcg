import { getPriceByCardId } from '@/lib/prices';

function formatUsd(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatEur(amount: number) {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatVariant(variant: string) {
  return variant
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (c) => c.toUpperCase())
    .trim();
}

function PriceRange({ low, mid, market }: { low?: number; mid?: number; market: number }) {
  if (low == null || mid == null) return null;
  const max = Math.max(market, mid, low) * 1.1 || 1;
  const pct = (v: number) => `${Math.min(100, (v / max) * 100)}%`;

  return (
    <div className="mt-3 space-y-2">
      <div className="relative h-1.5 rounded-full bg-white/10 overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-emerald-600/60 to-emerald-400/80"
          style={{ width: pct(market) }}
        />
      </div>
      <div className="flex justify-between text-[11px] text-neutral-500">
        <span>Low {formatUsd(low)}</span>
        <span>Mid {formatUsd(mid)}</span>
      </div>
    </div>
  );
}

export default function CardPrice({ cardId }: { cardId: string }) {
  const price = getPriceByCardId(cardId);
  if (!price?.usd && !price?.eur) return null;

  const updated = price.tcgplayerUpdated ?? price.cardmarketUpdated;
  const updatedLabel = updated
    ? new Date(updated).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : null;

  return (
    <section
      aria-label="Market value"
      className="mt-6 rounded-xl border border-white/10 bg-gradient-to-br from-white/[0.08] via-white/[0.04] to-transparent overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.24)]"
    >
      <div className="px-5 py-3.5 border-b border-white/8 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
          <h3 className="text-sm font-semibold text-white tracking-wide">Market Value</h3>
        </div>
        {updatedLabel && (
          <span className="text-[11px] text-neutral-500 whitespace-nowrap">Updated {updatedLabel}</span>
        )}
      </div>

      <div className={`p-5 gap-4 ${price.usd && price.eur ? 'grid sm:grid-cols-2' : ''}`}>
        {price.usd && (
          <div className="rounded-lg border border-emerald-500/15 bg-emerald-500/[0.06] p-4">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-400/90">
                TCGPlayer
              </span>
              <span className="text-[10px] text-neutral-500 uppercase tracking-wide">USD</span>
            </div>
            <div className="text-3xl font-bold text-white tabular-nums tracking-tight">
              {formatUsd(price.usd.market)}
            </div>
            <p className="text-neutral-500 text-xs mt-1.5">{formatVariant(price.usd.variant)}</p>
            <PriceRange low={price.usd.low} mid={price.usd.mid} market={price.usd.market} />
          </div>
        )}

        {price.eur && (
          <div className="rounded-lg border border-sky-500/15 bg-sky-500/[0.06] p-4">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-sky-400/90">
                Cardmarket
              </span>
              <span className="text-[10px] text-neutral-500 uppercase tracking-wide">EUR</span>
            </div>
            <div className="text-3xl font-bold text-white tabular-nums tracking-tight">
              {price.eur.trend != null ? formatEur(price.eur.trend) : price.eur.avg != null ? formatEur(price.eur.avg) : '—'}
            </div>
            <div className="text-neutral-500 text-xs mt-2 space-y-0.5">
              {price.eur.avg != null && price.eur.trend != null && (
                <p>Avg {formatEur(price.eur.avg)}</p>
              )}
              {price.eur.low != null && <p>Low {formatEur(price.eur.low)}</p>}
            </div>
          </div>
        )}
      </div>

      <p className="px-5 pb-4 text-[11px] leading-relaxed text-neutral-600">
        Rough market estimates sourced from TCGPlayer and Cardmarket via TCGdex. Not financial advice.
      </p>
    </section>
  );
}