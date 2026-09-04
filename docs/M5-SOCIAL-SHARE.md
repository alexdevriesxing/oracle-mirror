# M5 — Privacy-Safe Social Share Cards

## Goal

Turn strong Oracle Mirror results into visual acquisition assets without leaking the private inputs that produced them.

## Supported cards

### Daily Mirror
Contains only generated values:
- Card of the Day
- theme
- moon phase
- lucky number
- element

### Tarot
Contains only the drawn Past / Present / Future card names.
The original Tarot question and full AI interpretation are excluded.

### Numerology
Contains only the Life Path number.
The birth date is excluded.

### Love Match
Contains only the compatibility percentage and tier.
Seeker and partner names are excluded.

## Output

- 1080×1920 PNG, suitable for vertical story/social formats.
- Rendered on demand in the browser using Canvas.
- No server-side image generation or storage.
- No persistent public share page is created in this milestone.

## Share flow

1. A supported result renders.
2. M5 injects `Create Share Card` into the existing result actions.
3. The user opens a preview modal that explicitly explains what has been excluded.
4. `Share Image` uses the Web Share API with a PNG file when supported.
5. If file sharing is unavailable, it falls back to native text sharing or a locally saved PNG.
6. `Save PNG` is always available as a direct image fallback.

The existing Mirror Journey `Share Today's Mirror` control is intercepted by M5 and upgraded from plain text sharing to the same visual card flow.

## Files

- `public/share-card-core.js` — payload validation, sanitization, dimensions, filenames, share text.
- `public/social-share.js` — Canvas renderer, result extraction, modal, native share and PNG fallback.
- `public/social-share.css` — responsive preview UI.
- `public/hardening.js` — bootstraps the share layer before the legacy app initializes.
- `tests/social-share.test.ts` — payload and source-level privacy regressions.

## Privacy rules

The share-card payload schema intentionally has no fields for:
- user questions
- full reading text
- birth dates
- Love Match names
- email addresses
- private notes

Unknown payload properties are dropped by `sanitizeSharePayload`.

## Analytics

M5 reuses the existing safe telemetry vocabulary:
- `share_card_open`
- `share_complete`

Fields are limited to existing safe dimensions such as `realm`, `result_kind`, and `state`.
Examples of `state` are `native_file`, `native_text`, `saved_png`, and `fallback_png`.

Because `share_complete` already increments the session-level share counter, M5 requires no new Worker Analytics Engine schema fields.

## Acceptance criteria

- Daily, Tarot, Numerology, and Love Match can create a 1080×1920 card.
- Tarot question is absent from the payload and card.
- Numerology birth date is absent from the payload and card.
- Love Match names are absent from the payload and card.
- No share-card API, D1 row, KV record, or public indexed URL is created.
- Native share is used when available and a PNG fallback exists.
- Preview UI works on mobile and desktop and supports reduced-motion preferences.
- Dependency audit, typecheck, full tests, and production build pass.
