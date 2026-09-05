# M7.3 Advanced Tarot

Oracle Mirror V2 Pass 14 expands Tarot from the legacy Major Arcana question flow into a standalone 78-card reading and content system.

## Public routes

- `/tarot/advanced` — complete local 78-card reader.
- `/tarot/cards` — all 78 Tarot cards.
- `/tarot/cards/:slug` — individual card meaning pages.
- `/tarot/spreads` — spread guide hub.
- `/tarot/spreads/:slug` — individual spread guides.

This adds 88 sitemap URLs: the reader, library, 78 card pages, spread hub, and seven spread guides.

## Deck structure

`src/tarot-data.ts` contains the authoritative 78-card corpus:

- 22 Major Arcana.
- 14 Wands.
- 14 Cups.
- 14 Swords.
- 14 Pentacles.

Every card exposes upright, reversed, love, work, keywords, and a reflection question.

## Reader

`public/advanced-tarot-core.js` provides deterministic testable draws with a 35% reversal chance. A live session seeds from browser entropy. Cards never repeat within one spread.

Available layouts:

1. Past · Present · Future — 3 cards.
2. Love & Connection — 5 cards.
3. Career Compass — 5 cards.
4. Decision Mirror — 4 cards.
5. Horseshoe — 7 cards.
6. Celtic Cross — 10 cards.
7. Year Ahead — 12 cards.

`public/advanced-tarot.js` renders the reading locally. It does not call Workers AI or a feature API.

## Privacy

The advanced reader intentionally has no question input. A visitor may hold a question or situation in mind without entering it into Oracle Mirror.

The feature therefore collects no question, name, birthday, relationship name, email, or note.

The social-card sanitizer accepts only the spread name, generated card names, position labels, and orientations. It retains at most four cards on a vertical share card and discards arbitrary properties.

## Historical framing

Oracle Mirror distinguishes early Tarot from modern divination. Fifteenth-century Italian Tarot was a trick-taking card game; modern occult and fortune-telling associations developed later. The reader page links to the Metropolitan Museum of Art's historical overview.

## SEO / GAIO

The standalone pages provide:

- unique titles and descriptions;
- canonical URLs;
- answer-first card copy;
- upright and reversed sections;
- love and work applications;
- reflection prompts;
- previous/next card navigation;
- `ItemList` schema on the 78-card library;
- `Article` and `BreadcrumbList` schema on card and spread pages;
- sitemap and `llms.txt` discovery;
- homepage Realms-menu discovery for the advanced reader.

## Architecture

Advanced Tarot follows the standalone V2 route pattern used by Runes and Lenormand instead of adding another large page to the legacy SPA shell.

- `src/tarot-data.ts` — server corpus.
- `src/tarot-pages.ts` — SSR routes, sitemap, schema, discovery.
- `public/advanced-tarot-core.js` — local deterministic draw engine.
- `public/advanced-tarot.js` — interactive reader.
- `public/advanced-tarot.css` — presentation.
- `tests/advanced-tarot.test.ts` — corpus, route, privacy, sharing, sitemap, and draw regression coverage.
