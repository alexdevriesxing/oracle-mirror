# Oracle Mirror Adsterra Audit

## Current Architecture

- Framework: vanilla HTML, CSS, and JavaScript served by a Cloudflare Worker.
- App shell: `public/index.html` contains all realm screens in one SPA.
- Client state: `public/script.js` handles route state, virtual screens, reading flows, and LocalStorage archive.
- Ad system: `public/ad-config.js` is the central zone map; `public/ads.js` registers, loads, observes, and measures slots.
- Worker routes: `src/index.ts` serves real crawlable paths and result paths with apex canonical metadata.

## Canonical Host

- Canonical host remains `https://oraclemirror.com`.
- `www.oraclemirror.com` is redirected to apex in the Worker before API/static handling.
- Sitemap, canonical tags, and OpenGraph URLs use apex.

## Removed Risk

- Removed first-parse global Adsterra scripts from `index.html`.
- Removed popup/social scripts from first-parse loading because they can feel intrusive before value is delivered.
- Replaced inline ad snippets with reusable config-driven slots.

## Monetization Model

- Home: one native/display placement below realm selection.
- Realm screens: one tasteful slot below realm explanation/visual instructions.
- Result screens: result slot is created only after the answer is rendered.
- Result aftercare: the result ad appears before the “Try Another Reading” action.
- Archive: native/feed placement after several entries plus a bottom slot before footer.
- Mobile: sticky bottom anchor is closeable per session, suppressed during form focus, and follows the site-level consent policy.
- Desktop: optional side rails on realm/result states for wide screens.
- Popunder: loaded only through the ambient post-value scheduler, never directly from a button click handler, and gated by consent when `AD_CONSENT_REQUIRED=true`.
- Consent: production defaults to contextual ad eligibility without a pending-consent block; environments can set `AD_CONSENT_REQUIRED=true` to require ad consent before any third-party ad script request.

## Adsterra Placeholder Policy

Configured slots include the requested placeholder names:

- `TODO_ADSTERRA_ORACLE_MOBILE_ANCHOR`
- `TODO_ADSTERRA_ORACLE_RESULT_SLOT`
- `TODO_ADSTERRA_ORACLE_REALM_SLOT`
- `TODO_ADSTERRA_ORACLE_ARCHIVE_NATIVE`
- `TODO_ADSTERRA_ORACLE_DESKTOP_RAIL`
- `TODO_ADSTERRA_ORACLE_HOME_SLOT`

If a slot still has a `TODO_ADSTERRA...` zone or no script URL, the loader renders the reserved frame and logs the slot as a placeholder instead of throwing a console error.

## Telemetry

All events are pushed to `window.dataLayer`, and `/ad-debug` plus `window.oracleAdDebug.printSummary()` expose live client-side counts. Events include:

- Navigation/value: `page_view`, `virtual_page_view`, `realm_open`, `question_submitted`, `reading_started`, `result_rendered`, `result_saved`, `archive_open`, `another_reading_click`
- Ads: `ad_slot_registered`, `ad_slot_deferred`, `ad_slot_requested`, `ad_script_loaded`, `ad_slot_filled`, `ad_slot_unfilled`, `ad_script_error`, `ad_slot_visible_50`, `ad_slot_viewable_1s`, `ad_slot_collapsed`, `ad_block_check`, `mobile_anchor_closed`, `mobile_anchor_suppressed`
- Privacy: `consent_state`

## Crystal Ball Concept Update

Madame Fortuna now asks the seeker to prepare the mirror before the crystal-ball chat:

- Matter: the life area for the reading
- Season: the time horizon
- Omen: an optional recurring sign
- Heart: an optional emotional tone

The frontend sends these fields as `readingProfile` to `/api/chat`. The Worker injects that profile as private reading context so Madame Fortuna can weave it into the prophecy without mechanically listing the answers.

## Refresh Framework

Viewability-aware refresh support exists in `public/ad-config.js` but is disabled by default. It requires:

- Slot marked `refreshEligible`
- Slot has been viewable
- `document.visibilityState === "visible"`
- No active form input
- No active result animation state
- Session cap and minimum interval satisfied
