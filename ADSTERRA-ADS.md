# Adsterra Ad Units

`public/ad-config.js` is the single source of truth for Oracle Mirror ad zones. `public/ads.js` is the only loader and telemetry layer.

## Loading Policy

- No Adsterra script is hard-coded into `public/index.html`.
- Scripts are requested asynchronously after the slot becomes eligible.
- Below-the-fold placements use IntersectionObserver lazy loading.
- Result placements are created only after the reading/result is visible.
- Site-level consent gating is configurable through `AD_CONSENT_REQUIRED`; the production default is contextual ad eligibility without a pending-consent block.
- An explicit local "Reject Ads" preference still opts the browser out of third-party ad scripts.
- Placeholder zones beginning with `TODO_ADSTERRA...` reserve space and log telemetry without throwing console errors.
- `/ad-debug` and `window.oracleAdDebug.printSummary()` expose registered, requested, loaded, filled, blocked, consent, placeholder, script error, adblock, device, and lazy-loading counts.

## Active Slot Map

| Slot ID | Adsterra unit | Placement | Format | Devices | Refresh eligible |
| --- | --- | --- | --- | --- | --- |
| `oracle-home-slot` | Native banner `2f5bd5c1…` | Home, below realm selection | Native | All | No |
| `oracle-home-leaderboard` | 728x90 `f0208b6d…` | Home, below hero | Display | Desktop | Yes |
| `oracle-realm-slot` | 300x250 `da8fed9f…` | Realm, below instructions | Display | All | No |
| `oracle-result-slot` | 300x250 `da8fed9f…` | Below rendered result | Display | All | Yes |
| `oracle-archive-native` | Native banner `2f5bd5c1…` | Archive feed | Native | All | No |
| `oracle-archive-bottom-slot` | 300x250 `da8fed9f…` | Archive bottom | Display | All | No |
| `oracle-desktop-rail-left` | 160x600 `40e53406…` | Desktop left rail | Display | Desktop | Yes |
| `oracle-desktop-rail-right` | 160x300 `34c93ad8…` | Desktop right rail | Display | Desktop | Yes |
| `oracle-mobile-anchor` | 320x50 `b3933fac…` | Mobile sticky anchor | Display | Mobile | Yes |
| `oracle-footer-banner` | 468x60 `b9dbdafd…` | Mid-content, above footer (all screens) | Display | Desktop/Tablet | Yes |

## Ambient Popunder

The popunder script is managed by `public/ads.js`, not by button handlers or inline HTML. It is eligible only after a reading value moment, then waits for the configured session age, post-result delay, and idle time since the last user interaction before loading. If `AD_CONSENT_REQUIRED` is enabled, it also waits for ad consent. This prevents the popunder from firing as a direct consequence of clicking "Reveal My Fortune" or another CTA.

## Social Bar

The Adsterra Social Bar (`bdbff70e…`) is a managed global script in `public/ads.js`. It loads once per page load, a few seconds after `initAdSystem` (idle-scheduled so it never competes with first paint), respects the local "Reject Ads" opt-out, and waits for consent when `AD_CONSENT_REQUIRED` is enabled. If consent arrives later, it loads on acceptance. Load, fill, and error telemetry is pushed to `window.dataLayer` under slot id `oracle-social-bar`.
