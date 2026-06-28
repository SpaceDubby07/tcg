# Pokémon TCG Browser — Full Redesign Spec

**Date:** 2026-06-27  
**Scope:** Full visual and interaction redesign of the existing Next.js 16 app. No routing, data layer, or type changes. No build runs during development.

---

## Goals

- Mobile-first responsive design throughout
- Dark holographic TCG energy theme (deep navy-black, type-color neons, shimmer effects)
- anime.js for all animations — remove Framer Motion entirely
- Era-grouped set browser on the homepage
- Infinite scroll on set detail and all-cards pages
- Full cinematic pack opening experience

---

## Design System (`globals.css`)

Add to existing `@import 'tailwindcss'`:

### Type-color CSS custom properties
```css
:root {
  --color-fire: #ff6b35;
  --color-water: #4fc3f7;
  --color-grass: #66bb6a;
  --color-lightning: #ffd600;
  --color-psychic: #ce93d8;
  --color-fighting: #ef9a9a;
  --color-darkness: #9575cd;
  --color-metal: #b0bec5;
  --color-colorless: #cfd8dc;
  --color-dragon: #7e57c2;
  --color-fairy: #f48fb1;
}
```

### Keyframes
- `shimmer`: background-position sweep from -200% to 200% — used on holographic card borders
- `pokeball-spin`: full 360° rotation — used on loading states
- `particle-burst`: opacity + translate to random position — used on rare card reveals
- `float`: subtle Y oscillation (0 → -8px → 0, 3s ease-in-out infinite) — used on hero elements

### Base styles
- `body` background: `#0a0a0f`
- Scrollbar: thin, dark, with type-color thumb on hover
- Focus rings: type-color glow

---

## Layout / Navigation (`app/layout.tsx`)

### Structure
```
<nav> sticky top-0, z-50, bg-black/40 backdrop-blur-xl border-b border-white/10
  <div> max-w-7xl mx-auto px-4 py-3 flex items-center justify-between
    <!-- Logo -->
    <PokeballLogo /> + "TCG Browser" text (hidden on xs)
    <!-- Desktop links (hidden on mobile) -->
    <NavLinks /> Sets | Cards | Decks
    <!-- Mobile hamburger (visible on mobile only) -->
    <HamburgerButton />
  </div>
  <!-- Mobile drawer (slide down, AnimatePresence via anime.js height tween) -->
  <MobileDrawer /> — full-width links stacked
</nav>
```

### PokeballLogo component
- Pure SVG or CSS div: top half `bg-red-500`, bottom half `bg-white`, center circle `bg-neutral-900 border-2 border-white`, outer ring `border-2 border-neutral-700`
- On hover: `pokeball-spin` animation triggers (anime.js, 600ms ease-out)
- Links to `/`

### NavLinks
- Each link: `px-4 py-2 rounded-full text-sm font-semibold text-neutral-300 hover:text-white transition-colors`
- Active route: `bg-white/10 text-white ring-1 ring-white/20`

### Mobile drawer
- Full-width below nav, dark glass bg
- Links stacked vertically with 1px separator
- anime.js `height` tween: `0 → auto` open, `auto → 0` close

---

## Home / Sets Page

### Files changed
- `app/components/SetFilter.tsx` → replaced by `app/components/SetGrid.tsx`
- `app/components/SetCards.tsx` → replaced by `app/components/SetCard.tsx`
- `app/page.tsx` → update import from `SetList` → `SetList` stays but calls `SetGrid`
- `app/components/SetList.tsx` → update to call `SetGrid` instead of `SetFilter`

### SetGrid component (`app/components/SetGrid.tsx`)
- Client component (`'use client'`)
- Props: `sets: Set[], deckSetIds: string[]`
- State: `query: string`, `selectedSeries: string`

#### Series grouping
Map each set's `series` field to one of these display eras (in display order, newest first):
```
"Scarlet & Violet" → SV era
"Sword & Shield"   → SWSH era
"Sun & Moon"       → SM era
"XY"               → XY era
"Black & White"    → BW era
"HeartGold SoulSilver" → HGSS era
"Platinum"         → Platinum era
"Diamond & Pearl"  → DP era
"EX"               → EX era
"Neo"              → Neo era
"Base"             → Original era
(any other)        → Other
```

#### Era section layout
```
<section key={era}>
  <EraHeader era={era} setCount={n} yearRange="1999–2003" />
  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
    {sets.map(set => <SetCard key={set.id} set={set} />)}
  </div>
</section>
```

