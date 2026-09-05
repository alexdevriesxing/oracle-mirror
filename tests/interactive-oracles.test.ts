import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  AURA_PROFILES,
  AURA_QUESTIONS,
  DUEL_MYSTICS,
  PENDULUM_OUTCOMES,
  buildOracleDuel,
  classifyDuelTheme,
  readPendulum,
  scoreAura,
} from "../public/interactive-oracles-core.js";
import { sanitizeSharePayload } from "../public/share-card-core.js";

const ui = await readFile(new URL("../public/interactive-oracles.js", import.meta.url), "utf8");
const css = await readFile(new URL("../public/interactive-oracles.css", import.meta.url), "utf8");
const hardening = await readFile(new URL("../public/hardening.js", import.meta.url), "utf8");

test("Pendulum has a bounded symbolic outcome set and deterministic core", () => {
  assert.equal(PENDULUM_OUTCOMES.length, 6);
  const first = readPendulum("Should I move forward?", "fixed");
  const second = readPendulum("Should I move forward?", "fixed");
  assert.deepEqual(first, second);
  assert.ok(PENDULUM_OUTCOMES.some((outcome) => outcome.id === first.id));
  assert.match(first.route, /^\/[a-z0-9-]+$/);
});

test("Aura quiz has five questions and resolves to one known profile", () => {
  assert.equal(AURA_QUESTIONS.length, 5);
  assert.equal(AURA_PROFILES.length, 6);
  const answers = AURA_QUESTIONS.map((question) => question.options[0].id);
  const aura = scoreAura(answers);
  assert.ok(AURA_PROFILES.some((profile) => profile.id === aura.id));
  assert.equal(aura.traits.length, 3);
  assert.ok(aura.confidence >= 1 && aura.confidence <= 100);
});

test("Aura scoring is deterministic and ignores unknown answers", () => {
  const known = scoreAura(["quiet", "facts", "studio", "chaos", "perspective"]);
  assert.deepEqual(known, scoreAura(["quiet", "facts", "studio", "chaos", "perspective"]));
  const unknown = scoreAura(["invalid", "invalid", "invalid", "invalid", "invalid"]);
  assert.ok(AURA_PROFILES.some((profile) => profile.id === unknown.id));
});

test("Oracle Duel classifies common themes locally", () => {
  assert.equal(classifyDuelTheme("What should I do about this relationship?"), "love");
  assert.equal(classifyDuelTheme("Should I take this new job?"), "work");
  assert.equal(classifyDuelTheme("Which option should I choose?"), "choice");
  assert.equal(classifyDuelTheme("Is it time for a change?"), "change");
  assert.equal(classifyDuelTheme("What am I missing here?"), "general");
});

test("Oracle Duel always returns two distinct known mystics with authored responses", () => {
  const duel = buildOracleDuel("Which path should I choose?", "fixed");
  assert.equal(duel.contestants.length, 2);
  assert.notEqual(duel.contestants[0].id, duel.contestants[1].id);
  duel.contestants.forEach((mystic) => {
    assert.ok(DUEL_MYSTICS.some((known) => known.id === mystic.id));
    assert.ok(mystic.response.length > 60);
    assert.match(mystic.route, /^\/[a-z0-9-]+$/);
  });
  assert.deepEqual(duel, buildOracleDuel("Which path should I choose?", "fixed"));
});

test("Mirror Lab stays fully local and never posts Pendulum or Duel questions", () => {
  assert.doesNotMatch(ui, /fetch\s*\(|\/api\//);
  assert.match(ui, /never sent to an API/);
  assert.match(ui, /stays in this browser/);
  assert.doesNotMatch(ui, /question\s*:/);
});

test("Mirror Lab boots after Council and includes accessible live result regions", () => {
  const councilIndex = hardening.indexOf('import "./council.js"');
  const labIndex = hardening.indexOf('import "./interactive-oracles.js"');
  assert.ok(councilIndex >= 0 && labIndex > councilIndex);
  assert.match(ui, /Pendulum Oracle/);
  assert.match(ui, /Aura Reading/);
  assert.match(ui, /Oracle Duel/);
  assert.match(ui, /aria-live="polite"/);
  assert.match(css, /prefers-reduced-motion/);
});

test("Pendulum share payload excludes the private question", () => {
  const payload = sanitizeSharePayload({
    kind: "pendulum",
    outcome: "Leaning Yes",
    glyph: "⌁",
    question: "Private question about my life",
    email: "private@example.com",
  });
  assert.equal(payload?.title, "Leaning Yes");
  assert.doesNotMatch(JSON.stringify(payload), /Private question|private@example/);
});

test("Aura share payload includes only quiz result traits", () => {
  const payload = sanitizeSharePayload({
    kind: "aura",
    aura: "Violet Aura",
    glyph: "✦",
    traits: ["Imaginative", "Intuitive", "Vision-led"],
    answers: ["secret", "answers"],
    name: "Private Person",
  });
  assert.equal(payload?.title, "Violet Aura");
  assert.deepEqual(payload?.lines, ["Imaginative", "Intuitive", "Vision-led"]);
  assert.doesNotMatch(JSON.stringify(payload), /secret|Private Person/);
});

test("Oracle Duel share payload excludes question and interpretation text", () => {
  const payload = sanitizeSharePayload({
    kind: "oracle-duel",
    mystics: ["Seraphina", "Pythius"],
    winner: "Seraphina",
    question: "Private dilemma",
    responses: ["Secret answer one", "Secret answer two"],
  });
  assert.match(payload?.title || "", /Seraphina/);
  assert.doesNotMatch(JSON.stringify(payload), /Private dilemma|Secret answer/);
});
