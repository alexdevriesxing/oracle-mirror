# Oracle Mirror

Oracle Mirror is a fantasy-themed fortune-telling web app built on Cloudflare Workers, Workers AI, static assets, and a route-scoped V2 SSR shell. It is live at [oraclemirror.com](https://oraclemirror.com).

## Experiences

- Your Mirror Today — a zero-API-cost daily ritual with a deterministic card, moon phase, lucky signals, energy scores, streaks, badges, and a recommended realm.
- The Mirror Journey — a private seven-day progression layer with weekly recaps, realm-exploration quests, visible badge shelves, Major Arcana collection progress, and daily sharing.
- Social Share Cards — privacy-safe 1080×1920 visual cards for the Daily Mirror, Tarot, Advanced Tarot, Numerology, Advanced Numerology, Love Match, Instant Mysteries, Council of Mystics, Mirror Lab, Rune Casting, and Lenormand results, with native sharing and PNG fallback.
- Instant Mysteries — zero-API-cost Mystic Roulette, Pick a Card, and Three Doors homepage rituals that feed into deeper Oracle Mirror realms.
- Council of Mystics — one question is examined by three distinct fictional mystics and distilled into a single Mirror Verdict using one Workers AI request.
- Mirror Lab — fully local Pendulum Oracle, five-question Aura Reading, and Oracle Duel experiences with no API or Workers AI cost.
- Rune Casting — a standalone three-rune Elder Futhark realm plus 24 indexable individual rune meaning pages, all local and zero-AI-cost.
- Lenormand — a standalone three-card Petit Lenormand realm plus 36 indexable card meaning pages and local two-card combination guidance, all zero-AI-cost.
- Advanced Tarot — a standalone full 78-card reader with upright/reversed orientations, seven spreads, 78 card meaning pages, and seven spread guides, all zero-AI-cost.
- Advanced Numerology — a standalone local six-number profile with Life Path, Expression, Soul Urge, Personality, Birthday, and Personal Year calculations, plus 12 number meanings and six calculation guides.
- Crystal Ball — conversational readings with Madame Fortuna.
- Dream Interpreter — Morpheus asks clarifying questions and grounds interpretations in a dream-symbol corpus.
- Western Zodiac and Chinese Zodiac readings.
- Classic Tarot — interactive Past / Present / Future Major Arcana reading.
- Love Oracle and Love Match compatibility.
- Magic 8 Ball.
- Numerology life-path calculator.
- Daily Fortune.
- Birth Chart.
- Palm Reading.
- I Ching.
- Mystics — character/lore hub.
- Private browser Archive for saved readings.
- Dream symbol guide hub and individual symbol pages.

All readings are entertainment experiences. Avoid entering sensitive personal information.

## Architecture

- **Cloudflare Worker:** `src/v2-index.ts` is the production entry point. It wraps the core application handler with route-scoped SSR, security headers, SEO freshness rules, telemetry, the Council API, standalone Rune/Lenormand/Advanced Tarot/Advanced Numerology routing, and legacy URL tombstones.
- **Core application:** `src/index.ts` provides reading APIs, metadata, sitemap/robots/llms output, dream-guide routing, and the static app shell.
- **Workers AI:** the default inference model is `@cf/meta/llama-3.3-70b-instruct-fp8-fast`.
- **Static app:** `public/index.html`, `public/script.js`, and `public/styles.css` contain the interactive legacy realms.
- **Route-scoped SSR:** initial HTML contains only the requested legacy realm plus shared chrome; `public/hydrate-shell.js` restores the complete client shell before the legacy application module starts.
- **Hardening:** `public/hardening.js` adds reduced-effects behavior and accessibility semantics; `src/security-headers.ts` applies explicit security headers.
- **Daily ritual:** `public/daily-ritual-core.js` generates deterministic daily values and streak state, while `public/daily-ritual.js` / `public/daily-ritual.css` render the homepage return loop. State stays in localStorage and no reading text is uploaded.
- **Mirror Journey:** `public/mirror-journey-core.js` stores a bounded local history of generated daily-card metadata and coarse realm visits. `public/mirror-journey.js` / `public/mirror-journey.css` render the seven-day timeline, weekly recap, exploration quest, badge shelf, collection progress, and share action without storing user questions or reading text.
- **Social sharing:** `public/share-card-core.js` sanitizes share payloads, while `public/social-share.js` / `public/social-share.css` render 1080×1920 PNG cards on demand. Share cards intentionally exclude private Tarot questions, numerology birth dates, Advanced Numerology names/birth dates, Love Match names, Council question/answer text, Mirror Lab questions/answers, arbitrary rune/Lenormand extras, and arbitrary Advanced Tarot extras.
- **Instant Mysteries:** `public/instant-mysteries-core.js` contains the local mystic/card/door corpora and deterministic selectors, while `public/instant-mysteries.js` / `public/instant-mysteries.css` mount three accessible homepage micro-rituals without Worker AI or private-input access.
- **Council of Mystics:** `src/council.ts` selects three fictional lenses and requests all three responses plus one synthesis in a single AI call. `public/council-core.js`, `public/council.js`, and `public/council.css` handle the homepage UI, optional local Archive saving, and privacy-safe sharing.
- **Mirror Lab:** `public/interactive-oracles-core.js` contains deterministic Pendulum, Aura, and Oracle Duel logic. `public/interactive-oracles.js` / `public/interactive-oracles.css` render the experiences entirely client-side; no Mirror Lab question or quiz answer is sent to an API.
- **Rune realm:** `src/runes-data.ts` is the server-side 24-rune corpus and `src/runes-pages.ts` renders the standalone hub/meaning pages, sitemap entries, homepage discovery, and schema. `public/runes-core.js`, `public/runes.js`, and `public/runes.css` provide the local three-rune interaction and presentation.
- **Lenormand realm:** `src/lenormand-data.ts` is the server-side 36-card corpus and `src/lenormand-pages.ts` renders the standalone hub/card pages, sitemap entries, homepage/LLM discovery, and schema. `public/lenormand-core.js`, `public/lenormand.js`, and `public/lenormand.css` provide the local three-card draw, pair-combination guidance, sharing, and presentation.
- **Advanced Tarot:** `src/tarot-data.ts` contains the authoritative 78-card corpus and `src/tarot-pages.ts` renders the reader, card library, individual meaning pages, spread guides, sitemap entries, discovery, and schema. `public/advanced-tarot-core.js`, `public/advanced-tarot.js`, and `public/advanced-tarot.css` provide local multi-spread drawing with optional reversals and privacy-safe sharing.
- **Advanced Numerology:** `src/numerology-data.ts` contains the 1–9/11/22/33 meaning corpus and six core-number guides, while `src/numerology-pages.ts` renders the local profile calculator, meaning pages, calculation guides, sitemap entries, discovery, and schema. `public/advanced-numerology-core.js`, `public/advanced-numerology.js`, and `public/advanced-numerology.css` calculate and display the profile without sending or persisting the entered name or birth date.
- **Ads:** `public/ad-config.js` and `public/ads.js` manage Adsterra placements, lazy loading, viewability, unfilled collapse, and refresh eligibility. `public/monetization.js` applies the M2 experiment/policy layer.
- **Analytics:** `public/telemetry.js` sends allowlisted, non-reading-content events to `/api/telemetry`; `src/telemetry.ts` writes sanitized points to Workers Analytics Engine when bound.

## Routes

Public reading routes include:

`/crystal-ball`, `/dream-interpreter`, `/western-zodiac`, `/chinese-zodiac`, `/tarot`, `/tarot/advanced`, `/tarot/cards`, `/tarot/cards/:slug`, `/tarot/spreads`, `/tarot/spreads/:slug`, `/love-oracle`, `/love-match`, `/magic-8-ball`, `/numerology`, `/numerology/advanced`, `/numerology/numbers`, `/numerology/numbers/:number`, `/numerology/core-numbers`, `/numerology/core-numbers/:slug`, `/daily-fortune`, `/birth-chart`, `/palm-reading`, `/iching-oracle`, `/runes`, `/runes/:slug`, `/lenormand`, `/lenormand/:slug`, `/mystics`, `/dreams`, and `/dreams/:symbol`.

Utility routes include `/archive`, `/privacy-policy`, `/cookie-policy`, `/contact`, `/sitemap.xml`, `/robots.txt`, `/llms.txt`, `/ads.txt`, and `/api/health`.

Result shells under `/result/*` are intentionally noindex.

## API

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/api/health` | Health check |
| POST | `/api/chat` | Crystal Ball conversation |
| POST | `/api/dream` | Dream Interpreter conversation |
| POST | `/api/reading` | One-shot crystal-ball reading |
| POST | `/api/western-zodiac` | Western horoscope |
| POST | `/api/chinese-zodiac` | Chinese zodiac reading |
| POST | `/api/tarot` | Classic Tarot interpretation |
| POST | `/api/love` | Love Oracle |
| POST | `/api/love-match` | Compatibility interpretation |
| POST | `/api/magic8` | Magic 8 Ball |
| POST | `/api/numerology` | Numerology reading |
| POST | `/api/daily-fortune` | Daily fortune |
| POST | `/api/birthchart` | Birth-chart interpretation |
| POST | `/api/palmistry` | Palm reading |
| POST | `/api/soulmate-vision` | Soulmate Vision |
| POST | `/api/iching` | I Ching interpretation |
| POST | `/api/council` | Three-mystic Council reading plus Mirror Verdict in one AI request |
| POST | `/api/telemetry` | Privacy-safe analytics ingestion |

Rune casting, Lenormand drawing, Advanced Tarot drawing, and Advanced Numerology calculation are client-side and do not add API endpoints.

## Local development

Requirements: Node.js 22.6+ and a Cloudflare account when running Worker-bound features.

```bash
npm install
npm run typecheck
npm test
npm run build
npx wrangler@4 dev
```

## Deployment

Production deploys are gated by `.github/workflows/v2-ci.yml`. After a green `master` build, `.github/workflows/deploy-cloudflare.yml` deploys the exact verified SHA when these GitHub Actions secrets are configured:

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

The deployment workflow then verifies production metadata, security headers, and retired-URL behavior.

Manual deployment:

```bash
npm run deploy
```

## Cloudflare bindings

`wrangler.toml` currently defines:

- `AI` — Workers AI.
- `ASSETS` — static asset binding.
- `ANALYTICS` — Workers Analytics Engine dataset (`oracle_mirror_events`).
- `CF_VERSION_METADATA` — Worker version metadata used in analytics.
- custom domains for `oraclemirror.com` and `www.oraclemirror.com`.

`ADSTERRA_ADS_TXT` is an optional Worker secret used to serve the production `ads.txt` seller record.

## Quality gates

The V2 CI workflow runs on `master` and `v2/**` branches:

1. `npm ci`
2. `npm audit --audit-level=high`
3. `npm run typecheck`
4. `npm test`
5. `npm run build`

## Key files

```text
.github/workflows/
  v2-ci.yml
  deploy-cloudflare.yml
public/
  index.html
  script.js
  styles.css
  hydrate-shell.js
  hardening.js
  daily-ritual-core.js
  daily-ritual.js
  daily-ritual.css
  mirror-journey-core.js
  mirror-journey.js
  mirror-journey.css
  share-card-core.js
  social-share.js
  social-share.css
  instant-mysteries-core.js
  instant-mysteries.js
  instant-mysteries.css
  council-core.js
  council.js
  council.css
  interactive-oracles-core.js
  interactive-oracles.js
  interactive-oracles.css
  runes-core.js
  runes.js
  runes.css
  lenormand-core.js
  lenormand.js
  lenormand.css
  advanced-tarot-core.js
  advanced-tarot.js
  advanced-tarot.css
  advanced-numerology-core.js
  advanced-numerology.js
  advanced-numerology.css
  monetization.js
  telemetry.js
  ad-config.js
  ads.js
src/
  index.ts
  v2-index.ts
  council.ts
  runes-data.ts
  runes-pages.ts
  lenormand-data.ts
  lenormand-pages.ts
  tarot-data.ts
  tarot-pages.ts
  numerology-data.ts
  numerology-pages.ts
  ssr-shell.ts
  seo-freshness.ts
  security-headers.ts
  telemetry.ts
  dream-data.ts
  dream-pages.ts
  realm-content.ts
tests/
docs/
wrangler.toml
```

## Notes

- The private Archive is `noindex,follow` and excluded from the sitemap.
- Historical URLs for removed temporary experiences may return HTTP 410 so search engines can retire them cleanly; removed feature code is not kept in the product bundle.
- M2 monetization details and Analytics Engine query examples are documented in `docs/M2-MONETIZATION.md`.
- M3 daily-return mechanics are documented in `docs/M3-DAILY-RITUAL.md`.
- M4 Mirror Journey retention and progression mechanics are documented in `docs/M4-MIRROR-JOURNEY.md`.
- M5 privacy-safe social sharing is documented in `docs/M5-SOCIAL-SHARE.md`.
- M6 Instant Mysteries are documented in `docs/M6-INSTANT-MYSTERIES.md`.
- M6 Council of Mystics is documented in `docs/M6-COUNCIL-OF-MYSTICS.md`.
- M6 Mirror Lab is documented in `docs/M6-MIRROR-LAB.md`.
- M7 Rune Casting is documented in `docs/M7-RUNES.md`.
- M7 Lenormand is documented in `docs/M7-LENORMAND.md`.
- M7 Advanced Tarot is documented in `docs/M7-ADVANCED-TAROT.md`.
- M7 Advanced Numerology is documented in `docs/M7-ADVANCED-NUMEROLOGY.md`.
