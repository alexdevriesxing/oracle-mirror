# Oracle Mirror V2 — Pass 23 / M8.1 Mirror Journal 2.0

## Goal

Turn the private `/archive` screen from a flat list of saved readings into a useful local-first journal without introducing accounts, cloud synchronization, private-content analytics, or a second incompatible storage system.

## User experience

Mirror Journal 2.0 adds:

- full local search across saved realm, question, answer, private note and tags;
- realm filtering;
- tag filtering;
- favorites-only filtering;
- newest/oldest sorting;
- a monthly calendar with reading counts and favorite markers;
- private notes up to 2,000 characters;
- up to eight normalized tags per reading;
- favorite/unfavorite controls;
- per-reading deletion;
- full-journal clearing with explicit confirmation;
- local JSON backup download;
- summary counters for saved readings, favorites, notes, tagged readings and realms.

The existing archive header is upgraded in-place to `Your Private Mirror Journal` while keeping the original `/archive` route.

## Storage and migration

The existing storage key remains:

`oracle-mirror-archive`

Legacy saved readings have the shape:

```js
{
  realm,
  question,
  answer,
  extra,
  date
}
```

Journal 2.0 preserves every legacy field and adds a nested metadata object:

```js
{
  realm,
  question,
  answer,
  extra,
  date,
  journal: {
    version: 1,
    id: "journal-...",
    favorite: false,
    tags: [],
    note: "",
    updatedAt: ""
  }
}
```

Migration is lazy and idempotent. Existing entries receive stable IDs the first time the journal reads them. Future legacy or Council saves can still insert the old shape; the next journal read upgrades only the new raw entries while preserving metadata already attached to migrated entries.

The existing 100-entry archive cap is unchanged.

## Privacy boundary

Journal 2.0 is intentionally local-first:

- no journal API;
- no Workers AI call;
- no third-party service;
- no journal search telemetry;
- no note telemetry;
- no tag telemetry;
- no saved question or answer telemetry;
- no sharing integration;
- no clipboard integration.

Private content is read and written only through browser `localStorage` under the existing archive key. The JSON backup is assembled in the browser and downloaded locally through a Blob URL.

`/archive` remains `noindex,follow` and remains absent from the sitemap.

## Compatibility

The implementation is modular:

- `public/mirror-journal-core.js` — migration, normalization, filtering, stats, facets, calendar and export helpers;
- `public/mirror-journal.js` — UI enhancement and storage integration;
- `public/mirror-journal.css` — responsive journal styling;
- `tests/mirror-journal.test.ts` — migration, privacy, filtering and private-route regression coverage.

The module is bootstrapped from `public/hardening.js` before the legacy application script. It observes the legacy archive list and re-applies the Journal 2.0 renderer if the original application re-renders that list during client-side navigation.

This lets the existing save flows continue working while avoiding a high-risk rewrite of the large legacy `public/script.js` archive implementation.

## Accessibility and performance

- native inputs, selects, buttons and `<details>` editors;
- explicit labels and ARIA state for favorites and calendar days;
- polite live status region;
- visible `:focus-visible` states;
- keyboard-operable filters and calendar;
- responsive layouts at tablet and mobile widths;
- reduced-motion rules;
- no perpetual animation;
- no background polling.

## Acceptance criteria

- existing archive records migrate without content loss;
- migrated records remain readable by legacy archive code;
- Council saves continue using the same key;
- later legacy saves do not erase existing journal metadata;
- favorites, notes and tags persist locally;
- search/filter/calendar logic runs locally;
- private journal text is never sent to telemetry or an API;
- archive remains `noindex`;
- CI security, typecheck, tests and production build stay green.
