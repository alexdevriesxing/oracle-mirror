import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  MYSTIC_ROULETTE_OPTIONS,
  MICRO_TAROT_CARDS,
  SAFE_INSTANT_ROUTES,
  assignDoors,
  pickMicroTarot,
  pickMystic,
} from "../public/instant-mysteries-core.js";
import { sanitizeSharePayload } from "../public/share-card-core.js";

const ui = await readFile(new URL("../public/instant-mysteries.js", import.meta.url), "utf8");
const css = await readFile(new URL("../public/instant-mysteries.css", import.meta.url), "utf8");
const hardening = await readFile(new URL("../public/hardening.js", import.meta.url), "utf8");

test("mystic roulette is deterministic for tests and can avoid an immediate repeat", () => {
  const first = pickMystic("fixed-seed");
  const again = pickMystic("fixed-seed");
  assert.deepEqual(first, again);
  assert.ok(first);
  const avoided = pickMystic("fixed-seed", first?.id);
  assert.ok(avoided);
  assert.notEqual(avoided?.id, first?.id);
  assert.ok(MYSTIC_ROULETTE_OPTIONS.length >= 8);
});

test("micro tarot draws from the full Major Arcana set", () => {
  assert.equal(MICRO_TAROT_CARDS.length, 22);
  const card = pickMicroTarot("card-seed", 1);
  assert.ok(card?.name);
  assert.ok(card?.message.length > 30);
  assert.deepEqual(card, pickMicroTarot("card-seed", 1));
});

test("three doors always contain exactly one opportunity, warning, and unexpected turn", () => {
  const doors = assignDoors("door-seed");
  assert.equal(doors.length, 3);
  assert.deepEqual(new Set(doors.map((door) => door.category)), new Set(["opportunity", "warning", "unexpected"]));
  assert.deepEqual(doors, assignDoors("door-seed"));
  doors.forEach((door) => assert.ok(SAFE_INSTANT_ROUTES.has(door.route)));
});

test("all instant mystery continuation routes remain within Oracle Mirror", () => {
  MYSTIC_ROULETTE_OPTIONS.forEach((option) => {
    assert.match(option.route, /^\/[a-z0-9-]+$/);
    assert.ok(SAFE_INSTANT_ROUTES.has(option.route));
  });
  for (const route of SAFE_INSTANT_ROUTES) assert.match(route, /^\/[a-z0-9-]+$/);
});

test("instant mysteries bootstrap after social sharing and use accessible native controls", () => {
  const socialIndex = hardening.indexOf('import "./social-share.js"');
  const instantIndex = hardening.indexOf('import "./instant-mysteries.js"');
  assert.ok(socialIndex >= 0 && instantIndex > socialIndex);
  assert.match(ui, /Instant Mysteries/);
  assert.match(ui, /data-roll-mystic/);
  assert.match(ui, /data-card-slot/);
  assert.match(ui, /data-door-index/);
  assert.match(ui, /aria-live="polite"/);
  assert.match(ui, /instant_mystery_reveal/);
  assert.match(css, /prefers-reduced-motion/);
});

test("instant gimmicks never read private question, birthday, or relationship-name fields", () => {
  assert.doesNotMatch(ui, /tarot-question-input|numerology-birthday|birthchart-date|seekerName|partnerName|chat-input|dream-input/);
});

test("Pick a Card share payload keeps only the controlled reveal", () => {
  const payload = sanitizeSharePayload({
    kind: "pick-card",
    card: "The Star",
    glyph: "★",
    message: "Keep one hopeful signal in view.",
    question: "Private question",
    birthday: "1980-01-01",
    name: "Private Person",
  });
  assert.equal(payload?.title, "The Star");
  assert.match(payload?.lines[0] || "", /hopeful signal/);
  assert.doesNotMatch(JSON.stringify(payload), /Private|1980/);
});

test("Three Doors share payload drops arbitrary private extras", () => {
  const payload = sanitizeSharePayload({
    kind: "three-doors",
    door: "Golden",
    outcome: "A Small Opening",
    glyph: "✦",
    message: "An overlooked option deserves a second look.",
    category: "opportunity",
    privateNote: "do not share this",
    email: "private@example.com",
  });
  assert.equal(payload?.title, "A Small Opening");
  assert.match(payload?.subtitle || "", /Golden Door/);
  assert.doesNotMatch(JSON.stringify(payload), /do not share|private@example/);
});
