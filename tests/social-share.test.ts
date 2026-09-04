import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  SHARE_CARD_HEIGHT,
  SHARE_CARD_WIDTH,
  payloadText,
  safeFileName,
  sanitizeSharePayload,
} from "../public/share-card-core.js";

const shareUi = await readFile(new URL("../public/social-share.js", import.meta.url), "utf8");
const shareCss = await readFile(new URL("../public/social-share.css", import.meta.url), "utf8");
const hardening = await readFile(new URL("../public/hardening.js", import.meta.url), "utf8");

test("social share canvas is vertical story format", () => {
  assert.equal(SHARE_CARD_WIDTH, 1080);
  assert.equal(SHARE_CARD_HEIGHT, 1920);
});

test("daily share payload keeps generated signals only", () => {
  const payload = sanitizeSharePayload({
    kind: "daily",
    card: "The Star",
    glyph: "★",
    theme: "Follow the warm signal",
    moon: "Full Moon",
    luckyNumber: 17,
    element: "Aether",
    question: "private question",
    email: "private@example.com",
  });
  assert.equal(payload?.title, "The Star");
  assert.match(payloadText(payload), /Full Moon/);
  assert.doesNotMatch(JSON.stringify(payload), /private question|private@example\.com/);
});

test("tarot share payload excludes the private question", () => {
  const payload = sanitizeSharePayload({
    kind: "tarot",
    cards: ["The Fool", "The Star", "The World"],
    question: "Should I resign tomorrow?",
    answer: "Long private interpretation",
  });
  assert.deepEqual(payload?.lines, ["Past: The Fool", "Present: The Star", "Future: The World"]);
  assert.doesNotMatch(JSON.stringify(payload), /resign|private interpretation/i);
});

test("numerology share payload excludes birth date", () => {
  const payload = sanitizeSharePayload({
    kind: "numerology",
    lifePath: 11,
    birthday: "1980-01-01",
  });
  assert.equal(payload?.title, "Life Path 11");
  assert.doesNotMatch(JSON.stringify(payload), /1980|01-01/);
});

test("love match share payload excludes names and keeps score/tier", () => {
  const payload = sanitizeSharePayload({
    kind: "love-match",
    score: 87,
    tier: "Cosmic Resonance (High Affinity)",
    seekerName: "Private Person A",
    partnerName: "Private Person B",
  });
  assert.equal(payload?.title, "87% Compatibility");
  assert.match(payload?.subtitle || "", /Cosmic Resonance/);
  assert.doesNotMatch(JSON.stringify(payload), /Private Person/);
});

test("share layer is bootstrapped and does not read private form inputs", () => {
  assert.match(hardening, /import "\.\/social-share\.js"/);
  assert.match(shareUi, /Create Share Card/);
  assert.match(shareUi, /share_complete/);
  assert.match(shareUi, /navigator\.canShare/);
  assert.match(shareUi, /Private names and inputs excluded|private question, names and birth date/i);
  assert.doesNotMatch(shareUi, /tarot-question-input/);
  assert.doesNotMatch(shareUi, /numerology-birthday/);
  assert.doesNotMatch(shareUi, /seekerName|partnerName/);
  assert.match(shareCss, /\.oracle-share-modal/);
  assert.match(shareCss, /prefers-reduced-motion/);
});

test("share filenames remain stable and contain no user input", () => {
  const payload = { kind: "love-match", score: 91, tier: "Twin Flames" };
  assert.equal(safeFileName(payload), "oracle-mirror-love-match-share-card.png");
});
