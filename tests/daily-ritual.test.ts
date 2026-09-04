import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  activeStreakForDate,
  buildDailyMirror,
  completeDailyRitual,
  daysBetweenDateKeys,
  moonPhaseForDate,
  normalizeRitualState,
  ritualBadgeProgress,
} from "../public/daily-ritual-core.js";

const ritualUi = await readFile(new URL("../public/daily-ritual.js", import.meta.url), "utf8");
const ritualCss = await readFile(new URL("../public/daily-ritual.css", import.meta.url), "utf8");
const hardening = await readFile(new URL("../public/hardening.js", import.meta.url), "utf8");

test("daily mirror is stable for a local date and exposes the full ritual payload", () => {
  const first = buildDailyMirror("2026-09-04");
  const second = buildDailyMirror("2026-09-04");

  assert.deepEqual(first, second);
  assert.equal(first.dateKey, "2026-09-04");
  assert.ok(first.tarot.name.length > 0);
  assert.ok(first.luckyNumber >= 1 && first.luckyNumber <= 99);
  assert.ok(first.scores.mood >= 0 && first.scores.mood <= 100);
  assert.ok(first.scores.love >= 0 && first.scores.love <= 100);
  assert.ok(first.scores.money >= 0 && first.scores.money <= 100);
  assert.match(first.recommendation.path, /^\//);
});

test("streak increments once per consecutive local day and resets after a gap", () => {
  let state = normalizeRitualState(null);
  state = completeDailyRitual(state, "2026-09-04");
  assert.equal(state.streak, 1);
  assert.equal(state.totalDays, 1);

  const repeated = completeDailyRitual(state, "2026-09-04");
  assert.deepEqual(repeated, state);

  state = completeDailyRitual(state, "2026-09-05");
  assert.equal(state.streak, 2);
  assert.equal(state.bestStreak, 2);
  assert.equal(state.totalDays, 2);
  assert.equal(activeStreakForDate(state, "2026-09-06"), 2);

  state = completeDailyRitual(state, "2026-09-08");
  assert.equal(state.streak, 1);
  assert.equal(state.bestStreak, 2);
  assert.equal(state.totalDays, 3);
  assert.equal(activeStreakForDate(state, "2026-09-10"), 0);
});

test("date math is DST-safe and badge progress follows best streak", () => {
  assert.equal(daysBetweenDateKeys("2026-03-28", "2026-03-29"), 1);
  assert.equal(daysBetweenDateKeys("2026-10-24", "2026-10-25"), 1);

  const progress = ritualBadgeProgress({
    lastCompletedDate: "2026-09-10",
    streak: 7,
    bestStreak: 7,
    totalDays: 7,
  });
  assert.equal(progress.current?.name, "Seven-Day Seer");
  assert.equal(progress.next?.threshold, 14);
});

test("moon phase calculation returns a named phase with a bounded lunar age", () => {
  const phase = moonPhaseForDate("2026-09-04");
  assert.ok(phase.name.length > 0);
  assert.ok(phase.ageDays >= 0 && phase.ageDays < 29.6);
});

test("V2 bootstrap mounts the ritual and assets preserve privacy boundaries", () => {
  assert.match(hardening, /import "\.\/daily-ritual\.js"/);
  assert.match(ritualUi, /oracle-mirror-daily-ritual-v1/);
  assert.match(ritualUi, /daily_ritual_revealed/);
  assert.match(ritualUi, /No account needed\. Your streak stays in this browser\./);
  assert.doesNotMatch(ritualUi, /question\s*:/i);
  assert.match(ritualCss, /\.daily-ritual/);
  assert.match(ritualCss, /prefers-reduced-motion/);
});
