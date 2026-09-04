# Oracle Mirror

Oracle Mirror is a fantasy-themed fortune-telling web app built on Cloudflare Workers, Workers AI, static assets, and a route-scoped V2 SSR shell. It is live at [oraclemirror.com](https://oraclemirror.com).

## Experiences

- Your Mirror Today — a zero-API-cost daily ritual with a deterministic card, moon phase, lucky signals, energy scores, streaks, badges, and a recommended realm.
- The Mirror Journey — a private seven-day progression layer with weekly recaps, realm-exploration quests, visible badge shelves, Major Arcana collection progress, and daily sharing.
- Crystal Ball — conversational readings with Madame Fortuna.
- Dream Interpreter — Morpheus asks clarifying questions and grounds interpretations in a dream-symbol corpus.
- Western Zodiac and Chinese Zodiac readings.
- Tarot — interactive Past / Present / Future Major Arcana reading.
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

- **Cloudflare Worker:** `src/v2-index.ts` is the production entry point. It wraps the core application handler with route-scoped SSR, security headers, SEO freshness rules, telemetry, and legacy URL tombstones.
- **Core application:** `src/index.ts` provides reading APIs, metadata, sitemap/robots/llms output, dream-guide routing, and the static app shell.
- **Workers AI:** the default inference model is `@cf/meta/llama-3.3-70b-instruct-fp8-fast`.
- **Static app:** `public/index.html`, `public/script.js`, and `public/styles.css` contain the interactive realms.
- **Route-scoped SSR:** initial HTML contains only the requested realm plus shared chrome; `public/hydrate-shell.js` restores the complete client shell before the legacy application module starts.
- **Hardening:** `public/hardening.js` adds reduced-effects behavior and accessibility semantics; `src/security-headers.ts` applies explicit security headers.
- **Daily ritual:** `public/daily-ritual-core.js` generates deterministic daily values and streak state, while `public/daily-ritual.js` / `public/daily-ritual.css` render the homepage return loop. State stays in localStorage and no reading text is uploaded.
- **Mirror Journey:** `public/mirror-journey-core.js` stores a bounded local history of generated daily-card metadata and coarse realm visits. `public/mirror-journey.js` / `public/mirror-journey.css` render the seven-day timeline, weekly recap, exploration quest, badge shelf, collection progress, and share action without storing user questions or reading text.
- **Ads:** `public/ad-config.js` and `public/ads.js` manage Adsterra placements, lazy loading, viewability, unfilled collapse, and refresh eligibility. `public/monetization.js` applies the M2 experiment/policy layer.
- **Analytics:** `public/telemetry.js` sends allowlisted, non-reading-content events to `/api/telemetry`; `src/telemetry.ts` writes sanitized points to Workers Analytics Engine when bound.

## Routes

Public reading routes include:

`/crystal-ball`, `/dream-interpreter`, `/western-zodiac`, `/chinese-zodiac`, `/tarot`, `/love-oracle`, `/love-match`, `/magic-8-ball`, `/numerology`, `/daily-fortune`, `/birth-chart`, `/palm-reading`, `/iching-oracle`, `/mystics`, `/dreams`, and `/dreams/:symbol`.

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
| POST | `/api/tarot` | Tarot interpretation |
| POST | `/api/love` | Love Oracle |
| POST | `/api/love-match` | Compatibility interpretation |
| POST | `/api/magic8` | Magic 8 Ball |
| POST | `/api/numerology` | Numerology reading |
| POST | `/api/daily-fortune` | Daily fortune |
| POST | `/api/birthchart` | Birth-chart interpretation |
| POST | `/api/palmistry` | Palm reading |
| POST | `/api/soulmate-vision` | Soulmate Vision |
| POST | `/api/iching` | I Ching interpretation |
| POST | `/api/telemetry` | Privacy-safe analytics ingestion |

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
  monetization.js
  telemetry.js
  ad-config.js
  ads.js
src/
  index.ts
  v2-index.ts
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