#### EraHeader
- Full-width bar: dark glass bg, era emoji + era name left, year range + count badge right
- anime.js: fade+translateY on mount (staggered per era, 60ms delay each)

#### Filtering
- Search input + series dropdown sit above all era sections
- When `query` or `selectedSeries` is active, filter sets across all eras and either:
  - If series filter active: only show that era section
  - If text search: collapse to a flat filtered grid (no era grouping)

### SetCard component (`app/components/SetCard.tsx`)
- Dark glass panel: `bg-white/5 backdrop-blur border border-white/10 rounded-2xl`
- Content:
  ```
  Set logo (Image, object-contain, white bg inset rounded-xl)
  Set name (text-white font-bold text-lg)
  Series badge (pill, text-xs)
  Card count + release year (grid-cols-2 text-neutral-400)
  Legality badge (green/red dot + text)
  [Open Pack 🎴] [View Cards] [View Decks?]
  ```
- Hover: anime.js `translateY(-4px)` + shimmer border sweep (background-position tween)
- Border on hover: `linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)` shimmer

---

## Set Detail Page (`/sets/[setId]`)

### Files changed
- `app/components/CardList.tsx` — rewrite to client component with infinite scroll

### CardList component
- Currently a server component that renders all cards. **Change to client component.**
- Server component in `app/sets/[setId]/page.tsx` fetches cards and passes as prop, or keep server-side data fetch and pass serialized array.
- Actually: keep data fetch in page.tsx as server component, pass `cards: Card[]` as prop to `CardList` which becomes a client component.

### New CardList behavior
- `CARDS_PER_PAGE = 40`
- `displayCount` state, IntersectionObserver sentinel div
- On new batch load: anime.js staggered entrance for newly visible cards (`translateY(20px) → 0`, `opacity 0 → 1`, 40ms stagger)
- Loading indicator: Pokéball spinner (CSS `pokeball-spin` keyframe)
- Header: set logo + name + series badge + total count

### Card item in grid
- Dark glass card: `bg-white/5 border border-white/10 rounded-xl overflow-hidden`
- Image fills card (aspect-ratio maintained)
- Hover: scale 1.05 + type-color glow shadow (anime.js)
- On hover overlay: card name + rarity (animated in with anime.js `opacity 0 → 1`)

---

## All Cards Page (`/card`)

### Files changed
- `app/components/CardFilter.tsx` — restyle, add type filter, anime.js

### Changes
- Filter bar: dark glass pill inputs (`bg-white/5 border border-white/10 rounded-full px-4 py-2 text-white`)
- Add **type filter** alongside existing rarity filter (maps to `card.types[0]`)
- Each type option shows colored dot matching `--color-<type>`
- Keep IntersectionObserver infinite scroll (existing logic is good)
- Card entrance animation: stagger anime.js on each new batch (same as set detail)
- "Showing X of Y" counter stays

---

## Card Detail Page (`/card/[id]`)

### Files changed
- `app/card/[id]/page.tsx` — add type-color background, pass type to client wrapper
- New `app/components/CardDetailClient.tsx` — client wrapper for animations

### Type-color background
- Read `card.types[0]` → map to CSS var → apply as `background: radial-gradient(ellipse at top-left, var(--color-type)/20%, transparent 60%)`
- Behind card image only (left column)

### Card image entrance
- Wrap image in a client component that runs anime.js on mount:
  ```js
  anime({ targets: ref.current, translateY: [-30, 0], opacity: [0, 1], scale: [0.92, 1], duration: 600, easing: 'easeOutExpo' })
  ```

### Attack energy costs
- Each energy type in `attack.cost[]` rendered as a colored circle (16×16px) using type-color map
- e.g. `"Fire"` → `bg-[var(--color-fire)]` orange circle with `F` or flame emoji

### HP display
- `HP {card.hp}` text color matches `var(--color-<type>)` instead of hardcoded `text-red-500`

### Prev/Next nav
- Show tiny card thumbnail (`.images.small`) in the prev/next link cards

---

## Pack Opening Modal (`app/components/PackModal.tsx`)

### Complete rewrite — remove all Framer Motion imports

### New animation timeline (anime.js)

