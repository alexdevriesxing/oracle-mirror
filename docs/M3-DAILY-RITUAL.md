# M3 — Your Mirror Today

`Your Mirror Today` is Oracle Mirror's lightweight daily-return loop. It is designed to increase repeat visits without adding AI inference cost, account requirements, or storage of reading content.

## Product behavior

The homepage receives a daily ritual panel immediately below the home leaderboard placement. The panel reveals:

- one deterministic Major Arcana card of the day;
- an approximate moon phase;
- a daily theme and reflection prompt;
- lucky number, lucky color, and element;
- mood, love, and money energy scores;
- one recommended Oracle Mirror realm;
- a persistent daily streak and badge progression.

The same local calendar date always produces the same ritual payload. This means repeated visits during one day are consistent without server state.

## Streak rules

State key: `oracle-mirror-daily-ritual-v1`.

Stored fields:

- `lastCompletedDate`
- `streak`
- `bestStreak`
- `totalDays`
- schema `version`

A ritual can only increment once per local date. Completing on the next calendar day increments the streak. A gap of two or more calendar days resets the active streak to one while preserving `bestStreak` and `totalDays`.

Date differences are calculated from UTC-noon representations of `YYYY-MM-DD` values so daylight-saving changes do not create false zero-day or two-day transitions.

## Badges

Badges use `bestStreak`, so an earned badge is never lost after a future broken streak.

| Best streak | Badge |
| ---: | --- |
| 1 | First Reflection |
| 3 | Triple Glimmer |
| 7 | Seven-Day Seer |
| 14 | Moonlit Fortnight |
| 30 | Mirror Keeper |
| 100 | Oracle Devotee |

## Privacy and cost

The ritual does not call Workers AI or any third-party generation API. Its content is deterministic and computed in the browser.

Streak state stays in `localStorage`. No account, email address, birthday, question, reading text, or other user-supplied content is required by the ritual.

Only coarse product analytics are allowlisted:

- ritual card name;
- recommended realm;
- badge name;
- streak / best streak / total ritual days;
- mood / love / money scores;
- completion state and trigger.

Arbitrary properties are dropped by both the browser telemetry sanitizer and the Worker telemetry sanitizer.

## Files

- `public/daily-ritual-core.js` — deterministic generation, moon phase, state transitions, badges.
- `public/daily-ritual.js` — homepage rendering and event tracking.
- `public/daily-ritual.css` — responsive visual layer with reduced-motion support.
- `public/hardening.js` — imports the ritual before the legacy app initializes.
- `public/telemetry.js` — browser allowlist.
- `src/telemetry.ts` — Worker allowlist and Analytics Engine mapping.
- `tests/daily-ritual.test.ts` — determinism, date math, streak, badge, and asset tests.
- `tests/telemetry.test.ts` — server-side analytics privacy regression.

## M3 success signals

Useful Analytics Engine questions after meaningful traffic accumulates:

1. What percentage of homepage sessions reveal the ritual?
2. How many reveal sessions click the recommended realm?
3. What share of ritual users return with streaks of 2+, 3+, 7+, and 14+ days?
4. Do ritual sessions produce more completed readings than non-ritual homepage sessions?
5. Does the ritual improve revenue per session without harming homepage bounce or viewability?

The implementation intentionally leaves push notifications, accounts, cross-device streaks, and server-generated daily readings out of M3. Those should only be added if the local daily-return loop demonstrates real retention value.
