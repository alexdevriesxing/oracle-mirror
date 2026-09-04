# M4 — Mirror Journey

M4 builds on the M3 daily ritual with a local-first retention and progression layer. It deliberately avoids accounts, cloud sync, reading-text storage, and extra AI calls.

## User-facing features

### Seven-day Mirror Journey

The homepage displays the last seven local calendar days as a compact timeline. Completed Daily Mirror rituals show their generated Major Arcana card; missed days remain visibly empty instead of being back-filled.

### Weekly recap

From the same local data, Oracle Mirror derives:

- completed ritual days in the last seven days;
- average Mood, Love, and Money signals;
- strongest signal for the week;
- number of distinct realms explored;
- the realm most often recommended by the Daily Mirror.

The recap is descriptive entertainment UI. It does not infer sensitive traits or upload reading content.

### Weekly realm quest

A lightweight exploration quest asks the visitor to open three distinct Oracle Mirror realms during the rolling seven-day period. Visits are deduplicated per realm/day and remain local to the browser.

### Badge shelf

All six M3 streak badges are now visible at once, with earned and locked states. This makes the progression system legible instead of exposing only the currently active badge.

### Major Arcana collection

Every distinct Card of the Day becomes a collectible. The collection reports unique cards out of the 22 Major Arcana and stores at most 90 daily generated entries.

This is not tied to paid mechanics, random purchases, loot boxes, or monetary value.

### Daily sharing

After today's ritual is completed, visitors can share a privacy-safe text summary using the Web Share API. Browsers without native sharing fall back to copying the same summary to the clipboard.

The shared summary contains only generated daily values: card, theme, moon, lucky number, and streak. It never includes an original question, birthday, private note, or reading text.

## Storage

Mirror Journey uses a separate localStorage key:

`oracle-mirror-journey-v1`

The state contains:

- a maximum of 90 generated daily-mirror entries;
- a maximum of 180 coarse realm-visit records;
- no user-authored text.

M3 streak state remains under:

`oracle-mirror-daily-ritual-v1`

Keeping the contracts separate prevents Journey evolution from corrupting or resetting a visitor's streak.

## Files

- `public/mirror-journey-core.js` — normalization, bounded history, card collection, seven-day window, weekly summaries, realm quest.
- `public/mirror-journey.js` — browser storage, homepage UI, sharing, realm-visit capture, telemetry.
- `public/mirror-journey.css` — responsive presentation and reduced-motion handling.
- `public/daily-ritual.js` — emits the local `oracle:daily-ritual-completed` event consumed by Journey.
- `public/hardening.js` — bootstraps Journey after the Daily Ritual.
- `tests/mirror-journey.test.ts` — state, privacy, telemetry, and asset regression coverage.

## Analytics

Only coarse product metrics are allowlisted:

- `journey_days`;
- `unique_cards`;
- `realms_explored`;
- existing streak/card fields;
- share mode (`native`, `clipboard`, `failed`).

Arbitrary properties remain discarded by both browser and Worker telemetry sanitizers.

## Success signals

The M4 retention layer should be evaluated against:

1. return visits within seven days;
2. percentage of ritual completers who return for a second day;
3. seven-day ritual completion depth;
4. unique realms explored per returning session;
5. Major Arcana collection depth;
6. daily share usage;
7. reading completion and revenue/session, to ensure progression does not distract from the core product.

## Next extension

M5 can turn the current text share into fully rendered social cards and can begin upgrading the Archive into a structured Mirror Journal. The M4 state is intentionally bounded and simple enough to migrate later without requiring an account today.
