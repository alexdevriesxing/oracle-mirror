# M8.2 — Mirror Journal Recovery & Insights

M8.2 extends the local-first Mirror Journal with safe backup recovery, follow-up markers, and structural weekly/monthly recaps. The feature does not add a server-side journal, account requirement, Workers AI call, or private-content telemetry.

## Recovery model

Oracle Mirror restores backups by **merge**, never by destructive replacement.

1. The user explicitly chooses a local `.json` backup file.
2. The browser rejects files larger than 2 MB before reading them.
3. JSON is parsed locally and must declare `format: "mirror-journal"`.
4. Backups from a future unsupported journal version are rejected rather than guessed at.
5. Individual entries must contain a realm, answer, and valid saved date. Malformed entries are rejected individually.
6. No data is written during validation. A merge preview explains what would be added, detected as duplicate, enriched, rejected, or skipped at the storage limit.
7. The user must explicitly choose **Merge Backup Into Journal** before localStorage changes.

The validation core also refuses backup arrays above 1,000 candidate entries. The active browser journal retains the existing 100-reading product limit.

## Non-destructive merge rules

Existing browser data is authoritative:

- Every reading already present in the current browser journal is preserved.
- A restore never evicts a current local reading to make room for a newer imported reading.
- New imported readings fill only unused capacity up to 100 entries; the newest valid imported readings are considered first.
- Duplicates are matched by stable journal ID or by a content fingerprint derived from realm, date, question, and answer.
- Duplicate records inside the backup do not consume capacity more than once.
- Existing reading text is never overwritten by backup text.
- An existing local private note wins over an imported note. An imported note may fill an empty local note.
- Favorites use an additive OR rule.
- Tags are normalized, deduplicated, and unioned under the existing eight-tag limit.
- Follow-up markers may enrich duplicates.

Duplicate enrichment continues to work even when the current journal already contains 100 readings because it does not require adding another entry.

## Follow-up queue

Each saved journal card can be marked for follow-up. This adds two version-2 metadata fields inside the existing nested `journal` object:

- `followUp` — whether the reading is still pending review.
- `followedUpAt` — completion timestamp when the marker is cleared.

The existing M8.1 metadata (`id`, `favorite`, `tags`, `note`, `updatedAt`) remains unchanged. The journal migration was advanced to version 2 so follow-up fields survive later note, tag, favorite, legacy-save, and migration cycles.

Follow-up status is private local metadata and is not transmitted to analytics.

## Weekly and monthly insights

The Journal now computes lightweight recaps from structural local metadata. Visitors can switch between the current week and current month.

The recap can show:

- number of saved readings;
- active reading days;
- favorites;
- readings with private notes;
- pending follow-ups;
- most visited realms;
- realms used at least twice in the period;
- most-used tags;
- tags used at least twice in the period;
- busiest weekday.

These are descriptive counts, not AI interpretations. The insight code does not analyze the semantic content of questions, answers, or private notes.

## Privacy boundary

M8.2 intentionally has:

- no Journal API;
- no Workers AI request;
- no backup upload;
- no query, question, answer, note, tag, restore, or follow-up telemetry;
- no clipboard integration;
- no Web Share integration;
- no third-party restore service.

Backup parsing, duplicate detection, merging, insights, and follow-up state all execute locally in the visitor's browser using the same `oracle-mirror-archive` localStorage key as M8.1.

`/archive` remains `noindex,follow` and stays out of the sitemap.

## Files

- `public/mirror-journal-core.js` — version-2 metadata preservation and existing Journal 2.0 primitives.
- `public/mirror-journal-recovery-core.js` — backup validation, duplicate-safe merge, follow-ups, weekly/monthly insight calculations.
- `public/mirror-journal-recovery.js` — local restore preview/confirmation, insight panel, and follow-up controls.
- `public/mirror-journal-recovery.css` — responsive and accessible M8.2 presentation.
- `public/hardening.js` — bootstrap order.
- `tests/mirror-journal-recovery.test.ts` — recovery, no-eviction, compatibility, insight, accessibility, and privacy regression coverage.

## Acceptance criteria

M8.2 is ready only when CI proves that:

- supported versioned backups validate;
- future backup versions are rejected;
- malformed entries do not enter the journal;
- existing local readings cannot be evicted by restore;
- duplicate IDs and duplicate content fingerprints are detected;
- local notes win while safe metadata can enrich duplicates;
- backup-internal duplicates do not consume capacity twice;
- the 100-reading limit remains intact;
- follow-up metadata survives main journal normalization and later edits;
- weekly/monthly insight boundaries and recurrence logic are deterministic;
- the recovery client contains no network API or telemetry path;
- focus-visible and reduced-motion rules remain present.
