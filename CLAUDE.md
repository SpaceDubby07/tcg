# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # start dev server at http://localhost:3000
npm run build    # production build
npm run lint     # run ESLint
```

No test suite is configured.

## Architecture

This is a Next.js 16 (App Router) Pokémon TCG browser built with React 19, TypeScript, and Tailwind CSS v4.

### Data layer

All card and set data is stored as static JSON files — no database or external API calls at runtime:

- `data/cards/en/<setId>.json` — each file is an array of `Card` objects for one set (e.g. `base1.json`, `sm1.json`)
- `data/sets/en.json` — array of `Set` objects (metadata for all sets)

Card images are served from `images.pokemontcg.io` (configured in `next.config.ts` as an allowed remote image host).

### Shared utilities

`lib/cards.ts` exports `getAllCards()` and `getCardById()`, both wrapped in React `cache()` so file reads are deduplicated within a single server render. Server components that need cards should import from here rather than reading files directly.

### Routing

| Route | Description |
|---|---|
| `/` | Set listing — server component, loads `data/sets/en.json` |
| `/card` | All-cards view with name/rarity filters and infinite scroll |
| `/card/[id]` | Card detail page with prev/next navigation |
| `/sets/[setId]` | Cards for a specific set, loaded server-side by set ID |

### Server vs. client components

Server components read JSON files via Node `fs` directly. Client components are marked `'use client'` and handle interactive state (filters, pack opening modal, infinite scroll). The pack opening modal (`PackModal.tsx`) uses dynamic `import()` to load a set's card JSON on the client side when a pack is opened.

### Types

`types/types.ts` defines the two core interfaces — `Card` and `Set` — used throughout the app.

### Path alias

`@/` resolves to the project root (configured in `tsconfig.json`), so `@/types/types`, `@/lib/cards`, and `@/data/...` all work.
