# Oracle Mirror V2 — M7.11 Universal Reference Search

## Goal

Oracle Mirror now contains hundreds of standalone evergreen reference pages. M7.11 adds one fast search surface that makes the entire reference collection discoverable without introducing a third-party search service, a server-side query log, or a large search payload on every page.

The public entry point is:

- `/search`

## Indexed surface

The search index is generated from the same authoritative data modules that power the public reference libraries.

| System | Indexed pages |
| --- | ---: |
| Runes | 25 |
| Lenormand | 37 |
| Advanced Tarot | 88 |
| Advanced Numerology | 21 |
| Advanced I Ching | 76 |
| Astrology & Lunar | 43 |
| Advanced Palmistry | 45 |
| Dream Library | 277 |
| Divination Reference Library | 122 |
| Cross-System Mystical Themes | 11 |
| **Total** | **745** |

The regression suite requires all 745 entries to remain unique and checks the per-system totals individually.

## Search architecture

### Server side

`src/reference-search.ts` builds a static `ReferenceSearchEntry[]` from the existing corpora. Entries contain only public reference data:

- canonical/reference path;
- title;
- system;
- glyph;
- public summary;
- public keywords;
- coarse cross-system theme tags.

The resulting array is embedded into `/search` as application JSON. It is not added to every Oracle Mirror response.

The Worker serves `/search` as standalone SSR with:

- canonical metadata;
- a WebApplication schema node;
- system and theme filter controls;
- the local static index;
- the dedicated search client.

### Browser side

`public/reference-search-core.js` provides normalization, filtering, weighted ranking, and result-path normalization.

Ranking favors:

1. exact title matches;
2. title prefixes and title phrases;
3. public keywords;
4. Mystical Theme membership;
5. system name;
6. canonical/reference path;
7. public summary text.

All query tokens must be present somewhere in the candidate's public search fields. Results are then ranked by the weighted score.

`public/reference-search.js` owns the actual interaction. Search results are rendered with DOM `textContent` rather than interpolating the query into raw HTML.

## Canonical route integrity

The search regression suite resolves every clickable result through its real production route handler and requires HTTP 200 HTML.

This test caught a real integration defect during the pass: initial I Ching entries used an unnumbered route such as `/iching/hexagrams/creative`, while the production library intentionally uses numbered canonical paths such as `/iching/hexagrams/1-creative`.

The result-path normalizer now preserves the production I Ching convention before the link is rendered. The entire 745-result route sweep passes.

## Privacy model

This is intentionally stricter than a conventional web search implementation.

### No search API

The browser does not POST or GET the typed phrase to a search endpoint. There is no `/api/search` and no third-party search provider.

### No raw query telemetry

The feature does not send the typed phrase to Analytics Engine, `dataLayer`, `sendBeacon`, or another telemetry surface.

### No persistent query storage

The feature does not use:

- `localStorage`;
- `sessionStorage`;
- IndexedDB.

### URL fragments instead of query strings

When search state needs to survive navigation history, it is stored after `#`:

`/search#q=moon&system=Astrology`

Fragments are handled by the browser and are not part of the HTTP request sent to the Worker. This avoids turning the server access log into a raw search-query log merely to preserve UI state.

The canonical page remains `/search`.

## Global access

Reference-enabled Oracle Mirror HTML receives a small search launcher and `public/reference-search-shortcut.js`.

Supported keyboard shortcuts:

- `Ctrl+K`;
- `Cmd+K`;
- `/` when the user is not already editing a form field.

On other pages the shortcut navigates to `/search#focus`. On the search page it simply focuses and selects the search input.

The full 745-entry index is not loaded by the global shortcut.

## Filters

Visitors can combine free-text search with:

- system filter;
- one of the ten M7.10 Mystical Themes.

A blank phrase plus an active filter is allowed so the search page can also function as a compact filtered directory.

## Discovery / SEO / GAIO

M7.11 adds:

- `/search` to the sitemap;
- a `Universal Reference Search` section to `llms.txt`;
- a Realms-menu `Search Library` entry;
- a homepage `Search Library` card;
- a floating accessible search launcher on reference-enabled pages.

The search result state itself is not a crawlable query-page factory because state lives in the URL fragment and the canonical remains `/search`.

## Accessibility and performance

- native search input and selects;
- `role="search"`;
- polite result-count live region;
- visible focus styles;
- keyboard shortcut hints;
- mobile layouts;
- reduced-motion CSS;
- no perpetual animation;
- no index payload outside `/search`;
- no network request per keystroke.

## Files

- `src/reference-search.ts` — index builder, SSR page, discovery, sitemap and `llms.txt` integration.
- `public/reference-search-core.js` — normalization, ranking and canonical result-path helper.
- `public/reference-search.js` — local UI, filters, fragment state and result rendering.
- `public/reference-search-shortcut.js` — lightweight global keyboard access.
- `public/reference-search.css` — responsive search page and launcher styling.
- `tests/reference-search.test.ts` — corpus, route, ranking, privacy, accessibility and integration coverage.

## Verification

The pass is accepted only when the standard Oracle Mirror V2 gate passes:

1. dependency security gate;
2. TypeScript;
3. complete test suite;
4. production Worker build.

The dedicated search suite additionally requires:

- exactly 745 indexed entries;
- exactly 745 unique raw/effective paths;
- exact system totals;
- all clickable paths resolve through production handlers;
- representative ranking behavior;
- system/theme filtering;
- diacritic-insensitive matching;
- sitemap and `llms.txt` idempotence;
- discovery injection idempotence;
- zero network-search/persistence/telemetry code in the search clients.
