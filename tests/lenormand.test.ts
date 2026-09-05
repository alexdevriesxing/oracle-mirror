import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { LENORMAND_CARDS } from "../src/lenormand-data.ts";
import {
  augmentLlmsWithLenormand,
  augmentSitemapWithLenormand,
  handleLenormandRoute,
  injectLenormandDiscovery,
  lenormandSitemapUrls,
} from "../src/lenormand-pages.ts";
import { buildLenormandReading, drawLenormand } from "../public/lenormand-core.js";
import { sanitizeSharePayload } from "../public/share-card-core.js";

const v2Index = await readFile(new URL("../src/v2-index.ts", import.meta.url), "utf8");
const ui = await readFile(new URL("../public/lenormand.js", import.meta.url), "utf8");
const css = await readFile(new URL("../public/lenormand.css", import.meta.url), "utf8");

test("Lenormand corpus contains the complete numbered 36-card sequence", () => {
  assert.equal(LENORMAND_CARDS.length, 36);
  assert.deepEqual(LENORMAND_CARDS.map((card) => card.number), Array.from({ length: 36 }, (_, index) => index + 1));
  assert.equal(new Set(LENORMAND_CARDS.map((card) => card.slug)).size, 36);
  assert.equal(LENORMAND_CARDS[0].name, "Rider");
  assert.equal(LENORMAND_CARDS[35].name, "Cross");
  assert.equal(LENORMAND_CARDS.find((card) => card.name === "Man")?.playingCard, "Ace of Hearts");
  assert.equal(LENORMAND_CARDS.find((card) => card.name === "Woman")?.playingCard, "Ace of Spades");
});

test("three-card Lenormand line is deterministic for tests and never repeats a card", () => {
  const first = drawLenormand(LENORMAND_CARDS, "fixed-lenormand-seed");
  assert.deepEqual(first, drawLenormand(LENORMAND_CARDS, "fixed-lenormand-seed"));
  assert.equal(first.length, 3);
  assert.equal(new Set(first.map((card) => card.slug)).size, 3);
  assert.deepEqual(first.map((card) => card.position.label), ["Context", "Focus", "Direction"]);
  const reading = buildLenormandReading(first);
  assert.equal(reading?.pairs.length, 2);
  assert.match(reading?.summary || "", /sets the context/);
});

test("Lenormand hub is indexable, complete, local-first, and historically qualified", async () => {
  const response = handleLenormandRoute("/lenormand");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /Free Lenormand Reading Online/);
  assert.match(html, /canonical" href="https:\/\/oraclemirror\.com\/lenormand"/);
  assert.match(html, /All 36 Lenormand Cards/);
  assert.match(html, /Game of Hope/);
  assert.match(html, /does not claim that Mlle Lenormand designed/);
  assert.match(html, /data-lenormand-draw/);
  assert.match(html, /lenormand-deck-data/);
  assert.match(html, /lenormand\.js/);
  for (const card of LENORMAND_CARDS) assert.match(html, new RegExp(`/lenormand/${card.slug}`));
  assert.doesNotMatch(html, /name="question"|textarea|type="date"/);
});

test("each Lenormand card page has answer-first copy, applications, schema, and history caveat", async () => {
  const response = handleLenormandRoute("/lenormand/heart");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /Heart Lenormand Card Meaning/);
  assert.match(html, /lenormand-answer-first/);
  assert.match(html, /in love and relationships/);
  assert.match(html, /in work and money/);
  assert.match(html, /Reading Heart in combinations/);
  assert.match(html, /"@type":"Article"/);
  assert.match(html, /BreadcrumbList/);
  assert.match(html, /Marie Anne Lenormand did not create this specific deck/);
  assert.equal(handleLenormandRoute("/lenormand/not-a-card").status, 404);
});

test("modern significator copy does not force binary identity assumptions", () => {
  const man = LENORMAND_CARDS.find((card) => card.name === "Man");
  const woman = LENORMAND_CARDS.find((card) => card.name === "Woman");
  assert.match(man?.challenge || "", /Avoid forcing gender assumptions/);
  assert.match(woman?.challenge || "", /need not dictate gender identity/);
});

test("sitemap expansion adds hub plus all 36 card pages exactly once", () => {
  assert.equal(lenormandSitemapUrls().length, 37);
  const base = '<?xml version="1.0"?><urlset><url><loc>https://oraclemirror.com/</loc></url></urlset>';
  const expanded = augmentSitemapWithLenormand(base);
  assert.equal((expanded.match(/<loc>https:\/\/oraclemirror\.com\/lenormand/g) || []).length, 37);
  assert.equal(augmentSitemapWithLenormand(expanded), expanded);
});

test("homepage and llms discovery are idempotent and use real links", () => {
  const sample = '<a href="/runes" class="dropdown-item">ᚠ Rune Casting</a><a href="/dream-interpreter" class="card card-dream" data-realm="dream-interpreter">';
  const injected = injectLenormandDiscovery(sample);
  assert.match(injected, /href="\/lenormand"/);
  assert.match(injected, /card-lenormand/);
  assert.doesNotMatch(injected, /card-lenormand[^>]*data-realm/);
  assert.equal(injectLenormandDiscovery(injected), injected);
  const llms = augmentLlmsWithLenormand("# Oracle Mirror\n");
  assert.match(llms, /## Lenormand/);
  assert.match(llms, /https:\/\/oraclemirror\.com\/lenormand/);
  assert.equal(augmentLlmsWithLenormand(llms), llms);
  assert.match(v2Index, /isLenormandRoute/);
  assert.match(v2Index, /handleLenormandRoute/);
});

test("Lenormand share card keeps only generated card names and position labels", () => {
  const payload = sanitizeSharePayload({
    kind: "lenormand",
    cards: ["Rider", "Heart", "Key"],
    positions: ["Context", "Focus", "Direction"],
    question: "private relationship question",
    name: "private name",
    email: "private@example.com",
    notes: "never share",
  });
  assert.equal(payload?.kind, "lenormand");
  assert.equal(payload?.lines.length, 3);
  assert.match(payload?.lines[0] || "", /Context: Rider/);
  assert.doesNotMatch(JSON.stringify(payload), /relationship question|private name|example\.com|never share/i);
});

test("Lenormand UI makes no feature API or AI calls and supports reduced motion", () => {
  assert.doesNotMatch(ui, /fetch\(|\/api\//);
  assert.match(ui, /crypto\.randomUUID/);
  assert.match(ui, /openShareCard/);
  assert.match(css, /prefers-reduced-motion/);
});
