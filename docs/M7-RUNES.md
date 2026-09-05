# M7.1 — Rune Casting

## Scope

Oracle Mirror's first M7 full realm adds a dedicated Elder Futhark experience rather than another homepage-only micro-ritual.

## Public routes

- `/runes` — three-rune casting hub plus all-rune reference index.
- `/runes/:slug` — 24 individual meaning pages, Fehu through Othala.

All 25 URLs are indexable and are added to the V2 sitemap transformation.

## Three-rune cast

The cast draws three distinct runes and assigns them to:

1. **Root** — the condition or influence underneath the situation.
2. **Present** — what deserves attention now.
3. **Path Ahead** — a symbolic direction to consider next, explicitly not a fixed prediction.

The browser uses local entropy for live casts. The selector is deterministic when supplied a fixed seed so regression tests can verify uniqueness and position order.

## Privacy and cost

- No question is requested.
- No user-authored text is collected.
- No Workers AI call is made.
- No feature API call is made.
- No account or remote persistence is required.
- Share cards contain only the three generated rune names and position labels.

## Historical framing

The realm distinguishes the historical Elder Futhark alphabet from modern rune-divination practice. The site does not claim that the contemporary three-rune spread or Oracle Mirror's interpretations reproduce one documented ancient fortune-telling system.

Each meaning page includes:

- rune name and glyph;
- transliteration/sound value;
- answer-first symbolic summary;
- constructive expression;
- challenge/shadow expression;
- reflection question;
- how to read the rune in each of the three cast positions;
- a historical/modern-practice note.

## SEO / GAIO

- Unique title, description, canonical, and index directives on every rune page.
- `Article` + `BreadcrumbList` structured data on individual rune pages.
- `WebApplication` + `ItemList` structured data on the hub.
- Homepage realm grid and Realms navigation discover `/runes` in server-rendered HTML.
- Rune URLs are added to `sitemap.xml`.
- Rune discovery is added to `llms.txt`.
- Static homepage feature-list metadata is extended with Elder Futhark rune casting.

## Share cards

The existing 1080×1920 share-card renderer accepts a new `runes` payload. Only three controlled rune names and position labels survive sanitization; arbitrary question, email, note, or other fields are dropped.

## Acceptance gate

The pass is accepted when:

- server and client corpora both contain exactly 24 matching unique runes;
- a cast always returns exactly three different runes;
- all 25 public rune URLs render successfully;
- unknown rune slugs return 404;
- sitemap expansion is idempotent;
- homepage discovery avoids the legacy `data-realm` click router;
- share payloads cannot include arbitrary private fields;
- typecheck, tests, dependency security gate, and production build all pass.
