# Oracle Mirror V2 — M2 Monetization & Analytics

## What is live in this milestone

- Mobile visitors are assigned once per browser session to one of two mutually exclusive sticky formats:
  - `social_bar`
  - `anchor`
- The assignment is emitted as `experiment_assignment` with experiment key `mobile_ad_surface_v1`.
- Ad refresh is capped at 8 refreshes per session with a 45-second minimum interval. Existing visibility and reading-state gates still apply.
- Short-lived inventory (home leaderboard, footer banner, mobile anchor, ordinary realm MREC) no longer refreshes.
- The Dream Interpreter conversation interstitial is disabled. Monetization remains available after the final interpretation through the dream result slot.
- Existing `dataLayer` events are captured through a privacy-safe allowlist and batched to `/api/telemetry`.
- The Worker writes sanitized events to the `oracle_mirror_events` Workers Analytics Engine dataset.
- A `session_summary` event records engaged seconds, completed readings, filled ads, 1-second viewable ads and shares.

## Privacy boundary

Telemetry intentionally does **not** accept or store reading questions, names, birth dates, free-text dream content, journal notes, or generated reading text. Both the browser sender and Worker receiver use explicit allowlists.

## Analytics Engine layout

Each data point uses the session ID as the Analytics Engine index.

Blob positions:

1. event
2. realm
3. screen
4. slot ID
5. placement
6. format
7. zone ID
8. reason/error reason
9. page path
10. experiment key/result kind
11. experiment state/variant
12. Worker version ID
13. Worker version tag

Double positions:

1. event timestamp (ms)
2. answer length
3. engaged seconds
4. readings completed
5. ads filled
6. ads viewable for >= 1 second
7. shares
8. attempt
9. next attempt
10. eligible flag
11. blocked flag

## Core queries

### Mobile experiment: engagement by variant

```sql
SELECT
  blob11 AS variant,
  COUNT() AS sessions,
  AVG(double3) AS avg_engaged_seconds,
  AVG(double4) AS readings_per_session,
  AVG(double5) AS filled_ads_per_session,
  AVG(double6) AS viewable_ads_per_session
FROM oracle_mirror_events
WHERE blob1 = 'session_summary'
  AND blob10 = 'mobile_ad_surface_v1'
GROUP BY variant
ORDER BY sessions DESC;
```

### Fill and viewability by slot

```sql
SELECT
  blob4 AS slot_id,
  SUM(CASE WHEN blob1 = 'ad_slot_requested' THEN 1 ELSE 0 END) AS requests,
  SUM(CASE WHEN blob1 = 'ad_slot_filled' THEN 1 ELSE 0 END) AS fills,
  SUM(CASE WHEN blob1 = 'ad_slot_viewable_1s' THEN 1 ELSE 0 END) AS viewable_1s
FROM oracle_mirror_events
WHERE timestamp > NOW() - INTERVAL '7' DAY
GROUP BY slot_id
ORDER BY requests DESC;
```

### Reading completion by realm

```sql
SELECT
  blob2 AS realm,
  COUNT() AS completed_readings
FROM oracle_mirror_events
WHERE blob1 = 'result_rendered'
  AND timestamp > NOW() - INTERVAL '7' DAY
GROUP BY realm
ORDER BY completed_readings DESC;
```

## Revenue per engaged session

Adsterra revenue is authoritative in the Adsterra dashboard rather than in the browser. For revenue-per-session analysis:

1. export Adsterra revenue/impressions by zone for the same date range;
2. join zone IDs to Analytics Engine `blob7`;
3. allocate revenue to the corresponding slot/variant;
4. divide by unique engaged sessions or total engaged seconds, depending on the experiment.

This is why dedicated zone IDs are still important.

## Dedicated Adsterra zone migration

The current configuration reuses some Adsterra zones across multiple placements. Create new zones in Adsterra and replace the matching values in `public/ad-config.js` so each commercial surface can be measured independently.

| Desired inventory key | Current slot | Current situation | Action |
| --- | --- | --- | --- |
| `HOME_NATIVE` | `oracle-home-slot` | Native zone shared with archive/dream interstitial | Create dedicated native zone |
| `HOME_LEADERBOARD` | `oracle-home-leaderboard` | Already placement-specific | Keep |
| `REALM_300` | `oracle-realm-slot` | 300x250 zone shared with result/archive/dream result | Create dedicated 300x250 zone |
| `RESULT_300` | `oracle-result-slot` | Shared 300x250 | Create dedicated 300x250 zone |
| `ARCHIVE_NATIVE` | `oracle-archive-native` | Shared native | Create dedicated native zone |
| `ARCHIVE_300` | `oracle-archive-bottom-slot` | Shared 300x250 | Create dedicated 300x250 zone |
| `DESKTOP_RAIL_LEFT` | `oracle-desktop-rail-left` | Placement-specific | Keep |
| `DESKTOP_RAIL_RIGHT` | `oracle-desktop-rail-right` | Placement-specific | Keep |
| `MOBILE_ANCHOR` | `oracle-mobile-anchor` | Placement-specific | Keep; compare with Social Bar experiment |
| `DREAM_RESULT_300` | `oracle-dream-result-slot` | Shared 300x250 | Create dedicated 300x250 zone |
| `FOOTER_468` | `oracle-footer-banner` | Placement-specific | Keep |
| `SOCIAL_BAR` | global Social Bar | Placement-specific | Keep |
| `POPUNDER` | global ambient popunder | Placement-specific | Keep |

The retired `oracle-dream-interstitial` does not need a new zone.

## M2 decision gates

Do not pick a mobile winner until each variant has enough engaged sessions to avoid reacting to random daily CPM variation. Compare:

- revenue per engaged session;
- readings completed per session;
- viewable ads per session;
- engaged seconds;
- return rate when available.

A monetization variant is a regression if it raises raw impressions while materially reducing reading completion or engaged sessions.
