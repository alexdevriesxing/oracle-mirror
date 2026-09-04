# M6 — Instant Mysteries

Oracle Mirror V2 Pass 9 adds three zero-API-cost homepage rituals designed to improve first-session engagement, deeper-realm discovery, and organic sharing.

## Mystic Roulette

`Mystic Roulette` selects from a fixed allowlist of Oracle Mirror realms and mystics. Browser entropy makes live spins feel fresh, while the pure core helper remains deterministic for tests. The selector avoids immediately repeating the previously shown mystic when possible.

The reveal contains only a mystic, realm, short teaser, and first-party continuation route. It never accepts or stores user-authored text.

## Pick a Card

`Pick a Card` presents three face-down native buttons. Choosing one reveals a Major Arcana card and a concise reflective prompt drawn from a 22-card local corpus.

The result can continue into the full Tarot experience or create a privacy-safe 1080×1920 share card. The share payload contains only the generated card name, glyph, and built-in prompt.

## Three Doors

`Three Doors` assigns one opportunity, one warning, and one unexpected-turn outcome behind the Golden, Moon, and Crimson doors in a shuffled order. Each outcome links into an existing Oracle Mirror realm that can explore the theme more deeply.

Door results can be shared through the existing M5 share-card system. Only the selected door label and built-in reveal are used.

## Privacy

The feature reads no question fields, names, birth dates, chat text, dream text, saved Archive entries, or other personal input. It creates no account record and uses no Worker AI request.

## Telemetry

The module reuses the existing allowlisted telemetry schema with these event names:

- `instant_mystery_open`
- `instant_mystery_reveal`
- `instant_mystery_continue`

Only existing safe dimensions are used: `source`, `result_kind`, `state`, `realm`, and `page_path`.

## Accessibility and performance

- All choices are native buttons or links.
- Results use polite live regions.
- Reduced-motion preferences remove reveal/spin animation delays.
- No remote assets or additional network calls are required for the three rituals.
- The module is isolated in `instant-mysteries-core.js`, `instant-mysteries.js`, and `instant-mysteries.css`.

## Follow-on

The next M6 pass can build the Council of Mystics on top of the same pattern: one question routed through multiple existing Oracle personas, followed by a synthesized verdict and privacy-safe result actions.
