# M7.4 — Advanced Numerology

Oracle Mirror's Advanced Numerology layer expands the legacy Life Path experience into a standalone local six-number profile and an indexable meaning library.

## Routes

- `/numerology/advanced` — local six-number profile calculator.
- `/numerology/numbers` — meanings hub for 1–9, 11, 22, and 33.
- `/numerology/numbers/:number` — twelve individual number pages.
- `/numerology/core-numbers` — six core-number calculation guides.
- `/numerology/core-numbers/:slug` — Life Path, Expression, Soul Urge, Personality, Birthday, and Personal Year guides.

The expansion adds 21 V2 sitemap URLs while preserving `/numerology` as the legacy Life Path / AI interpretation realm.

## Calculation contract

`public/advanced-numerology-core.js` performs all calculations locally.

- Latin letters are normalized to uppercase A–Z; common diacritics are stripped before calculation.
- Letter values repeat 1–9: A=1 through I=9, J=1 through R=9, S=1 through Z=8.
- 11, 22, and 33 are preserved as master numbers when they appear as the final unreduced total.
- Soul Urge uses A, E, I, O, and U.
- Y is always treated as a consonant so the implementation remains deterministic and documented.
- Life Path uses the complete ISO birth date.
- Birthday Number uses the day of the month.
- Personal Year uses birth month + birth day + current calendar year.

Different numerology traditions make different choices around compound numbers, Y, master numbers, and name conventions. Oracle Mirror therefore describes this as one transparent modern Pythagorean rule set rather than a universal standard.

## Historical framing

The page distinguishes ancient Pythagorean number philosophy from the modern A–Z 1–9 name-calculation system. Pythagorean traditions genuinely gave number an important metaphysical and harmonic role, but Oracle Mirror does not claim that Pythagoras authored the exact Latin-letter numerology chart used by modern calculators.

This is also why the product copy avoids presenting numerology as science, diagnosis, or factual prediction.

## Privacy

The calculator does not call a feature API.

- Name stays in the form.
- Date of birth stays in the form.
- Neither value is written to localStorage or sessionStorage.
- The result view contains only derived numbers and authored meaning text.
- The social share payload accepts only the six allowed derived number values plus the calendar year.
- Arbitrary `name`, `birthDate`, email, notes, or other properties are discarded by `public/share-card-core.js`.

## Social card

The 1080×1920 share card shows:

- Life Path;
- Expression;
- Soul Urge;
- Personality;
- Birthday Number;
- Personal Year and calendar year.

The entered name and birth date are excluded by construction.

## SEO / GAIO

`src/numerology-pages.ts` provides:

- standalone SSR responses;
- unique titles and meta descriptions;
- canonical URLs;
- answer-first number meanings;
- `WebApplication`, `ItemList`, `Article`, and `BreadcrumbList` structured data;
- internal links between calculator, number meanings, and calculation guides;
- sitemap augmentation;
- `llms.txt` discovery;
- Realms-menu discovery from the legacy shell.

## Verification

`tests/advanced-numerology.test.ts` covers:

- all 12 meaning entries;
- all six calculation guides;
- letter values and diacritic normalization;
- master-number reduction;
- vowel/consonant handling and the documented Y rule;
- invalid calendar dates;
- a deterministic six-number fixture;
- standalone SSR and schema;
- the exact 21-URL sitemap surface;
- idempotent discovery;
- share-card privacy;
- zero feature API calls and zero client-side storage of private inputs.
