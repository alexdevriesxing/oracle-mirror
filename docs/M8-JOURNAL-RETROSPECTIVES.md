# Oracle Mirror V2 — Pass 25 / M8.3 Journal Patterns & Retrospectives

## Goal

Extend Mirror Journal 2.0 and M8.2 Recovery & Insights with a useful long-view layer that helps people revisit their own saved history without introducing cloud accounts, AI analysis of private journal text, or a second journal datastore.

## User experience

The `/archive` Journal gains a **Mirror Retrospectives** section with five connected capabilities.

### 1. Month-over-month comparison

The current calendar month is compared with the previous month using structural local metadata only:

- saved-reading count;
- active journal days;
- favorites;
- readings carrying private notes;
- pending follow-ups;
- leading realm;
- leading tag.

The UI shows current values and simple up/down/flat deltas.

### 2. Six-month trend

A compact CSS-only chart shows saved-reading volume for the latest six months, plus:

- number of active months in the displayed window;
- consecutive active-month streak ending in the current month.

The pure core supports a bounded 2–12 month range for testing and future extensions.

### 3. Follow-up desk

M8.2 follow-up markers become a practical queue.

Pending readings are sorted oldest first and grouped into clear age buckets:

- under 7 days;
- 7–29 days;
- 30+ days.

The desk exposes only local structural metadata: journal ID, realm, date, favorite flag and tags. It does not duplicate the saved question or answer. A **View** action clears Journal filters and focuses the original Journal card. **Complete** uses the existing M8.2 follow-up write path and shared archive key.

### 4. On This Day

When an older saved reading shares today's month/day, the Journal resurfaces up to six prior-year matches. The summary contains only:

- year/date;
- realm;
- favorite marker;
- tags;
- journal ID for focusing the original card.

Current-year entries and nearby dates are excluded.

### 5. Journal × Mirror Journey bridge

The retrospective layer reads the bounded local `oracle-mirror-journey-v1` state and compares the previous 30 days of Journal and Journey activity.

It reports:

- Journal-active days;
- Daily Mirror days;
- days where both histories were active;
- Journal-only days;
- Journey-only days;
- realm counts;
- shared realms;
- unique Daily Mirror cards encountered.

This is a local join between two existing browser histories. Neither history is copied to a server.

## Reflection prompts

The interface generates up to four fixed retrospective questions from structural conditions such as:

- pending follow-ups;
- an anniversary match;
- the month's most visited realm;
- higher/lower reading volume than the previous month;
- repeated Journal/Journey overlap.

The prompt engine never reads saved `question` or `answer` fields and never sends journal content to Workers AI. It does not claim psychological diagnosis or mystical certainty.

## Privacy boundaries

M8.3 adds no new backend endpoint and no new telemetry event.

The retrospective client contains:

- no `fetch()` call;
- no `/api/` route;
- no Workers AI request;
- no `dataLayer` or telemetry call;
- no clipboard integration;
- no Web Share integration.

The retrospective core deliberately omits access to saved `question` and `answer` fields. Private note content is used only as a local boolean presence signal for monthly counts; note text is never returned from the retrospective core or interpreted.

The `/archive` route retains its existing private `noindex,follow` and sitemap-exclusion behavior.

## State model

M8.3 introduces **no new persistent storage key**.

It reads:

- `oracle-mirror-archive` through the existing Mirror Journal core;
- `oracle-mirror-journey-v1` through the existing bounded Mirror Journey normalizer.

Follow-up completion writes back through the existing Mirror Journal storage path. Everything else is derived at render time.

## Performance

The module is bootstrapped through `public/hardening.js`, but it performs retrospective computation only when `.mirror-journal-shell` exists.

Its stylesheet is lazy-loaded only after the archive Journal shell is found, so ordinary realm and reference pages do not request `mirror-journal-retrospective.css`.

The six-month visual is ordinary DOM/CSS. There is no canvas, perpetual animation, timer loop, or charting dependency.

## Accessibility

- Native buttons and links are used for actions.
- Trend bars carry descriptive `aria-label` values.
- Follow-up count has an explicit accessible label.
- Revisit clears filters, scrolls to the original Journal card, and moves keyboard focus there.
- Temporary focus styling makes resurfaced readings visually obvious.
- Reduced-motion preference disables smooth revisit scrolling and effectively suppresses transition/animation duration.
- `:focus-visible` styles are provided for retrospective controls.

## Files

- `public/mirror-journal-retrospective-core.js` — pure month/trend/follow-up/anniversary/Journey-bridge/prompt logic.
- `public/mirror-journal-retrospective.js` — archive-only retrospective renderer and local actions.
- `public/mirror-journal-retrospective.css` — responsive long-view UI, trend bars and focus treatment.
- `public/hardening.js` — loads the M8.3 module after M8.2 recovery.
- `tests/mirror-journal-retrospective.test.ts` — structural, privacy, accessibility and integration regressions.

## Acceptance criteria

1. Current vs previous month comparisons are deterministic and structural.
2. Six-month trend remains bounded and ordered.
3. Follow-ups are age-bucketed and oldest-first without exposing question/answer text.
4. On This Day matches only the same calendar date in earlier years.
5. Journal × Journey overlap uses bounded local Journey state only.
6. Reflection prompts are structural fixed copy, not AI interpretation.
7. View/Revisit focuses the original Journal card after clearing filters.
8. No new persistent storage, API, AI call, telemetry, clipboard or share path exists.
9. Styles load only when the Journal shell exists.
10. Existing M8.1/M8.2 storage and privacy contracts remain unchanged.
