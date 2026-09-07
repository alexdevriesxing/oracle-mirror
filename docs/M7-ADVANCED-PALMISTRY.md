# M7.7 — Advanced Palmistry

Pass 18 adds a standalone, server-rendered palmistry reference library around the existing `/palm-reading` Classic Palm Reading experience.

## Product position

Advanced Palmistry is an educational and reflective reference layer. It documents common palmistry traditions without pretending that hand creases scientifically predict lifespan, illness, personality, fertility, intelligence, sexuality, wealth, or unavoidable future events.

The classic AI reading remains at `/palm-reading`. The new library lives under `/palmistry` and requires no Workers AI call, feature API, camera permission, file upload, or biometric analysis.

## Route surface

The pass adds 45 canonical URLs:

- `/palmistry` — library hub.
- `/palmistry/lines` plus nine line pages.
- `/palmistry/hand-shapes` plus Earth, Air, Fire, and Water hand pages.
- `/palmistry/mounts` plus seven mount pages.
- `/palmistry/fingers` plus six finger/thumb/spacing pages.
- `/palmistry/markings` plus eight marking pages.
- `/palmistry/how-to-read-palm`.
- `/palmistry/left-right-hands`.
- `/palmistry/history`.
- `/palmistry/science`.
- `/palmistry/ethics`.

All routes are included in the sitemap and Advanced Palmistry is surfaced in `llms.txt`, the homepage realm grid, and the Realms navigation.

## Content model

Each symbolic feature page contains:

1. an answer-first description;
2. how palmists traditionally observe the feature;
3. a reflection prompt that preserves user agency;
4. an explicit scientific/medical caveat;
5. links to the Classic Palm Reading and its parent collection.

The core collections cover:

- Heart, Head, Life, Fate, Sun/Apollo, Mercury, Girdle of Venus, relationship, and travel/influence lines;
- four elemental hand archetypes;
- Jupiter, Saturn, Apollo, Mercury, Venus, Moon, and Mars mounts;
- index, middle, ring, little finger, thumb, and finger spacing;
- forks, breaks, islands, crosses, stars, squares, triangles, and grilles.

## Safety and accuracy framing

The Life Line page explicitly rejects lifespan prediction. Health-related historical labels are retained only as historical context and are paired with a clear statement that palm features cannot diagnose disease.

The ring-finger guide rejects common online overclaims that finger proportions can establish hormones, sexuality, intelligence, or medical traits.

The left/right-hand guide does not impose gender-based reading rules because palmistry schools disagree and those claims have no scientific basis.

The ethics guide prohibits fear-based predictions of death, serious illness, infertility, crime, or inevitable disaster and emphasizes uncertainty and personal agency.

## Palmistry versus dermatoglyphics

The science guide distinguishes palmistry from dermatoglyphics. Dermatoglyphics is the study of friction-ridge patterns such as fingerprints. That does not validate divinatory meanings assigned to palm lines, mounts, or hand shape.

## Historical framing

The history page avoids a single-origin myth. Palm-reading traditions developed across several cultures and were later systematized in different ways. European chiromancy is documented in medieval and early-modern sources, while nineteenth-century writers such as d'Arpentigny, Desbarrolles, and Cheiro strongly influenced modern popular palmistry.

Stories about an authentic Aristotelian palmistry treatise are not presented as fact; the relevant material belongs to later pseudo-Aristotelian traditions rather than Aristotle's accepted works.

## Architecture

- `src/palmistry-data.ts` — curated palmistry corpus.
- `src/palmistry-pages.ts` — standalone SSR renderer, schema, sitemap, discovery, and `llms.txt` integration.
- `public/palmistry.css` — responsive realm styling and reduced-motion handling.
- `tests/advanced-palmistry.test.ts` — corpus, route-count, safety, SEO, discovery, and 404 regressions.
- `src/v2-index.ts` — routes `/palmistry*` before the legacy app and augments discovery surfaces.

Reference pages require no client-side feature JavaScript.

## Quality contract

The regression suite checks:

- 9 lines, 4 hand shapes, 7 mounts, 6 digit/thumb entries, 8 markings, and 5 guides;
- exactly 45 unique canonical sitemap URLs;
- Life Line anti-lifespan language;
- health and biometric overclaim safeguards;
- science/history/ethics distinctions;
- idempotent sitemap, `llms.txt`, and homepage discovery;
- no feature API, localStorage, sessionStorage, camera, or upload dependency;
- 404 responses for unknown detail routes.
