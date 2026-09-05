# M6.4 — Council of Mystics

## Purpose

Council of Mystics is Oracle Mirror's first signature multi-perspective reading. A seeker asks one question, three fictional mystics answer through different lenses, and the Mirror produces a synthesis plus one practical next step.

## Cost architecture

A Council reading makes **one** Workers AI request. The selected three voices and the Mirror Verdict are requested in one structured JSON response. The UI renders that single response as four visual sections.

There are no hidden follow-up model calls and no per-mystic requests.

If Workers AI fails or returns malformed JSON, the endpoint returns a controlled fallback council instead of retrying the model repeatedly.

## Council pool

The server selects three distinct members deterministically from:

- Madame Fortuna — possibilities and uncertainty
- Seraphina — patterns, choices, and action
- Morpheus — hidden assumptions and emotions
- Rosalind — relationships, empathy, and boundaries
- Pythius — structure, repeatable patterns, and testing
- Sage Lao-Tan — timing, change, and non-forcing

The same normalized question selects the same trio, making retries visually coherent while the actual AI wording can still vary.

## API

`POST /api/council`

Request:

```json
{ "question": "A reflective question between 8 and 500 characters" }
```

Response contains:

- exactly three allowlisted mystic voices;
- one Mirror Verdict;
- one next step;
- `source: "ai"` or `source: "fallback"`.

The question is not returned as a separate response field.

### Guardrails

- one model call per accepted request;
- 8–500 character normalized input;
- same-origin browser check;
- lightweight per-isolate rate limit: four Council readings per ten-minute window;
- no-store responses;
- noindex response header;
- prompt explicitly avoids supernatural certainty and high-stakes professional instructions;
- high-stakes situations are redirected toward appropriate qualified help while keeping the response reflective.

## Privacy

The question is sent to Workers AI because it is necessary to create the requested reading. It is **not** sent through Oracle Mirror telemetry.

Archive behavior is opt-in: only pressing **Save to Private Archive** stores the question and Council response in the existing `oracle-mirror-archive` localStorage record. Nothing is uploaded for Archive storage.

The social card is intentionally more restrictive. It contains only:

- Council of Mystics branding;
- the three participating mystic names;
- a generic “The Council Spoke” message.

It excludes the question, the three answers, the Mirror Verdict, names, dates, emails, and arbitrary extra properties.

## Homepage UX

The module is inserted after Instant Mysteries and before the normal realm grid when possible.

Flow:

1. Enter one question.
2. Convene the Council.
3. Read three independent perspectives.
4. Read the Mirror Verdict and practical next step.
5. Optionally save locally or create a privacy-safe share card.
6. Reset and ask another question.

The module uses native controls, live status regions, keyboard focus styles, responsive layouts, and reduced-motion handling.

## Telemetry

Only coarse allowlisted events are emitted:

- `council_view`
- `council_start`
- `council_complete`
- `council_error`
- `council_save`
- `council_share`

The question and generated answer text are never attached to telemetry events.

## Acceptance gate

M6.4 is complete when:

- `/api/council` uses no more than one `AI.run` call per accepted request;
- three distinct allowlisted mystics are returned;
- malformed/failed model output falls back cleanly;
- the question is not placed in telemetry;
- Archive saving is explicit and local-only;
- social cards exclude question and answer text;
- native accessibility and reduced-motion checks pass;
- dependency audit, typecheck, tests, and production build are green.
