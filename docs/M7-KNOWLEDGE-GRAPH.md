# M7.10 — Cross-System Knowledge Graph

Pass 21 turns Oracle Mirror's separate evergreen libraries into one connected symbolic reference network without creating thin keyword pages, new AI calls, new user state, or a second client runtime.

## Goal

Oracle Mirror now contains substantial standalone reference systems for dreams, Tarot, runes, Lenormand, numerology, I Ching, astrology, palmistry, and grounded divination. Each system is useful by itself, but a visitor exploring a human theme such as change or relationships previously had to know which tradition to open next.

The Knowledge Graph adds a middle layer based on **human themes rather than occult taxonomy**. It helps a visitor compare how different systems frame a similar concern while explicitly warning that repeated symbolism is not independent scientific or supernatural confirmation.

## Public surface

The graph adds **11 canonical routes**:

- `/topics` — Mystical Themes hub.
- `/topics/love-relationships`
- `/topics/change-transition`
- `/topics/intuition-inner-life`
- `/topics/work-purpose`
- `/topics/protection-boundaries`
- `/topics/communication-truth`
- `/topics/creativity-confidence`
- `/topics/timing-cycles`
- `/topics/decisions-crossroads`
- `/topics/rest-renewal`

Each of the ten topic pages contains **eight curated cross-system links**, for **80 validated internal reference links** in total.

## Why ten topics instead of hundreds

The pass deliberately avoids automated combinations such as `/meaning/love-tarot-rune-moon-crystal` or other thin SEO pages. A knowledge hub only exists when it represents a useful recurring human question and can support a curated comparison across several mature Oracle Mirror references.

That keeps the graph:

- understandable to visitors;
- useful to search engines and answer engines;
- small enough to curate;
- resistant to doorway-page patterns;
- easy to regression-test.

## Theme examples

### Love & Relationships

Connects The Lovers, Lenormand Heart, the Palmistry Heart Line, Venus, relationship dreams, tea-leaf Heart, Numerology 2, and Gebo.

### Change & Transition

Connects Death and Wheel of Fortune Tarot, Dagaz, Lenormand Stork, palm-line breaks, travel dreams, tea-leaf Bridge, and the complete I Ching hexagram library.

### Intuition & Inner Life

Connects The High Priestess, The Moon, Perthro, the Mount of Moon, mystical dreams, the lunar guide, scrying methods, and Lenormand Moon.

### Decisions & Crossroads

Connects The Lovers as a values-choice card, Lenormand Crossroads, Raidho, palm forks, travel dreams, tea-leaf Fork, Numerology 1, and Advanced I Ching.

## Related-theme panels

Existing reference pages now receive a compact `Explore this theme in other traditions` panel when their path maps to one or more knowledge topics.

The panel is injected centrally rather than copied into every mature renderer. This keeps the implementation consistent across:

- Advanced Tarot;
- Runes;
- Lenormand;
- Advanced Numerology;
- Advanced I Ching;
- Astrology;
- Advanced Palmistry;
- Divination Reference Library;
- Dream Library pages passing through the existing V2 response transform;
- compatible legacy realm HTML where a topic mapping is useful.

Direct curated links take priority. Family-level deterministic fallbacks then provide sensible themes for pages that are not one of the 80 featured nodes.

The panel adds no JavaScript and no tracking.

## Route safety

The topic renderer is protected by `src/knowledge-graph-router.ts`.

Only `/topics` and the ten registered topic slugs are routed to the renderer. Unknown slugs return HTTP 404 before rendering, so `/topics/not-a-real-theme` cannot trigger an exception or a thin generated page.

## Link integrity

The regression suite does not merely validate URL shape. Every curated link is passed through its real production route handler:

- `handleRuneRoute`
- `handleLenormandRoute`
- `handleAdvancedTarotRoute`
- `handleAdvancedNumerologyRoute`
- `handleAdvancedIChingRoute`
- `handleAstrologyRoute`
- `handleAdvancedPalmistryRoute`
- `handleDivinationRoute`
- `handleDreamLibraryRoute`

A typo, renamed slug, missing card, or broken theme route therefore fails CI.

## SEO / GAIO

Pass 21 adds:

- 11 indexable canonical topic URLs;
- one descriptive hub instead of a generated keyword index;
- `CollectionPage` and `ItemList` schema;
- BreadcrumbList schema on topic pages;
- sitemap integration;
- `llms.txt` discovery;
- Realms-menu discovery;
- a homepage `Mystical Themes` discovery card;
- deterministic cross-links from mature reference pages;
- answer-first topic copy and explicit reflection prompts.

The links are designed to improve crawl depth and semantic context without making unsupported claims about relationships between traditions.

## Grounding standard

The graph repeats an important distinction throughout the experience:

> Similar symbols across different divination traditions can be culturally interesting or personally useful without becoming independent evidence for a supernatural mechanism.

For example, a heart appearing in Tarot-adjacent symbolism, Lenormand, palmistry, tea-leaf reading, and dream material does not make the shared metaphor scientifically predictive. The graph treats repeated motifs as comparative symbolic language.

## Runtime and privacy

The Knowledge Graph:

- uses no Workers AI;
- adds no feature API endpoint;
- uses no `localStorage` or `sessionStorage`;
- creates no telemetry stream;
- has no user input;
- has no perpetual animation;
- adds no client-side feature JavaScript;
- uses a single responsive stylesheet.

This makes the pass primarily an information-architecture and crawlability improvement rather than a runtime feature expansion.

## Files

- `src/knowledge-graph.ts` — ten-topic corpus, deterministic path mapping, SSR pages, related-theme injection, sitemap/LLM/home discovery.
- `src/knowledge-graph-router.ts` — strict public topic-route allowlist and safe 404 handling.
- `public/knowledge-graph.css` — responsive topic and injected-panel presentation.
- `tests/knowledge-graph.test.ts` — corpus, real-link resolution, SSR, 404, mapping, idempotence, V2 integration, and zero-runtime-cost regression coverage.
- `src/v2-index.ts` — central edge integration for topic routes and graph decoration.

## Acceptance criteria

- Exactly ten curated human-readable topic pages.
- Exactly eight real reference links per topic.
- Exactly 80 curated cross-system links.
- Every curated link resolves through a production handler with HTTP 200.
- Exactly 11 canonical `/topics` sitemap routes.
- Unknown topic slugs return 404.
- Topic pages are standalone SSR and indexable.
- Related-theme injection is accessible and idempotent.
- Existing reference renderers do not need duplicated graph markup.
- Sitemap and `llms.txt` augmentation are idempotent.
- Homepage/menu discovery is idempotent.
- No feature AI, API, storage, telemetry, or animation runtime is introduced.
- Full CI and production build are green before merge.
