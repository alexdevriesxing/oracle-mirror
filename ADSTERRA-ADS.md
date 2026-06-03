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

| Slot ID | Placeholder name | Placement | Format | Devices | Refresh eligible |
| --- | --- | --- | --- | --- | --- |
| `oracle-home-slot` | `TODO_ADSTERRA_ORACLE_HOME_SLOT` | Home, below realm selection | Native | All | No |
| `oracle-realm-slot` | `TODO_ADSTERRA_ORACLE_REALM_SLOT` | Realm, below instructions | Display | All | No |
| `oracle-result-slot` | `TODO_ADSTERRA_ORACLE_RESULT_SLOT` | Below rendered result | Display | All | Yes |
| `oracle-archive-native` | `TODO_ADSTERRA_ORACLE_ARCHIVE_NATIVE` | Archive feed | Native | All | No |
| `oracle-archive-bottom-slot` | `TODO_ADSTERRA_ORACLE_ARCHIVE_NATIVE` | Archive bottom | Display | All | No |
| `oracle-desktop-rail-left` | `TODO_ADSTERRA_ORACLE_DESKTOP_RAIL` | Desktop left rail | Display | Desktop | Yes |
| `oracle-desktop-rail-right` | `TODO_ADSTERRA_ORACLE_DESKTOP_RAIL` | Desktop right rail | Display | Desktop | Yes |
| `oracle-mobile-anchor` | `TODO_ADSTERRA_ORACLE_MOBILE_ANCHOR` | Mobile sticky anchor | Display | Mobile | Yes |

## Ambient Popunder

The popunder script is managed by `public/ads.js`, not by button handlers or inline HTML. It is eligible only after a reading value moment, then waits for the configured session age, post-result delay, and idle time since the last user interaction before loading. If `AD_CONSENT_REQUIRED` is enabled, it also waits for ad consent. This prevents the popunder from firing as a direct consequence of clicking "Reveal My Fortune" or another CTA.

## Retired Default Scripts

The previous first-parse social-bar script is not loaded by default. Re-enable intrusive formats only after a policy review because Oracle Mirror should not block or cheapen the reading reveal.
