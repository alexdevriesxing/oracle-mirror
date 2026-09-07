import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  migrateMirrorJournal,
  mirrorJournalExport,
  updateMirrorJournalEntry,
} from "../public/mirror-journal-core.js";
import {
  MIRROR_JOURNAL_RECOVERY_VERSION,
  markMirrorJournalFollowUp,
  mergeMirrorJournalBackup,
  mirrorJournalFingerprint,
  mirrorJournalInsights,
  validateMirrorJournalBackup,
} from "../public/mirror-journal-recovery-core.js";

const recoveryUi = await readFile(new URL("../public/mirror-journal-recovery.js", import.meta.url), "utf8");
const recoveryCss = await readFile(new URL("../public/mirror-journal-recovery.css", import.meta.url), "utf8");
const hardening = await readFile(new URL("../public/hardening.js", import.meta.url), "utf8");

function entry(overrides: Record<string, any> = {}) {
  return {
    realm: "tarot",
    question: "What should I focus on?",
    answer: "Move carefully and choose what matters.",
    date: "2026-09-07T12:00:00.000Z",
    ...overrides,
  };
}

test("M8.2 accepts supported Oracle Mirror backups and rejects malformed or future formats", () => {
  const exported = mirrorJournalExport([entry()], new Date("2026-09-07T18:00:00.000Z"));
  const valid = validateMirrorJournalBackup(JSON.stringify(exported));
  assert.equal(valid.ok, true);
  assert.equal(valid.entries.length, 1);
  assert.equal(valid.rejected, 0);

  assert.equal(validateMirrorJournalBackup("not json").error, "invalid-json");
  assert.equal(validateMirrorJournalBackup({ format: "other", entries: [] }).error, "wrong-format");
  assert.equal(validateMirrorJournalBackup({ format: "mirror-journal" }).error, "missing-entries");
  assert.equal(validateMirrorJournalBackup({
    format: "mirror-journal",
    version: MIRROR_JOURNAL_RECOVERY_VERSION + 1,
    entries: [entry()],
  }).error, "unsupported-version");
});

test("backup validation rejects malformed entries without importing their content", () => {
  const result = validateMirrorJournalBackup({
    format: "mirror-journal",
    version: 1,
    entries: [entry(), { realm: "tarot", answer: "missing date" }, null],
  });
  assert.equal(result.ok, true);
  assert.equal(result.entries.length, 1);
  assert.equal(result.rejected, 2);
});

test("duplicate restore preserves local note while imported metadata safely enriches it", () => {
  let local = migrateMirrorJournal([entry()]).entries;
  const id = local[0].journal.id;
  local = updateMirrorJournalEntry(local, id, { note: "My private local note", tags: ["career"], favorite: false }, new Date("2026-09-07T13:00:00.000Z"));

  const imported = [{
    ...entry(),
    journal: {
      id,
      favorite: true,
      note: "Backup note must not overwrite local note",
      tags: ["career", "decision"],
      followUp: true,
    },
  }];

  const merged = mergeMirrorJournalBackup(local, imported);
  assert.equal(merged.summary.added, 0);
  assert.equal(merged.summary.duplicates, 1);
  assert.equal(merged.summary.enriched, 1);
  assert.equal(merged.entries[0].journal.note, "My private local note");
  assert.equal(merged.entries[0].journal.favorite, true);
  assert.deepEqual(merged.entries[0].journal.tags, ["career", "decision"]);
  assert.equal(merged.entries[0].journal.followUp, true);
});

test("content fingerprint catches duplicates even when journal ids differ", () => {
  const local = migrateMirrorJournal([entry()]).entries;
  const imported = [{ ...entry(), journal: { id: "journal-imported123", favorite: true } }];
  assert.equal(mirrorJournalFingerprint(local[0]), mirrorJournalFingerprint(imported[0]));
  const merged = mergeMirrorJournalBackup(local, imported);
  assert.equal(merged.entries.length, 1);
  assert.equal(merged.summary.duplicates, 1);
  assert.equal(merged.entries[0].journal.favorite, true);
});

test("restore keeps the newest 100 imported readings when the local journal is empty", () => {
  const backup = Array.from({ length: 105 }, (_, index) => entry({
    realm: `realm-${index}`,
    answer: `Answer ${index}`,
    question: `Question ${index}`,
    date: new Date(Date.UTC(2026, 0, index + 1)).toISOString(),
  }));
  const merged = mergeMirrorJournalBackup([], backup);
  assert.equal(merged.entries.length, 100);
  assert.equal(merged.summary.added, 100);
  assert.equal(merged.summary.truncated, 5);
  assert.ok(Date.parse(merged.entries[0].date) >= Date.parse(merged.entries.at(-1)!.date));
});

