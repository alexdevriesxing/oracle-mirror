# M7.8 — Expanded Dream Library

Oracle Mirror's Dream Library expands the original 15-symbol corpus into a 265-symbol reference and grounding system. The expansion is designed to improve both public dream-symbol discovery and Morpheus's ability to recognize concrete imagery in free-text dream descriptions without treating a symbol dictionary as diagnosis, proof, or prediction.

## Public surface

The library exposes 277 canonical dream URLs:

- `/dreams` — the full 265-symbol library hub.
- `/dreams/themes` — the semantic theme index.
- 10 theme hubs under `/dreams/themes/:theme`.
- 265 individual symbol guides under `/dreams/:symbol`.

The ten themes are Animals, People & Relationships, Places & Buildings, Nature & Weather, Objects & Symbols, Body & Appearance, Travel & Movement, Nightmares & Threats, Work/Money/Success, and Mystical & Spiritual Symbols.

The original 15 hand-written symbol entries remain the authoritative versions for their existing meanings. The additional 250 entries are layered behind them rather than replacing them.

## Semantic discovery

Related-symbol links no longer depend on neighbouring database positions. Related entries are selected from the same semantic theme and ranked using overlapping meaning language, so a wolf guide links to other animal material rather than whatever happened to follow it in an array.

Multiword retrieval accepts natural filler words. For example, `missed my flight` can resolve to the `missed-flight` symbol and `lost my luggage` can resolve to `lost-luggage`, while exact single-symbol matching remains available.

## Morpheus grounding

`/api/dream` is intercepted by the expanded Dream API while all unrelated application behaviour delegates to the preserved legacy app.

The conversation ritual remains compatible with the existing frontend:

1. Dream description.
2. Clarifying question one.
3. Clarifying question two.
4. Interpretation on the third user turn.

The expanded retrieval layer supplies at most six matched symbols as optional model context. It explicitly tells Morpheus that personal associations, emotional tone, memory, and waking context take priority over fixed dictionary meanings.

The API response exposes only a coarse `matchedSymbolCount`; it does not return matched symbol names as analytics-style metadata.

A successful request uses one Workers AI model call. The existing gateway-first/direct-retry infrastructure may make one fallback call only if the configured AI Gateway path itself fails.

## Safety and epistemic framing

Dream interpretation is presented as reflection and entertainment. Pages and model instructions do not claim that dream symbols:

- diagnose physical or mental-health conditions;
- prove trauma, abuse, pregnancy, criminal intent, or supernatural attack;
- literally predict death, illness, disaster, relationships, or future events;
- have one universal meaning shared by every dreamer.

Violent, sexual, frightening, grief-related, health-related, and bizarre dream content can be discussed symbolically without treating the imagery as evidence of waking intent or events. For recurrent nightmares or sleep disturbance causing real distress, Morpheus may gently suggest speaking with a qualified health professional.

## SEO / GAIO

The expanded surface adds:

- standalone server-rendered symbol and theme pages;
- canonical URLs;
- CollectionPage and ItemList schema for hubs;
- Article and BreadcrumbList schema for symbol guides;
- sitemap expansion;
- `llms.txt` discovery;
- homepage Dream Library card;
- Realms-menu Dream Library link;
- semantic internal linking between symbol pages and theme hubs.

## Architecture

To avoid destabilizing the mature monolithic Worker, Pass 19 introduces a compatibility wrapper:

- `src/index-legacy.ts` preserves the previous production application handler.
- `src/index.ts` becomes a thin wrapper that intercepts only `/api/dream` and `/dreams*`, re-exports the legacy public symbols, and delegates all other requests unchanged.
- `src/dream-expanded-data.ts` contains the 250 new symbol seeds and theme metadata.
- `src/dream-library.ts` combines legacy and expanded symbols, retrieval, theme grouping, and related-symbol logic.
- `src/dream-pages-v2.ts` renders the public dream library.
- `src/dream-api.ts` supplies the expanded Morpheus grounding path.

This keeps the expansion isolated while retaining compatibility for existing tests and imports such as `deriveDreamPhase`.

## Acceptance criteria

- 250 unique new seed symbols.
- 265 unique combined symbols.
- 10 semantic themes covering the entire corpus.
- 277 public dream-library sitemap URLs.
- Natural multiword phrase retrieval.
- Semantic related-symbol discovery.
- Existing two-question Morpheus ritual preserved.
- One successful AI model call per Dream API turn.
- No diagnosis, supernatural-certainty, or literal-prediction framing.
- Dependency audit, TypeScript, full tests, and production build green before merge.
