# M7.9 — Grounded Divination Reference Library

Pass 20 adds a standalone evergreen reference layer for symbolic practices that previously appeared only as lightweight Oracle Mirror experiences or adjacent mystical themes. The goal is to deepen useful content, SEO/GAIO coverage, and internal discovery without presenting divination as scientific evidence, medical treatment, supernatural proof, or guaranteed prediction.

## Public surface

The library adds **122 canonical routes** under `/divination`:

- `/divination` — reference hub.
- `/divination/crystals` plus **36** crystal symbolism guides.
- `/divination/tea-leaves` plus **40** tea-leaf symbol guides.
- `/divination/candle-wax` plus **24** candle/wax symbol guides.
- `/divination/scrying` plus **6** method guides.
- `/divination/pendulum` plus **4** pendulum guides.
- `/divination/guides` plus **5** grounding guides covering history, pareidolia, ritual safety, symbol journaling, and tradition versus evidence.

All pages are standalone server-rendered HTML with canonical URLs and indexable metadata. Collection pages include `CollectionPage` and `ItemList` structured data; detail pages include `Article` and `BreadcrumbList` structured data.

## Crystal symbolism

The crystal branch documents common modern spiritual associations such as calm, boundaries, confidence, transition, compassion, or focus. The copy intentionally describes these as **symbolic associations and ritual cues**, not measurable healing properties.

Crystal pages do not claim that stones:

- diagnose or treat illness;
- cure, detoxify, or alter medical conditions;
- provide objectively verified spiritual or physical protection;
- replace medical or mental-health care;
- emit a proven force that guarantees emotional or practical outcomes.

A visitor can still use a stone as a physical reminder for an intention or reflection theme without Oracle Mirror presenting that personal use as clinical efficacy.

## Pendulum reflection

The pendulum branch explains a low-stakes reflective method and explicitly introduces the **ideomotor effect**: tiny involuntary muscle movements can produce visible pendulum motion without conscious intention.

That distinction matters because the existing Mirror Lab Pendulum can feel responsive. The reference layer explains why responsiveness should not be mistaken for an independent factual information source.

Pendulum pages cover:

- a simple practice method;
- predefined yes / no / maybe patterns;
- the ideomotor effect;
- ethics and better questions.

The Mirror Lab Pendulum panel now contains a direct educational link to `/divination/pendulum`. The bridge does not read the visitor's question, add telemetry, or persist data.

## Scrying

Six guides cover:

1. Crystal ball scrying.
2. Black mirror scrying.
3. Water scrying.
4. Flame gazing.
5. Smoke scrying.
6. Cloud scrying.

The guides frame scrying as focused observation of ambiguous visual material that can encourage imagery, memory, metaphor, and free association. They explicitly distinguish this from proof of remote viewing, supernatural communication, or externally supplied future information.

Cloud and other pattern-heavy methods connect naturally to the pareidolia guide: perceiving meaningful shapes in ambiguous material is a normal feature of human perception.

## Tea-leaf symbols

The tea branch contains 40 common forms, including Anchor, Bird, Bridge, Clock, Door, Heart, Key, Moon, Ring, Snake, Star, Tree, and Wolf.

Each symbol is treated as a **flexible metaphor**. The guide encourages the reader to consider:

- what the shape first reminded them of;
- where it appeared in the cup;
- whether it was clear or ambiguous;
- nearby shapes;
- the emotional and personal association they brought to it.

The dictionary is therefore a prompt library, not a fixed decoding key. Tea leaves are not presented as evidence of illness, pregnancy, crime, another person's private intentions, or future events.

## Candle and wax symbolism

The wax branch contains 24 shapes such as Arch, Circle, Crescent, Cross, Heart, Key, Ring, Spiral, Star, Tower, and Wave.

Pages start from the physical reality that cooling wax is shaped by heat, gravity, surface angle, material composition, and chance. Symbolic meaning is assigned only after the form appears.

Fire safety is part of the product content rather than a footnote:

- never leave candles unattended;
- keep flames away from children, pets, and flammable material;
- use a stable heat-safe surface;
- do not use flame, soot, wax, or smoke behaviour as a medical test or danger detector.

## Grounding standard

Across the entire library, Oracle Mirror distinguishes four layers:

1. **Observation** — what was physically seen or experienced.
2. **Tradition** — what a symbolic practice commonly associates with it.
3. **Personal association** — what the image evokes for this particular reader.
4. **Evidence** — what can actually be supported as a factual claim.

The site can preserve atmosphere and imaginative reflection without collapsing those layers into supernatural certainty.

High-stakes decisions stay outside the ritual. The library does not endorse using divination to diagnose health conditions, identify criminals, determine whether someone is lying, predict death or disaster, or replace medical, legal, financial, safety, or mental-health expertise.

## Runtime and privacy

The reference library itself:

- uses no Workers AI;
- adds no feature API endpoint;
- uses no localStorage or sessionStorage;
- creates no new telemetry stream;
- has no perpetual animation loop;
- requires no user input.

`public/divination-bridge.js` only inserts the educational Pendulum link after the existing Mirror Lab module has mounted. It does not access the Pendulum input value.

## SEO / GAIO

Pass 20 adds:

- 122 standalone canonical URLs;
- answer-first copy on detail pages;
- CollectionPage / ItemList schema on hubs;
- Article / BreadcrumbList schema on detail pages;
- sitemap integration;
- `llms.txt` discovery;
- Realms-menu discovery;
- a homepage Divination Library card;
- internal links back to existing Crystal Ball and Mirror Lab experiences.

The content is intentionally evergreen rather than news-like and does not depend on third-party APIs.

## File map

- `src/divination-data.ts` — reference corpora.
- `src/divination-pages.ts` — SSR rendering, routing, schema, sitemap, llms, and app-shell discovery.
- `public/divination.css` — standalone responsive presentation.
- `public/divination-bridge.js` — privacy-safe Mirror Lab education link.
- `tests/divination-library.test.ts` — route counts, rendering, safety, privacy, runtime, and discovery regressions.

## Acceptance criteria

- Exactly 36 crystal guides.
- Exactly 40 tea-leaf symbols.
- Exactly 24 candle/wax symbols.
- Exactly six scrying methods.
- Exactly four pendulum guides.
- Exactly five grounding guides.
- Exactly 122 unique canonical routes.
- All canonical routes render indexable standalone HTML.
- Unknown `/divination/*` routes return 404.
- Crystal pages reject medical/healing certainty.
- Tea/scrying pages describe pattern recognition rather than supernatural proof.
- Wax pages include practical fire safety.
- Pendulum pages explain the ideomotor effect and low-stakes use.
- No feature AI/API/storage/perpetual animation runtime.
- Mirror Lab educational bridge never reads or transmits the visitor's question.
- Sitemap, `llms.txt`, homepage, and navigation discovery are idempotent.
- Full CI and production build green before merge.
