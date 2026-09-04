# Oracle Mirror V2 — Pass 1

## Baseline

The pre-V2 application serves a single static HTML shell containing every interactive realm. The Worker injects route-specific metadata, structured data, visible SEO content, and activates the requested section, but unrelated realm bodies remain present in the server response.

Approximate repository payloads at the start of the pass:

- `public/index.html`: ~111 KB
- `public/script.js`: ~113 KB
- `public/styles.css`: ~121 KB
- `public/ads.js`: ~37 KB

The first V2 architecture goal is crawl isolation without rewriting every existing realm at once.

## Pass 1 implementation

1. `src/v2-index.ts` wraps the established Worker handler.
2. The established handler performs metadata, FAQ, and dream SSR enrichment.
3. `src/ssr-shell.ts` then keeps only the requested top-level `page-*` application section plus shared header/footer chrome.
4. The server swaps the monolithic client entry for `public/hydrate-shell.js`.
5. The hydrator fetches one full shell in the browser, restores missing realm sections, and only then imports the established `public/script.js` application.
6. If hydration fails, the browser falls back to the established full-shell route.

This is an intentionally transitional architecture. It fixes server-response topic contamination while preserving current client behavior. Later V2 passes can replace the hydration fetch with proper route-level modules/fragments for additional performance gains.

## Acceptance criteria

- A direct `/tarot` response does not contain the Numerology, Love Match, or Dream page bodies.
- A direct `/numerology` response does not contain unrelated realm bodies.
- `/` initially contains the homepage application page only.
- Shared navigation, footer, global ads, metadata, canonical tags, and structured data remain intact.
- Browser hydration restores all application pages before `script.js` initializes.
- Deep result routes map to their parent realm.
- Dream guide pages remain standalone and are not transformed.
- Typecheck, test suite, and production build pass in CI.

## Next pass

M1 SEO/freshness cleanup:

- freeze completed match sitemap dates/frequencies;
- remove World Cup positioning from evergreen homepage metadata/navigation priority;
- `noindex,follow` the private Archive utility route and remove it from the sitemap;
- refresh sitemap `lastmod` handling;
- consolidate route metadata definitions where practical.
