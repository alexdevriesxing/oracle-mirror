# M7.5 — Advanced I Ching

Advanced I Ching is the standalone V2 expansion of Oracle Mirror's existing `/iching-oracle` experience. The classic route remains available for an AI interpretation; the new `/iching` namespace provides a fully local three-coin cast plus an indexable reference library.

## Routes

- `/iching` — six-line three-coin casting interface.
- `/iching/hexagrams` — all 64 hexagrams in the received King Wen sequence.
- `/iching/hexagrams/:number-slug` — one indexable hexagram meaning page.
- `/iching/hexagrams/:number` — permanent redirect to the canonical number + slug URL.
- `/iching/trigrams` — the eight trigram hub.
- `/iching/trigrams/:slug` — individual trigram guide.
- `/iching/coin-method` — explanation of the three-coin method, line values, changing lines, and transformed hexagrams.

The new namespace contributes 76 canonical sitemap URLs: one reader, one hexagram hub, 64 hexagram pages, one trigram hub, eight trigram pages, and one coin-method guide.

## Casting model

`public/advanced-iching-core.js` performs the complete cast locally.

1. Three virtual coins are thrown six times.
2. Each coin contributes 2 or 3 with equal probability.
3. Each throw therefore resolves to 6, 7, 8, or 9.
4. Lines are constructed from bottom to top.
5. 6 = old yin, changing to yang.
6. 7 = young yang, stable.
7. 8 = young yin, stable.
8. 9 = old yang, changing to yin.
9. Changing lines are flipped to calculate a transformed hexagram.

The browser and server share the same eight-trigram / King Wen lookup structure. Deterministic seeded helpers exist for tests; normal use receives browser entropy.

## Data model

`src/iching-data.ts` contains:

- all eight trigrams with Chinese name, pinyin, Unicode trigram glyph, line pattern, image, and concise symbolic quality;
- the complete 8 × 8 King Wen lookup matrix;
- 64 unique hexagrams with number, canonical slug, common English label, Chinese name, pinyin, Unicode hexagram symbol, upper/lower trigrams, keywords, and original Oracle Mirror reflection copy.

The short interpretations are original summaries. Oracle Mirror does not reproduce the Judgment, line statements, or a copyrighted modern I Ching translation.

## Historical framing

The product deliberately separates several layers that are often collapsed together online:

- the long textual history of the Zhouyi / I Ching;
- the received 64-hexagram ordering conventionally called the King Wen sequence;
- the eight trigrams that form the six-line figures;
- older yarrow-stalk divination procedures;
- the later and more convenient three-coin method.

The coin reader is therefore presented as a practical later casting method rather than the earliest attested procedure. The coin method also has different changing-line probabilities from the yarrow-stalk method, so Oracle Mirror does not claim the two are statistically identical.

## Privacy and cost

Advanced I Ching requests no typed question. It does not collect a name, birth date, notes, email, or other reading input.

- zero feature API calls;
- zero Workers AI calls;
- no localStorage/sessionStorage persistence;
- no question sent to telemetry;
- no server-side reading record.

Telemetry is limited to generated product state such as whether the result was stable or changing and the generated hexagram numbers.

## Sharing

`public/share-card-core.js` accepts an `iching` payload containing only:

- primary generated hexagram label;
- primary Unicode symbol;
- transformed generated hexagram label when present;
- valid changing-line positions 1–6.

Arbitrary question, name, date, email, notes, and other extras are discarded. The existing 1080 × 1920 social-card renderer handles native sharing and PNG fallback.

## SEO / GAIO

`src/iching-pages.ts` provides:

- unique metadata and canonical URLs;
- answer-first hexagram copy;
- upper/lower trigram internal linking;
- WebApplication schema on the reader;
- ItemList schema on library hubs;
- Article + BreadcrumbList schema on detail pages;
- sitemap augmentation;
- `llms.txt` augmentation;
- homepage and Realms-menu discovery.

The standalone pages are routed directly by `src/v2-index.ts` and do not enter the legacy SPA router.

## Accessibility / performance

- Native buttons and links are used for interactions.
- Result updates use an ARIA live region.
- Focus-visible styles are explicit.
- Reduced-motion preferences remove the artificial casting wait and animation transitions.
- The reader loads only its small client core/UI modules; reference pages are server-rendered and need no feature JavaScript.

## Regression coverage

`tests/advanced-iching.test.ts` verifies:

- exactly 64 unique King Wen numbers and eight trigram patterns;
- every server hexagram's upper/lower composition against the full matrix;
- stable and changing 6/7/8/9 semantics;
- primary → transformed hexagram calculation;
- deterministic seeded casts and valid output bounds;
- canonical redirects and 404s;
- all 76 sitemap URLs;
- SSR/schema/history content;
- privacy-safe share sanitization;
- zero feature API calls / zero private-input persistence;
- reduced-motion styling.
