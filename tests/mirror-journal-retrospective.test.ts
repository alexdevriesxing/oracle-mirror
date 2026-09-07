import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { migrateMirrorJournal } from "../public/mirror-journal-core.js";
import {
  journalFollowUpDashboard,
  journalJourneyBridge,
  journalMonthComparison,
  journalMonthlyTrend,
  journalOnThisDay,
  journalReflectionPrompts,
} from "../public/mirror-journal-retrospective-core.js";

const retroCoreSource = await readFile(new URL("../public/mirror-journal-retrospective-core.js", import.meta.url), "utf8");
const retroUiSource = await readFile(new URL("../public/mirror-journal-retrospective.js", import.meta.url), "utf8");
const retroCssSource = await readFile(new URL("../public/mirror-journal-retrospective.css", import.meta.url), "utf8");
const hardeningSource = await readFile(new URL("../public/hardening.js", import.meta.url), "utf8");

function rawEntry(date: string, realm = "tarot", journal: Record<string, any> = {}, index = 0) {
  return {
    realm,
    question: `Private question ${index}`,
    answer: `Private answer ${index}`,
    date,
    journal,
  };
}

function migrated(entries: any[]) {
  return migrateMirrorJournal(entries).entries;
}

test("month comparison reports structural deltas without reading private text", () => {
  const entries = migrated([
    rawEntry("2026-09-02T12:00:00.000Z", "tarot", { favorite: true, tags: ["career"], note: "private" }, 1),
    rawEntry("2026-09-05T12:00:00.000Z", "tarot", { tags: ["career"] }, 2),
    rawEntry("2026-09-06T12:00:00.000Z", "numerology", { followUp: true }, 3),
    rawEntry("2026-08-12T12:00:00.000Z", "dream-interpreter", { favorite: true }, 4),
  ]);
  const comparison = journalMonthComparison(entries, new Date("2026-09-07T12:00:00.000Z"));
  assert.equal(comparison.current.key, "2026-09");
  assert.equal(comparison.previous.key, "2026-08");
  assert.equal(comparison.current.readings, 3);
  assert.equal(comparison.previous.readings, 1);
  assert.equal(comparison.readings.change, 2);
  assert.equal(comparison.readings.direction, "up");
  assert.deepEqual(comparison.current.topRealm, ["tarot", 2]);
  assert.deepEqual(comparison.current.topTag, ["career", 2]);
  assert.equal(comparison.current.notes, 1);
  assert.equal(comparison.current.followUps, 1);
});

test("six month trend is ordered, bounded and measures continuity", () => {
  const entries = migrated([
    rawEntry("2026-04-01T12:00:00.000Z", "tarot", {}, 1),
    rawEntry("2026-06-01T12:00:00.000Z", "tarot", {}, 2),
    rawEntry("2026-07-01T12:00:00.000Z", "tarot", {}, 3),
    rawEntry("2026-08-01T12:00:00.000Z", "tarot", {}, 4),
    rawEntry("2026-09-01T12:00:00.000Z", "tarot", {}, 5),
  ]);
  const trend = journalMonthlyTrend(entries, new Date("2026-09-07T12:00:00.000Z"), 99);
  assert.equal(trend.months.length, 12);
  assert.equal(trend.months.at(-1)?.key, "2026-09");
  assert.equal(trend.currentStreakMonths, 4);
  assert.equal(trend.activeMonths, 5);
});

test("follow-up dashboard sorts oldest first and uses clear age buckets", () => {
  const entries = migrated([
    rawEntry("2026-09-05T12:00:00.000Z", "tarot", { followUp: true }, 1),
    rawEntry("2026-08-20T12:00:00.000Z", "numerology", { followUp: true }, 2),
    rawEntry("2026-07-01T12:00:00.000Z", "iching", { followUp: true }, 3),
    rawEntry("2026-08-15T12:00:00.000Z", "tarot", { followUp: false, followedUpAt: "2026-08-20T12:00:00.000Z" }, 4),
  ]);
  const dashboard = journalFollowUpDashboard(entries, new Date("2026-09-07T12:00:00.000Z"));
  assert.equal(dashboard.pendingCount, 3);
  assert.equal(dashboard.completedCount, 1);
  assert.equal(dashboard.buckets.fresh, 1);
  assert.equal(dashboard.buckets.aging, 1);
  assert.equal(dashboard.buckets.longstanding, 1);
  assert.equal(dashboard.pending[0].realm, "iching");
  assert.ok(dashboard.oldestAgeDays >= 60);
  assert.ok(!Object.prototype.hasOwnProperty.call(dashboard.pending[0], "question"));
  assert.ok(!Object.prototype.hasOwnProperty.call(dashboard.pending[0], "answer"));
});

