import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import {
  MIRROR_JOURNAL_ARCHIVE_KEY,
  MIRROR_JOURNAL_MAX_ENTRIES,
  MIRROR_JOURNAL_MAX_NOTE_LENGTH,
  MIRROR_JOURNAL_MAX_TAGS,
  deleteMirrorJournalEntry,
  filterMirrorJournal,
  migrateMirrorJournal,
  mirrorJournalCalendar,
  mirrorJournalExport,
  mirrorJournalFacets,
  mirrorJournalStats,
  normalizeJournalTag,
  parseJournalTags,
  readMirrorJournal,
  updateMirrorJournalEntry,
  writeMirrorJournal,
} from "../public/mirror-journal-core.js";
import { rewriteHtmlFreshness } from "../src/seo-freshness.ts";

const journalUi = await readFile(new URL("../public/mirror-journal.js", import.meta.url), "utf8");
const journalCss = await readFile(new URL("../public/mirror-journal.css", import.meta.url), "utf8");
const hardening = await readFile(new URL("../public/hardening.js", import.meta.url), "utf8");

function legacyEntry(overrides: Record<string, unknown> = {}) {
  return {
    realm: "tarot",
    question: "What should I focus on?",
    answer: "The Star invites a calmer long-term view.",
    extra: { cards: ["The Star"] },
    date: "2026-09-05T12:00:00.000Z",
    ...overrides,
  };
}

function memoryStorage(initial: unknown[] = []) {
  const values = new Map([[MIRROR_JOURNAL_ARCHIVE_KEY, JSON.stringify(initial)]]);
  return {
    getItem(key: string) { return values.get(key) ?? null; },
    setItem(key: string, value: string) { values.set(key, value); },
    removeItem(key: string) { values.delete(key); },
    dump() { return values.get(MIRROR_JOURNAL_ARCHIVE_KEY) || ""; },
  };
}

test("legacy archive entries migrate in place without losing original reading fields", () => {
  const original = legacyEntry();
  const migrated = migrateMirrorJournal([original]);
  assert.equal(migrated.entries.length, 1);
  assert.equal(migrated.changed, true);
  assert.equal(migrated.entries[0].realm, original.realm);
  assert.equal(migrated.entries[0].question, original.question);
  assert.equal(migrated.entries[0].answer, original.answer);
  assert.deepEqual(migrated.entries[0].extra, original.extra);
  assert.match(migrated.entries[0].journal.id, /^journal-[a-z0-9]+$/);
  assert.equal(migrated.entries[0].journal.favorite, false);
  assert.deepEqual(migrated.entries[0].journal.tags, []);
  assert.equal(migrated.entries[0].journal.note, "");

  const again = migrateMirrorJournal(migrated.entries);
  assert.equal(again.changed, false);
  assert.equal(again.entries[0].journal.id, migrated.entries[0].journal.id);
});

test("journal metadata survives a new raw legacy save inserted ahead of migrated entries", () => {
  let entries = migrateMirrorJournal([legacyEntry()]).entries;
  const id = entries[0].journal.id;
  entries = updateMirrorJournalEntry(entries, id, { favorite: true, tags: "career, follow-up", note: "Check this again next month." }, new Date("2026-09-06T10:00:00Z"));
  const withNewLegacySave = migrateMirrorJournal([
    legacyEntry({ realm: "numerology", date: "2026-09-07T10:00:00Z" }),
    ...entries,
  ]).entries;
  assert.equal(withNewLegacySave[1].journal.id, id);
  assert.equal(withNewLegacySave[1].journal.favorite, true);
  assert.deepEqual(withNewLegacySave[1].journal.tags, ["career", "follow-up"]);
  assert.equal(withNewLegacySave[1].journal.note, "Check this again next month.");
});

test("tag and note normalization is bounded, deduplicated and Unicode aware", () => {
  assert.equal(normalizeJournalTag("  #Déjà Vu!! "), "déjà-vu");
  const tags = parseJournalTags("Career, career, déjà vu, one, two, three, four, five, six, seven, eight, nine");
  assert.equal(tags.length, MIRROR_JOURNAL_MAX_TAGS);
  assert.equal(new Set(tags).size, tags.length);
  assert.ok(tags.every((tag) => tag.length <= 24));

  const [entry] = migrateMirrorJournal([legacyEntry()]).entries;
  const updated = updateMirrorJournalEntry([entry], entry.journal.id, { note: "x".repeat(MIRROR_JOURNAL_MAX_NOTE_LENGTH + 100) });
  assert.equal(updated[0].journal.note.length, MIRROR_JOURNAL_MAX_NOTE_LENGTH);
});

