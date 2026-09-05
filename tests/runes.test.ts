import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { ELDER_FUTHARK } from "../src/runes-data.ts";
import {
  augmentSitemapWithRunes,
  handleRuneRoute,
  injectRunesDiscovery,
  runeSitemapUrls,
} from "../src/runes-pages.ts";
import { RUNES, drawRunes } from "../public/runes-core.js";
import { sanitizeSharePayload } from "../public/share-card-core.js";

const v2Index = await readFile(new URL("../src/v2-index.ts", import.meta.url), "utf8");
const runeUi = await readFile(new URL("../public/runes.js", import.meta.url), "utf8");
const runeCss = await readFile(new URL("../public/runes.css", import.meta.url), "utf8");

test("Elder Futhark corpus contains 24 unique runes and client corpus matches", () => {
  assert.equal(ELDER_FUTHARK.length, 24);
  assert.equal(new Set(ELDER_FUTHARK.map((rune) => rune.slug)).size, 24);
  assert.equal(new Set(ELDER_FUTHARK.map((rune) => rune.glyph)).size, 24);
  assert.deepEqual(
    RUNES.map(({ slug, name, glyph }) => ({ slug, name, glyph })),
    ELDER_FUTHARK.map(({ slug, name, glyph }) => ({ slug, name, glyph }))
  );
});

test("three-rune cast is deterministic for tests and never repeats a rune", () => {
  const first = drawRunes("fixed-rune-seed");
  assert.deepEqual(first, drawRunes("fixed-rune-seed"));
  assert.equal(first.length, 3);
  assert.equal(new Set(first.map((rune) => rune.slug)).size, 3);
  assert.deepEqual(first.map((rune) => rune.position.label), ["Root", "Present", "Path Ahead"]);
});

test("rune hub is indexable, complete, local-first, and historically qualified", async () => {
  const response = handleRuneRoute("/runes");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /Free Rune Reading Online/);
  assert.match(html, /canonical" href="https:\/\/oraclemirror\.com\/runes"/);
  assert.match(html, /24 Elder Futhark Runes/);
  assert.match(html, /modern symbolic interpretation/);
  assert.match(html, /data-rune-cast/);
  assert.match(html, /runes\.js/);
  for (const rune of ELDER_FUTHARK) assert.match(html, new RegExp(`/runes/${rune.slug}`));
  assert.doesNotMatch(html, /name="question"|textarea/);
});

test("each rune meaning page has answer-first copy, schema, and modern-practice caveat", async () => {
  const response = handleRuneRoute("/runes/fehu");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /Fehu Rune Meaning/);
  assert.match(html, /rune-answer-first/);
  assert.match(html, /"@type":"Article"/);
  assert.match(html, /BreadcrumbList/);
  assert.match(html, /Modern rune divination systems/);
  assert.equal(handleRuneRoute("/runes/not-a-rune").status, 404);
});

test("sitemap expansion adds the hub plus all 24 meaning pages exactly once", () => {
  assert.equal(runeSitemapUrls().length, 25);
  const base = '<?xml version="1.0"?><urlset><url><loc>https://oraclemirror.com/</loc></url></urlset>';
  const expanded = augmentSitemapWithRunes(base);
  assert.equal((expanded.match(/<loc>https:\/\/oraclemirror\.com\/runes/g) || []).length, 25);
  assert.equal(augmentSitemapWithRunes(expanded), expanded);
});

test("app-shell discovery adds a real rune link and v2 keeps it outside the legacy data-realm router", () => {
  const sample = '<a href="/iching-oracle" class="dropdown-item" data-nav="iching">&#128142; I Ching</a><a href="/dream-interpreter" class="card card-dream" data-realm="dream-interpreter">';
  const injected = injectRunesDiscovery(sample);
  assert.match(injected, /href="\/runes"/);
  assert.match(injected, /card-runes/);
  assert.match(v2Index, /data-realm="runes"/);
  assert.match(v2Index, /isRuneRoute/);
});

test("rune share card contains only the controlled three-rune result", () => {
  const payload = sanitizeSharePayload({
    kind: "runes",
    runes: ["Fehu", "Ansuz", "Laguz"],
    positions: ["Root", "Present", "Path Ahead"],
    question: "private question",
    email: "private@example.com",
    notes: "never share",
  });
  assert.equal(payload?.kind, "runes");
  assert.equal(payload?.lines.length, 3);
  assert.match(payload?.lines[0] || "", /Root: Fehu/);
  assert.doesNotMatch(JSON.stringify(payload), /private|never share|example\.com/i);
});

test("rune UI has no API calls and provides reduced-motion styling", () => {
  assert.doesNotMatch(runeUi, /fetch\(|\/api\//);
  assert.match(runeUi, /crypto\.randomUUID/);
  assert.match(runeUi, /openShareCard/);
  assert.match(runeCss, /prefers-reduced-motion/);
});
