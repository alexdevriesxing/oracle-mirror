import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  COUNCIL_PERSONAS,
  handleCouncil,
  normalizeCouncilQuestion,
  parseCouncilResponse,
  selectCouncilMembers,
} from "../src/council.ts";
import {
  councilArchiveEntry,
  councilSharePayload,
  isCouncilResult,
  saveCouncilToArchive,
} from "../public/council-core.js";
import { sanitizeSharePayload } from "../public/share-card-core.js";

const ui = await readFile(new URL("../public/council.js", import.meta.url), "utf8");
const css = await readFile(new URL("../public/council.css", import.meta.url), "utf8");
const hardening = await readFile(new URL("../public/hardening.js", import.meta.url), "utf8");
const v2Index = await readFile(new URL("../src/v2-index.ts", import.meta.url), "utf8");

function modelJson(question: string) {
  const members = selectCouncilMembers(question);
  return JSON.stringify({
    voices: members.map((member) => ({
      id: member.id,
      response: `A distinct reflective perspective from ${member.name} that stays grounded, avoids certainty, and gives the seeker a useful angle to consider before acting.`,
    })),
    verdict: {
      title: "Clarity Before Commitment",
      summary: "The council converges on a practical theme: separate facts from assumptions, notice the pressure surrounding the choice, and create information before committing to an irreversible direction. The useful answer is less about predicting what will happen and more about learning what the situation is actually asking of you.",
      next_step: "Take one small reversible action that gives you new information before making the final decision.",
    },
  });
}

test("Council question normalization enforces useful bounded input", () => {
  assert.equal(normalizeCouncilQuestion("   Should   I change direction?   "), "Should I change direction?");
  assert.equal(normalizeCouncilQuestion("short"), null);
  assert.equal(normalizeCouncilQuestion("x".repeat(501)), null);
});

test("Council selects exactly three distinct fictional mystics deterministically", () => {
  const first = selectCouncilMembers("Should I change direction now?");
  const again = selectCouncilMembers("Should I change direction now?");
  assert.deepEqual(first, again);
  assert.equal(first.length, 3);
  assert.equal(new Set(first.map((member) => member.id)).size, 3);
  assert.ok(COUNCIL_PERSONAS.length >= 6);
});

test("Council parser accepts only the selected identities and controlled fields", () => {
  const question = "Should I change direction now?";
  const members = selectCouncilMembers(question);
  const parsed = parseCouncilResponse(modelJson(question), members);
  assert.ok(parsed);
  assert.equal(parsed?.voices.length, 3);
  assert.deepEqual(parsed?.voices.map((voice) => voice.id), members.map((member) => member.id));
  assert.equal(parsed?.source, "ai");
});

test("Council endpoint produces three voices and one verdict with one AI call", async () => {
  const question = "Should I change direction now?";
  let calls = 0;
  const env = {
    AI: {
      run: async () => {
        calls += 1;
        return { response: modelJson(question) };
      },
    },
  };
  const request = new Request("https://oraclemirror.com/api/council", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Origin": "https://oraclemirror.com",
      "CF-Connecting-IP": "198.51.100.10",
    },
    body: JSON.stringify({ question }),
  });
  const response = await handleCouncil(request, env);
  const payload = await response.json();
  assert.equal(response.status, 200);
  assert.equal(calls, 1);
  assert.ok(isCouncilResult(payload));
  assert.equal(payload.source, "ai");
  assert.equal(response.headers.get("Cache-Control"), "no-store");
});

test("Council endpoint falls back gracefully when AI fails without retrying multiple model calls", async () => {
  let calls = 0;
  const request = new Request("https://oraclemirror.com/api/council", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Origin": "https://oraclemirror.com",
      "CF-Connecting-IP": "198.51.100.11",
    },
    body: JSON.stringify({ question: "What angle am I missing in this decision?" }),
  });
  const response = await handleCouncil(request, {
    AI: {
      run: async () => {
        calls += 1;
        throw new Error("AI unavailable");
      },
    },
  });
  const payload = await response.json();
  assert.equal(calls, 1);
  assert.equal(payload.source, "fallback");
  assert.ok(isCouncilResult(payload));
});

test("Council share card excludes question and answer text by construction", () => {
  const question = "Private question about my private situation";
  const members = selectCouncilMembers(question);
  const result = parseCouncilResponse(modelJson(question), members);
  assert.ok(result);
  const rawShare = councilSharePayload(result);
  const share = sanitizeSharePayload({
    ...rawShare,
    question,
    answer: "Highly private answer text",
    email: "private@example.com",
  });
  assert.equal(share?.kind, "council");
  assert.equal(share?.lines.length, 3);
  assert.doesNotMatch(JSON.stringify(share), /Private question|Highly private|private@example/);
});

test("Council Archive saving is explicit, local, and compatible with the existing archive shape", () => {
  const question = "What angle am I missing in this decision?";
  const members = selectCouncilMembers(question);
  const result = parseCouncilResponse(modelJson(question), members);
  assert.ok(result);
  const entry = councilArchiveEntry(result, question, new Date("2026-09-05T12:00:00Z"));
  assert.equal(entry?.realm, "Council of Mystics");
  assert.equal(entry?.question, question);
  assert.match(entry?.answer || "", /Mirror Verdict/);

  const values = new Map<string, string>();
  const storage = {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
  };
  assert.equal(saveCouncilToArchive(result, question, storage), true);
  const saved = JSON.parse(values.get("oracle-mirror-archive") || "[]");
  assert.equal(saved.length, 1);
  assert.equal(saved[0].realm, "Council of Mystics");
});

test("Council UI never sends question content through telemetry", () => {
  assert.match(ui, /body: JSON\.stringify\(\{ question \}\)/);
  assert.doesNotMatch(ui, /track\([^\n]+question/);
  assert.match(ui, /Avoid sensitive personal information/);
  assert.match(ui, /aria-live="polite"/);
  assert.match(css, /prefers-reduced-motion/);
});

test("Council is bootstrapped after Instant Mysteries and routed at the V2 edge", () => {
  const instantIndex = hardening.indexOf('import "./instant-mysteries.js"');
  const councilIndex = hardening.indexOf('import "./council.js"');
  assert.ok(instantIndex >= 0 && councilIndex > instantIndex);
  assert.match(v2Index, /url\.pathname === "\/api\/council"/);
  assert.match(v2Index, /handleCouncil\(request, env\)/);
});
