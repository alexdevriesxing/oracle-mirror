# Oracle Mirror Ad Monetization QA

## Build

- Run `npm run build`.
- Confirm `public/script.js` and `public/ads.js` pass JavaScript syntax checks.

## Desktop QA

- Open `/`.
- Confirm no major ad appears above the hero or before realm selection.
- Confirm the home ad reserves space below realm selection and does not shift layout.
- Open each realm URL:
  - `/crystal-ball`
  - `/tarot`
  - `/numerology`
  - `/love-oracle`
  - `/daily-fortune`
  - `/chinese-zodiac`
  - `/western-zodiac`
  - `/magic-8-ball`
- Confirm `virtual_page_view` and `realm_open` fire for each realm.
- Submit a reading and confirm:
  - Crystal Ball requires at least Matter and Season before “Reveal My Fortune” enables.
  - Crystal Ball sends `readingProfile` with the chat request.
  - `question_submitted` fires.
  - `reading_started` fires.
  - The answer appears before the result ad.
  - `result_rendered` fires.
  - `result_saved` fires.
  - Result URL changes to `/result/{realm}`.
  - Result ad appears below the answer and before “Try Another Reading”.
- Open `/archive`.
- Confirm `archive_open` fires.
- Confirm archive feed ad appears after several entries and bottom ad appears before footer.

## Mobile QA

- Repeat home, realm, result, and archive checks at mobile width.
- Confirm sticky anchor stays within 50-100px height.
- Confirm sticky anchor has a close/minimize button.
- Confirm closing the anchor logs `mobile_anchor_closed` and persists for the session.
- Confirm the anchor does not cover forms, navigation, cookie buttons, or result text.

## Consent QA

- Fresh browser profile: confirm `consent_state` is `pending` and third-party ad scripts do not request before consent.
- Accept ads: confirm configured slots request and `ad_slot_requested` fires.
- Reject ads: confirm no third-party ad scripts request and slots do not throw errors.
- Footer Cookie Preferences: confirm the consent banner can be reopened.

## Adblock QA

- With no blocker: confirm `ad_block_check` fires with `blocked: false`.
- With a blocker: confirm `ad_block_check` fires for measurement only and readings remain usable.

## SEO QA

- Confirm `https://www.oraclemirror.com/...` redirects to `https://oraclemirror.com/...`.
- Confirm canonical tags are apex on all app routes.
- Confirm OpenGraph URLs are apex.
- Confirm `/sitemap.xml` includes major realm and result URLs.
- Confirm internal navigation uses real links, not `#` links.

## Negative Checks

- No interstitial before a result reveal.
- No fake loading delay to force ad exposure.
- No social script loaded by default.
- Popunder script is not loaded from a button click handler; it loads only through the post-value ambient scheduler after consent, delay, visibility, and idle checks.
- No synchronous third-party ad script in the initial HTML.
- No console errors when a zone remains `TODO_ADSTERRA...`.
