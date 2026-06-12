# Oracle Mirror

Oracle Mirror is a fantasy-themed fortune-telling web application that runs entirely on [Cloudflare Workers](https://developers.cloudflare.com/workers/) with integrated [Workers AI](https://developers.cloudflare.com/workers-ai/).
It delivers tarot readings, horoscopes, numerology, love compatibility, and FIFA World Cup 2026 match predictions through atmospheric oracle personas — live at [oraclemirror.com](https://oraclemirror.com).

## Features

- **Enchanted UI** — Dark, illustrated interface with an ornate mirror hero, ambient particle effects, and unique visual themes for each realm.
- **Mystical Realms** — Each with its own oracle persona, AI prompt, and dedicated page:
  - **Crystal Ball** — Madame Fortuna answers questions through a 7-step alignment ritual and chat.
  - **Western Zodiac** — Astaria reads planetary alignments for your zodiac sign.
  - **Chinese Zodiac** — Master Longwei reveals your destiny based on your birth year.
  - **Tarot** — Seraphina draws a Past-Present-Future three-card spread.
  - **Love Oracle & Love Match** — Rosalind guides hearts through cosmic compatibility scores.
  - **Soulmate Vision** — AI-generated portrait (Flux-1-schnell) and destined location of your cosmic soulmate.
  - **Magic 8 Ball** — The Cosmic 8-Ball delivers playful cosmic answers.
  - **Numerology** — Pythius calculates your Life Path Number from your birthday.
  - **Daily Fortune** — The Dawn Oracle inscribes today's fortune at sunrise.
  - **Birth Chart, Palm Reading, I Ching** — Astrological placements, palmistry lines, and hexagram consultations.
  - **Archive** — LocalStorage-powered history of all your past readings.
- **Oracle of Olympus (World Cup 2026)** — Pythia Nikephoros predicts all 72 group stage matches:
  - Full fixture seed with a deterministic prediction engine (scores, win probabilities, confidence).
  - Match statuses (upcoming/today/completed) derived from dates; old matches auto-hide after 7 days.
  - A cron trigger (every 2 hours) syncs fixtures into KV; with a [football-data.org](https://www.football-data.org/) API key configured, real final scores overlay the predictions automatically.
  - Per-match SEO pages with SportsEvent/BreadcrumbList JSON-LD, sitemap coverage, and an `llms.txt` index for AI assistants.
- **Workers AI via AI Gateway** — All inference routes through AI Gateway for caching and observability. Pluggable provider support (Workers AI, OpenAI, Anthropic) for Olympus prophecies.
- **Fallback fortunes** — Graceful degradation with mystical one-liners (and template prophecies) when AI is unavailable.
- **Hardening** — Origin allowlist, per-IP rate limiting, payload size limits, strict request validation, and betting-language sanitization on sports content.

## API Endpoints

| Method | Path | Body | Description |
|--------|------|------|-------------|
| GET | `/api/health` | — | Returns `OK` |
| GET | `/api/oracle-of-olympus/matches` | — | All World Cup 2026 fixtures with predictions (KV-backed) |
| POST | `/api/oracle-of-olympus/predict` | match payload | AI prophecy for a fixture (validated, rate-limited, cached) |
| POST | `/api/chat` | `{ messages, readingProfile? }` | Crystal Ball conversation with Madame Fortuna |
| POST | `/api/reading` | `{ query }` | One-shot crystal ball reading |
| POST | `/api/western-zodiac` | `{ sign }` | Western horoscope |
| POST | `/api/chinese-zodiac` | `{ year }` | Chinese zodiac reading |
| POST | `/api/tarot` | `{ question, cards? }` | Three-card tarot spread |
| POST | `/api/love` | `{ question, name1?, name2? }` | Love oracle |
| POST | `/api/love-match` | `{ type, seekerName, partnerName, seekerValue, partnerValue }` | Compatibility reading |
| POST | `/api/soulmate-vision` | `{ energy, element, age, idealDate }` | AI soulmate portrait + location |
| POST | `/api/magic8` | `{ question }` | Magic 8 Ball |
| POST | `/api/numerology` | `{ birthday }` | Life path numerology |
| POST | `/api/daily-fortune` | `{ sign? }` | Daily fortune |
| POST | `/api/birthchart` | `{ birthday, birthtime?, sign, placements }` | Birth chart reading |
| POST | `/api/palmistry` | `{ handShape, lines }` | Palm reading |
| POST | `/api/iching` | `{ question, hexagramTitle, hexagramLines }` | I Ching interpretation |
| POST | `/api/feedback` | `{ ... }` | Submit feedback |

SEO/GAIO routes served by the worker: `/sitemap.xml`, `/robots.txt`, `/llms.txt`.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 22.6+ (the test runner uses native TypeScript type stripping)
- A Cloudflare account with Workers, Workers AI, and KV enabled
- (Optional) An AI Gateway configured on your account
- (Optional) A free [football-data.org](https://www.football-data.org/client/register) API key for live World Cup scores

### Setup

```bash
npm install        # install dev dependencies
npm run build      # bundle the worker with esbuild → dist/index.js
npm run typecheck  # tsc --noEmit
npm test           # node:test suite (prediction engine, sanitization, sync)
npm run dev        # wrangler dev on http://localhost:8787
npm run deploy     # build + wrangler deploy
```

### Configuration (`wrangler.toml`)

- `[ai]` — Workers AI binding (`AI`).
- `[[kv_namespaces]]` — `ORACLE_KV` stores the synced World Cup fixtures. Create your own with `npx wrangler kv namespace create ORACLE_KV` and update the `id`.
- `[triggers]` — cron `0 */2 * * *` refreshes fixtures/results.
- `[assets]` — serves `public/` with `run_worker_first = true`.

### Secrets / Vars (optional)

| Name | Purpose |
|------|---------|
| `FOOTBALL_DATA_API_KEY` | Enables live World Cup final scores (`npx wrangler secret put FOOTBALL_DATA_API_KEY`) |
| `AI_PROVIDER` / `AI_MODEL` / `AI_API_KEY` | Route Olympus prophecies through OpenAI or Anthropic via AI Gateway instead of Workers AI |
| `CLOUDFLARE_ACCOUNT_ID` / `CLOUDFLARE_AI_GATEWAY_ID` | Required for provider-native AI Gateway calls |
| `ORACLE_ALLOWED_ORIGIN` | Comma-separated CORS origin allowlist for the predict API |
| `ORACLE_CACHE_TTL_SECONDS` | Override the prophecy cache TTL |
| `AD_CONSENT_REQUIRED` | Gate ad scripts behind a consent prompt |

## Project Structure

```
oracle-mirror-code/
├── package.json          # Scripts: build, dev, test, typecheck, deploy
├── tsconfig.json         # TypeScript configuration (strict, noEmit)
├── wrangler.toml         # Worker config: AI, KV, cron, assets, routes
├── public/               # Static assets served by the worker
│   ├── index.html        # SPA with all realm pages + structured data
│   ├── styles.css        # Fantasy themes, animations, responsive layout
│   ├── script.js         # Navigation, API calls, particles, archive, Olympus UI
│   └── ads.js            # Ad slot management and diagnostics
├── src/
│   ├── index.ts          # Worker: routing, API endpoints, SEO injection, cron
│   ├── olympus-data.ts   # WC2026 fixture seed + deterministic prediction engine
│   └── olympus-sync.ts   # KV store + football-data.org result sync
├── tests/
│   └── prediction.test.ts # node:test suite
└── dist/                 # esbuild output (gitignored)
```

## Architecture

- **Backend**: Single Cloudflare Worker handles all `/api/*` routes, injects per-route SEO metadata and JSON-LD into the SPA shell, and serves static assets via the `ASSETS` binding.
- **Frontend**: Single-page application with CSS-based page transitions. No framework dependencies — pure vanilla HTML/CSS/JS. World Cup fixtures are fetched from the worker API (no hardcoded data).
- **AI**: `@cf/meta/llama-3.1-8b-instruct` via Workers AI + AI Gateway for readings; `@cf/black-forest-labs/flux-1-schnell` for Soulmate Vision portraits.
- **Storage**: Reading history lives client-side in LocalStorage; World Cup fixtures live in Workers KV, refreshed by cron.

## License

This project is provided for educational purposes under the MIT license.
