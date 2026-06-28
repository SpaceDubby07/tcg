/**
 * Fetches market prices from TCGdex and writes data/prices.json.
 *
 * Usage:
 *   node scripts/fetch-prices.mjs              # all cards (~20k, slow)
 *   node scripts/fetch-prices.mjs --set=base1    # one set only
 *   node scripts/fetch-prices.mjs --delay=150    # ms between requests (default 120)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const CARDS_DIR = path.join(ROOT, 'data', 'cards', 'en');
const OUT_FILE = path.join(ROOT, 'data', 'prices.json');
const API_BASE = 'https://api.tcgdex.net/v2/en/cards';

const args = process.argv.slice(2);
const setFilter = args.find((a) => a.startsWith('--set='))?.split('=')[1];
const delayMs = Number(args.find((a) => a.startsWith('--delay='))?.split('=')[1] ?? 120);

const VARIANT_PRIORITY = [
  'normal',
  'holofoil',
  'reverse',
  'reverseHolofoil',
  '1stEdition',
  '1stEditionHolofoil',
];

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function loadCardIds() {
  const files = fs.readdirSync(CARDS_DIR).filter((f) => f.endsWith('.json'));
  const ids = [];

  for (const file of files) {
    if (setFilter && file !== `${setFilter}.json`) continue;
    const cards = JSON.parse(fs.readFileSync(path.join(CARDS_DIR, file), 'utf-8'));
    for (const card of cards) {
      if (card.id) ids.push(card.id);
    }
  }

  return ids;
}

function extractTcgPlayer(tcgplayer) {
  if (!tcgplayer || typeof tcgplayer !== 'object') return null;

  for (const key of VARIANT_PRIORITY) {
    const variant = tcgplayer[key];
    if (variant?.marketPrice != null) {
      return {
        variant: key,
        market: variant.marketPrice,
        low: variant.lowPrice,
        mid: variant.midPrice,
      };
    }
  }

  for (const [key, value] of Object.entries(tcgplayer)) {
    if (key === 'unit' || key === 'updated') continue;
    if (value && typeof value === 'object' && value.marketPrice != null) {
      return {
        variant: key,
        market: value.marketPrice,
        low: value.lowPrice,
        mid: value.midPrice,
      };
    }
  }

  return null;
}

function extractCardmarket(cardmarket) {
  if (!cardmarket || typeof cardmarket !== 'object') return null;
  const { trend, avg, low } = cardmarket;
  if (trend == null && avg == null && low == null) return null;
  return { trend, avg, low };
}

function toPriceEntry(pricing) {
  if (!pricing) return null;
  const usd = extractTcgPlayer(pricing.tcgplayer);
  const eur = extractCardmarket(pricing.cardmarket);
  if (!usd && !eur) return null;

  return {
    tcgplayerUpdated: pricing.tcgplayer?.updated,
    cardmarketUpdated: pricing.cardmarket?.updated,
    ...(usd ? { usd } : {}),
    ...(eur ? { eur } : {}),
  };
}

async function fetchCardPrice(id) {
  const res = await fetch(`${API_BASE}/${id}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`TCGdex ${id}: HTTP ${res.status}`);
  const data = await res.json();
  return toPriceEntry(data.pricing);
}

async function main() {
  const ids = loadCardIds();
  if (!ids.length) {
    console.error('No card IDs found.');
    process.exit(1);
  }

  let existing = {};
  if (fs.existsSync(OUT_FILE)) {
    existing = JSON.parse(fs.readFileSync(OUT_FILE, 'utf-8'));
  }

  console.log(`Fetching prices for ${ids.length} cards (delay ${delayMs}ms)...`);
  let fetched = 0;
  let withPrice = 0;
  let skipped = 0;

  for (const id of ids) {
    try {
      const entry = await fetchCardPrice(id);
      fetched++;
      if (entry) {
        existing[id] = entry;
        withPrice++;
      } else {
        skipped++;
      }
    } catch (err) {
      console.error(`  ${id}: ${err.message}`);
    }

    if (fetched % 25 === 0) {
      console.log(`  ${fetched}/${ids.length} (${withPrice} with prices)`);
    }

    await sleep(delayMs);
  }

  fs.writeFileSync(OUT_FILE, JSON.stringify(existing, null, 2));
  console.log(`Done. ${withPrice} priced, ${skipped} without data. Wrote ${OUT_FILE}`);
}

main();