test("restore never evicts an existing local reading even when imported readings are newer", () => {
  const local = migrateMirrorJournal(Array.from({ length: 99 }, (_, index) => entry({
    realm: `local-${index}`,
    answer: `Local answer ${index}`,
    question: `Local question ${index}`,
    date: new Date(Date.UTC(2025, 0, index + 1)).toISOString(),
  }))).entries;
  const localFingerprints = new Set(local.map(mirrorJournalFingerprint));
  const backup = Array.from({ length: 10 }, (_, index) => entry({
    realm: `import-${index}`,
    answer: `Import answer ${index}`,
    question: `Import question ${index}`,
    date: new Date(Date.UTC(2027, 0, index + 1)).toISOString(),
  }));

  const merged = mergeMirrorJournalBackup(local, backup);
  assert.equal(merged.entries.length, 100);
  assert.equal(merged.summary.added, 1);
  assert.equal(merged.summary.truncated, 9);
  for (const fingerprint of localFingerprints) {
    assert.ok(merged.entries.some((item) => mirrorJournalFingerprint(item) === fingerprint));
  }
});

test("duplicate records inside one backup do not consume journal capacity twice", () => {
  const duplicate = entry({ realm: "runes", answer: "Same cast" });
  const merged = mergeMirrorJournalBackup([], [duplicate, { ...duplicate, journal: { id: "journal-other" } }]);
  assert.equal(merged.entries.length, 1);
  assert.equal(merged.summary.added, 1);
  assert.equal(merged.summary.duplicates, 1);
});

test("follow-up metadata survives the main journal migration and later note updates", () => {
  let entries = migrateMirrorJournal([entry()]).entries;
  const id = entries[0].journal.id;
  entries = markMirrorJournalFollowUp(entries, id, true, new Date("2026-09-07T14:00:00.000Z"));
  entries = migrateMirrorJournal(entries).entries;
  assert.equal(entries[0].journal.followUp, true);
  entries = updateMirrorJournalEntry(entries, id, { note: "Check again next week" }, new Date("2026-09-07T15:00:00.000Z"));
  assert.equal(entries[0].journal.followUp, true);

  entries = markMirrorJournalFollowUp(entries, id, false, new Date("2026-09-08T15:00:00.000Z"));
  assert.equal(entries[0].journal.followUp, false);
  assert.equal(entries[0].journal.followedUpAt, "2026-09-08T15:00:00.000Z");
});

test("weekly and monthly insights stay structural and identify recurring patterns", () => {
  const entries = migrateMirrorJournal([
    entry({ realm: "tarot", date: "2026-09-07T09:00:00.000Z", journal: { tags: ["career"], favorite: true, followUp: true } }),
    entry({ realm: "tarot", answer: "Second", date: "2026-09-08T09:00:00.000Z", journal: { tags: ["career"] } }),
    entry({ realm: "numerology", answer: "Third", date: "2026-09-09T09:00:00.000Z", journal: { tags: ["planning"], note: "private" } }),
    entry({ realm: "dream-interpreter", answer: "Old", date: "2026-08-10T09:00:00.000Z", journal: { tags: ["career"] } }),
  ]).entries;

  const week = mirrorJournalInsights(entries, { period: "week", anchorDate: new Date("2026-09-09T12:00:00.000Z") });
  assert.equal(week.readings, 3);
  assert.equal(week.activeDays, 3);
  assert.equal(week.pendingFollowUps, 1);
  assert.deepEqual(week.recurringRealms, [["tarot", 2]]);
  assert.deepEqual(week.recurringTags, [["career", 2]]);

  const month = mirrorJournalInsights(entries, { period: "month", anchorDate: new Date("2026-09-09T12:00:00.000Z") });
  assert.equal(month.readings, 3);
  assert.equal(month.topRealms[0][0], "tarot");
});

test("M8.2 bootstrap, recovery preview, accessibility and privacy boundaries are present", () => {
  assert.match(hardening, /import "\.\/mirror-journal-recovery\.js"/);
  assert.match(recoveryUi, /Choose Backup File/);
  assert.match(recoveryUi, /Merge Backup Into Journal/);
  assert.match(recoveryUi, /every reading already in this browser is preserved/i);
  assert.match(recoveryUi, /unsupported-version/);
  assert.match(recoveryUi, /aria-pressed/);
  assert.match(recoveryUi, /Follow-up/);
  assert.match(recoveryUi, /MAX_BACKUP_BYTES/);
  assert.match(recoveryCss, /prefers-reduced-motion/);
  assert.match(recoveryCss, /focus-visible/);
  assert.doesNotMatch(recoveryUi, /fetch\s*\(/);
  assert.doesNotMatch(recoveryUi, /\/api\//);
  assert.doesNotMatch(recoveryUi, /trackEvent|dataLayer|telemetry/i);
  assert.doesNotMatch(recoveryUi, /navigator\.clipboard|navigator\.share/);
});
