# Oracle Mirror

Oracle Mirror is a fantasy-themed fortune-telling web application that runs entirely on [Cloudflare Workers](https://developers.cloudflare.com/workers/) with integrated [Workers AI](https://developers.cloudflare.com/workers-ai/).
The goal is to provide an atmospheric, magical user experience reminiscent of a mystical gypsy fair, while delivering horoscopes, tarot readings, numerology insights and more via AI.

## Features

- **Enchanted UI** -- Dark, illustrated interface with an ornate mirror hero, ambient particle effects, and unique visual themes for each realm.
- **10 Mystical Realms** -- Each with its own oracle persona, AI prompt, and dedicated page:
  - **Crystal Ball** -- Madame Fortuna peers through swirling mists to answer your questions.
  - **Western Zodiac** -- Astaria reads planetary alignments for your zodiac sign.
  - **Chinese Zodiac** -- Master Longwei reveals your destiny based on your birth year.
  - **Tarot** -- Seraphina draws a Past-Present-Future three-card spread.
  - **Love Oracle** -- Rosalind guides hearts through cosmic compatibility.
  - **Magic 8 Ball** -- The Cosmic 8-Ball delivers playful cosmic answers.
  - **Numerology** -- Pythius calculates your Life Path Number from your birthday.
  - **Daily Fortune** -- The Dawn Oracle inscribes today's fortune at sunrise.
  - **Personas** -- A gallery of all oracle characters with their domains and descriptions.
  - **Archive** -- LocalStorage-powered history of all your past readings.
- **Workers AI via AI Gateway** -- All inference routes through AI Gateway for caching and observability.
- **Fallback fortunes** -- Graceful degradation with mystical one-liners when AI is unavailable.
- **Responsive design** -- Works on mobile and desktop with adaptive layouts.

## API Endpoints

| Method | Path | Body | Description |
|--------|------|------|-------------|
| GET | `/api/health` | -- | Returns `OK` |
| POST | `/api/reading` | `{ query: string }` | Crystal Ball reading |
| POST | `/api/western-zodiac` | `{ sign: string }` | Western horoscope |
| POST | `/api/chinese-zodiac` | `{ year: number }` | Chinese zodiac reading |
| POST | `/api/tarot` | `{ question: string }` | Three-card tarot spread |
| POST | `/api/love` | `{ question: string, name1?: string, name2?: string }` | Love oracle |
| POST | `/api/magic8` | `{ question: string }` | Magic 8 Ball |
| POST | `/api/numerology` | `{ birthday: string }` | Life path numerology |
| POST | `/api/daily-fortune` | `{ sign?: string }` | Daily fortune |
| POST | `/api/feedback` | `{ ... }` | Submit feedback (logged) |

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (18+)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/) (`npm install -g wrangler`)
- A Cloudflare account with Workers and Workers AI enabled
- (Optional) An AI Gateway configured on your account

### Setup

1. Clone or unzip this repository:

   ```bash
   cd oracle-mirror-code
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Build the worker:

   ```bash
   npm run build
   ```

4. Configure `wrangler.toml`:

   - `name` -- give your worker a unique name
   - Ensure the `[ai]` section has `binding = "AI"`
   - The `[site]` section should point to `./public`
   - Replace `gateway: { id: 'default' }` in `src/index.ts` with your AI Gateway ID, or remove it if not using AI Gateway

5. Test locally:

   ```bash
   wrangler dev
   ```

   Open `http://localhost:8787` in your browser.

6. Deploy to production:

   ```bash
   wrangler publish
   ```

### Configuring AI Gateway

AI Gateway provides caching, analytics, rate limiting and logging for your AI calls. To set it up:

1. Go to the Cloudflare dashboard > AI > AI Gateway
2. Create a new gateway (or use `default`)
3. Update the `gateway.id` value in `src/index.ts` to match your gateway name
4. Rebuild and deploy

## Project Structure

```
oracle-mirror-code/
├── README.md           # This file
├── package.json        # Dependencies and build scripts
├── tsconfig.json       # TypeScript configuration
├── wrangler.toml       # Cloudflare Worker configuration
├── public/             # Static assets served by the worker
│   ├── index.html      # SPA with all realm pages
│   ├── styles.css      # Fantasy themes, animations, responsive layout
│   └── script.js       # Navigation, API calls, particles, archive
├── src/
│   └── index.ts        # Cloudflare Worker with all API endpoints
└── dist/
    └── index.js        # Compiled worker (output of npm run build)
```

## Architecture

- **Backend**: Single Cloudflare Worker (`src/index.ts`) handles all `/api/*` routes and serves static assets via the `ASSETS` binding. Each realm has a dedicated endpoint with a unique AI prompt and oracle persona.
- **Frontend**: Single-page application with CSS-based page transitions. No framework dependencies -- pure vanilla HTML/CSS/JS.
- **AI Model**: `@cf/meta/llama-3.1-8b-instruct` via Workers AI, routed through AI Gateway.
- **Storage**: Reading history is stored client-side in LocalStorage (Archive feature).

## License

This project is provided for educational purposes under the MIT license.