test("local filtering searches saved reading content plus private notes and tags", () => {
  let entries = migrateMirrorJournal([
    legacyEntry({ date: "2026-09-05T12:00:00Z" }),
    legacyEntry({ realm: "numerology", question: "Life path", answer: "Build patiently.", date: "2026-09-06T12:00:00Z" }),
    legacyEntry({ realm: "Council of Mystics", question: "A private choice", answer: "Three perspectives.", date: "2026-09-07T12:00:00Z" }),
  ]).entries;
  entries = updateMirrorJournalEntry(entries, entries[0].journal.id, { tags: "career, recurring", note: "Promotion discussion felt important." });
  entries = updateMirrorJournalEntry(entries, entries[2].journal.id, { favorite: true, tags: "decision" });

  assert.equal(filterMirrorJournal(entries, { query: "promotion" }).length, 1);
  assert.equal(filterMirrorJournal(entries, { query: "career recurring" }).length, 1);
  assert.equal(filterMirrorJournal(entries, { realm: "numerology" }).length, 1);
  assert.equal(filterMirrorJournal(entries, { tag: "decision" }).length, 1);
  assert.equal(filterMirrorJournal(entries, { favoritesOnly: true }).length, 1);
  assert.equal(filterMirrorJournal(entries, { dateKey: "2026-09-07" }).length, 1);
  assert.equal(filterMirrorJournal(entries, { sort: "oldest" })[0].date, "2026-09-05T12:00:00Z");
});

test("calendar, facets and stats derive only from the local archive", () => {
  let entries = migrateMirrorJournal([
    legacyEntry({ realm: "tarot", date: "2026-09-05T10:00:00Z" }),
    legacyEntry({ realm: "tarot", date: "2026-09-05T14:00:00Z" }),
    legacyEntry({ realm: "numerology", date: "2026-09-07T12:00:00Z" }),
  ]).entries;
  entries = updateMirrorJournalEntry(entries, entries[0].journal.id, { favorite: true, tags: "career" });
  entries = updateMirrorJournalEntry(entries, entries[1].journal.id, { note: "Second reading." });

  const calendar = mirrorJournalCalendar(entries, 2026, 8);
  assert.deepEqual(calendar, [
    { day: 5, count: 2, favorites: 1 },
    { day: 7, count: 1, favorites: 0 },
  ]);
  const facets = mirrorJournalFacets(entries);
  assert.deepEqual(facets.realms[0], ["tarot", 2]);
  assert.deepEqual(facets.tags, [["career", 1]]);
  assert.deepEqual(mirrorJournalStats(entries), { total: 3, favorites: 1, notes: 1, tagged: 1, realms: 2 });
});

test("read/write migration keeps the shared archive key and existing 100-entry cap", () => {
  const raw = Array.from({ length: MIRROR_JOURNAL_MAX_ENTRIES + 20 }, (_, index) => legacyEntry({ date: `2026-09-${String((index % 28) + 1).padStart(2, "0")}T12:00:00Z`, answer: `Reading ${index}` }));
  const storage = memoryStorage(raw);
  const read = readMirrorJournal(storage);
  assert.equal(read.entries.length, MIRROR_JOURNAL_MAX_ENTRIES);
  assert.equal(read.migrated, true);
  assert.equal(JSON.parse(storage.dump()).length, MIRROR_JOURNAL_MAX_ENTRIES);

  const reduced = deleteMirrorJournalEntry(read.entries, read.entries[0].journal.id);
  assert.equal(writeMirrorJournal(reduced, storage), true);
  assert.equal(JSON.parse(storage.dump()).length, MIRROR_JOURNAL_MAX_ENTRIES - 1);
});

test("private backup is explicit, versioned and contains the same migrated local entries", () => {
  const entries = migrateMirrorJournal([legacyEntry()]).entries;
  const payload = mirrorJournalExport(entries, new Date("2026-09-07T20:00:00Z"));
  assert.equal(payload.product, "Oracle Mirror");
  assert.equal(payload.format, "mirror-journal");
  assert.equal(payload.storage, "local-browser");
  assert.equal(payload.entries.length, 1);
  assert.equal(payload.exportedAt, "2026-09-07T20:00:00.000Z");
});

test("Mirror Journal UI is local-only and never sends private search, note, tag or reading text", () => {
  assert.match(hardening, /import "\.\/mirror-journal\.js"/);
  assert.match(journalUi, /oracle-mirror-archive|MIRROR_JOURNAL_ARCHIVE_KEY/);
  assert.match(journalUi, /Download Private Backup/);
  assert.match(journalUi, /Search readings, answers, notes or tags/);
  assert.match(journalUi, /mirrorJournalCalendar/);
  assert.match(journalUi, /textContent/);
  assert.doesNotMatch(journalUi, /\bfetch\s*\(/);
  assert.doesNotMatch(journalUi, /\/api\//);
  assert.doesNotMatch(journalUi, /dataLayer|sendBeacon|telemetry/i);
  assert.doesNotMatch(journalUi, /navigator\.share|navigator\.clipboard/);
  assert.match(journalCss, /focus-visible/);
  assert.match(journalCss, /prefers-reduced-motion/);
});

test("archive remains explicitly private and noindex after Journal 2.0", () => {
  const html = '<html><head><title>Reading Archive | Oracle Mirror</title><meta name="robots" content="index,follow"></head><body><section id="page-archive"></section></body></html>';
  const transformed = rewriteHtmlFreshness(html, "/archive");
  assert.match(transformed, /name="robots" content="noindex,follow"/);
});
