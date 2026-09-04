import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { buildDailyMirror } from "../public/daily-ritual-core.js";
import {
  collectionProgress,
  journeyWindow,
  normalizeJourneyState,
  realmForPath,
  realmQuestProgress,
  recordDailyMirror,
  recordRealmVisit,
  weeklyJourneySummary,
} from "../public/mirror-journey-core.js";
import { handleTelemetry } from "../src/telemetry.ts";

const journeyUi = await readFile(new URL("../public/mirror-journey.js", import.meta.url), "utf8");
const journeyCss = await readFile(new URL("../public/mirror-journey.css", import.meta.url), "utf8");
const hardening = await readFile(new URL("../public/hardening.js", import.meta.url), "utf8");
const ritualUi = await readFile(new URL("../public/daily-ritual.js", import.meta.url), "utf8");

function requestTelemetry(body: unknown) {
  return new Request("https://oraclemirror.com/api/telemetry", {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: "https://oraclemirror.com" },
    body: JSON.stringify(body),
  });
}

test("journey records one generated mirror per date and builds a seven-day window", () => {
  let state = normalizeJourneyState(null);
  state = recordDailyMirror(state, buildDailyMirror("2026-09-01"));
  state = recordDailyMirror(state, buildDailyMirror("2026-09-02"));
  state = recordDailyMirror(state, buildDailyMirror("2026-09-02"));
  state = recordDailyMirror(state, buildDailyMirror("2026-09-04"));

  assert.equal(state.entries.length, 3);
  const window = journeyWindow(state, "2026-09-04", 7);
  assert.equal(window.length, 7);
  assert.equal(window.at(-1)?.dateKey, "2026-09-04");
  assert.equal(window.at(-1)?.entry?.dateKey, "2026-09-04");
  assert.equal(window.filter((slot) => slot.entry).length, 3);
});

test("collection progress counts unique Major Arcana rather than ritual days", () => {
  let state = normalizeJourneyState(null);
  for (const dateKey of ["2026-09-01", "2026-09-02", "2026-09-03", "2026-09-04", "2026-09-05"]) {
    state = recordDailyMirror(state, buildDailyMirror(dateKey));
  }
  const collection = collectionProgress(state);
  assert.ok(collection.uniqueCards >= 1 && collection.uniqueCards <= 5);
  assert.equal(collection.totalCards, 22);
  assert.equal(collection.collected.length, collection.uniqueCards);
  assert.ok(collection.percent >= 0 && collection.percent <= 100);
});

test("weekly summary and realm quest dedupe same-day realm visits", () => {
  let state = normalizeJourneyState(null);
  for (const dateKey of ["2026-09-02", "2026-09-03", "2026-09-04"]) {
    state = recordDailyMirror(state, buildDailyMirror(dateKey));
  }
  state = recordRealmVisit(state, "2026-09-04", "tarot");
  state = recordRealmVisit(state, "2026-09-04", "tarot");
  state = recordRealmVisit(state, "2026-09-04", "numerology");
  state = recordRealmVisit(state, "2026-09-03", "iching");

  const summary = weeklyJourneySummary(state, "2026-09-04");
  assert.equal(summary.completedDays, 3);
  assert.equal(summary.realmsExplored, 3);
  assert.ok(summary.averages.mood > 0);
  assert.ok(["mood", "love", "money"].includes(summary.strongestArea));

  const quest = realmQuestProgress(state, "2026-09-04", 3);
  assert.equal(quest.complete, true);
  assert.equal(quest.current, 3);
});

test("realm path mapping is explicit and excludes utility pages", () => {
  assert.equal(realmForPath("/tarot"), "tarot");
  assert.equal(realmForPath("/dream-interpreter"), "dream-interpreter");
  assert.equal(realmForPath("/archive"), "");
  assert.equal(realmForPath("/privacy-policy"), "");
});

test("M4 bootstrap, local-only copy, share fallback, and reduced-motion styles are present", () => {
  assert.match(hardening, /import "\.\/mirror-journey\.js"/);
  assert.match(ritualUi, /oracle:daily-ritual-completed/);
  assert.match(journeyUi, /oracle-mirror-journey-v1/);
  assert.match(journeyUi, /navigator\.share/);
  assert.match(journeyUi, /navigator\.clipboard/);
  assert.match(journeyUi, /No reading text or personal question is stored here\./);
  assert.doesNotMatch(journeyUi, /question\s*:/i);
  assert.match(journeyCss, /\.mirror-journey/);
  assert.match(journeyCss, /prefers-reduced-motion/);
});

test("journey telemetry stores coarse counts but discards arbitrary private fields", async () => {
  const points: unknown[] = [];
  const response = await handleTelemetry(requestTelemetry({
    session_id: "journey-session-1234",
    events: [{
      event: "mirror_journey_impression",
      journey_days: 5,
      unique_cards: 4,
      realms_explored: 3,
      private_note: "this must never reach analytics",
    }],
  }), {
    ANALYTICS: { writeDataPoint(point: unknown) { points.push(point); } },
  } as any);

  assert.equal(response.status, 204);
  assert.equal(points.length, 1);
  const serialized = JSON.stringify(points[0]);
  assert.match(serialized, /mirror_journey_impression/);
  assert.match(serialized, /5/);
  assert.doesNotMatch(serialized, /this must never reach analytics/);
});