test("On This Day resurfaces only earlier years for the same calendar date", () => {
  const entries = migrated([
    rawEntry("2025-09-07T12:00:00.000Z", "tarot", { tags: ["annual"] }, 1),
    rawEntry("2024-09-07T12:00:00.000Z", "numerology", {}, 2),
    rawEntry("2026-09-07T10:00:00.000Z", "iching", {}, 3),
    rawEntry("2025-09-08T12:00:00.000Z", "dream-interpreter", {}, 4),
  ]);
  const matches = journalOnThisDay(entries, new Date("2026-09-07T12:00:00.000Z"));
  assert.equal(matches.length, 2);
  assert.deepEqual(matches.map((item) => item.year), [2025, 2024]);
  assert.deepEqual(matches.map((item) => item.realm), ["tarot", "numerology"]);
});

test("Journal and Mirror Journey bridge compares only local structural histories", () => {
  const entries = migrated([
    rawEntry("2026-09-05T12:00:00.000Z", "tarot", {}, 1),
    rawEntry("2026-09-06T12:00:00.000Z", "numerology", {}, 2),
    rawEntry("2026-08-01T12:00:00.000Z", "iching", {}, 3),
  ]);
  const journey = {
    entries: [
      { dateKey: "2026-09-05", cardName: "The Star" },
      { dateKey: "2026-09-07", cardName: "The Moon" },
    ],
    realmVisits: [
      { dateKey: "2026-09-05", realm: "tarot" },
      { dateKey: "2026-09-07", realm: "iching" },
    ],
  };
  const bridge = journalJourneyBridge(entries, journey, new Date("2026-09-07T12:00:00.000Z"), 30);
  assert.equal(bridge.journalDays, 2);
  assert.equal(bridge.journeyDays, 2);
  assert.equal(bridge.pairedDays, 1);
  assert.equal(bridge.journalOnlyDays, 1);
  assert.equal(bridge.journeyOnlyDays, 1);
  assert.deepEqual(bridge.sharedRealms, ["tarot"]);
  assert.equal(bridge.uniqueJourneyCards, 2);
});

test("reflection prompts are deterministic structural prompts rather than text analysis", () => {
  const prompts = journalReflectionPrompts({
    comparison: {
      current: { topRealm: ["tarot", 3] },
      readings: { direction: "up" },
    },
    followUps: { pendingCount: 2 },
    onThisDay: [{ id: "journal-old" }],
    journeyBridge: { pairedDays: 4 },
  });
  assert.equal(prompts.length, 4);
  assert.deepEqual(prompts.map((item) => item.id), ["follow-up", "anniversary", "realm", "pace-up"]);
  assert.ok(prompts.some((item) => item.prompt.includes("tarot")));
});

test("M8.3 UI is local-only, accessible and does not inspect journal question or answer text", () => {
  assert.match(hardeningSource, /import "\.\/mirror-journal-retrospective\.js"/);
  assert.match(retroUiSource, /Mirror Retrospectives/);
  assert.match(retroUiSource, /data-journal-reset/);
  assert.match(retroUiSource, /scrollIntoView/);
  assert.match(retroUiSource, /focus\(\{ preventScroll: true \}\)/);
  assert.match(retroCssSource, /prefers-reduced-motion/);
  assert.match(retroCssSource, /focus-visible/);
  assert.doesNotMatch(retroCoreSource, /\.question\b|\.answer\b/);
  assert.doesNotMatch(retroUiSource, /fetch\s*\(|\/api\/|dataLayer|telemetry|navigator\.clipboard|navigator\.share/i);
  assert.doesNotMatch(retroCoreSource, /fetch\s*\(|\/api\/|dataLayer|telemetry|navigator\.clipboard|navigator\.share/i);
});
