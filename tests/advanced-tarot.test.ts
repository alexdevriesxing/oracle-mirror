import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { TAROT_CARDS } from "../src/tarot-data.ts";
import {
  TAROT_SPREAD_GUIDES,
  advancedTarotSitemapUrls,
  augmentLlmsWithAdvancedTarot,
  augmentSitemapWithAdvancedTarot,
  handleAdvancedTarotRoute,
  injectAdvancedTarotDiscovery,
} from "../src/tarot-pages.ts";
import { drawTarot, TAROT_SPREADS } from "../public/advanced-tarot-core.js";
import { sanitizeSharePayload } from "../public/share-card-core.js";

const v2Index = await readFile(new URL("../src/v2-index.ts", import.meta.url), "utf8");
const ui = await readFile(new URL("../public/advanced-tarot.js", import.meta.url), "utf8");
const css = await readFile(new URL("../public/advanced-tarot.css", import.meta.url), "utf8");

function regexEscape(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function htmlText(value: string): string {
  return value.replace(/&/g, "&amp;");
}

test("Tarot corpus contains exactly 78 unique cards with 22 Major and 56 Minor Arcana", () => {
  assert.equal(TAROT_CARDS.length, 78);
  assert.equal(new Set(TAROT_CARDS.map((card) => card.slug)).size, 78);
  assert.equal(TAROT_CARDS.filter((card) => card.arcana === "major").length, 22);
  assert.equal(TAROT_CARDS.filter((card) => card.arcana === "minor").length, 56);
  for (const suit of ["Wands", "Cups", "Swords", "Pentacles"]) {
    assert.equal(TAROT_CARDS.filter((card) => card.suit === suit).length, 14);
  }
  assert.equal(TAROT_CARDS[0].name, "The Fool");
  assert.equal(TAROT_CARDS.at(-1)?.name, "King of Pentacles");
});

test("all cards have upright, reversed, love, work, and reflection copy", () => {
  for (const card of TAROT_CARDS) {
    assert.ok(card.upright.length > 45, `${card.name} upright copy too short`);
    assert.ok(card.reversed.length > 45, `${card.name} reversed copy too short`);
    assert.ok(card.love.length > 40, `${card.name} love copy too short`);
    assert.ok(card.work.length > 40, `${card.name} work copy too short`);
    assert.ok(card.reflection.endsWith("?"), `${card.name} reflection should be a question`);
  }
});

test("advanced Tarot draw is deterministic, unique, and supports every spread", () => {
  const deck = TAROT_CARDS.map((card) => ({ slug: card.slug, name: card.name, glyph: card.glyph, upright: card.upright, reversed: card.reversed }));
  for (const [key, spread] of Object.entries(TAROT_SPREADS)) {
    const first = drawTarot(deck, key, "fixed-tarot-seed");
    assert.deepEqual(first, drawTarot(deck, key, "fixed-tarot-seed"));
    assert.equal(first.length, spread.positions.length);
    assert.equal(new Set(first.map((card) => card.slug)).size, first.length);
    assert.deepEqual(first.map((card) => card.position), spread.positions);
    assert.ok(first.every((card) => typeof card.reversed === "boolean"));
  }
});

test("advanced reader is standalone, local-first, and historically qualified", async () => {
  const response = handleAdvancedTarotRoute("/tarot/advanced");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /Free 78-Card Tarot Reader/);
  assert.match(html, /canonical" href="https:\/\/oraclemirror\.com\/tarot\/advanced"/);
  assert.match(html, /78 cards · 7 spreads/);
  assert.match(html, /generated entirely in this browser/);
  assert.match(html, /fifteenth-century Italy/);
  assert.match(html, /Metropolitan Museum of Art/);
  assert.match(html, /advanced-tarot-deck-data/);
  assert.match(html, /advanced-tarot\.js/);
  assert.doesNotMatch(html, /name="question"|textarea|type="date"/);
});

test("Tarot library exposes all 78 cards and each detail page has complete meanings plus schema", async () => {
  const library = await handleAdvancedTarotRoute("/tarot/cards").text();
  for (const card of TAROT_CARDS) assert.match(library, new RegExp(`/tarot/cards/${card.slug}`));
  const detail = await handleAdvancedTarotRoute("/tarot/cards/queen-of-cups").text();
  assert.match(detail, /Queen of Cups Tarot Card Meaning/);
  assert.match(detail, /upright meaning/);
  assert.match(detail, /reversed meaning/);
  assert.match(detail, /Love and relationships/);
  assert.match(detail, /Work and money/);
  assert.match(detail, /Reflection question/);
  assert.match(detail, /"@type":"Article"/);
  assert.match(detail, /BreadcrumbList/);
  assert.equal(handleAdvancedTarotRoute("/tarot/cards/not-a-card").status, 404);
});

test("seven spread guides render position-level content and routes", async () => {
  assert.equal(TAROT_SPREAD_GUIDES.length, 7);
  const hub = await handleAdvancedTarotRoute("/tarot/spreads").text();
  for (const spread of TAROT_SPREAD_GUIDES) {
    assert.match(hub, new RegExp(`/tarot/spreads/${spread.slug}`));
    const page = await handleAdvancedTarotRoute(`/tarot/spreads/${spread.slug}`).text();
    assert.match(page, new RegExp(regexEscape(spread.name)));
    for (const position of spread.positions) assert.match(page, new RegExp(regexEscape(htmlText(position))));
  }
});

test("sitemap expansion adds reader, library, 78 card pages, spread hub, and seven guides once", () => {
  assert.equal(advancedTarotSitemapUrls().length, 88);
  const base = '<?xml version="1.0"?><urlset><url><loc>https://oraclemirror.com/</loc></url></urlset>';
  const expanded = augmentSitemapWithAdvancedTarot(base);
  assert.equal((expanded.match(/<loc>https:\/\/oraclemirror\.com\/tarot\//g) || []).length, 88);
  assert.equal(augmentSitemapWithAdvancedTarot(expanded), expanded);
});

test("homepage and llms discovery are idempotent and use real advanced Tarot links", () => {
  const sample = '<a href="/tarot" class="dropdown-item">Tarot</a>';
  const injected = injectAdvancedTarotDiscovery(sample);
  assert.match(injected, /href="\/tarot\/advanced"/);
  assert.equal(injectAdvancedTarotDiscovery(injected), injected);
  const llms = augmentLlmsWithAdvancedTarot("# Oracle Mirror\n");
  assert.match(llms, /## Advanced Tarot/);
  assert.match(llms, /https:\/\/oraclemirror\.com\/tarot\/cards/);
  assert.equal(augmentLlmsWithAdvancedTarot(llms), llms);
  assert.match(v2Index, /isAdvancedTarotRoute/);
  assert.match(v2Index, /handleAdvancedTarotRoute/);
});

test("advanced Tarot share card strips arbitrary private fields and limits card detail", () => {
  const payload = sanitizeSharePayload({
    kind: "advanced-tarot",
    spread: "Celtic Cross",
    cards: ["The Star", "Two of Cups", "The Tower", "Queen of Swords", "The Sun"],
    positions: ["Present", "Challenge", "Foundation", "Recent Past", "Possibility"],
    orientations: ["Upright", "Reversed", "Upright", "Upright", "Reversed"],
    question: "my secret roadmap decision",
    name: "private name",
    email: "private@example.com",
    notes: "never share",
  });
  assert.equal(payload?.kind, "advanced-tarot");
  assert.equal(payload?.lines.length, 4);
  assert.match(payload?.title || "", /Celtic Cross/);
  assert.doesNotMatch(JSON.stringify(payload), /my secret roadmap decision|private name|example\.com|never share/i);
});

test("advanced Tarot UI makes no feature API or AI calls and supports reduced motion", () => {
  assert.doesNotMatch(ui, /fetch\(|\/api\//);
  assert.match(ui, /crypto\.randomUUID/);
  assert.match(ui, /openShareCard/);
  assert.match(css, /prefers-reduced-motion/);
});