```
Phase 1: Entry (onOpen)
  - Backdrop: opacity 0 → 0.85 (300ms)
  - Modal panel: scale 0.85→1, opacity 0→1 (400ms easeOutBack)

Phase 2: Pack selection screen
  - Pack size buttons: stagger translateY(10→0) + opacity (200ms, 40ms delay each)
  - "Open Pack!" button: subtle float animation (pokeball-spin variant)

Phase 3: Opening animation (after click)
  - Pokéball SVG appears center screen, spins (pokeball-spin, 800ms)
  - Screen flash: white overlay div opacity 0→0.8→0 (150ms)
  - Cards fan in from center: each card translateY(100→0) + rotate(-15→natural) staggered 80ms

Phase 4: Card reveal
  - Card backs glow by rarity:
    - Common: subtle white glow (box-shadow)
    - Uncommon: silver shimmer border
    - Rare/Holo Rare: gold shimmer border + pulse
    - Ultra Rare+: rainbow shimmer (hue-rotate keyframe) + stronger pulse
  - Click card to flip: rotateY 0→90 (200ms) → swap image src → rotateY -90→0 (200ms)
  - On rare flip: particle burst (20 absolutely-positioned divs, random angle 0-360°, random distance 60-120px, opacity 1→0, 600ms)

Phase 5: All revealed
  - Action buttons slide in from bottom: translateY(20→0) + opacity (300ms)
```

### Rarity tiers for glow
```ts
const RARITY_TIER = {
  common: ['Common'],
  uncommon: ['Uncommon'],
  rare: ['Rare', 'Rare Holo'],
  ultra: ['Rare Holo EX', 'Rare Holo GX', 'Rare Holo V', 'Rare VMAX', 'Rare Secret', 'Rare Ultra', 'Amazing Rare', 'Rare Shining', 'Rare Holo Star'],
}
```

### Remove
- All `framer-motion` imports
- `motion.div`, `AnimatePresence`, `motion.*` components

---

## New file: `lib/anime.ts`

Small helper to avoid repeating boilerplate:

```ts
import anime from 'animejs'

export function fadeIn(targets: string | Element | Element[], delay = 0) {
  return anime({ targets, opacity: [0, 1], translateY: [20, 0], duration: 500, delay, easing: 'easeOutExpo' })
}

export function staggerIn(targets: string | Element[], stagger = 40) {
  return anime({ targets, opacity: [0, 1], translateY: [20, 0], duration: 400, delay: anime.stagger(stagger), easing: 'easeOutExpo' })
}

export function flipCard(front: Element, back: Element, onMidpoint: () => void) {
  return anime.timeline()
    .add({ targets: back, rotateY: [0, 90], duration: 200, easing: 'easeInQuad' })
    .add({ begin: onMidpoint })
    .add({ targets: front, rotateY: [-90, 0], duration: 200, easing: 'easeOutQuad' })
}

export function particleBurst(container: Element, count = 20) {
  // Creates temporary divs, animates them outward, removes on complete
}
```

---

## Constraints

- No `npm run build` during development
- No new routes added
- No changes to `types/types.ts`, `lib/cards.ts`, or any JSON data files
- Framer Motion remains in `package.json` (don't uninstall) but zero imports remain after rewrite
- All components that use anime.js must be `'use client'`
- anime.js import: `import anime from 'animejs'` (already installed)

---

## File Change Summary

| File | Change |
|---|---|
| `app/globals.css` | Add CSS vars, keyframes, base styles |
| `app/layout.tsx` | New nav: Pokéball logo, frosted glass, mobile drawer |
| `app/components/SetList.tsx` | Update import: SetFilter → SetGrid |
| `app/components/SetFilter.tsx` | Replace with SetGrid.tsx (era grouping) |
| `app/components/SetCards.tsx` | Replace with SetCard.tsx (dark glass) |
| `app/components/PackModal.tsx` | Full rewrite, no Framer Motion, anime.js cinematic |
| `app/components/CardList.tsx` | Client component, infinite scroll, anime.js stagger |
| `app/components/CardFilter.tsx` | Restyle inputs, add type filter, anime.js stagger |
| `app/card/[id]/page.tsx` | Type-color bg, anime.js entrance wrapper |
| `lib/anime.ts` | New: shared anime.js helpers |

---

## Success Criteria

- [ ] No white elements visible on dark background (consistent dark theme)
- [ ] Sets page groups by era, search collapses to flat filtered grid
- [ ] Set detail page loads 40 cards then infinite scrolls remaining with anime.js stagger
- [ ] Pack modal has no Framer Motion imports; full cinematic plays on open
- [ ] Card detail shows type-color glow background
- [ ] Nav shows Pokéball logo and collapses to hamburger on mobile
- [ ] All interactive elements have anime.js hover/entrance animations
- [ ] No build runs required to verify (dev server only)
