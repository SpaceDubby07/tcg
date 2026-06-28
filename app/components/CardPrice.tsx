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
  return new Intl.NumberFormat('en-EU', {
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

export default function CardPrice({ cardId }: { cardId: string }) {
  const price = getPriceByCardId(cardId);

  if (!price) {
    return (
      <div className="bg-white/5 border border-white/10 rounded-xl p-5">
        <h3 className="text-base font-bold text-white mb-2">Market Price</h3>
        <p className="text-neutral-500 text-sm">No market data available for this card.</p>
      </div>
    );
  }

  const updated = price.tcgplayerUpdated ?? price.cardmarketUpdated;

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-4">
      <div>
        <h3 className="text-base font-bold text-white">Market Price</h3>
        <p className="text-neutral-500 text-xs mt-1">Rough estimates from TCGPlayer &amp; Cardmarket via TCGdex</p>
      </div>

      {price.usd && (
        <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-4">
          <div className="text-emerald-400 text-xs font-semibold uppercase tracking-wide mb-1">TCGPlayer (USD)</div>
          <div className="text-3xl font-bold text-white">{formatUsd(price.usd.market)}</div>
          <div className="text-neutral-400 text-xs mt-2 space-y-0.5">
            <div>{formatVariant(price.usd.variant)} printing</div>
            {price.usd.low != null && price.usd.mid != null && (
              <div>Low {formatUsd(price.usd.low)} · Mid {formatUsd(price.usd.mid)}</div>
            )}
          </div>
        </div>
      )}

      {price.eur && (
        <div className="rounded-lg bg-blue-500/10 border border-blue-500/20 p-4">
          <div className="text-blue-400 text-xs font-semibold uppercase tracking-wide mb-1">Cardmarket (EUR)</div>
          {price.eur.trend != null && (
            <div className="text-2xl font-bold text-white">{formatEur(price.eur.trend)}</div>
          )}
          <div className="text-neutral-400 text-xs mt-2 space-y-0.5">
            {price.eur.avg != null && <div>Avg {formatEur(price.eur.avg)}</div>}
            {price.eur.low != null && <div>Low {formatEur(price.eur.low)}</div>}
          </div>
        </div>
      )}

      {updated && (
        <p className="text-neutral-600 text-xs">
          Last updated {new Date(updated).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </p>
      )}
    </div>
  );
}