# M7.2 — Lenormand Realm

## Scope

Pass 13 adds Lenormand as a full Oracle Mirror realm using the standalone SSR pattern introduced by Rune Casting.

### Routes

- `/lenormand` — interactive three-card line.
- `/lenormand/:slug` — 36 individual card meaning pages, from Rider (#1) through Cross (#36).

The hub and all card pages are indexable and included in the sitemap. Unknown card slugs return 404.

## Reading model

The interactive line draws three distinct cards locally:

1. **Context** — conditions or influences surrounding the situation.
2. **Focus** — the center of gravity and the card that most deserves attention.
3. **Direction** — the direction of the current pattern if conditions continue.

The local combination engine also reads adjacent pairs. It does not invent a deterministic future; it explains how the second card modifies the first card's theme using the cards' keywords and light/neutral/shadow classification.

## Card corpus

`src/lenormand-data.ts` contains the fixed traditional sequence of 36 cards, including:

- number;
- slug;
- name;
- visual symbol;
- traditional playing-card association;
- light/neutral/shadow classification;
- keywords;
- answer-first core meaning;
- constructive expression;
- challenge expression;
- love/relationship application;
- work/money application;
- reflection question.

The Man and Woman cards are documented as traditional significators without forcing binary identity or relationship-role assumptions on modern users.

## Historical framing

The site distinguishes the historical card sequence from later divination practice. The 36-card sequence traces back to Johann Kaspar Hechtel's late-18th-century *Game of Hope*. Later cartomancy decks used the same sequence under the name of celebrated French cartomancer Marie Anne Lenormand after her death. Oracle Mirror therefore does not claim that Mlle Lenormand designed or personally used this exact deck.

## Architecture

- `src/lenormand-data.ts` — authoritative server-side card corpus.
- `src/lenormand-pages.ts` — standalone SSR hub/card pages, sitemap entries, homepage discovery, `llms.txt` discovery, and JSON-LD.
- `public/lenormand-core.js` — deterministic local draw and pair-combination logic.
- `public/lenormand.js` — accessible browser interaction, sharing, and coarse telemetry.
- `public/lenormand.css` — responsive presentation and reduced-motion support.
- `tests/lenormand.test.ts` — corpus, draw, route, schema, privacy, sitemap, history, and share-card regression coverage.

The client does not duplicate the full corpus. The server embeds a sanitized JSON representation of the card data into the hub page and the browser uses that local payload for the draw.

## Privacy and cost

Lenormand is deliberately local-first:

- no question field;
- no name or birth date;
- no feature API endpoint;
- no Workers AI call;
- no account requirement;
- no database/KV persistence;
- no reading text upload.

Only coarse generated result identifiers are added to the existing client telemetry layer.

## Social sharing

The existing 1080×1920 share-card renderer supports `kind: "lenormand"`.

Allowed share fields are limited to:

- the three generated card names;
- their Context / Focus / Direction labels.

Arbitrary question, name, email, notes, or other supplied fields are discarded by the sanitizer.

## SEO / GAIO

The pass adds 37 indexable URLs:

- 1 reading hub;
- 36 card meaning pages.

Each individual page includes:

- unique title and description;
- canonical URL;
- answer-first meaning;
- constructive/challenge interpretation;
- love and work applications;
- combination guidance;
- reflection question;
- historical note;
- previous/next internal links;
- `Article` JSON-LD;
- `BreadcrumbList` JSON-LD.

The hub includes `WebApplication` and `ItemList` JSON-LD. Sitemap and `llms.txt` augmentation are idempotent.

## Acceptance gate

Pass 13 is ready to merge only when the normal V2 gate is green:

1. dependency security;
2. TypeScript;
3. complete test suite;
4. production build.
